export async function bulkRemoveTags(tagNames: string[]): Promise<{ success: boolean; updated: number }> {
  const res = await fetch("/api/bulk-remove-tags", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tagNames }),
  });
  if (!res.ok) throw new Error("Bulk remove failed");
  return res.json();
}
