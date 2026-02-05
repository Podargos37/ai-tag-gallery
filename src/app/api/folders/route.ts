import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { FoldersData } from "@/types/folders";

const FOLDERS_PATH = path.join(process.cwd(), "data", "folders.json");

async function readFolders(): Promise<FoldersData> {
  try {
    const content = await fs.readFile(FOLDERS_PATH, "utf-8");
    const data = JSON.parse(content);
    return { folders: Array.isArray(data.folders) ? data.folders : [] };
  } catch {
    return { folders: [] };
  }
}

async function ensureDataDir() {
  const dir = path.dirname(FOLDERS_PATH);
  await fs.mkdir(dir, { recursive: true });
}

export async function GET() {
  try {
    const data = await readFolders();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Folders GET error:", error);
    return NextResponse.json({ folders: [] });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const folders = Array.isArray(body.folders) ? body.folders : [];

    await ensureDataDir();
    await fs.writeFile(
      FOLDERS_PATH,
      JSON.stringify({ folders }, null, 2),
      "utf-8"
    );

    return NextResponse.json({ success: true, folders });
  } catch (error) {
    console.error("Folders PUT error:", error);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
