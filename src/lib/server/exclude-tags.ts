import { readSettingsFromFile } from "./settings";

/** 서버 전용: data/settings.json의 excludeTags 반환 (업로드 라우트 등) */
export async function readExcludeTagsFromFile(): Promise<string[]> {
  const settings = await readSettingsFromFile();
  return settings.excludeTags;
}
