// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const THUMB_DIR = path.join(process.cwd(), "public", "thumbnails"); // 썸네일 폴더 추가
const METADATA_DIR = path.join(process.cwd(), "public", "metadata");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    await Promise.all([
      fs.mkdir(UPLOAD_DIR, { recursive: true }),
      fs.mkdir(THUMB_DIR, { recursive: true }),
      fs.mkdir(METADATA_DIR, { recursive: true }),
    ]);

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileId = Date.now().toString();

    // 1. 변수 정의: 원본 확장자 보존 및 썸네일용 webp 고정
    const originalExt = path.extname(file.name).toLowerCase() || '.bin';
    const imgFilename = `${fileId}${originalExt}`; // 예: 12345.png
    const thumbFilename = `${fileId}.webp`;       // 썸네일은 항상 .webp
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

    // 4. 메타데이터 생성: thumbFilename 누락 해결
    const metadata = {
      id: fileId,
      originalName: file.name,
      filename: imgFilename,
      thumbnail: thumbFilename, // 정의된 변수 사용
      tags: tags,
      createdAt: new Date().toISOString(),
    };

    await fs.writeFile(
      path.join(METADATA_DIR, jsonFilename),
      JSON.stringify(metadata, null, 2)
    );

    return NextResponse.json({ success: true, metadata });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}