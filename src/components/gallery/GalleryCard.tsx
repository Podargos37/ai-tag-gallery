"use client";

import { X, Check } from "lucide-react";
import type { ImageItem } from "@/types/gallery";
import { DEFAULT_ASPECT_RATIO } from "@/constants/gallery";

interface GalleryCardProps {
  image: ImageItem;
  isSelected?: boolean;
  onSelect: () => void;
  onSelectionClick?: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export default function GalleryCard({
  image,
  isSelected = false,
  onSelect,
  onSelectionClick,
  onDelete,
}: GalleryCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      onSelectionClick?.(e);
    } else {
      onSelect();
    }
  };

  const aspectRatio =
    image.width != null && image.height != null && image.height > 0
      ? `${image.width}/${image.height}`
      : DEFAULT_ASPECT_RATIO;

  return (
    <div
      onClick={handleClick}
      style={{ aspectRatio }}
      className={`group w-full bg-slate-800 rounded-2xl overflow-hidden relative border transition-all duration-300 shadow-lg cursor-pointer ${
        isSelected
          ? "border-white ring-2 ring-white/80"
          : "border-white/5 hover:border-indigo-500/50"
      }`}
    >
      {isSelected && (
        <div className="absolute left-3 top-3 z-20 p-1.5 bg-white rounded-full text-slate-900">
          <Check className="w-4 h-4" />
        </div>
      )}
      <button
        onClick={onDelete}
        className="absolute top-3 right-3 z-20 p-1.5 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 backdrop-blur-md shadow-md"
      >
        <X className="w-4 h-4" />
      </button>

      <img
        src={`/thumbnails/${image.thumbnail}`}
        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
        alt={image.originalName}
        loading="lazy"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end pointer-events-none">
        <div className="flex flex-wrap gap-1 mb-2">
          {image.tags?.slice(0, 5).map((t: string) => (
            <span
              key={t}
              className="text-[10px] bg-indigo-500/80 text-white px-1.5 py-0.5 rounded backdrop-blur-sm"
            >
              #{t}
            </span>
          ))}
        </div>
        <p className="text-[11px] font-medium text-white/90 truncate">{image.originalName}</p>
      </div>
    </div>
  );
}
