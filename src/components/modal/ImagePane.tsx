"use client";

import { ChevronLeft, ChevronRight, Play, Pause, Maximize2, Minimize2 } from "lucide-react";
import type { ImageItem } from "@/types/gallery";

export default function ImagePane({
  image,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  isSlideshowPlaying,
  onToggleSlideshow,
  slideshowIntervalMs,
  onSlideshowIntervalChange,
  isFullscreen,
  onToggleFullscreen,
}: {
  image: ImageItem;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  isSlideshowPlaying: boolean;
  onToggleSlideshow: () => void;
  slideshowIntervalMs: number;
  onSlideshowIntervalChange: (ms: number) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center bg-black/20 relative group">
      {/* 이전 버튼 */}
      {hasPrev && (
        <button
          onClick={onPrev}
          className="absolute left-4 z-10 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-500"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      <img
        src={`/uploads/${image.filename}`}
        className="w-full h-full object-contain"
        alt={image.originalName}
      />

      {/* 슬라이드쇼 + 전체화면 컨트롤 (호버 시 표시) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-black/40 text-white px-3 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md">
        {onToggleFullscreen && (
          <>
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
              aria-label={isFullscreen ? "전체화면 나가기" : "전체화면"}
              title={isFullscreen ? "전체화면 나가기 (Esc)" : "전체화면"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <div className="h-4 w-px bg-white/20" />
          </>
        )}

        <button
          type="button"
          onClick={onToggleSlideshow}
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
          aria-label={isSlideshowPlaying ? "슬라이드쇼 일시정지" : "슬라이드쇼 재생"}
          title="Space: 재생/일시정지"
        >
          {isSlideshowPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <div className="h-4 w-px bg-white/20" />

        {[2000, 3000, 5000].map((ms) => (
          <button
            key={ms}
            type="button"
            onClick={() => onSlideshowIntervalChange(ms)}
            className={`text-xs px-2 py-1 rounded-full transition-colors ${
              slideshowIntervalMs === ms ? "bg-indigo-500/80" : "hover:bg-white/10"
            }`}
            aria-label={`슬라이드쇼 속도 ${ms / 1000}초`}
          >
            {ms / 1000}s
          </button>
        ))}
      </div>

      {/* 다음 버튼 */}
      {hasNext && (
        <button
          onClick={onNext}
          className="absolute right-4 z-10 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-500"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}
    </div>
  );
}

