// src/components/ImageModal.tsx
"use client";

import { X } from "lucide-react";

interface ImageModalProps {
  image: any;
  onClose: () => void;
}

export default function ImageModal({ image, onClose }: ImageModalProps) {
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* 뒷배경: 블러 처리 */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300" />

      <div
        className="relative z-[110] max-w-5xl w-full max-h-[90vh] flex flex-col items-center animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-8 h-8" />
        </button>

        {/* 원본 이미지 로드 */}
        <img
          src={`/uploads/${image.filename}`}
          className="w-full h-full object-contain rounded-lg shadow-2xl border border-white/10"
          alt={image.originalName}
        />

        <div className="mt-4 text-center">
          <p className="text-white text-lg font-medium">{image.originalName}</p>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {image.tags.map((t: string) => (
              <span key={t} className="px-3 py-1 bg-indigo-500/30 text-indigo-200 rounded-full text-xs border border-indigo-500/50">
                #{t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}