import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import {
  UPLOAD_DIR,
  THUMB_DIR,
  THUMB_MAX_SIZE,
  THUMB_WEBP_QUALITY,
} from "./constants";
import { tagImage, registerImage, type ImageMetadataForApi } from "./pythonClient";
import type { ImageItem } from "@/types/gallery";

export type ProcessOneImageOptions = {
  baseId: number;
  excludeTagSet: Set<string>;
  /** WD14 확률 임계값 (0.2~1.0). 없으면 Python 기본값 사용 */
  wd14Threshold?: number;
  /** 한 장 처리 완료 시 호출 (progress 갱신용) */
  onComplete?: () => void;
};

const DEFAULT_TAG = "untagged";

/**
 * 단일 이미지 처리: 원본 저장 → 썸네일 생성 → AI 태깅 → LanceDB 등록
 */
export async function processOneImage(
  file: File,
  index: number,
  options: ProcessOneImageOptions
): Promise<ImageItem> {
  const { baseId, excludeTagSet, wd14Threshold, onComplete } = options;
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileId = (baseId + index).toString();

  const originalExt = path.extname(file.name).toLowerCase() || ".bin";
  const imgFilename = `${fileId}${originalExt}`;
  const thumbFilename = `${fileId}.webp`;

  await saveOriginal(buffer, imgFilename);
  const { width: origWidth, height: origHeight } = await createThumbnail(
    buffer,
    thumbFilename
  );

  let tags = await fetchAndFilterTags(file, buffer, excludeTagSet, wd14Threshold);

  const metadata: ImageMetadataForApi = {
    id: fileId,
    originalName: file.name,
    filename: imgFilename,
    thumbnail: thumbFilename,
    width: typeof origWidth === "number" ? origWidth : undefined,
    height: typeof origHeight === "number" ? origHeight : undefined,
    tags,
    createdAt: new Date().toISOString(),
    notes: "",
  };

  await registerImage(metadata);
  onComplete?.();

  return toImageItem(metadata);
}

async function saveOriginal(buffer: Buffer, imgFilename: string): Promise<void> {
  await fs.writeFile(path.join(UPLOAD_DIR, imgFilename), buffer);
}

async function createThumbnail(
  buffer: Buffer,
  thumbFilename: string
): Promise<{ width?: number; height?: number }> {
  const meta = await sharp(buffer).rotate().metadata();
  await sharp(buffer)
    .rotate()
    .resize(THUMB_MAX_SIZE)
    .webp({ quality: THUMB_WEBP_QUALITY })
    .toFile(path.join(THUMB_DIR, thumbFilename));
  return {
    width: typeof meta.width === "number" ? meta.width : undefined,
    height: typeof meta.height === "number" ? meta.height : undefined,
  };
}

async function fetchAndFilterTags(
  file: File,
  buffer: Buffer,
  excludeTagSet: Set<string>,
  wd14Threshold?: number
): Promise<string[]> {
  let raw: string[] = [];
  try {
    raw = await tagImage(file, buffer, wd14Threshold);
  } catch (e) {
    console.warn("AI Tagging failed");
  }
  const filtered =
    excludeTagSet.size > 0
      ? raw.filter((t) => !excludeTagSet.has(String(t).toLowerCase().trim()))
      : raw;
  return filtered.length > 0 ? filtered : [DEFAULT_TAG];
}

function toImageItem(m: ImageMetadataForApi): ImageItem {
  return {
    id: m.id,
    originalName: m.originalName,
    filename: m.filename,
    thumbnail: m.thumbnail,
    width: m.width,
    height: m.height,
    tags: m.tags,
    createdAt: m.createdAt,
    notes: m.notes,
  };
}
