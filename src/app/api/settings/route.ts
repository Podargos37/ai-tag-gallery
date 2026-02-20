import { NextRequest, NextResponse } from "next/server";
import {
  readSettingsFromFile,
  writeSettingsToFile,
  type AppSettings,
} from "@/lib/server/settings";

export async function GET() {
  try {
    const settings = await readSettingsFromFile();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { error: "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<AppSettings>;
    const settings = await writeSettingsToFile(body);
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
