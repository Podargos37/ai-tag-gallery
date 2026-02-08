"use client";

import { useEffect, useState, useRef, useCallback } from "react";

export function useImageModalEffects(
  hasNext: boolean,
  hasPrev: boolean,
  onNext: () => void,
  onPrev: () => void,
  onClose: () => void
) {
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

  useEffect(() => {
    if (!isSlideshowPlaying) return;
    const intervalId = window.setInterval(() => {
      if (hasNext) onNext();
      else setIsSlideshowPlaying(false);
    }, slideshowIntervalMs);
    return () => window.clearInterval(intervalId);
  }, [isSlideshowPlaying, slideshowIntervalMs, hasNext, onNext]);

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

  return {
    isSlideshowPlaying,
    setIsSlideshowPlaying,
    slideshowIntervalMs,
    setSlideshowIntervalMs,
    isFullscreen,
    modalRef,
    toggleFullscreen,
  };
}
