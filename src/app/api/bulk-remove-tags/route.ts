import { NextRequest, NextResponse } from "next/server";

const PYTHON_API = process.env.PYTHON_API_URL ?? "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tagNames = Array.isArray(body?.tagNames) ? body.tagNames.filter((t: unknown) => typeof t === "string") : [];
    const res = await fetch(`${PYTHON_API}/bulk-remove-tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag_names: tagNames }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("Python bulk-remove-tags error:", res.status, err);
      return NextResponse.json({ error: "Bulk remove failed" }, { status: 500 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Bulk remove tags error:", error);
    return NextResponse.json({ error: "Bulk remove failed" }, { status: 500 });
  }
}
