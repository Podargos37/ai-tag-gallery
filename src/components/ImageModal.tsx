"use client";

import { useState } from "react";
import { X } from "lucide-react";
import ImagePane from "./modal/ImagePane";
import ImageDetailsSidebar from "./modal/ImageDetailsSidebar";
import NukkiEditor from "./nukki/NukkiEditor";
import { useImageModalEffects } from "@/hooks/useImageModalEffects";
import type { Folder } from "@/types/folders";
import type { ImageItem } from "@/types/gallery";

export interface ImageModalProps {
  image: ImageItem;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  isRandomSlideshow?: boolean;
  onToggleRandomSlideshow?: () => void;
  folders?: Folder[];
  onAddImageToFolder?: (folderId: string, imageId: string) => void;
  onRemoveImageFromFolder?: (folderId: string, imageId: string) => void;
  onDelete?: (image: ImageItem) => void | Promise<void>;
  onImageCreated?: (newImage: ImageItem) => void;
}

export default function ImageModal({
  image,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  isRandomSlideshow = false,
  onToggleRandomSlideshow,
  folders = [],
  onAddImageToFolder,
  onRemoveImageFromFolder,
  onDelete,
  onImageCreated,
}: ImageModalProps) {
  const [isNukkiEditorOpen, setIsNukkiEditorOpen] = useState(false);

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

  const handleNukkiComplete = (newImage: ImageItem) => {
    setIsNukkiEditorOpen(false);
    if (onImageCreated) {
      onImageCreated(newImage);
    }
    alert("누끼 추출 완료! 새 이미지가 갤러리에 추가되었습니다.");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-6 lg:p-12 overflow-y-auto" onClick={handleClose}>
      <div className="absolute inset-0 backdrop-blur-xl animate-in fade-in duration-300" />

      <div
        ref={modalRef}
        className={`relative w-full max-w-6xl h-full max-h-[85vh] rounded-3xl overflow-hidden border shadow-2xl flex flex-col md:flex-row transition-[max-width,max-height,border-radius] min-h-0 ${
          isFullscreen ? "!max-w-none !max-h-none !rounded-none w-full h-full" : ""
        }`}
        style={{ backgroundColor: "var(--modal-bg)", borderColor: "var(--surface-border)" }}
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
          isRandomSlideshow={isRandomSlideshow}
          onToggleRandomSlideshow={onToggleRandomSlideshow}
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
              onDelete={onDelete}
              onImageCreated={onImageCreated}
              onOpenNukki={() => setIsNukkiEditorOpen(true)}
            />
          </div>
        )}
      </div>

      {/* 누끼 에디터 */}
      {isNukkiEditorOpen && (
        <NukkiEditor
          image={image}
          onClose={() => setIsNukkiEditorOpen(false)}
          onComplete={handleNukkiComplete}
        />
      )}
    </div>
  );
}