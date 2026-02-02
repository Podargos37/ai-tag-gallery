// src/app/api/upload/progress/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cleanupOldProgress, getProgress } from "../progressStore";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  cleanupOldProgress();
  const p = getProgress(id);
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(p);
}

