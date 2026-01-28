import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const METADATA_DIR = path.join(process.cwd(), "public", "metadata");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    // 폴더 생성 보장
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.mkdir(METADATA_DIR, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileId = Date.now().toString();
    const imgFilename = `${fileId}.webp`;
    const jsonFilename = `${fileId}.json`;

    await sharp(buffer)
      .rotate()
      .webp({ quality: 80 })
      .toFile(path.join(UPLOAD_DIR, imgFilename));

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

    const metadata = {
      id: fileId,
      originalName: file.name,
      filename: imgFilename,
      tags: tags,
      createdAt: new Date().toISOString(),
    };

    await fs.writeFile(
      path.join(METADATA_DIR, jsonFilename),
      JSON.stringify(metadata, null, 2)
    );

    return NextResponse.json({ success: true, metadata });
  } catch (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}