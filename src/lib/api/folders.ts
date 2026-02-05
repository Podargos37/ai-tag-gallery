import type { Folder, FoldersData } from "@/types/folders";

export async function getFolders(): Promise<FoldersData> {
  const res = await fetch("/api/folders");
  if (!res.ok) throw new Error("Failed to load folders");
  return res.json();
}

export async function saveFolders(folders: Folder[]): Promise<{ success: boolean }> {
  const res = await fetch("/api/folders", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folders }),
  });
  if (!res.ok) throw new Error("Failed to save folders");
  return res.json();
}
