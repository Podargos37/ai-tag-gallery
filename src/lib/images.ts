import fs from "fs/promises";
import path from "path";
import type { ImageItem } from "@/types/gallery";

const METADATA_DIR = path.join(process.cwd(), "public", "metadata");

/**
 * 서버에 저장된 이미지 메타데이터(JSON) 목록을 읽어옵니다.
 * public/metadata/*.json 을 읽어 notes 기본값을 보정한 뒤, id 기준 최신순으로 정렬해 반환합니다.
 */
export async function getImageMetadataList(): Promise<ImageItem[]> {
  try {
    await fs.mkdir(METADATA_DIR, { recursive: true });
    const files = await fs.readdir(METADATA_DIR);

    const images = await Promise.all(
      files
        .filter((file) => file.endsWith(".json"))
        .map(async (file) => {
          const content = await fs.readFile(path.join(METADATA_DIR, file), "utf-8");
          const data = JSON.parse(content);
          return {
            ...data,
            notes: data.notes ?? "",
          };
        })
    );

    return images.sort((a, b) => Number(b.id) - Number(a.id));
  } catch (e) {
    console.error("데이터 로드 실패:", e);
    return [];
  }
}
