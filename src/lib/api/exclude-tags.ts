import { getSettings, patchSettings } from "./settings";

export async function getExcludeTags(): Promise<string[]> {
  const settings = await getSettings();
  return settings.excludeTags ?? [];
}

export async function saveExcludeTags(tags: string[]): Promise<void> {
  await patchSettings({ excludeTags: tags });
}
