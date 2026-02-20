export const THEME_KEY = "theme";
export const DEFAULT_THEME = "indigo" as const;

export const THEME_IDS = [
  "indigo",
  "gray",
  "light",
  "ocean",
  "sunset",
  "forest",
  "rose",
  "midnight",
  "lavender",
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export const THEME_OPTIONS: { id: ThemeId; label: string; color: string }[] = [
  { id: "indigo", label: "인디고", color: "#1e1b4b" },
  { id: "gray", label: "다크 그레이", color: "#1f2937" },
  { id: "light", label: "라이트", color: "#f3f4f6" },
  { id: "ocean", label: "오션", color: "#0f766e" },
  { id: "sunset", label: "선셋", color: "#7c2d12" },
  { id: "forest", label: "포레스트", color: "#14532d" },
  { id: "rose", label: "로즈", color: "#881337" },
  { id: "midnight", label: "미드나잇", color: "#0c0a1d" },
  { id: "lavender", label: "라벤더", color: "#581c87" },
];

export function isValidThemeId(value: string | null): value is ThemeId {
  return value !== null && (THEME_IDS as readonly string[]).includes(value);
}
