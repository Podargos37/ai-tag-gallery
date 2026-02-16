# server/schema.py — LanceDB images 테이블 스키마 (ImageItem + vector)
# 테이블 생성·삽입·검색 시 이 스키마를 사용해 타입/컬럼 일관성을 유지합니다.

from typing import List, Optional

from lancedb.pydantic import LanceModel, Vector

# 벡터 차원: 임베딩 모델에 따름. 예: CLIP ViT-B/32 → 512. 변경 시 마이그레이션 필요.
VECTOR_DIM = 512


class ImageRow(LanceModel):
    """갤러리 이미지 한 건. 기존 JSON/ImageItem 필드 + vector 컬럼."""

    id: str
    filename: str
    thumbnail: str
    originalName: str
    tags: List[str]
    width: Optional[int] = None
    height: Optional[int] = None
    notes: str = ""
    createdAt: str
    vector: Vector(VECTOR_DIM)
