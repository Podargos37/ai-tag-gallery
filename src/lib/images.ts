import type { ImageItem } from "@/types/gallery";

const PYTHON_API = process.env.PYTHON_API_URL ?? "http://127.0.0.1:8000";

/**
 * LanceDB(Python 서버)에서 이미지 메타데이터 목록을 가져옵니다.
 * id 기준 최신순으로 정렬된 배열을 반환합니다.
 */
export async function getImageMetadataList(): Promise<ImageItem[]> {
  try {
    const res = await fetch(`${PYTHON_API}/images`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as unknown;
    const list = Array.isArray(data) ? data : [];
    return list.map((item: Record<string, unknown>) => ({
      id: String(item.id ?? ""),
      filename: String(item.filename ?? ""),
      thumbnail: String(item.thumbnail ?? ""),
      originalName: String(item.originalName ?? ""),
      tags: Array.isArray(item.tags) ? (item.tags as string[]) : [],
      width: typeof item.width === "number" ? item.width : undefined,
      height: typeof item.height === "number" ? item.height : undefined,
      notes: typeof item.notes === "string" ? item.notes : "",
      createdAt: typeof item.createdAt === "string" ? item.createdAt : undefined,
    }));
  } catch (e) {
    console.error("데이터 로드 실패:", e);
    return [];
  }
}
