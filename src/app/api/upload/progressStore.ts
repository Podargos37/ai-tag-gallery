// src/app/api/upload/progressStore.ts
export type UploadProgressStatus = "uploading" | "processing" | "done" | "error";

export type UploadProgress = {
  status: UploadProgressStatus;
  total: number;
  processed: number;
  message?: string;
  updatedAt: number;
};

const STORE_KEY = "__ai_tag_gallery_upload_progress_store__";

function getStore(): Map<string, UploadProgress> {
  const g = globalThis as unknown as Record<string, unknown>;
  if (!g[STORE_KEY]) g[STORE_KEY] = new Map<string, UploadProgress>();
  return g[STORE_KEY] as Map<string, UploadProgress>;
}

export function getProgress(id: string) {
  return getStore().get(id);
}

export function setProgress(id: string, progress: UploadProgress) {
  getStore().set(id, progress);
}

export function deleteProgress(id: string) {
  getStore().delete(id);
}

export function cleanupOldProgress(maxAgeMs = 5 * 60 * 1000) {
  const now = Date.now();
  const store = getStore();
  for (const [id, p] of store.entries()) {
    if (now - p.updatedAt > maxAgeMs) store.delete(id);
  }
}

