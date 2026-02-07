// Next.js 서버가 Python 백엔드에서 퀵 터널 URL을 가져와 반환
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const pyRes = await fetch("http://127.0.0.1:8000/tunnel-url", {
      cache: "no-store",
    });
    if (!pyRes.ok) return NextResponse.json({ url: null });
    const data = await pyRes.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ url: null });
  }
}
