import { NextRequest, NextResponse } from "next/server";

const PYTHON_API = process.env.PYTHON_API_URL ?? "http://127.0.0.1:8000";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const threshold = Math.min(1, Math.max(0.05, Number(searchParams.get("threshold")) || 0.2));
    const maxGroups = Math.min(200, Math.max(1, Number(searchParams.get("max_groups")) || 50));

    const res = await fetch(
      `${PYTHON_API}/duplicate-candidates?threshold=${encodeURIComponent(threshold)}&max_groups=${encodeURIComponent(maxGroups)}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Python duplicate-candidates error:", res.status, err);
      return NextResponse.json({ groups: [] }, { status: 200 });
    }
    const data = (await res.json()) as { groups?: unknown[] };
    return NextResponse.json({ groups: data.groups ?? [] });
  } catch (error) {
    console.error("duplicate-candidates error:", error);
    return NextResponse.json({ groups: [] }, { status: 200 });
  }
}
