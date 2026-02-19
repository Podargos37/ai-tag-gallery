import fs from "fs/promises";
import path from "path";

const EXCLUDE_TAGS_PATH = path.join(process.cwd(), "data", "exclude-tags.json");

/** 서버 전용: data/exclude-tags.json에서 제외 태그 목록 읽기 (업로드 라우트 등) */
export async function readExcludeTagsFromFile(): Promise<string[]> {
  try {
    const content = await fs.readFile(EXCLUDE_TAGS_PATH, "utf-8");
    const data = JSON.parse(content);
    const list = Array.isArray(data.excludeTags) ? data.excludeTags : [];
    return list.filter((t: unknown) => typeof t === "string");
  } catch {
    return [];
  }
}
