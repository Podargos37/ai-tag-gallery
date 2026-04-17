import path from "path";
import { readExcludeTagsFromFile } from "@/lib/server/exclude-tags";
import { readSettingsFromFile } from "@/lib/server/settings";
import { tagImage } from "@/lib/upload/pythonClient";

const DEFAULT_TAG = "untagged";

function mimeFromFilename(name: string): string {
  const ext = path.extname(name).toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".bmp":
      return "image/bmp";
    default:
      return "application/octet-stream";
  }
}

export type ComputeAiTagsWithSettingsInput = {
  /** 태거에 넘기는 표시용 파일명 */
  displayName: string;
  buffer: Buffer;
};

/**
 * 업로드 시와 동일: settings의 WD14 임계값 + 제외 태그 적용, 결과 없으면 untagged.
 */
export async function computeAiTagsWithSettings(
  input: ComputeAiTagsWithSettingsInput
): Promise<string[]> {
  const [excludeList, settings] = await Promise.all([
    readExcludeTagsFromFile(),
    readSettingsFromFile(),
  ]);
  const excludeTagSet = new Set(
    excludeList.map((t) => String(t).toLowerCase().trim()).filter(Boolean)
  );

  const baseName = path.basename(input.displayName) || "image.bin";
  const mime = mimeFromFilename(baseName);
  const file = new File([new Uint8Array(input.buffer)], baseName, { type: mime });

  let raw: string[] = [];
  try {
    raw = await tagImage(file, input.buffer, settings.wd14Threshold);
  } catch {
    // Python 미기동 등
  }

  const filtered =
    excludeTagSet.size > 0
      ? raw.filter((t) => !excludeTagSet.has(String(t).toLowerCase().trim()))
      : raw;

  return filtered.length > 0 ? filtered : [DEFAULT_TAG];
}
