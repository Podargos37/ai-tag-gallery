"use client";

import type { MasonryCell } from "@/lib/masonry";

interface VirtualMasonryViewProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  totalHeight: number;
  visibleCells: MasonryCell[];
  renderCell: (cell: MasonryCell) => React.ReactNode;
}

export default function VirtualMasonryView({
  containerRef,
  totalHeight,
  visibleCells,
  renderCell,
}: VirtualMasonryViewProps) {
  return (
    <div ref={containerRef} className="w-full">
      <div
        style={{
          height: `${totalHeight}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {visibleCells.map((cell) => (
          <div
            key={cell.image.id}
            className="absolute overflow-hidden rounded-2xl"
            style={{
              left: cell.x,
              top: cell.y,
              width: cell.width,
              height: cell.height,
            }}
          >
            {renderCell(cell)}
          </div>
        ))}
      </div>
    </div>
  );
}
