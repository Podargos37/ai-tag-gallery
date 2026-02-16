// src/app/api/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const PYTHON_API = process.env.PYTHON_API_URL ?? "http://127.0.0.1:8000";

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const filename = searchParams.get("filename");

    if (!id || !filename) {
      return NextResponse.json({ error: "Missing ID or filename" }, { status: 400 });
    }

    const uploadPath = path.join(process.cwd(), "public", "uploads", filename);
    const thumbPath = path.join(process.cwd(), "public", "thumbnails", `${id}.webp`);

    await Promise.all([
      fs.unlink(uploadPath).catch(() => console.warn(`File not found: ${uploadPath}`)),
      fs.unlink(thumbPath).catch(() => console.warn(`Thumbnail not found: ${thumbPath}`)),
    ]);

    const res = await fetch(`${PYTHON_API}/images?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("Python delete error:", res.status, err);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete files" }, { status: 500 });
  }
}