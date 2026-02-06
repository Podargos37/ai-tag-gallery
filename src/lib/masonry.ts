import type { ImageItem } from "@/types/gallery";

/** 3/4 비율 → height/width = 4/3 */
const DEFAULT_HEIGHT_RATIO = 4 / 3;

export interface MasonryCell {
  image: ImageItem;
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 컬럼 너비와 이미지 메타로 매슨리 셀 위치를 계산합니다.
 * (가장 짧은 컬럼에 순서대로 쌓는 방식)
 */
export function computeMasonryLayout(
  images: ImageItem[],
  columnCount: number,
  columnWidth: number,
  gap: number
): { cells: MasonryCell[]; totalHeight: number } {
  if (images.length === 0) {
    return { cells: [], totalHeight: 0 };
  }

  const columnHeights = new Array(columnCount).fill(0);
  const cells: MasonryCell[] = [];

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const col = columnHeights.indexOf(Math.min(...columnHeights));

    const w = columnWidth;
    let h: number;
    if (img.width != null && img.height != null && img.height > 0) {
      h = w * (img.height / img.width);
    } else {
      h = w * DEFAULT_HEIGHT_RATIO; // 3/4 → height = width * 4/3
    }

    const x = col * (columnWidth + gap);
    const y = columnHeights[col];

    cells.push({ image: img, index: i, x, y, width: w, height: h });
    columnHeights[col] += h + gap;
  }

  const totalHeight = Math.max(0, ...columnHeights) - gap; // 마지막 gap 제거
  return { cells, totalHeight };
}
