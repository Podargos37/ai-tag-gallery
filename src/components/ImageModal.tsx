"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { X } from "lucide-react";
import ImagePane from "./modal/ImagePane";
import ImageDetailsSidebar from "./modal/ImageDetailsSidebar";

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
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(false);
  const [slideshowIntervalMs, setSlideshowIntervalMs] = useState(3000);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = useCallback(() => {
    const el = modalRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // 슬라이드쇼: 일정 간격마다 다음 이미지로 이동
  useEffect(() => {
    if (!isSlideshowPlaying) return;

    const intervalId = window.setInterval(() => {
      if (hasNext) onNext();
      else setIsSlideshowPlaying(false);
    }, slideshowIntervalMs);

    return () => window.clearInterval(intervalId);
  }, [isSlideshowPlaying, slideshowIntervalMs, hasNext, onNext]);

  // 키보드: 화살표, Space, Escape(전체화면이면 해제만, 아니면 모달 닫기)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && hasNext) onNext();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      if (e.key === "Escape") {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          setIsSlideshowPlaying(false);
          onClose();
        }
      }
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        setIsSlideshowPlaying((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasNext, hasPrev, onNext, onPrev, onClose]);

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
          className="md:hidden absolute top-3 right-3 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition z-[110]"
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