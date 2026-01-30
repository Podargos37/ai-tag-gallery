// src/app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { query, all_tags } = await req.json();

    // Next.js 서버가 FastAPI 서버와 통신 (Proxy 역할)
    const pyRes = await fetch("http://localhost:8000/search_semantic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, all_tags }),
    });

    if (!pyRes.ok) throw new Error("FastAPI server error");

    const data = await pyRes.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ match_tags: [] }, { status: 500 });
  }
}