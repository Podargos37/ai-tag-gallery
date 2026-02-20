import type { ImageItem } from "@/types/gallery";

function rowToImageItem(o: Record<string, unknown>): ImageItem {
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
}

export type DuplicateCandidatesResult = ImageItem[][];

export async function fetchDuplicateCandidates(
  options?: { threshold?: number; maxGroups?: number }
): Promise<DuplicateCandidatesResult> {
  const threshold = options?.threshold ?? 0.2;
  const maxGroups = options?.maxGroups ?? 50;
  const res = await fetch(
    `/api/duplicate-candidates?threshold=${encodeURIComponent(threshold)}&max_groups=${encodeURIComponent(maxGroups)}`,
    { cache: "no-store" }
  );
  if (!res.ok) return [];
  const data = (await res.json()) as { groups?: unknown[] };
  const raw = Array.isArray(data.groups) ? data.groups : [];
  return raw.map((g) => {
    const list = Array.isArray(g) ? g : [];
    return list.map((item) => rowToImageItem(item as Record<string, unknown>));
  });
}
