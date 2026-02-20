"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Check, Copy, Search } from "lucide-react";
import type { ImageItem } from "@/types/gallery";
import { DEFAULT_ASPECT_RATIO } from "@/constants/gallery";

interface GalleryCardProps {
  image: ImageItem;
  isSelected?: boolean;
  onSelect: () => void;
  onSelectionClick?: (e: React.MouseEvent) => void;
  onToggleOneClick?: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onSearchSimilar?: (image: ImageItem) => void;
}

export default function GalleryCard({
  image,
  isSelected = false,
  onSelect,
  onSelectionClick,
  onToggleOneClick,
  onDelete,
  onSearchSimilar,
}: GalleryCardProps) {
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const hasTags = (image.tags?.length ?? 0) > 0;

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuOpen(true);
  }, []);

  const copyTags = useCallback(() => {
    if (!hasTags) return;
    const text = (image.tags ?? []).join(", ");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setContextMenuOpen(false);
    });
  }, [image.tags, hasTags]);

  useEffect(() => {
    if (!contextMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      setContextMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [contextMenuOpen]);

  const handleClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      onToggleOneClick?.();
    } else if (e.shiftKey) {
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
      onContextMenu={handleContextMenu}
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
        src={`/api/thumb?id=${image.id}`}
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

      {contextMenuOpen && (
        <div
          ref={menuRef}
          className="fixed z-50 min-w-[140px] rounded-lg border border-white/10 bg-slate-800 py-1 shadow-xl"
          style={{ left: contextMenuPosition.x, top: contextMenuPosition.y }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              copyTags();
            }}
            disabled={!hasTags}
            aria-label="태그 복사"
            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
              hasTags
                ? "text-white hover:bg-white/10"
                : "cursor-not-allowed text-white/40"
            }`}
          >
            <Copy className="h-4 w-4 shrink-0" />
            {copied ? "복사됨" : "태그 복사"}
          </button>
          {onSearchSimilar && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onSearchSimilar(image);
                setContextMenuOpen(false);
              }}
              aria-label="이미지 검색"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors"
            >
              <Search className="h-4 w-4 shrink-0" />
              이미지 검색
            </button>
          )}
        </div>
      )}
    </div>
  );
}
