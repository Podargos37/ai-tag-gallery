import { useState, useCallback, useEffect } from "react";
import type { ImageItem } from "@/types/gallery";

function shuffleIndices(length: number): number[] {
  const arr = Array.from({ length }, (_, i) => i);
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function useGallerySelection(filteredImages: ImageItem[]) {
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastClickedIndex, setLastClickedIndex] = useState<number>(-1);
  const [randomOrder, setRandomOrder] = useState<number[] | null>(null);

  useEffect(() => {
    setRandomOrder(null);
  }, [filteredImages.length]);

  const currentIndex = selectedImage
    ? filteredImages.findIndex((img) => img.id === selectedImage.id)
    : -1;

  const handleNavigate = useCallback(
    (direction: "prev" | "next") => {
      if (currentIndex === -1 || filteredImages.length === 0) return;
      const len = filteredImages.length;
      let nextIndex: number;
      if (randomOrder && randomOrder.length === len) {
        const pos = randomOrder.indexOf(currentIndex);
        if (pos === -1) {
          nextIndex = direction === "next" ? Math.min(currentIndex + 1, len - 1) : Math.max(currentIndex - 1, 0);
        } else {
          const nextPos =
            direction === "next"
              ? (pos + 1) % randomOrder.length
              : (pos - 1 + randomOrder.length) % randomOrder.length;
          nextIndex = randomOrder[nextPos];
        }
      } else {
        nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
      }
      if (nextIndex >= 0 && nextIndex < len) {
        setSelectedImage(filteredImages[nextIndex]);
      }
    },
    [currentIndex, filteredImages, randomOrder]
  );

  const startRandomSlideshow = useCallback(() => {
    if (filteredImages.length < 2) return;
    setRandomOrder(shuffleIndices(filteredImages.length));
  }, [filteredImages.length]);

  const clearRandomSlideshow = useCallback(() => {
    setRandomOrder(null);
  }, []);

  const hasNext =
    filteredImages.length > 1 &&
    (randomOrder
      ? true
      : currentIndex >= 0 && currentIndex < filteredImages.length - 1);
  const hasPrev =
    filteredImages.length > 1 && (randomOrder ? true : currentIndex > 0);

  const handleCardSelectionClick = (image: ImageItem, index: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(image.id)) {
        next.delete(image.id);
        return next;
      }
      if (lastClickedIndex === -1) {
        next.add(image.id);
        return next;
      }
      const from = Math.min(lastClickedIndex, index);
      const to = Math.max(lastClickedIndex, index);
      filteredImages.slice(from, to + 1).forEach((img) => next.add(img.id));
      return next;
    });
    setLastClickedIndex(index);
  };

  const handleCardToggleOne = (image: ImageItem, index: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(image.id)) next.delete(image.id);
      else next.add(image.id);
      return next;
    });
    setLastClickedIndex(index);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setLastClickedIndex(-1);
  };

  return {
    selectedImage,
    setSelectedImage,
    selectedIds,
    handleCardSelectionClick,
    handleCardToggleOne,
    clearSelection,
    handleNavigate,
    currentIndex,
    hasNext,
    hasPrev,
    isRandomSlideshow: randomOrder !== null,
    startRandomSlideshow,
    clearRandomSlideshow,
  };
}
