import { NextResponse } from "next/server";

const PYTHON_API = process.env.PYTHON_API_URL ?? "http://127.0.0.1:8000";

export async function POST() {
  try {
    const res = await fetch(`${PYTHON_API}/backfill/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("Python backfill/embeddings error:", res.status, err);
      return NextResponse.json(
        { error: "백필 요청 실패", updated: 0, skipped: 0, failed: 0 },
        { status: 502 }
      );
    }
    const data = (await res.json()) as { updated?: number; skipped?: number; failed?: number };
    return NextResponse.json({
      updated: data.updated ?? 0,
      skipped: data.skipped ?? 0,
      failed: data.failed ?? 0,
    });
  } catch (error) {
    console.error("backfill/embeddings error:", error);
    return NextResponse.json(
      { error: "백필 중 오류 발생", updated: 0, skipped: 0, failed: 0 },
      { status: 500 }
    );
  }
}
