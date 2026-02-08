"use client";

import { QRCodeSVG } from "qrcode.react";

interface MobileLinkPopupProps {
  open: boolean;
  url: string | null;
  loading: boolean;
  copied: boolean;
  onClose: () => void;
  onCopyLink: () => void;
}

export default function MobileLinkPopup({
  open,
  url,
  loading,
  copied,
  onClose,
  onCopyLink,
}: MobileLinkPopupProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-link-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-2xl bg-[var(--background)] border border-white/10 p-6 shadow-xl">
        <h2 id="mobile-link-title" className="text-lg font-semibold text-white mb-4">
          모바일에서 접속
        </h2>
        {loading && !url && (
          <p className="text-white/70 text-sm py-8 text-center">터널 준비 중...</p>
        )}
        {url && (
          <div className="space-y-4">
            <div className="flex justify-center rounded-lg bg-white p-4">
              <QRCodeSVG value={url} size={200} level="M" />
            </div>
            <p className="text-xs text-white/60 break-all">{url}</p>
            <button
              type="button"
              onClick={onCopyLink}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition"
            >
              {copied ? "복사됨" : "링크 복사"}
            </button>
          </div>
        )}
        {!loading && !url && (
          <p className="text-white/70 text-sm py-4">
            터널을 사용할 수 없습니다. 백엔드가 실행 중인지 확인하세요.
          </p>
        )}
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-lg border border-white/20 py-2 text-sm text-white/80 hover:bg-white/5 transition"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
