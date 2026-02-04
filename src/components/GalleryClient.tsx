"use client";

import { useState, useRef, useEffect } from "react";
import { Tag, X } from "lucide-react";
import { useSearch } from "@/hooks/useSearch";
import { useDelete } from "@/hooks/useDelete";
import { updateTags } from "@/lib/api/update";
import ImageModal from "./ImageModal";
import SearchBar from "./gallery/SearchBar";
import GalleryGrid from "./gallery/GalleryGrid";

export default function GalleryClient({ initialImages }: { initialImages: any[] }) {
  // 검색/필터의 기준 목록. 일괄 태그·모달에서 수정 시 여기도 갱신해야 검색에 반영됨
  const [images, setImages] = useState(initialImages);
  const { search, setSearch, filteredImages, setFilteredImages, isSearching } = useSearch(images);
  const { deleteImage } = useDelete(setFilteredImages);

  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastClickedIndex, setLastClickedIndex] = useState<number>(-1);
  const [showBulkTagInput, setShowBulkTagInput] = useState(false);
  const [bulkTagValue, setBulkTagValue] = useState("");
  const [isAddingBulkTag, setIsAddingBulkTag] = useState(false);
  const bulkTagInputRef = useRef<HTMLInputElement>(null);

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

  const handleDeleteClick = async (e: React.MouseEvent, id: string, filename: string) => {
    e.stopPropagation();
    if (!confirm("이미지를 삭제하시겠습니까?")) return;
    const success = await deleteImage(id, filename);
    if (!success) alert("삭제 중 오류가 발생했습니다.");
  };

  const handleCardSelectionClick = (image: any, index: number) => {
    if (selectedIds.has(image.id)) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(image.id);
        return next;
      });
    } else if (lastClickedIndex === -1) {
      setSelectedIds((prev) => new Set(prev).add(image.id));
    } else {
      const from = Math.min(lastClickedIndex, index);
      const to = Math.max(lastClickedIndex, index);
      const rangeIds = filteredImages.slice(from, to + 1).map((img) => img.id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        rangeIds.forEach((id) => next.add(id));
        return next;
      });
    }
    setLastClickedIndex(index);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setLastClickedIndex(-1);
    setShowBulkTagInput(false);
    setBulkTagValue("");
  };

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
      // 기준 목록(images)도 갱신해야 검색 시 추가한 태그가 반영됨 (JSON에는 이미 저장됨)
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

  return (
    <>
      <SearchBar
        value={search}
        onChange={setSearch}
        isSearching={isSearching}
      />

      {selectedIds.size > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3 backdrop-blur-sm">
          <span className="text-sm text-white/80">
            <strong className="text-white">{selectedIds.size}</strong>개 선택
          </span>
          {!showBulkTagInput ? (
            <>
              <button
                type="button"
                onClick={openBulkTagInput}
                className="flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
              >
                <Tag className="w-4 h-4" />
                태그 추가
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/10"
              >
                <X className="w-4 h-4" />
                선택 해제
              </button>
            </>
          ) : (
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <input
                ref={bulkTagInputRef}
                type="text"
                value={bulkTagValue}
                onChange={(e) => setBulkTagValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleBulkTagSubmit();
                  if (e.key === "Escape") setShowBulkTagInput(false);
                }}
                placeholder="추가할 태그 입력 후 Enter"
                className="flex-1 min-w-[160px] rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <button
                type="button"
                onClick={handleBulkTagSubmit}
                disabled={!bulkTagValue.trim() || isAddingBulkTag}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
              >
                {isAddingBulkTag ? "추가 중..." : "추가"}
              </button>
              <button
                type="button"
                onClick={() => setShowBulkTagInput(false)}
                className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white/60 hover:text-white"
              >
                취소
              </button>
            </div>
          )}
        </div>
      )}

      <GalleryGrid
        images={filteredImages}
        isSearching={isSearching}
        selectedIds={selectedIds}
        onSelectImage={setSelectedImage}
        onCardSelectionClick={handleCardSelectionClick}
        onDeleteImage={handleDeleteClick}
      />

      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onNext={() => handleNavigate("next")}
          onPrev={() => handleNavigate("prev")}
          hasNext={currentIndex < filteredImages.length - 1}
          hasPrev={currentIndex > 0}
        />
      )}
    </>
  );
}
