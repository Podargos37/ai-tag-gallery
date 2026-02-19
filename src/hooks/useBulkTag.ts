import { useState, useRef } from "react";
import { updateTags } from "@/lib/api/update";
import type { ImageItem } from "@/types/gallery";

type ClearSelectionFn = () => void;

export function useBulkTag(
  selectedIds: Set<string>,
  filteredImages: ImageItem[],
  setImages: React.Dispatch<React.SetStateAction<ImageItem[]>>,
  setSelectedImage: React.Dispatch<React.SetStateAction<ImageItem | null>>,
  clearSelection: ClearSelectionFn
) {
  const [showBulkTagInput, setShowBulkTagInput] = useState(false);
  const [bulkTagValue, setBulkTagValue] = useState("");
  const [isAddingBulkTag, setIsAddingBulkTag] = useState(false);
  const bulkTagInputRef = useRef<HTMLInputElement>(null);

  const handleBulkTagSubmit = async () => {
    const newTags = bulkTagValue
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (newTags.length === 0) return;
    const toUpdate = filteredImages.filter((img) => selectedIds.has(img.id));
    if (toUpdate.length === 0) return;

    setIsAddingBulkTag(true);
    try {
      await Promise.all(
        toUpdate.map((img) => {
          const merged = [...new Set([...(img.tags || []), ...newTags])];
          return updateTags(img.id, merged);
        })
      );
      setImages((prev) =>
        prev.map((img) => {
          if (!selectedIds.has(img.id)) return img;
          const merged = [...new Set([...(img.tags || []), ...newTags])];
          return { ...img, tags: merged };
        })
      );
      setSelectedImage((prev: ImageItem | null) => {
        if (!prev || !selectedIds.has(prev.id)) return prev;
        const merged = [...new Set([...(prev.tags || []), ...newTags])];
        return { ...prev, tags: merged };
      });
      clearSelection();
      setShowBulkTagInput(false);
      setBulkTagValue("");
      const tagText = newTags.length <= 3 ? newTags.map((t) => `#${t}`).join(", ") : `${newTags.length}개 태그`;
      alert(`${toUpdate.length}개 이미지에 ${tagText}를 추가했습니다.`);
    } catch {
      alert("태그 추가 중 오류가 발생했습니다.");
    } finally {
      setIsAddingBulkTag(false);
    }
  };

  const openBulkTagInput = () => {
    setShowBulkTagInput(true);
    setTimeout(() => bulkTagInputRef.current?.focus(), 0);
  };

  const closeBulkTagInput = () => {
    setShowBulkTagInput(false);
    setBulkTagValue("");
  };

  const clearSelectionAndBulkTag = () => {
    clearSelection();
    setShowBulkTagInput(false);
    setBulkTagValue("");
  };

  return {
    showBulkTagInput,
    bulkTagValue,
    setBulkTagValue,
    isAddingBulkTag,
    bulkTagInputRef,
    handleBulkTagSubmit,
    openBulkTagInput,
    closeBulkTagInput,
    clearSelectionAndBulkTag,
  };
}
