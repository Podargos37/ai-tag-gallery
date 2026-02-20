# server/db.py — LanceDB 연결, 테이블 생성

from pathlib import Path

import lancedb

from schema import ImageRow, VECTOR_DIM

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DB_DIR = PROJECT_ROOT / "data" / "gallery"

# 512차원 0 벡터 (신규 삽입 시 임베딩 없을 때 사용)
ZERO_VECTOR = [0.0] * VECTOR_DIM


def _connect() -> lancedb.db.DBConnection:
    DB_DIR.mkdir(parents=True, exist_ok=True)
    return lancedb.connect(str(DB_DIR))


def _table_exists(db: lancedb.db.DBConnection) -> bool:
    return "images" in db.table_names()


def ensure_migrated() -> None:
    """LanceDB 연결 후 images 테이블이 없으면 스키마로 생성."""
    db = _connect()
    if not _table_exists(db):
        db.create_table("images", schema=ImageRow)


def get_table():
    """테이블 반환. 호출 전 ensure_migrated() 가 불려 있어야 함."""
    db = _connect()
    if not _table_exists(db):
        db.create_table("images", schema=ImageRow)
    return db.open_table("images")
