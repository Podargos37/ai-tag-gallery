import fs from "fs/promises";
import path from "path";

const SETTINGS_PATH = path.join(process.cwd(), "data", "settings.json");
const LEGACY_EXCLUDE_TAGS_PATH = path.join(
  process.cwd(),
  "data",
  "exclude-tags.json"
);

export interface AppSettings {
  wd14Threshold: number;
  semanticSimilarityThreshold: number;
  theme: string;
  excludeTags: string[];
}

const DEFAULT_SETTINGS: AppSettings = {
  wd14Threshold: 0.35,
  semanticSimilarityThreshold: 0.8,
  theme: "indigo",
  excludeTags: [],
};

async function readLegacyExcludeTags(): Promise<string[]> {
  try {
    const content = await fs.readFile(LEGACY_EXCLUDE_TAGS_PATH, "utf-8");
    const data = JSON.parse(content) as { excludeTags?: unknown[] };
    return Array.isArray(data.excludeTags)
      ? data.excludeTags.filter((t): t is string => typeof t === "string")
      : [];
  } catch {
    return [];
  }
}

/** 서버 전용: data/settings.json 읽기. 없으면 기본값. excludeTags 없으면 기존 exclude-tags.json에서 마이그레이션. */
export async function readSettingsFromFile(): Promise<AppSettings> {
  try {
    const content = await fs.readFile(SETTINGS_PATH, "utf-8");
    const data = JSON.parse(content) as Partial<AppSettings>;
    let excludeTags = Array.isArray(data.excludeTags)
      ? data.excludeTags.filter((t): t is string => typeof t === "string")
      : null;
    if (excludeTags === null || excludeTags.length === 0) {
      const legacy = await readLegacyExcludeTags();
      if (legacy.length > 0) excludeTags = legacy;
    }
    return {
      ...DEFAULT_SETTINGS,
      ...data,
      excludeTags: excludeTags ?? DEFAULT_SETTINGS.excludeTags,
    };
  } catch {
    const legacy = await readLegacyExcludeTags();
    return {
      ...DEFAULT_SETTINGS,
      excludeTags: legacy.length > 0 ? legacy : DEFAULT_SETTINGS.excludeTags,
    };
  }
}

/** 서버 전용: data/settings.json에 병합 저장. */
export async function writeSettingsToFile(
  partial: Partial<AppSettings>
): Promise<AppSettings> {
  const current = await readSettingsFromFile();
  const next: AppSettings = {
    ...current,
    ...partial,
    excludeTags:
      partial.excludeTags !== undefined
        ? Array.isArray(partial.excludeTags)
          ? partial.excludeTags.filter((t): t is string => typeof t === "string")
          : current.excludeTags
        : current.excludeTags,
  };
  await fs.mkdir(path.dirname(SETTINGS_PATH), { recursive: true });
  await fs.writeFile(SETTINGS_PATH, JSON.stringify(next, null, 2), "utf-8");
  return next;
}
