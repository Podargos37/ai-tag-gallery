// src/app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { readSettingsFromFile } from "@/lib/server/settings";

export async function POST(req: NextRequest) {
  try {
    const { query, all_tags } = await req.json();
    const settings = await readSettingsFromFile();
    const similarity_threshold = settings.semanticSimilarityThreshold ?? 0.8;

    const pyRes = await fetch("http://localhost:8000/search_semantic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        all_tags,
        similarity_threshold,
      }),
    });

    if (!pyRes.ok) throw new Error("FastAPI server error");

    const data = await pyRes.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ match_tags: [] }, { status: 500 });
  }
}