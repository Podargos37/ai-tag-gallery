"use client";

import { useEffect } from "react";
import { getSettings } from "@/lib/api";
import { DEFAULT_THEME, isValidThemeId } from "@/constants/themes";

export default function ThemeInit() {
  useEffect(() => {
    getSettings()
      .then((s) => {
        const theme = isValidThemeId(s.theme) ? s.theme : DEFAULT_THEME;
        document.documentElement.setAttribute("data-theme", theme);
      })
      .catch(() => {
        document.documentElement.setAttribute("data-theme", DEFAULT_THEME);
      });
  }, []);
  return null;
}
