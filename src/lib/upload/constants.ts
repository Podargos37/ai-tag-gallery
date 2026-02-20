import path from "path";

export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
export const THUMB_DIR = path.join(process.cwd(), "public", "thumbnails");
export const PYTHON_API_URL = process.env.PYTHON_API_URL ?? "http://127.0.0.1:8000";

export const THUMB_MAX_SIZE = 400;
export const THUMB_WEBP_QUALITY = 75;
