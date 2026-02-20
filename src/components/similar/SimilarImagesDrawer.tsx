"use client";

import { X, ImageIcon } from "lucide-react";
import type { ImageItem } from "@/types/gallery";

const DRAWER_WIDTH = 360;

interface SimilarImagesDrawerProps {
  open: boolean;
  onClose: () => void;
  queryImage: ImageItem | null;
  results: ImageItem[];
  loading: boolean;
  onSelectImage: (image: ImageItem) => void;
}

export default function SimilarImagesDrawer({
  open,
  onClose,
  queryImage,
  results,
  loading,
  onSelectImage,
}: SimilarImagesDrawerProps) {
  if (!open) return null;

  return (
    <aside
      className="shrink-0 flex flex-col border-l overflow-hidden rounded-l-xl"
      style={{
        width: DRAWER_WIDTH,
        backgroundColor: "var(--sidebar-bg)",
        borderColor: "var(--surface-border)",
        color: "var(--foreground)",
      }}
    >
      <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-3 border-b" style={{ borderColor: "var(--surface-border)" }}>
        <h2 className="text-sm font-semibold truncate">이 이미지와 비슷한 이미지</h2>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {queryImage && (
        <div className="shrink-0 px-4 py-2 border-b" style={{ borderColor: "var(--surface-border)" }}>
          <p className="text-xs text-white/50 mb-2">기준 이미지</p>
          <div className="flex gap-2 items-center">
            <img
              src={`/api/thumb?id=${queryImage.id}`}
              alt=""
              className="w-14 h-14 object-cover rounded-lg shrink-0"
            />
            <p className="text-xs truncate flex-1 min-w-0">{queryImage.originalName}</p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto min-h-0 p-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-white/50">
            <ImageIcon className="w-10 h-10 mb-2 animate-pulse" />
            <span className="text-sm">검색 중...</span>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-white/40 text-center px-4">
            <ImageIcon className="w-10 h-10 mb-2 opacity-60" />
            <p className="text-sm">
              {queryImage
                ? "유사 이미지가 없거나, 이 이미지에 대한 벡터가 아직 없습니다. 새로 업로드한 이미지는 곧 검색됩니다."
                : "이미지를 선택한 뒤 우클릭 → 이미지 검색을 사용하세요."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {results.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => onSelectImage(img)}
                className="aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-indigo-500/50 hover:ring-1 hover:ring-indigo-500/50 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <img
                  src={`/api/thumb?id=${img.id}`}
                  alt={img.originalName ?? ""}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
