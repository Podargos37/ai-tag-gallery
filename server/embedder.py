# server/embedder.py — CLIP 이미지 임베딩 (유사 이미지 검색용)
import asyncio
from pathlib import Path
from typing import Optional

from sentence_transformers import SentenceTransformer

# CLIP ViT-B/32 → 512차원 (schema.VECTOR_DIM과 일치) (VECTOR_DIM과 일치)
CLIP_MODEL_ID = "clip-ViT-B-32"

_image_model: Optional[SentenceTransformer] = None
_model_lock: Optional[asyncio.Lock] = None


def _get_lock() -> asyncio.Lock:
    global _model_lock
    if _model_lock is None:
        _model_lock = asyncio.Lock()
    return _model_lock


async def get_image_model() -> SentenceTransformer:
    global _image_model
    lock = _get_lock()
    async with lock:
        if _image_model is None:
            _image_model = await asyncio.to_thread(SentenceTransformer, CLIP_MODEL_ID)
    return _image_model


def _encode_path_sync(path: Path, model: SentenceTransformer) -> list[float]:
    from PIL import Image

    try:
        img = Image.open(path).convert("RGB")
        vec = model.encode(img)
        if hasattr(vec, "tolist"):
            return vec.tolist()
        return list(vec)
    except Exception:
        return []


async def encode_image_path(image_path: Path) -> list[float]:
    """이미지 경로 → 512차원 벡터. 실패 시 빈 리스트."""
    if not image_path.exists():
        return []
    model = await get_image_model()
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, _encode_path_sync, image_path, model)
