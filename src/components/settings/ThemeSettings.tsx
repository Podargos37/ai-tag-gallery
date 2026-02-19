"use client";

import { useSyncExternalStore } from "react";
import {
  THEME_KEY,
  THEME_OPTIONS,
  DEFAULT_THEME,
  isValidThemeId,
  type ThemeId,
} from "@/constants/themes";

function getStoredTheme(): ThemeId {
  if (typeof window === "undefined") return DEFAULT_THEME;
  const t = localStorage.getItem(THEME_KEY);
  return isValidThemeId(t) ? t : DEFAULT_THEME;
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
  return DEFAULT_THEME;
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
        {THEME_OPTIONS.map(({ id, label, color }) => (
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
