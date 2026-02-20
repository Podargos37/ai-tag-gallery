# server/main.py — FastAPI 백엔드 (태깅, 시맨틱 검색, LanceDB 이미지 API, 터널 URL)
import asyncio
import gc
import threading
from pathlib import Path
from typing import Optional, Literal
from io import BytesIO

import torch
from PIL import Image
from fastapi import FastAPI, UploadFile, File, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
from tagger import WD14Eva02Tagger
from tunnel import start_tunnel, get_tunnel_url

from db import ensure_migrated, get_table
from embedder import encode_image_path
from contextlib import asynccontextmanager
from schema import VECTOR_DIM

PROJECT_ROOT = Path(__file__).resolve().parent.parent
UPLOAD_DIR = PROJECT_ROOT / "public" / "uploads"
THUMB_DIR = PROJECT_ROOT / "public" / "thumbnails"
THUMB_MAX_SIZE = 400
THUMB_WEBP_QUALITY = 75

# 마이그레이션 후 이미지 행 삽입용 0 벡터
ZERO_VECTOR = [0.0] * VECTOR_DIM

# WD14 태거: 업로드(/tag) 시에만 로드, 유휴 시 언로드
_tagger: Optional[WD14Eva02Tagger] = None
_tagger_lock: Optional[asyncio.Lock] = None
_tagger_unload_handle: Optional[asyncio.TimerHandle] = None
TAGGER_IDLE_UNLOAD_SECONDS = 120


def _get_tagger_lock() -> asyncio.Lock:
    global _tagger_lock
    if _tagger_lock is None:
        _tagger_lock = asyncio.Lock()
    return _tagger_lock


async def get_or_load_tagger() -> WD14Eva02Tagger:
    global _tagger
    lock = _get_tagger_lock()
    async with lock:
        if _tagger is None:
            _tagger = await asyncio.to_thread(WD14Eva02Tagger)
    return _tagger


def _do_unload_tagger() -> None:
    global _tagger, _tagger_unload_handle
    _tagger = None
    _tagger_unload_handle = None
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
    print("WD14 unloaded.")


def schedule_tagger_unload() -> None:
    global _tagger_unload_handle
    if _tagger_unload_handle is not None:
        _tagger_unload_handle.cancel()
    loop = asyncio.get_running_loop()
    _tagger_unload_handle = loop.call_later(TAGGER_IDLE_UNLOAD_SECONDS, _do_unload_tagger)


@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_migrated()
    yield


app = FastAPI(lifespan=lifespan)
app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:3000"],
  allow_methods=["*"],
  allow_headers=["*"],
)

text_model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")


class SearchRequest(BaseModel):
  query: str
  all_tags: list
  similarity_threshold: float = 0.8


class ImageUpdateBody(BaseModel):
  notes: str | None = None
  tags: list[str] | None = None


class ImageCreateBody(BaseModel):
  id: str
  filename: str
  thumbnail: str
  originalName: str
  tags: list[str]
  width: int | None = None
  height: int | None = None
  notes: str = ""
  createdAt: str


class BulkRemoveTagsBody(BaseModel):
  tag_names: list[str]


class SearchSimilarRequest(BaseModel):
  imageId: str
  limit: int = 20


class ConvertRequest(BaseModel):
  imageId: str
  format: Literal["png", "jpg", "webp"]
  quality: int = 85  # 1-100, used for jpg/webp


@app.post("/bulk-remove-tags")
def bulk_remove_tags(body: BulkRemoveTagsBody):
  """제외 목록 태그를 모든 이미지에서 완전 일치로 제거."""
  if not body.tag_names:
    return {"success": True, "updated": 0}
  exclude_set = {t.strip().lower() for t in body.tag_names if t and str(t).strip()}
  if not exclude_set:
    return {"success": True, "updated": 0}
  table = get_table()
  df = table.to_pandas()
  if df.empty:
    return {"success": True, "updated": 0}
  if "tags" not in df.columns:
    return {"success": True, "updated": 0}
  updated = 0
  for _, row in df.iterrows():
    row_id = row.get("id")
    if row_id is None:
      continue
    tags = row.get("tags")
    if hasattr(tags, "tolist"):
      tags = tags.tolist()
    if not isinstance(tags, list):
      continue
    new_tags = [t for t in tags if str(t).strip().lower() not in exclude_set]
    if new_tags == tags:
      continue
    safe_id = str(row_id).replace("'", "''")
    pred = f"id = '{safe_id}'"
    table.update(where=pred, values={"tags": new_tags})
    updated += 1
  return {"success": True, "updated": updated}


@app.get("/health")
def health():
  """run.bat 등에서 AI 서버 준비 여부 확인용."""
  return {"ok": True}


@app.post("/tag")
async def get_tags(file: UploadFile = File(...), threshold: float = Query(0.35)):
  tagger = await get_or_load_tagger()
  contents = await file.read()
  tags = await asyncio.to_thread(tagger.predict, contents, threshold)
  schedule_tagger_unload()
  return {"tags": tags}


@app.post("/search_semantic")
async def search_semantic(req: SearchRequest):
  if not req.query or not req.all_tags:
    return {"match_tags": []}

  query_vec = text_model.encode(req.query, convert_to_tensor=True)
  tag_vecs = text_model.encode(req.all_tags, convert_to_tensor=True)
  cos_scores = util.cos_sim(query_vec, tag_vecs)[0]

  th = req.similarity_threshold
  match_tags = [req.all_tags[i] for i, score in enumerate(cos_scores) if score > th]
  return {"match_tags": match_tags}


@app.get("/images")
def list_images():
  """LanceDB images 테이블 목록. id 기준 최신순, vector 제외."""
  table = get_table()
  df = table.to_pandas()
  df = df.drop(columns=["vector"], errors="ignore")
  df["notes"] = df["notes"].fillna("")
  rows = df.to_dict("records")
  for d in rows:
    if "tags" in d and hasattr(d["tags"], "tolist"):
      d["tags"] = d["tags"].tolist()
  out = sorted(rows, key=lambda x: int(x.get("id", 0) or 0), reverse=True)
  return out


@app.patch("/images/{image_id}")
def update_image(image_id: str, body: ImageUpdateBody):
  table = get_table()
  safe_id = image_id.replace("'", "''")
  pred = f"id = '{safe_id}'"
  values = {}
  if body.notes is not None:
    values["notes"] = body.notes
  if body.tags is not None:
    values["tags"] = body.tags
  if values:
    table.update(where=pred, values=values)
  return {"success": True}


@app.delete("/images")
def delete_image(id: str):
  table = get_table()
  safe_id = id.replace("'", "''")
  table.delete(f"id = '{safe_id}'")
  return {"success": True}


@app.post("/images")
async def create_image(body: ImageCreateBody):
  vector = ZERO_VECTOR
  image_path = UPLOAD_DIR / body.filename
  if image_path.exists():
    vec = await encode_image_path(image_path)
    if vec and len(vec) == VECTOR_DIM:
      vector = vec
  row = {
    "id": body.id,
    "filename": body.filename,
    "thumbnail": body.thumbnail,
    "originalName": body.originalName,
    "tags": body.tags,
    "width": body.width,
    "height": body.height,
    "notes": body.notes or "",
    "createdAt": body.createdAt,
    "vector": vector,
  }
  table = get_table()
  table.add([row])
  return {"success": True}


def _is_zero_vector(vec) -> bool:
  if vec is None:
    return True
  if hasattr(vec, "tolist"):
    vec = vec.tolist()
  try:
    return all(abs(float(x)) < 1e-9 for x in (vec or []))
  except (TypeError, ValueError):
    return True


@app.post("/search_similar")
def search_similar(req: SearchSimilarRequest):
  """이미지 ID로 유사 이미지 검색. LanceDB vector search."""
  if not req.imageId or not req.imageId.strip():
    return {"results": []}
  table = get_table()
  df = table.to_pandas()
  if df.empty:
    return {"results": []}
  row = df[df["id"].astype(str) == str(req.imageId).strip()]
  if row.empty:
    return {"results": []}
  vec = row.iloc[0].get("vector")
  if _is_zero_vector(vec):
    return {"results": []}
  if hasattr(vec, "tolist"):
    vec = vec.tolist()
  elif hasattr(vec, "__iter__") and not isinstance(vec, (str, bytes)):
    vec = list(vec)
  else:
    return {"results": []}
  safe_id = str(req.imageId).replace("'", "''")
  limit = max(1, min(int(req.limit), 50))
  rs = (
    table.search(vec)
    .where(f"id != '{safe_id}'")
    .limit(limit + 1)
  )
  try:
    results_df = rs.to_pandas()
  except Exception:
    return {"results": []}
  if results_df.empty:
    return {"results": []}
  results_df = results_df.drop(columns=["vector"], errors="ignore")
  results_df["notes"] = results_df.get("notes", "").fillna("")
  rows = results_df.head(limit).to_dict("records")
  for d in rows:
    if "tags" in d and hasattr(d["tags"], "tolist"):
      d["tags"] = d["tags"].tolist()
  return {"results": rows}


def _find_duplicate_groups(table, df_with_vectors, threshold: float, max_groups: int):
  """벡터 거리 기준으로 중복 후보 그룹을 찾아 반환. (연결 요소)"""
  import pandas as pd
  edges = set()
  id_to_vec = {}
  for _, row in df_with_vectors.iterrows():
    vid = str(row.get("id", ""))
    vec = row.get("vector")
    if _is_zero_vector(vec):
      continue
    if hasattr(vec, "tolist"):
      vec = vec.tolist()
    elif hasattr(vec, "__iter__") and not isinstance(vec, (str, bytes)):
      vec = list(vec)
    else:
      continue
    id_to_vec[vid] = vec

  for vid, vec in id_to_vec.items():
    safe_id = vid.replace("'", "''")
    try:
      rs = (
        table.search(vec)
        .where(f"id != '{safe_id}'")
        .limit(40)
      )
      near_df = rs.to_pandas()
    except Exception:
      near_df = pd.DataFrame()
    if near_df.empty or "_distance" not in near_df.columns:
      continue
    for _, r in near_df.iterrows():
      d = r.get("_distance")
      if d is None:
        continue
      try:
        dist = float(d)
      except (TypeError, ValueError):
        continue
      if dist < threshold:
        other = str(r.get("id", ""))
        if other and other != vid:
          edge = (min(vid, other), max(vid, other))
          edges.add(edge)

  # Union-Find for connected components
  parent = {}
  def find(x):
    if x not in parent:
      parent[x] = x
    if parent[x] != x:
      parent[x] = find(parent[x])
    return parent[x]
  def union(a, b):
    pa, pb = find(a), find(b)
    if pa != pb:
      parent[pa] = pb
  for a, b in edges:
    union(a, b)
  groups = {}
  for uid in parent:
    root = find(uid)
    if root not in groups:
      groups[root] = []
    groups[root].append(uid)
  # Only groups with at least 2 images
  group_list = [g for g in groups.values() if len(g) >= 2]
  group_list.sort(key=lambda g: -len(g))
  return group_list[:max_groups]


@app.get("/duplicate-candidates")
def duplicate_candidates(
  threshold: float = Query(0.2, ge=0.05, le=1.0, description="L2 distance threshold"),
  max_groups: int = Query(50, ge=1, le=200, description="Max number of groups to return"),
):
  """CLIP 벡터 거리 기준 중복 후보 그룹 반환."""
  table = get_table()
  df = table.to_pandas()
  if df.empty:
    return {"groups": []}
  df_with_vec = df[df.apply(lambda r: not _is_zero_vector(r.get("vector")), axis=1)]
  if df_with_vec.empty:
    return {"groups": []}
  group_ids = _find_duplicate_groups(table, df_with_vec, threshold, max_groups)
  # Build id -> row (without vector) for lookup
  df_no_vec = df.drop(columns=["vector"], errors="ignore")
  df_no_vec["notes"] = df_no_vec.get("notes", "").fillna("")
  id_to_row = {}
  for _, r in df_no_vec.iterrows():
    id_to_row[str(r.get("id", ""))] = r.to_dict()
  out_groups = []
  for ids in group_ids:
    rows = []
    for iid in ids:
      row = id_to_row.get(iid)
      if row is None:
        continue
      if "tags" in row and hasattr(row["tags"], "tolist"):
        row["tags"] = row["tags"].tolist()
      rows.append(row)
    if len(rows) >= 2:
      out_groups.append(rows)
  return {"groups": out_groups}


@app.post("/backfill/embeddings")
async def backfill_embeddings():
  """기존 이미지에 대해 public/uploads 파일이 있으면 CLIP 벡터 계산 후 LanceDB에 반영."""
  table = get_table()
  df = table.to_pandas()
  if df.empty:
    return {"updated": 0, "skipped": 0, "failed": 0}
  updated = 0
  skipped = 0
  failed = 0
  for _, row in df.iterrows():
    id_val = row.get("id")
    filename = row.get("filename")
    if id_val is None or not filename:
      skipped += 1
      continue
    path = UPLOAD_DIR / str(filename).strip()
    if not path.exists():
      skipped += 1
      continue
    if not _is_zero_vector(row.get("vector")):
      skipped += 1
      continue
    try:
      vec = await encode_image_path(path)
      if vec and len(vec) == VECTOR_DIM:
        safe_id = str(id_val).replace("'", "''")
        table.update(where=f"id = '{safe_id}'", values={"vector": vec})
        updated += 1
      else:
        failed += 1
    except Exception:
      failed += 1
  return {"updated": updated, "skipped": skipped, "failed": failed}


@app.post("/convert")
async def convert_image(body: ConvertRequest):
  """이미지를 다른 포맷으로 변환해 새 이미지로 갤러리에 추가."""
  table = get_table()
  df = table.to_pandas()
  
  # 원본 이미지 찾기
  row = df[df["id"].astype(str) == str(body.imageId).strip()]
  if row.empty:
    return JSONResponse(status_code=404, content={"error": "Image not found"})
  
  src_row = row.iloc[0]
  src_filename = src_row.get("filename")
  src_path = UPLOAD_DIR / str(src_filename)
  
  if not src_path.exists():
    return JSONResponse(status_code=404, content={"error": "Image file not found"})
  
  # 새 ID 생성 (현재 타임스탬프)
  import time
  new_id = str(int(time.time() * 1000))
  
  # 포맷별 확장자 및 저장 옵션
  fmt = body.format.lower()
  ext_map = {"png": ".png", "jpg": ".jpg", "webp": ".webp"}
  new_ext = ext_map.get(fmt, ".png")
  new_filename = f"{new_id}{new_ext}"
  new_path = UPLOAD_DIR / new_filename
  
  # PIL로 변환
  try:
    img = Image.open(src_path)
    # RGBA → RGB (jpg는 알파 채널 미지원)
    if fmt == "jpg" and img.mode in ("RGBA", "LA", "P"):
      background = Image.new("RGB", img.size, (255, 255, 255))
      if img.mode == "P":
        img = img.convert("RGBA")
      background.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
      img = background
    elif fmt != "jpg" and img.mode == "P":
      img = img.convert("RGBA")
    
    width, height = img.size
    
    # 저장
    save_kwargs = {}
    if fmt == "jpg":
      save_kwargs = {"quality": body.quality, "optimize": True}
      img.save(new_path, "JPEG", **save_kwargs)
    elif fmt == "webp":
      save_kwargs = {"quality": body.quality, "method": 4}
      img.save(new_path, "WEBP", **save_kwargs)
    else:  # png
      img.save(new_path, "PNG", optimize=True)
    
    # 썸네일 생성
    thumb_filename = f"{new_id}.webp"
    thumb_path = THUMB_DIR / thumb_filename
    thumb_img = img.copy()
    thumb_img.thumbnail((THUMB_MAX_SIZE, THUMB_MAX_SIZE), Image.Resampling.LANCZOS)
    if thumb_img.mode in ("RGBA", "LA"):
      # webp는 RGBA 지원하지만 배경 흰색으로 변환
      bg = Image.new("RGB", thumb_img.size, (255, 255, 255))
      bg.paste(thumb_img, mask=thumb_img.split()[-1] if thumb_img.mode == "RGBA" else None)
      thumb_img = bg
    thumb_img.save(thumb_path, "WEBP", quality=THUMB_WEBP_QUALITY)
    
  except Exception as e:
    return JSONResponse(status_code=500, content={"error": f"Conversion failed: {str(e)}"})
  
  # 원본 이름에 포맷 정보 추가
  src_original = src_row.get("originalName", "image")
  src_base = Path(src_original).stem
  new_original = f"{src_base}_converted{new_ext}"
  
  # 원본 태그 복사
  src_tags = src_row.get("tags")
  if hasattr(src_tags, "tolist"):
    src_tags = src_tags.tolist()
  if not isinstance(src_tags, list):
    src_tags = []
  
  # CLIP 벡터 계산
  vector = ZERO_VECTOR
  try:
    vec = await encode_image_path(new_path)
    if vec and len(vec) == VECTOR_DIM:
      vector = vec
  except Exception:
    pass
  
  # LanceDB에 등록
  new_row = {
    "id": new_id,
    "filename": new_filename,
    "thumbnail": thumb_filename,
    "originalName": new_original,
    "tags": src_tags,
    "width": width,
    "height": height,
    "notes": "",
    "createdAt": __import__("datetime").datetime.now().isoformat(),
    "vector": vector,
  }
  table.add([new_row])
  
  # 응답 (vector 제외)
  response_row = {k: v for k, v in new_row.items() if k != "vector"}
  return {"success": True, "image": response_row}


@app.get("/tunnel-url")
def tunnel_url():
  """모바일 접속용 퀵 터널 URL. 없으면 null."""
  url = get_tunnel_url()
  return {"url": url}


if __name__ == "__main__":
  import uvicorn

  # Next.js(3000)로 퀵 터널 연결 → 폰에서 같은 갤러리 접속 가능
  threading.Thread(target=lambda: start_tunnel("http://localhost:3000"), daemon=True).start()
  uvicorn.run(app, host="0.0.0.0", port=8000)