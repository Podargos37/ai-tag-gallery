"use client";

import { useState, useEffect } from "react";

/** MASONRY_BREAKPOINTS와 동일: 1280→4, 1024→3, 768→2, 640→1(모바일 큰 사진) */
function getColumnCount(width: number): number {
  if (width > 1280) return 5;
  if (width > 1024) return 4;
  if (width > 768) return 3;
  if (width > 640) return 2;
  return 1;
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
