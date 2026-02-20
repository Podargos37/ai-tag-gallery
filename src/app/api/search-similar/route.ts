import { NextRequest, NextResponse } from "next/server";

const PYTHON_API = process.env.PYTHON_API_URL ?? "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const imageId = body?.imageId;
    if (!imageId || typeof imageId !== "string") {
      return NextResponse.json({ error: "Missing imageId" }, { status: 400 });
    }
    const limit = Math.min(50, Math.max(1, Number(body?.limit) || 20));

    const res = await fetch(`${PYTHON_API}/search_similar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageId: String(imageId).trim(), limit }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Python search_similar error:", res.status, err);
      return NextResponse.json({ results: [] }, { status: 200 });
    }
    const data = await res.json();
    return NextResponse.json({ results: data.results ?? [] });
  } catch (error) {
    console.error("search_similar error:", error);
    return NextResponse.json({ results: [] }, { status: 200 });
  }
}
