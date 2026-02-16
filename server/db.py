# server/db.py — LanceDB 연결, 테이블 생성, JSON → LanceDB 자동 마이그레이션

import json
from pathlib import Path

import lancedb

from schema import ImageRow, VECTOR_DIM

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DB_DIR = PROJECT_ROOT / "data" / "gallery"
METADATA_DIR = PROJECT_ROOT / "public" / "metadata"

# 512차원 0 벡터 (마이그레이션 시 임베딩 없을 때 사용)
ZERO_VECTOR = [0.0] * VECTOR_DIM


def _connect() -> lancedb.db.DBConnection:
    DB_DIR.mkdir(parents=True, exist_ok=True)
    return lancedb.connect(str(DB_DIR))


def _table_exists(db: lancedb.db.DBConnection) -> bool:
    return "images" in db.table_names()


def _table_empty(db: lancedb.db.DBConnection) -> bool:
    if not _table_exists(db):
        return True
    table = db.open_table("images")
    return table.count_rows() == 0


def _json_metadata_files() -> list[Path]:
    if not METADATA_DIR.exists():
        return []
    return sorted(METADATA_DIR.glob("*.json"))


def _load_json_rows() -> list[dict]:
    """public/metadata/*.json 을 읽어 ImageRow에 넣을 dict 리스트로 반환."""
    rows = []
    for path in _json_metadata_files():
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue
        row = {
            "id": data.get("id", ""),
            "filename": data.get("filename", ""),
            "thumbnail": data.get("thumbnail", ""),
            "originalName": data.get("originalName", ""),
            "tags": data.get("tags") if isinstance(data.get("tags"), list) else [],
            "width": data.get("width"),
            "height": data.get("height"),
            "notes": data.get("notes") or "",
            "createdAt": data.get("createdAt", ""),
            "vector": ZERO_VECTOR,
        }
        if not row["id"]:
            continue
        rows.append(row)
    return rows


def _migrate_json_into_table(db: lancedb.db.DBConnection, rows: list[dict]) -> None:
    """기존 테이블이 있으면 추가, 없으면 테이블 생성 후 삽입."""
    if not rows:
        return
    if _table_exists(db):
        table = db.open_table("images")
        table.add(rows)
    else:
        db.create_table("images", data=rows)


def ensure_migrated() -> None:
    """
    LanceDB 연결·테이블 유지 및 JSON 자동 마이그레이션.
    - 테이블 없음 + JSON 있음 → 테이블 생성하며 JSON 데이터 삽입.
    - 테이블 있으나 비어 있음 + JSON 있음 → 기존 테이블에 JSON 데이터 삽입.
    - 그 외에는 아무 작업 안 함.
    """
    db = _connect()
    json_files = _json_metadata_files()
    if not json_files:
        if not _table_exists(db):
            db.create_table("images", schema=ImageRow)
        return

    if _table_exists(db) and not _table_empty(db):
        return

    rows = _load_json_rows()
    _migrate_json_into_table(db, rows)


def get_table():
    """마이그레이션 후 images 테이블 반환. 호출 전 ensure_migrated() 가 불려 있어야 함."""
    db = _connect()
    if not _table_exists(db):
        db.create_table("images", schema=ImageRow)
    return db.open_table("images")
