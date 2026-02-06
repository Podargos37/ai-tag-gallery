import { useState } from "react";
import type { ImageItem } from "@/types/gallery";

export function useGallerySelection(filteredImages: ImageItem[]) {
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastClickedIndex, setLastClickedIndex] = useState<number>(-1);

  const currentIndex = selectedImage
    ? filteredImages.findIndex((img) => img.id === selectedImage.id)
    : -1;

  const handleNavigate = (direction: "prev" | "next") => {
    if (currentIndex === -1) return;
    const nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= 0 && nextIndex < filteredImages.length) {
      setSelectedImage(filteredImages[nextIndex]);
    }
  };

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

  const clearSelection = () => {
    setSelectedIds(new Set());
    setLastClickedIndex(-1);
  };

  return {
    selectedImage,
    setSelectedImage,
    selectedIds,
    handleCardSelectionClick,
    clearSelection,
    handleNavigate,
    currentIndex,
  };
}
