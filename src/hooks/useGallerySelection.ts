import { useState } from "react";

export function useGallerySelection(filteredImages: any[]) {
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastClickedIndex, setLastClickedIndex] = useState<number>(-1);

  const currentIndex = selectedImage
    ? filteredImages.findIndex((img: any) => img.id === selectedImage.id)
    : -1;

  const handleNavigate = (direction: "prev" | "next") => {
    if (currentIndex === -1) return;
    const nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= 0 && nextIndex < filteredImages.length) {
      setSelectedImage(filteredImages[nextIndex]);
    }
  };

  const handleCardSelectionClick = (image: any, index: number) => {
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
      filteredImages.slice(from, to + 1).forEach((img: any) => next.add(img.id));
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
