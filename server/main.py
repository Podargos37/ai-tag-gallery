import io
import torch
import timm
import pandas as pd  # CSV 처리를 위해 추가
from PIL import Image
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from transformers import ViTImageProcessor
from huggingface_hub import hf_hub_download
from sentence_transformers import SentenceTransformer, util
from pydantic import BaseModel

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


class WD14Eva02Tagger:
    def __init__(self):
        print("Loading WD-EVA02-Large-V3 (Final Stable Mode)...")
        self.model_id = "SmilingWolf/wd-eva02-large-tagger-v3"
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        # 1. 전처리기 설정
        self.processor = ViTImageProcessor(
            do_resize=True,
            size={"height": 448, "width": 448},
            do_normalize=True,
            image_mean=[0.48145466, 0.4578275, 0.40821073],
            image_std=[0.26862954, 0.26130258, 0.27577711]
        )

        # 2. 모델 로드
        self.model = timm.create_model(f"hf_hub:{self.model_id}", pretrained=True).to(self.device)
        self.model.eval()

        # 3. [핵심 수정] selected_tags.csv 파일을 받아 태그 리스트 생성
        tags_path = hf_hub_download(repo_id=self.model_id, filename="selected_tags.csv")
        df = pd.read_csv(tags_path)

        # 'name' 컬럼이 실제 태그 텍스트입니다.
        self.labels = df['name'].tolist()
        print(f"WD-EVA02 V3 Loaded with {len(self.labels)} tags on {self.device}!")

    def predict(self, image_bytes):
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            inputs = self.processor(images=image, return_tensors="pt").to(self.device)

            with torch.no_grad():
                outputs = self.model(inputs['pixel_values'])
                probs = torch.sigmoid(outputs)[0]

                # 상위 태그 추출 (V3는 0.3~0.35 권장)
                threshold = 0.35
                indices = torch.where(probs > threshold)[0]

                # 인덱스에 맞는 태그 이름 매핑
                found_tags = [self.labels[i.item()].replace('_', ' ') for i in indices]

                # 메타 태그 제외
                exclude = {'general', 'sensitive', 'questionable', 'explicit', 'rating:g', 'rating:s', 'rating:q',
                           'rating:e'}
                return [t for t in found_tags if t not in exclude]
        except Exception as e:
            print(f"Prediction Error: {e}")
            return ["error"]


tagger = WD14Eva02Tagger()


@app.post("/tag")
async def get_tags(file: UploadFile = File(...)):
    contents = await file.read()
    tags = tagger.predict(contents)
    return {"tags": tags}


text_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')


class SearchRequest(BaseModel):
    query: str
    all_tags: list


@app.post("/search_semantic")
async def search_semantic(req: SearchRequest):
    if not req.query or not req.all_tags:
        return {"match_tags": []}

    try:
        # 검색어와 태그들을 벡터(숫자 뭉치)로 변환
        query_vec = text_model.encode(req.query, convert_to_tensor=True)
        tag_vecs = text_model.encode(req.all_tags, convert_to_tensor=True)

        # 유사도 계산 (얼마나 의미가 가까운지)
        cos_scores = util.cos_sim(query_vec, tag_vecs)[0]

        match_tags = [req.all_tags[i] for i, score in enumerate(cos_scores) if score > 0.7]

        return {"match_tags": match_tags}
    except Exception as e:
        print(f"Search Error: {e}")
        return {"match_tags": []}

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)