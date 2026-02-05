"use client";

import { useEffect, useState } from "react";
import ImagePane from "./modal/ImagePane";
import ImageDetailsSidebar from "./modal/ImageDetailsSidebar";

import type { Folder } from "@/types/folders";

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
  image: any;
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

  // 슬라이드쇼: 일정 간격마다 다음 이미지로 이동
  useEffect(() => {
    if (!isSlideshowPlaying) return;

    const intervalId = window.setInterval(() => {
      if (hasNext) onNext();
      else setIsSlideshowPlaying(false);
    }, slideshowIntervalMs);

    return () => window.clearInterval(intervalId);
  }, [isSlideshowPlaying, slideshowIntervalMs, hasNext, onNext]);

  // 키보드 화살표 이벤트를 등록합니다.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && hasNext) onNext();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      if (e.key === "Escape") {
        setIsSlideshowPlaying(false);
        onClose();
      }
      // Space로 슬라이드쇼 재생/일시정지
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        setIsSlideshowPlaying((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // 모달이 닫힐 때 이벤트 리스너를 제거하여 메모리 누수를 방지합니다.
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasNext, hasPrev, onNext, onPrev, onClose]);

  if (!image) return null;

  const handleClose = () => {
    setIsSlideshowPlaying(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12" onClick={handleClose}>
      <div className="absolute inset-0 backdrop-blur-xl animate-in fade-in duration-300" />

      <div
        className="relative w-full max-w-6xl h-full max-h-[85vh] bg-slate-900/90 rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
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
        />

        <ImageDetailsSidebar
          image={image}
          onClose={handleClose}
          folders={folders}
          onAddImageToFolder={onAddImageToFolder}
          onRemoveImageFromFolder={onRemoveImageFromFolder}
        />
      </div>
    </div>
  );
}