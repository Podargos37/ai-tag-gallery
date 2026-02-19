"use client";

import { useSyncExternalStore } from "react";

const THEME_KEY = "theme";
type ThemeId = "indigo" | "gray" | "light" | "ocean" | "sunset" | "forest" | "rose" | "midnight" | "lavender";
const THEMES: { id: ThemeId; label: string; color: string }[] = [
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

const VALID_THEMES: ThemeId[] = ["indigo", "gray", "light", "ocean", "sunset", "forest", "rose", "midnight", "lavender"];

function getStoredTheme(): ThemeId {
  if (typeof window === "undefined") return "indigo";
  const t = localStorage.getItem(THEME_KEY);
  if (VALID_THEMES.includes(t as ThemeId)) return t as ThemeId;
  return "indigo";
}

const themeListeners = new Set<() => void>();

function subscribeTheme(cb: () => void) {
  themeListeners.add(cb);
  return () => themeListeners.delete(cb);
}

function getThemeSnapshot(): ThemeId {
  return getStoredTheme();
}

function getThemeServerSnapshot(): ThemeId {
  return "indigo";
}

export function applyTheme(id: ThemeId) {
  document.documentElement.setAttribute("data-theme", id);
  localStorage.setItem(THEME_KEY, id);
  themeListeners.forEach((listener) => listener());
}

export default function ThemeSettings() {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot
  );

  return (
    <div className="space-y-3">
      <p className="text-sm opacity-70" style={{ color: "var(--foreground)" }}>
        배경 테마를 선택하세요. 선택한 테마는 기기에 저장됩니다.
      </p>
      <div className="flex flex-wrap gap-3">
        {THEMES.map(({ id, label, color }) => (
          <button
            key={id}
            type="button"
            onClick={() => applyTheme(id)}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 min-w-[120px] transition ${
              theme === id
                ? "border-indigo-400 bg-indigo-500/20"
                : "hover:opacity-90"
            }`}
            style={{
              color: "var(--foreground)",
              borderColor: theme === id ? undefined : "var(--surface-border)",
              backgroundColor: theme === id ? undefined : "var(--surface)",
            }}
            aria-pressed={theme === id}
            aria-label={`테마: ${label}`}
          >
            <span
              className="block w-12 h-12 rounded-lg shrink-0 border border-black/10"
              style={{ background: color }}
            />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
