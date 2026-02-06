"use client";

import { useState, useEffect } from "react";

/** MASONRY_BREAKPOINTS와 동일한 기준: default 5, 1280→4, 1024→3, 768→2 */
function getColumnCount(width: number): number {
  if (width > 1280) return 5;
  if (width > 1024) return 4;
  if (width > 768) return 3;
  return 2;
}

export function useColumnCount(): number {
  const [columnCount, setColumnCount] = useState(5);

  useEffect(() => {
    const update = () => setColumnCount(getColumnCount(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return columnCount;
}
