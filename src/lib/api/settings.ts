export interface AppSettings {
  wd14Threshold: number;
  semanticSimilarityThreshold: number;
  theme: string;
  excludeTags: string[];
}

export async function getSettings(): Promise<AppSettings> {
  const res = await fetch("/api/settings");
  if (!res.ok) throw new Error("Failed to load settings");
  return res.json();
}

export async function patchSettings(
  partial: Partial<AppSettings>
): Promise<AppSettings> {
  const res = await fetch("/api/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(partial),
  });
  if (!res.ok) throw new Error("Failed to save settings");
  return res.json();
}
