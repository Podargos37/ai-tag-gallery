export interface BackfillEmbeddingsResult {
  updated: number;
  skipped: number;
  failed: number;
}

export async function runBackfillEmbeddings(): Promise<BackfillEmbeddingsResult> {
  const res = await fetch("/api/backfill/embeddings", { method: "POST" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? "백필 실패");
  }
  return res.json() as Promise<BackfillEmbeddingsResult>;
}
