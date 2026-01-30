// src/lib/api.ts
export async function searchSemantic(query: string, allTags: string[]) {
  const res = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, all_tags: allTags }),
  });

  if (!res.ok) throw new Error("Search failed");
  return res.json(); // { match_tags: [...] }
}