import type { ImageItem } from "@/types/gallery";

export async function searchSimilar(imageId: string, limit = 20): Promise<ImageItem[]> {
  const res = await fetch("/api/search-similar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageId, limit }),
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { results?: unknown[] };
  const list = Array.isArray(data.results) ? data.results : [];
  return list.map((item: unknown) => {
    const o = item as Record<string, unknown>;
    return {
      id: String(o.id ?? ""),
      filename: String(o.filename ?? ""),
      thumbnail: String(o.thumbnail ?? ""),
      originalName: String(o.originalName ?? ""),
      tags: Array.isArray(o.tags) ? (o.tags as string[]) : [],
      width: typeof o.width === "number" ? o.width : undefined,
      height: typeof o.height === "number" ? o.height : undefined,
      notes: typeof o.notes === "string" ? o.notes : "",
      createdAt: typeof o.createdAt === "string" ? o.createdAt : undefined,
    };
  });
}
