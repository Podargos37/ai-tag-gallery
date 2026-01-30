// src/app/api/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const filename = searchParams.get("filename");

    if (!id || !filename) {
      return NextResponse.json({ error: "Missing ID or filename" }, { status: 400 });
    }

    // 1. 경로 설정
    const uploadPath = path.join(process.cwd(), "public", "uploads", filename);
    const thumbPath = path.join(process.cwd(), "public", "thumbnails", `${id}.webp`);
    const metadataPath = path.join(process.cwd(), "public", "metadata", `${id}.json`);

    // 2. 파일 삭제 실행
    await Promise.all([
      fs.unlink(uploadPath).catch(() => console.warn(`File not found: ${uploadPath}`)),
      fs.unlink(thumbPath).catch(() => console.warn(`Thumbnail not found: ${thumbPath}`)),
      fs.unlink(metadataPath).catch(() => console.warn(`Metadata not found: ${metadataPath}`))
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete files" }, { status: 500 });
  }
}