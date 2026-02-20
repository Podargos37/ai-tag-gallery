import { NextRequest, NextResponse } from "next/server";
import {
  readSettingsFromFile,
  writeSettingsToFile,
} from "@/lib/server/settings";

/** 레거시 호환: excludeTags만 반환. 실제 저장소는 data/settings.json */
export async function GET() {
  try {
    const settings = await readSettingsFromFile();
    return NextResponse.json({ excludeTags: settings.excludeTags });
  } catch (error) {
    console.error("Exclude tags GET error:", error);
    return NextResponse.json({ excludeTags: [] });
  }
}

/** 레거시 호환: excludeTags만 저장. data/settings.json에 병합 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const excludeTags = Array.isArray(body.excludeTags)
      ? body.excludeTags.filter((t: unknown) => typeof t === "string")
      : [];
    await writeSettingsToFile({ excludeTags });
    return NextResponse.json({ success: true, excludeTags });
  } catch (error) {
    console.error("Exclude tags PUT error:", error);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
