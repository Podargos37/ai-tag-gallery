"use client";

import { useCallback, useEffect, useState } from "react";
import MobileLinkPopup from "./MobileLinkPopup";

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
        <span className="inline-block size-4" aria-hidden>📱</span>
        Mobile Link
      </button>
      <MobileLinkPopup
        open={open}
        url={url}
        loading={loading}
        copied={copied}
        onClose={() => setOpen(false)}
        onCopyLink={copyLink}
      />
    </>
  );
}
