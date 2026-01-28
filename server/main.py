import io
import os
import pandas as pd
import numpy as np
from PIL import Image
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from huggingface_hub import hf_hub_download
from sentence_transformers import SentenceTransformer, util
import onnxruntime as ort
from pydantic import BaseModel

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

MODEL_REPO = "SmilingWolf/wd-v1-4-vit-tagger-v2"
MODEL_FILE = "model.onnx"
LABEL_FILE = "selected_tags.csv"


class WD14Tagger:
    def __init__(self):
        print("Loading WD14 Model...")
        model_path = hf_hub_download(MODEL_REPO, MODEL_FILE)
        label_path = hf_hub_download(MODEL_REPO, LABEL_FILE)

        self.session = ort.InferenceSession(model_path, providers=['CPUExecutionProvider'])
        self.labels = pd.read_csv(label_path)
        self.tag_names = self.labels["name"].tolist()
        print("Model Loaded Successfully!")

    def predict(self, image_bytes, threshold=0.2):
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img = img.resize((448, 448), resample=Image.Resampling.LANCZOS)

        # 배열 변환 및 차원 확장 (WD14 모델 입력 규격에 맞춤)
        img_arr = np.array(img).astype(np.float32)
        img_arr = img_arr[:, :, ::-1]
        img_arr = np.expand_dims(img_arr, axis=0)

        # 추론
        input_name = self.session.get_inputs()[0].name
        probs = self.session.run(None, {input_name: img_arr})[0][0]

        # 문턱값(threshold) 이상의 태그만 추출
        res = []
        for i, p in enumerate(probs):
            if p >= threshold and i >= 9:  # 앞쪽 9개는 일반 카테고리 정보이므로 제외
                res.append(self.tag_names[i].replace("_", " "))

        return res[:30]


tagger = WD14Tagger()


@app.post("/tag")
async def get_tags(file: UploadFile = File(...)):
    try:
        contents = await file.read()

        tags = tagger.predict(contents)

        return {"tags": tags}
    except Exception as e:
        print(f"Tagging Error: {e}")
        return {"error": str(e), "tags": ["error"]}

text_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')


class SearchRequest(BaseModel):
    query: str
    all_tags: list


@app.post("/search_semantic")
async def search_semantic(req: SearchRequest):
    # 입력한 검색어가 없는 경우 빈 결과 반환
    if not req.query:
        return {"match_tags": []}

    # 태그를 벡터화
    query_vec = text_model.encode(req.query, convert_to_tensor=True)
    tag_vecs = text_model.encode(req.all_tags, convert_to_tensor=True)

    # 유사도 계산
    from sentence_transformers import util
    cos_scores = util.cos_sim(query_vec, tag_vecs)[0]

    # 유사도
    match_indices = [i for i, score in enumerate(cos_scores) if score > 0.5]
    match_tags = [req.all_tags[i] for i in match_indices]

    return {"match_tags": match_tags}



if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)