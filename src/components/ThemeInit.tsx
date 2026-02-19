"use client";

import { useEffect } from "react";
import { THEME_KEY, DEFAULT_THEME, isValidThemeId } from "@/constants/themes";

export default function ThemeInit() {
  useEffect(() => {
    const t = localStorage.getItem(THEME_KEY);
    document.documentElement.setAttribute(
      "data-theme",
      isValidThemeId(t) ? t : DEFAULT_THEME
    );
  }, []);
  return null;
}
