// src/app/api/update/route.ts
import { NextRequest, NextResponse } from "next/server";

const PYTHON_API = process.env.PYTHON_API_URL ?? "http://127.0.0.1:8000";

export async function PATCH(req: NextRequest) {
  try {
    const { id, notes, tags } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const body: { notes?: string; tags?: string[] } = {};
    if (notes !== undefined) body.notes = notes;
    if (tags !== undefined) body.tags = tags;
    if (Object.keys(body).length === 0) return NextResponse.json({ success: true });

    const res = await fetch(`${PYTHON_API}/images/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("Python update error:", res.status, err);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}