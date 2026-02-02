// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { deleteProgress, setProgress } from "./progressStore";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const THUMB_DIR = path.join(process.cwd(), "public", "thumbnails"); // 썸네일 폴더 추가
const METADATA_DIR = path.join(process.cwd(), "public", "metadata");

async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  const workers = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, async () => {
    while (true) {
      const current = nextIndex++;
      if (current >= items.length) break;
      results[current] = await fn(items[current], current);
    }
  });

  await Promise.all(workers);
  return results;
}

export async function POST(req: NextRequest) {
  try {
    const uploadId = req.headers.get("x-upload-id") || "";
    const hintedTotal = Number(req.headers.get("x-total-files") || "0") || 0;
    if (uploadId) {
      setProgress(uploadId, {
        status: "uploading",
        total: hintedTotal,
        processed: 0,
        updatedAt: Date.now(),
      });
    }

    const formData = await req.formData();
    const files = (formData.getAll("files") as File[]).filter(Boolean);
    const legacySingle = formData.get("file") as File | null;
    const allFiles = files.length > 0 ? files : legacySingle ? [legacySingle] : [];
    if (allFiles.length === 0) return NextResponse.json({ error: "No file" }, { status: 400 });

    const imageFiles = allFiles.filter((f) => (f?.type || "").startsWith("image/"));
    if (imageFiles.length === 0) {
      return NextResponse.json({ error: "No image files" }, { status: 400 });
    }

    await Promise.all([
      fs.mkdir(UPLOAD_DIR, { recursive: true }),
      fs.mkdir(THUMB_DIR, { recursive: true }),
      fs.mkdir(METADATA_DIR, { recursive: true }),
    ]);

    const baseId = Date.now();
    if (uploadId) {
      setProgress(uploadId, {
        status: "processing",
        total: imageFiles.length,
        processed: 0,
        updatedAt: Date.now(),
      });
    }

    let completed = 0;
    const metadataList = await mapLimit(imageFiles, 3, async (file, index) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileId = (baseId + index).toString();

      // 1. 변수 정의: 원본 확장자 보존 및 썸네일용 webp 고정
      const originalExt = path.extname(file.name).toLowerCase() || ".bin";
      const imgFilename = `${fileId}${originalExt}`; // 예: 12345.png
      const thumbFilename = `${fileId}.webp`; // 썸네일은 항상 .webp
      const jsonFilename = `${fileId}.json`;

      // 2. 원본 저장: 모든 메타데이터 보존 (Bypass)
      await fs.writeFile(path.join(UPLOAD_DIR, imgFilename), buffer);

      // 3. 썸네일 저장: thumbnails 폴더에 webp로 리사이징
      await sharp(buffer)
        .rotate()
        .resize(400)
        .webp({ quality: 75 })
        .toFile(path.join(THUMB_DIR, thumbFilename)); // thumbFilename 사용

      // AI 태깅 로직 (기존 유지)
      let tags = ["untagged"];
      try {
        const pyFormData = new FormData();
        pyFormData.append("file", new Blob([buffer], { type: file.type }), file.name);
        const pyRes = await fetch("http://127.0.0.1:8000/tag", { method: "POST", body: pyFormData });
        if (pyRes.ok) {
          const pyData = await pyRes.json();
          tags = pyData.tags;
        }
      } catch (e) {
        console.warn("AI Tagging failed");
      }

      // 4. 메타데이터 생성
      const metadata = {
        id: fileId,
        originalName: file.name,
        filename: imgFilename,
        thumbnail: thumbFilename,
        tags: tags,
        createdAt: new Date().toISOString(),
        notes: "",
      };

      await fs.writeFile(path.join(METADATA_DIR, jsonFilename), JSON.stringify(metadata, null, 2));

      if (uploadId) {
        completed += 1;
        setProgress(uploadId, {
          status: "processing",
          total: imageFiles.length,
          processed: completed,
          updatedAt: Date.now(),
        });
      }
      return metadata;
    });

    if (uploadId) {
      setProgress(uploadId, {
        status: "done",
        total: imageFiles.length,
        processed: imageFiles.length,
        updatedAt: Date.now(),
      });
      // 클라이언트가 마지막 상태를 읽을 시간을 주고 정리
      setTimeout(() => deleteProgress(uploadId), 30_000);
    }

    return NextResponse.json({ success: true, metadata: metadataList });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}