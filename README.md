![img.png](img.png)


## AI Semantic Tag Gallery
This is an intelligent gallery project that automatically generates tags upon image upload and allows for semantic-based image searching, moving beyond simple keyword matching. 

---
## Key Features
+ Automatically extracts dozens of relevant tags from uploaded images using the wd-eva02-large-tagger-v3 model.
+ Utilizes the paraphrase-multilingual-MiniLM-L12-v2 model to calculate semantic similarity between search terms and tags, enabling results like "dog" or "cat" when searching for "animal."
+ Real-time Editing: Supports manual editing of tags and personal notes for each image.

---
## Tech Stack
Frontend
+ Framework: Next.js 14 (App Router)
+ Styling: Tailwind CSS
+ Icons: Lucide React

Backend (AI Server)
+ Framework: FastAPI

AI Models:
+ wd-eva02-large-tagger-v3 (Image Tagging)
+ Sentence-Transformers (Semantic Vector Search)
+ Inference: ONNX Runtime

---
## Getting Started
Prerequisites
+ Node.js 18+
+ Python 3.10+

---
## AI Models Used
+ Image Tagging: WD-v3 ViT-Eva02-Large-Tagger
+ Text Embedding: paraphrase-multilingual-MiniLM-L12-v2
---

![img.png](img.png)

#  AI Semantic Tag Gallery

이미지 업로드 시 AI가 자동으로 태그를 생성하고, 단순 키워드 매칭을 넘어 의미 중심(Semantic)으로 이미지를 검색할 수 있는 지능형 갤러리 프로젝트입니다.

---

##  주요 기능

* wd-eva02-large-tagger-v3 모델을 사용하여 업로드된 이미지에서 수십 개의 관련 태그를 자동으로 추출합니다. 
* `paraphrase-multilingual-MiniLM-L12-v2` 모델을 활용하여 검색어와 태그 사이의 의미적 유사도를 계산, "동물" 검색 시 "강아지", "고양이" 등을 찾아냅니다. 
* 실시간 편집: 이미지별 태그 수정 및 개인 메모 작성이 가능합니다.

##  기술 스택

### Frontend
* **Framework**: Next.js 14 (App Router)
* **Styling**: Tailwind CSS
* **Icons**: Lucide React

### Backend (AI Server)
* **Framework**: FastAPI 
* **AI Models**: 
    * wd-eva02-large-tagger-v3 (Image Tagging) 
    * Sentence-Transformers (Semantic Vector Search) 
* **Inference**: ONNX Runtime 

---

##  시작하기

### Prerequisites
* Node.js 18+
* Python 3.10+

### Installation & Run
1.  Repository 클론:
    ```bash
    git clone https://github.com/Podargos37/ai-tag-gallery.git
    cd ai-tag-gallery
    ```
2.  의존성 설치 및 실행:
    * 루트 폴더에 있는 `run.bat` 파일을 더블 클릭하면 모든 서버가 자동으로 실행됩니다.
    * 브라우저에서 `http://localhost:3000` 접속 확인.

---
## 사용된 AI 모델
1. **Image Tagging**: [WD-v3 ViT-Eva02-Large-Tagger](https://huggingface.co/SmilingWolf/wd-v3-vit-eva02-large-tagger)
   - 이미지에서 애니메이션/일반 태그를 높은 정확도로 추출하는 최신 V3 모델입니다.
2. **Text Embedding**: [paraphrase-multilingual-MiniLM-L12-v2](https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2)
   - 50개 이상의 언어를 지원하며 검색어의 '의미'를 파악하는 Sentence-Transformers 모델입니다.