# server/main.py — FastAPI 백엔드 (태깅, 시맨틱 검색, 터널 URL)
import threading
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
from tagger import WD14Eva02Tagger
from tunnel import start_tunnel, get_tunnel_url

app = FastAPI()
app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:3000"],
  allow_methods=["*"],
  allow_headers=["*"],
)

tagger = WD14Eva02Tagger()
text_model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")


class SearchRequest(BaseModel):
  query: str
  all_tags: list

@app.post("/tag")
async def get_tags(file: UploadFile = File(...)):
  contents = await file.read()
  tags = tagger.predict(contents)
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