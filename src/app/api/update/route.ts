import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function PATCH(req: NextRequest) {
  try {
    const { id, notes } = await req.json();
    const metadataPath = path.join(process.cwd(), "public", "metadata", `${id}.json`);

    // 기존 데이터 읽기
    const content = await fs.readFile(metadataPath, "utf-8");
    const metadata = JSON.parse(content);

    // 메모 업데이트 및 저장
    metadata.notes = notes;
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}