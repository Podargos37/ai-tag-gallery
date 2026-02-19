# server/main.py — FastAPI 백엔드 (태깅, 시맨틱 검색, LanceDB 이미지 API, 터널 URL)
import asyncio
import gc
import threading
from contextlib import asynccontextmanager
from typing import Optional

import torch
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
from tagger import WD14Eva02Tagger
from tunnel import start_tunnel, get_tunnel_url

from db import ensure_migrated, get_table
from schema import VECTOR_DIM

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
async def get_tags(file: UploadFile = File(...)):
  tagger = await get_or_load_tagger()
  contents = await file.read()
  tags = await asyncio.to_thread(tagger.predict, contents)
  schedule_tagger_unload()
  return {"tags": tags}


@app.post("/search_semantic")
async def search_semantic(req: SearchRequest):
  if not req.query or not req.all_tags:
    return {"match_tags": []}

  query_vec = text_model.encode(req.query, convert_to_tensor=True)
  tag_vecs = text_model.encode(req.all_tags, convert_to_tensor=True)
  cos_scores = util.cos_sim(query_vec, tag_vecs)[0]

  match_tags = [req.all_tags[i] for i, score in enumerate(cos_scores) if score > 0.8]
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
def create_image(body: ImageCreateBody):
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
    "vector": ZERO_VECTOR,
  }
  table = get_table()
  table.add([row])
  return {"success": True}


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