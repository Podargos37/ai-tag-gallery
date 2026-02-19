"use client";

import { useRef, useMemo } from "react";
import type { ImageItem } from "@/types/gallery";
import { computeMasonryLayout } from "@/lib/masonry";
import type { MasonryCell } from "@/lib/masonry";
import {
  VIRTUAL_MASONRY_GAP,
  VIRTUAL_MASONRY_OVERSCAN_PX,
  MIN_COLUMN_WIDTH,
  MAX_COLUMN_COUNT,
} from "@/constants/gallery";
import { useContainerScrollState } from "./useContainerScrollState";

export interface UseVirtualMasonryOptions {
  images: ImageItem[];
}

export interface UseVirtualMasonryResult {
  containerRef: React.RefObject<HTMLDivElement | null>;
  totalHeight: number;
  visibleCells: MasonryCell[];
}

function getColumnCount(containerWidth: number): number {
  if (containerWidth <= 0) return 1;
  const count = Math.floor(
    (containerWidth + VIRTUAL_MASONRY_GAP) /
      (MIN_COLUMN_WIDTH + VIRTUAL_MASONRY_GAP)
  );
  return Math.max(1, Math.min(MAX_COLUMN_COUNT, count));
}

export function useVirtualMasonry({
  images,
}: UseVirtualMasonryOptions): UseVirtualMasonryResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const { containerWidth, scrollTop, containerOffset, viewHeight } =
    useContainerScrollState(containerRef);

  const columnCount = getColumnCount(containerWidth);

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
    const start = scrollTop - containerOffset - VIRTUAL_MASONRY_OVERSCAN_PX;
    const end = scrollTop - containerOffset + viewHeight + VIRTUAL_MASONRY_OVERSCAN_PX;
    return cells.filter((c) => c.y + c.height >= start && c.y <= end);
  }, [cells, scrollTop, containerOffset, viewHeight]);

  return {
    containerRef,
    totalHeight,
    visibleCells,
  };
}
