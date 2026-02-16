"use client";

import { useRef, useLayoutEffect, useState, useMemo, useEffect } from "react";
import type { ImageItem } from "@/types/gallery";
import { computeMasonryLayout } from "@/lib/masonry";
import type { MasonryCell } from "@/lib/masonry";
import {
  VIRTUAL_MASONRY_GAP,
  VIRTUAL_MASONRY_OVERSCAN_PX,
} from "@/constants/gallery";

function findScrollParent(el: HTMLElement | null): HTMLElement | null {
  if (!el) return null;
  let parent: HTMLElement | null = el.parentElement;
  while (parent) {
    const { overflowY } = getComputedStyle(parent);
    if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}

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
  const [scrollState, setScrollState] = useState({
    scrollTop: 0,
    containerOffset: 0,
    viewHeight: typeof window !== "undefined" ? window.innerHeight : 2000,
  });

  useLayoutEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      setContainerWidth(containerRef.current.offsetWidth);
      const scrollEl = findScrollParent(containerRef.current);
      if (scrollEl) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const scrollRect = scrollEl.getBoundingClientRect();
        const containerOffset = containerRect.top - scrollRect.top + scrollEl.scrollTop;
        setScrollState((prev) => ({
          ...prev,
          scrollTop: scrollEl.scrollTop,
          containerOffset,
          viewHeight: scrollEl.clientHeight,
        }));
      } else {
        const containerRect = containerRef.current.getBoundingClientRect();
        setScrollState((prev) => ({
          ...prev,
          scrollTop: typeof window !== "undefined" ? window.scrollY : 0,
          containerOffset: containerRect.top + (typeof window !== "undefined" ? window.scrollY : 0),
          viewHeight: typeof window !== "undefined" ? window.innerHeight : 2000,
        }));
      }
    };
    update();
    const el = containerRef.current;
    const scrollEl = el ? findScrollParent(el) : null;
    const ro = el ? new ResizeObserver(update) : null;
    if (el && ro) ro.observe(el);
    if (scrollEl) {
      scrollEl.addEventListener("scroll", update, { passive: true });
      const scrollRo = new ResizeObserver(update);
      scrollRo.observe(scrollEl);
      return () => {
        ro?.disconnect();
        scrollEl.removeEventListener("scroll", update);
        scrollRo.disconnect();
      };
    }
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [images.length]);

  useEffect(() => {
    const el = containerRef.current;
    const scrollEl = el ? findScrollParent(el) : null;
    const onScroll = () => {
      if (!el || !scrollEl) return;
      const containerRect = el.getBoundingClientRect();
      const scrollRect = scrollEl.getBoundingClientRect();
      const containerOffset = containerRect.top - scrollRect.top + scrollEl.scrollTop;
      setScrollState((prev) => ({
        ...prev,
        scrollTop: scrollEl.scrollTop,
        containerOffset,
        viewHeight: scrollEl.clientHeight,
      }));
    };
    if (scrollEl) {
      scrollEl.addEventListener("scroll", onScroll, { passive: true });
      return () => scrollEl.removeEventListener("scroll", onScroll);
    }
    const onWindowScroll = () =>
      setScrollState((prev) => ({
        ...prev,
        scrollTop: typeof window !== "undefined" ? window.scrollY : 0,
      }));
    window.addEventListener("scroll", onWindowScroll, { passive: true });
    return () => window.removeEventListener("scroll", onWindowScroll);
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
    const { scrollTop, containerOffset, viewHeight } = scrollState;
    const start = scrollTop - containerOffset - VIRTUAL_MASONRY_OVERSCAN_PX;
    const end = scrollTop - containerOffset + viewHeight + VIRTUAL_MASONRY_OVERSCAN_PX;
    return cells.filter((c) => c.y + c.height >= start && c.y <= end);
  }, [cells, scrollState]);

  return {
    containerRef,
    totalHeight,
    visibleCells,
  };
}
