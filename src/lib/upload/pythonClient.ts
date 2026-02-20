import { PYTHON_API_URL } from "./constants";

export type ImageMetadataForApi = {
  id: string;
  originalName: string;
  filename: string;
  thumbnail: string;
  width?: number;
  height?: number;
  tags: string[];
  createdAt: string;
  notes: string;
};

/**
 * Python /tag API로 이미지 AI 태깅 요청
 * @param threshold WD14 확률 임계값 (0.2~1.0). 낮을수록 더 많은 태그
 */
export async function tagImage(
  file: File,
  buffer: Buffer,
  threshold?: number
): Promise<string[]> {
  const formData = new FormData();
  formData.append(
    "file",
    new Blob([new Uint8Array(buffer)], { type: file.type }),
    file.name
  );
  const url =
    threshold != null
      ? `${PYTHON_API_URL}/tag?threshold=${threshold}`
      : `${PYTHON_API_URL}/tag`;
  const res = await fetch(url, { method: "POST", body: formData });
  if (!res.ok) return [];
  const data = await res.json();
  const raw = Array.isArray(data.tags) ? data.tags : [];
  return raw.map((t: string) => String(t));
}

/**
 * Python /images API로 메타데이터를 LanceDB에 등록
 */
export async function registerImage(metadata: ImageMetadataForApi): Promise<boolean> {
  const res = await fetch(`${PYTHON_API_URL}/images`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(metadata),
  });
  if (!res.ok) {
    console.warn("LanceDB insert failed:", await res.text());
    return false;
  }
  return true;
}
