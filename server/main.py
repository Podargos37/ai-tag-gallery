# server/main.py
# 백그라운드가 돌아가는 메인 서버
import threading
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
from tagger import WD14Eva02Tagger
from tunnel import start_tunnel, get_tunnel_url

app = FastAPI()
# CORS(Cross-Origin Resource Sharing) 설정
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], allow_methods=["*"], allow_headers=["*"])
"""
allow_origins,누가? - "요청을 보내는 웹사이트 주소를 제한한다."
  + localhost:3000은 next.js의 기본 로컬 개발 프론트
allow_methods,어떻게? - "어떤 HTTP 동작을 허용할지 정한다. GET(조회), POST(등록), DELETE(삭제) 등"
  + 모든 라우터(@app.???)가 모두 POST 메서드만 사용하므로 POST로만 설정해도 충분하다.
  + OPTIONS는 브라우저가 실제 요청을 보내기 전, 서버가 안전한지 미리 확인하는 예비 요청(Preflight)를 보낸 때 사용한다. 보통 함께 허용함.
allow_headers,무엇을? - 요청에 포함된 추가 정보(Header)를 제한한다. 인증 토큰(Authorization)이나 데이터 형식(Content-Type) 같은 정보를 주고받아도 되는지 결정.
"""

# 모델 인스턴스 생성
tagger = WD14Eva02Tagger()
text_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')


class SearchRequest(BaseModel):
  query: str
  all_tags: list
"""
FastAIPI에서 프론트엔드가 서버로 데이터를 보낼 때, 스키마를 정의하는 부분
query: str 은 검색어는 반드시 문자열
all_tags: list는 비교할 전체 태그들은 반드시 리스트 형태
만약 형식에 맞지 않는다면 FastAPI가 자동으로 에러 메시지를 응답하며 실행을 막아줌.
-> 로직을 보호하는 방어막 역할

from pydantic import BaseModel을 통해 class SearchRequest(BaseModel)로 BaseModel을 상속받음.
기능으로는 자동 형변환과 자동 문서화가 있음.
"""

@app.post("/tag")
async def get_tags(file: UploadFile = File(...)):
  contents = await file.read()
  tags = tagger.predict(contents)
  return {"tags": tags}
"""
/tag라는 주소로 post 요청이 들어오면 이 함수를 실행하겠다.
get은 주소창에 정보를 담기 때문에 용량이 큰 이미지는 body를 사용하는 POST 방식을 사용한다.
async def로 비동기 함수라고 선언.
tagger.predict는 tagger.py에서 만든 predict라는 사용자 정의 메서드 사용.
"""

@app.post("/search_semantic")
async def search_semantic(req: SearchRequest):
  if not req.query or not req.all_tags:
    return {"match_tags": []}

  query_vec = text_model.encode(req.query, convert_to_tensor=True)
  tag_vecs = text_model.encode(req.all_tags, convert_to_tensor=True)
  cos_scores = util.cos_sim(query_vec, tag_vecs)[0]

  match_tags = [req.all_tags[i] for i, score in enumerate(cos_scores) if score > 0.8]
  return {"match_tags": match_tags}
"""
정확도는 0.8 이상으로 설정
"""


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