"use client";

import { X } from "lucide-react";

interface GalleryCardProps {
  image: {
    id: string;
    filename: string;
    thumbnail: string;
    originalName: string;
    tags?: string[];
  };
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

export default function GalleryCard({ image, onSelect, onDelete }: GalleryCardProps) {
  return (
    <div
      onClick={onSelect}
      className="group aspect-[3/4] bg-slate-800 rounded-2xl overflow-hidden relative border border-white/5 hover:border-indigo-500/50 transition-all duration-300 shadow-lg cursor-pointer"
    >
      <button
        onClick={onDelete}
        className="absolute top-3 right-3 z-20 p-1.5 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 backdrop-blur-md shadow-md"
      >
        <X className="w-4 h-4" />
      </button>

      <img
        src={`/thumbnails/${image.thumbnail}`}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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
