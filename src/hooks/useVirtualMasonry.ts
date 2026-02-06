"use client";

import { useRef, useLayoutEffect, useState, useMemo, useEffect } from "react";
import type { ImageItem } from "@/types/gallery";
import { computeMasonryLayout } from "@/lib/masonry";
import type { MasonryCell } from "@/lib/masonry";
import {
  VIRTUAL_MASONRY_GAP,
  VIRTUAL_MASONRY_OVERSCAN_PX,
} from "@/constants/gallery";

export interface UseVirtualMasonryOptions {
  images: ImageItem[];
  columnCount: number;
}

export interface UseVirtualMasonryResult {
  containerRef: React.RefObject<HTMLDivElement | null>;
  totalHeight: number;
  visibleCells: MasonryCell[];
}

export function useVirtualMasonry({
  images,
  columnCount,
}: UseVirtualMasonryOptions): UseVirtualMasonryResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [scrollMargin, setScrollMargin] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  useLayoutEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      setContainerWidth(containerRef.current.offsetWidth);
      setScrollMargin(
        containerRef.current.getBoundingClientRect().top + window.scrollY
      );
    };
    update();
    const el = containerRef.current;
    const ro = el ? new ResizeObserver(update) : null;
    if (el && ro) ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [images.length]);

  useEffect(() => {
    const onScroll = () => setScrollTop(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { cells, totalHeight } = useMemo(() => {
    if (containerWidth <= 0 || images.length === 0)
      return {
        cells: [] as MasonryCell[],
        totalHeight: 0,
      };
    const columnWidth =
      (containerWidth - (columnCount - 1) * VIRTUAL_MASONRY_GAP) / columnCount;
    return computeMasonryLayout(
      images,
      columnCount,
      columnWidth,
      VIRTUAL_MASONRY_GAP
    );
  }, [images, columnCount, containerWidth]);

  const visibleCells = useMemo(() => {
    const start = scrollTop - scrollMargin - VIRTUAL_MASONRY_OVERSCAN_PX;
    const viewHeight =
      typeof window !== "undefined"
        ? window.innerHeight + VIRTUAL_MASONRY_OVERSCAN_PX
        : 2000;
    const end = scrollTop - scrollMargin + viewHeight;
    return cells.filter((c) => c.y + c.height >= start && c.y <= end);
  }, [cells, scrollTop, scrollMargin]);

  return {
    containerRef,
    totalHeight,
    visibleCells,
  };
}
