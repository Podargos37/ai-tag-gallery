"use client";

import GalleryCard from "./GalleryCard";

interface ImageItem {
  id: string;
  filename: string;
  thumbnail: string;
  originalName: string;
  tags?: string[];
}

interface GalleryGridProps {
  images: ImageItem[];
  isSearching: boolean;
  onSelectImage: (image: ImageItem) => void;
  onDeleteImage: (e: React.MouseEvent, id: string, filename: string) => void;
}

export default function GalleryGrid({
  images,
  isSearching,
  onSelectImage,
  onDeleteImage,
}: GalleryGridProps) {
  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold italic uppercase tracking-wider">
          Gallery <span className="text-indigo-500 ml-2 text-sm">({images.length})</span>
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {images.map((img) => (
          <GalleryCard
            key={img.id}
            image={img}
            onSelect={() => onSelectImage(img)}
            onDelete={(e) => onDeleteImage(e, img.id, img.filename)}
          />
        ))}
      </div>

      {images.length === 0 && !isSearching && (
        <div className="text-center py-20 text-white/20 italic">검색 결과가 없습니다.</div>
      )}
    </section>
  );
}
