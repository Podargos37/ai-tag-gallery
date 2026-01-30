# server/main.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
from tagger import WD14Eva02Tagger  # 분리한 클래스 불러오기

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# 모델 인스턴스 생성
tagger = WD14Eva02Tagger()
text_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')


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

    match_tags = [req.all_tags[i] for i, score in enumerate(cos_scores) if score > 0.7]
    return {"match_tags": match_tags}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)