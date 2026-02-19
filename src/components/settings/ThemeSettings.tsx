"use client";

import { useState, useEffect } from "react";
import {
  THEME_OPTIONS,
  DEFAULT_THEME,
  isValidThemeId,
  type ThemeId,
} from "@/constants/themes";
import { getSettings, patchSettings } from "@/lib/api";

function applyThemeToDom(id: ThemeId) {
  document.documentElement.setAttribute("data-theme", id);
}

export default function ThemeSettings() {
  const [theme, setTheme] = useState<ThemeId>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings()
      .then((s) => {
        setTheme(isValidThemeId(s.theme) ? s.theme : DEFAULT_THEME);
      })
      .catch(() => setTheme(DEFAULT_THEME))
      .finally(() => setLoading(false));
  }, []);

  const handleThemeClick = async (id: ThemeId) => {
    setTheme(id);
    applyThemeToDom(id);
    try {
      await patchSettings({ theme: id });
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="text-sm opacity-60" style={{ color: "var(--foreground)" }}>
        불러오는 중...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm opacity-70" style={{ color: "var(--foreground)" }}>
        배경 테마를 선택하세요. 설정은 data/settings.json에 저장됩니다.
      </p>
      <div className="flex flex-wrap gap-3">
        {THEME_OPTIONS.map(({ id, label, color }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleThemeClick(id)}
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
