import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { readExcludeTagsFromFile } from "@/lib/server/exclude-tags";

const EXCLUDE_TAGS_PATH = path.join(process.cwd(), "data", "exclude-tags.json");

async function ensureDataDir() {
  const dir = path.dirname(EXCLUDE_TAGS_PATH);
  await fs.mkdir(dir, { recursive: true });
}

export async function GET() {
  try {
    const excludeTags = await readExcludeTagsFromFile();
    return NextResponse.json({ excludeTags });
  } catch (error) {
    console.error("Exclude tags GET error:", error);
    return NextResponse.json({ excludeTags: [] });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const excludeTags = Array.isArray(body.excludeTags) ? body.excludeTags.filter((t: unknown) => typeof t === "string") : [];

    await ensureDataDir();
    await fs.writeFile(
      EXCLUDE_TAGS_PATH,
      JSON.stringify({ excludeTags }, null, 2),
      "utf-8"
    );

    return NextResponse.json({ success: true, excludeTags });
  } catch (error) {
    console.error("Exclude tags PUT error:", error);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
