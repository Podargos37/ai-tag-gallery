"use client";

import { useEffect } from "react";

const THEME_KEY = "theme";
const VALID_THEMES = ["indigo", "gray", "light", "ocean", "sunset", "forest", "rose", "midnight", "lavender"];

export default function ThemeInit() {
  useEffect(() => {
    const t = localStorage.getItem(THEME_KEY);
    const ok = t && VALID_THEMES.includes(t);
    document.documentElement.setAttribute("data-theme", ok ? t : "indigo");
  }, []);
  return null;
}
