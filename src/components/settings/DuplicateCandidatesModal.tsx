"use client";

import { X } from "lucide-react";
import type { ImageItem } from "@/types/gallery";

interface DuplicateCandidatesModalProps {
  open: boolean;
  onClose: () => void;
  groups: ImageItem[][];
}

export default function DuplicateCandidatesModal({
  open,
  onClose,
  groups,
}: DuplicateCandidatesModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="중복 이미지 후보"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl border shadow-xl overflow-hidden"
        style={{ backgroundColor: "var(--modal-bg)", borderColor: "var(--surface-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between shrink-0 border-b px-4 py-3"
          style={{ borderColor: "var(--surface-border)" }}
        >
          <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
            중복 이미지 후보 ({groups.length}개 그룹)
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" style={{ color: "var(--foreground)" }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-6">
          {groups.length === 0 ? (
            <p className="text-sm opacity-70 text-center py-8" style={{ color: "var(--foreground)" }}>
              유사도 기준에 맞는 중복 후보 그룹이 없습니다. threshold를 올리거나, 이미지 벡터 백필을 실행한 뒤 다시 시도하세요.
            </p>
          ) : (
            groups.map((imgs, idx) => (
              <div
                key={idx}
                className="rounded-xl border p-3"
                style={{ borderColor: "var(--surface-border)" }}
              >
                <p className="text-xs font-medium opacity-80 mb-2" style={{ color: "var(--foreground)" }}>
                  그룹 {idx + 1} — {imgs.length}장
                </p>
                <div className="flex flex-wrap gap-2">
                  {imgs.map((img) => (
                    <div
                      key={img.id}
                      className="flex flex-col items-center gap-1"
                    >
                      <a
                        href={`/api/thumb?id=${img.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-20 h-20 rounded-lg overflow-hidden border border-white/10 hover:border-indigo-500/50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <img
                          src={`/api/thumb?id=${img.id}`}
                          alt={img.originalName ?? ""}
                          className="w-full h-full object-cover"
                        />
                      </a>
                      <span
                        className="text-[10px] max-w-[84px] truncate opacity-70"
                        style={{ color: "var(--foreground)" }}
                        title={img.originalName ?? img.filename}
                      >
                        {img.originalName ?? img.filename}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
