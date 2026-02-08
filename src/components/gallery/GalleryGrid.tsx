"use client";

import GalleryCard from "./GalleryCard";
import VirtualMasonryView from "./VirtualMasonryView";
import type { ImageItem } from "@/types/gallery";
import { useColumnCount } from "@/hooks/useColumnCount";
import { useVirtualMasonry } from "@/hooks/useVirtualMasonry";

interface GalleryGridProps {
  images: ImageItem[];
  isSearching: boolean;
  selectedIds?: Set<string>;
  onSelectImage: (image: ImageItem) => void;
  onCardSelectionClick?: (image: ImageItem, index: number) => void;
  onDeleteImage: (e: React.MouseEvent, id: string, filename: string) => void;
}

export default function GalleryGrid({
  images,
  isSearching,
  selectedIds = new Set(),
  onSelectImage,
  onCardSelectionClick,
  onDeleteImage,
}: GalleryGridProps) {
  const columnCount = useColumnCount();
  const { containerRef, totalHeight, visibleCells } = useVirtualMasonry({
    images,
    columnCount,
  });

  if (images.length === 0 && !isSearching) {
    return (
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold italic uppercase tracking-wider">
            Gallery <span className="text-indigo-500 ml-2 text-sm">(0)</span>
          </h2>
        </div>
        <div className="text-center py-20 text-white/20 italic">
          검색 결과가 없습니다.
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold italic uppercase tracking-wider">
          Gallery{" "}
          <span className="text-indigo-500 ml-2 text-sm">({images.length})</span>
        </h2>
      </div>

      <VirtualMasonryView
        containerRef={containerRef}
        totalHeight={totalHeight}
        visibleCells={visibleCells}
        renderCell={(cell) => (
          <GalleryCard
            image={cell.image}
            isSelected={selectedIds.has(cell.image.id)}
            onSelect={() => onSelectImage(cell.image)}
            onSelectionClick={
              onCardSelectionClick
                ? () => onCardSelectionClick(cell.image, cell.index)
                : undefined
            }
            onDelete={(e) =>
              onDeleteImage(e, cell.image.id, cell.image.filename)
            }
          />
        )}
      />
    </section>
  );
}
