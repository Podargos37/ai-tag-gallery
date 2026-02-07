"use client";

import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect, useState } from "react";

export default function MobileLinkButton() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchUrl = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tunnel", { cache: "no-store" });
      const data = await res.json();
      setUrl(data?.url ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) fetchUrl();
  }, [open, fetchUrl]);

  // 터널 준비 중이면 3초마다 재요청
  useEffect(() => {
    if (!open || url) return;
    const id = setInterval(fetchUrl, 3000);
    return () => clearInterval(id);
  }, [open, url, fetchUrl]);

  const copyLink = useCallback(() => {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [url]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-[var(--background)]"
        aria-label="모바일 링크"
      >
        <span className="inline-block size-4" aria-hidden>
          📱
        </span>
        Mobile Link
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-link-title"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
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
                  onClick={copyLink}
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
              onClick={() => setOpen(false)}
              className="mt-4 w-full rounded-lg border border-white/20 py-2 text-sm text-white/80 hover:bg-white/5 transition"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
}
