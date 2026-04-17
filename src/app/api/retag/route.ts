import fs from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { computeAiTagsWithSettings } from "@/lib/server/computeAiTags";
import { UPLOAD_DIR } from "@/lib/upload/constants";

const PYTHON_API = process.env.PYTHON_API_URL ?? "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body?.id != null ? String(body.id).trim() : "";
    const filenameRaw = body?.filename != null ? String(body.filename) : "";
    if (!id || !filenameRaw) {
      return NextResponse.json({ error: "id와 filename이 필요합니다." }, { status: 400 });
    }

    const safeName = path.basename(filenameRaw.replace(/\\/g, "/"));
    if (!safeName) {
      return NextResponse.json({ error: "유효하지 않은 filename입니다." }, { status: 400 });
    }

    const resolvedUpload = path.resolve(UPLOAD_DIR);
    const abs = path.resolve(path.join(resolvedUpload, safeName));
    if (!abs.startsWith(resolvedUpload + path.sep) && abs !== resolvedUpload) {
      return NextResponse.json({ error: "유효하지 않은 경로입니다." }, { status: 400 });
    }

    let buffer: Buffer;
    try {
      buffer = await fs.readFile(abs);
    } catch {
      return NextResponse.json({ error: "이미지 파일을 찾을 수 없습니다." }, { status: 404 });
    }

    const tags = await computeAiTagsWithSettings({
      displayName: safeName,
      buffer,
    });

    const patchRes = await fetch(`${PYTHON_API}/images/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags }),
    });
    if (!patchRes.ok) {
      const err = await patchRes.text();
      console.error("retag PATCH error:", patchRes.status, err);
      return NextResponse.json({ error: "태그 저장에 실패했습니다." }, { status: 500 });
    }

    return NextResponse.json({ success: true, tags });
  } catch (error) {
    console.error("retag error:", error);
    return NextResponse.json({ error: "다시 태깅 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
