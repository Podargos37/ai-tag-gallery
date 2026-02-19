export async function getExcludeTags(): Promise<string[]> {
  const res = await fetch("/api/settings/exclude-tags");
  if (!res.ok) throw new Error("Failed to load exclude tags");
  const data = await res.json();
  return Array.isArray(data.excludeTags) ? data.excludeTags : [];
}

export async function saveExcludeTags(tags: string[]): Promise<void> {
  const res = await fetch("/api/settings/exclude-tags", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ excludeTags: tags }),
  });
  if (!res.ok) throw new Error("Failed to save exclude tags");
}
