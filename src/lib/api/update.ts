export async function updateNotes(id: string, notes: string): Promise<boolean> {
  const res = await fetch("/api/update", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, notes }),
  });
  return res.ok;
}

export async function updateTags(id: string, tags: string[]): Promise<boolean> {
  const res = await fetch("/api/update", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, tags }),
  });
  return res.ok;
}
