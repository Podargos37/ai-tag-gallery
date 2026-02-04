import { useState, useRef } from "react";
import { updateTags } from "@/lib/api/update";

type ClearSelectionFn = () => void;

export function useBulkTag(
  selectedIds: Set<string>,
  filteredImages: any[],
  setImages: React.Dispatch<React.SetStateAction<any[]>>,
  setSelectedImage: React.Dispatch<React.SetStateAction<any | null>>,
  clearSelection: ClearSelectionFn
) {
  const [showBulkTagInput, setShowBulkTagInput] = useState(false);
  const [bulkTagValue, setBulkTagValue] = useState("");
  const [isAddingBulkTag, setIsAddingBulkTag] = useState(false);
  const bulkTagInputRef = useRef<HTMLInputElement>(null);

  const handleBulkTagSubmit = async () => {
    const newTag = bulkTagValue.trim();
    if (!newTag) return;
    const toUpdate = filteredImages.filter((img) => selectedIds.has(img.id));
    if (toUpdate.length === 0) return;

    setIsAddingBulkTag(true);
    try {
      await Promise.all(
        toUpdate.map((img) => updateTags(img.id, [...(img.tags || []), newTag]))
      );
      setImages((prev) =>
        prev.map((img) =>
          selectedIds.has(img.id) ? { ...img, tags: [...(img.tags || []), newTag] } : img
        )
      );
      setSelectedImage((prev: any | null) =>
        prev && selectedIds.has(prev.id)
          ? { ...prev, tags: [...(prev.tags || []), newTag] }
          : prev
      );
      clearSelection();
      setShowBulkTagInput(false);
      setBulkTagValue("");
      alert(`${toUpdate.length}개 이미지에 #${newTag} 태그를 추가했습니다.`);
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
