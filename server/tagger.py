# server/tagger.py
import io
import torch
import timm
import pandas as pd
from PIL import Image
from transformers import ViTImageProcessor
from huggingface_hub import hf_hub_download

class WD14Eva02Tagger:
    def __init__(self):
        print("Loading WD-EVA02-Large-V3...")
        self.model_id = "SmilingWolf/wd-eva02-large-tagger-v3"
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        # 전처리기 설정
        self.processor = ViTImageProcessor(
            do_resize=True,
            size={"height": 448, "width": 448},
            do_normalize=True,
            image_mean=[0.48145466, 0.4578275, 0.40821073],
            image_std=[0.26862954, 0.26130258, 0.27577711]
        )

        # 모델 로드
        self.model = timm.create_model(f"hf_hub:{self.model_id}", pretrained=True).to(self.device)
        self.model.eval()

        # 태그 리스트 로드
        tags_path = hf_hub_download(repo_id=self.model_id, filename="selected_tags.csv")
        self.labels = pd.read_csv(tags_path)['name'].tolist()

    def predict(self, image_bytes):
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            inputs = self.processor(images=image, return_tensors="pt").to(self.device)

            with torch.no_grad():
                outputs = self.model(inputs['pixel_values'])
                probs = torch.sigmoid(outputs)[0]

                threshold = 0.35
                indices = torch.where(probs > threshold)[0]
                found_tags = [self.labels[i.item()].replace('_', ' ') for i in indices]

                exclude = {'general', 'sensitive', 'questionable', 'explicit', 'rating:g', 'rating:s', 'rating:q', 'rating:e'}
                return [t for t in found_tags if t not in exclude]
        except Exception as e:
            print(f"Prediction Error: {e}")
            return ["error"]