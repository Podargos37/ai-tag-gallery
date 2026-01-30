// src/app/api/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function PATCH(req: NextRequest) {
  try {
    const { id, notes, tags } = await req.json();
    const metadataPath = path.join(process.cwd(), "public", "metadata", `${id}.json`);

    // 기존 데이터 읽기
    const content = await fs.readFile(metadataPath, "utf-8");
    const metadata = JSON.parse(content);

    // 데이터 업데이트 (전달된 값이 있을 때만 교체)
    if (notes !== undefined) metadata.notes = notes;
    if (tags !== undefined) metadata.tags = tags;

    // 변경사항 저장
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}