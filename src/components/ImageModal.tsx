"use client";

import { X } from "lucide-react";
import ImagePane from "./modal/ImagePane";
import ImageDetailsSidebar from "./modal/ImageDetailsSidebar";
import { useImageModalEffects } from "@/hooks/useImageModalEffects";
import type { Folder } from "@/types/folders";
import type { ImageItem } from "@/types/gallery";

export default function ImageModal({
  image,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  folders = [],
  onAddImageToFolder,
  onRemoveImageFromFolder,
}: {
  image: ImageItem;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  folders?: Folder[];
  onAddImageToFolder?: (folderId: string, imageId: string) => void;
  onRemoveImageFromFolder?: (folderId: string, imageId: string) => void;
}) {
  const {
    isSlideshowPlaying,
    setIsSlideshowPlaying,
    slideshowIntervalMs,
    setSlideshowIntervalMs,
    isFullscreen,
    modalRef,
    toggleFullscreen,
  } = useImageModalEffects(hasNext, hasPrev, onNext, onPrev, onClose);

  if (!image) return null;

  const handleClose = () => {
    setIsSlideshowPlaying(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-6 lg:p-12 overflow-y-auto" onClick={handleClose}>
      <div className="absolute inset-0 backdrop-blur-xl animate-in fade-in duration-300" />

      <div
        ref={modalRef}
        className={`relative w-full max-w-6xl h-full max-h-[85vh] bg-slate-900/90 rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col md:flex-row transition-[max-width,max-height,border-radius] min-h-0 ${
          isFullscreen ? "!max-w-none !max-h-none !rounded-none w-full h-full" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모바일: 닫기 버튼 (사이드바 없을 때) */}
        <button
          type="button"
          onClick={handleClose}
          className="md:hidden absolute top-3 right-3 z-[110] p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
          aria-label="닫기"
        >
          <X className="w-6 h-6" />
        </button>

        <ImagePane
          image={image}
          onNext={onNext}
          onPrev={onPrev}
          hasNext={hasNext}
          hasPrev={hasPrev}
          isSlideshowPlaying={isSlideshowPlaying}
          onToggleSlideshow={() => setIsSlideshowPlaying((prev) => !prev)}
          slideshowIntervalMs={slideshowIntervalMs}
          onSlideshowIntervalChange={setSlideshowIntervalMs}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />

        {/* 데스크톱만: 태그/메모/폴더 사이드바 */}
        {!isFullscreen && (
          <div className="hidden md:flex shrink-0">
            <ImageDetailsSidebar
              image={image}
              onClose={handleClose}
              folders={folders}
              onAddImageToFolder={onAddImageToFolder}
              onRemoveImageFromFolder={onRemoveImageFromFolder}
            />
          </div>
        )}
      </div>
    </div>
  );
}