"use client";

import Masonry from "react-masonry-css";
import GalleryCard from "./GalleryCard";
import type { ImageItem } from "@/types/gallery";
import { MASONRY_BREAKPOINTS } from "@/constants/gallery";

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
  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold italic uppercase tracking-wider">
          Gallery <span className="text-indigo-500 ml-2 text-sm">({images.length})</span>
        </h2>
      </div>

      <Masonry
        breakpointCols={MASONRY_BREAKPOINTS}
        className="flex w-full -ml-6"
        columnClassName="pl-6 bg-clip-padding"
      >
        {images.map((img, index) => (
          <div key={img.id} className="mb-6">
            <GalleryCard
              image={img}
              isSelected={selectedIds.has(img.id)}
              onSelect={() => onSelectImage(img)}
              onSelectionClick={
                onCardSelectionClick ? () => onCardSelectionClick(img, index) : undefined
              }
              onDelete={(e) => onDeleteImage(e, img.id, img.filename)}
            />
          </div>
        ))}
      </Masonry>

      {images.length === 0 && !isSearching && (
        <div className="text-center py-20 text-white/20 italic">검색 결과가 없습니다.</div>
      )}
    </section>
  );
}