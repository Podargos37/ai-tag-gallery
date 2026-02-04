"use client";

import { useState, useEffect } from "react";
import { useSearch } from "@/hooks/useSearch";
import { useDelete } from "@/hooks/useDelete";
import { useGallerySelection } from "@/hooks/useGallerySelection";
import { useBulkTag } from "@/hooks/useBulkTag";
import ImageModal from "./ImageModal";
import SearchBar from "./gallery/SearchBar";
import GalleryGrid from "./gallery/GalleryGrid";
import BulkTagBar from "./gallery/BulkTagBar";

export default function GalleryClient({ initialImages }: { initialImages: any[] }) {
  const [images, setImages] = useState(initialImages);
  const { search, setSearch, filteredImages, setFilteredImages, isSearching } = useSearch(images);
  const { deleteImage } = useDelete(setFilteredImages);

  const {
    selectedImage,
    setSelectedImage,
    selectedIds,
    handleCardSelectionClick,
    clearSelection,
    handleNavigate,
    currentIndex,
  } = useGallerySelection(filteredImages);

  const bulkTag = useBulkTag(
    selectedIds,
    filteredImages,
    setImages,
    setSelectedImage,
    clearSelection
  );

  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  const handleDeleteClick = async (e: React.MouseEvent, id: string, filename: string) => {
    e.stopPropagation();
    if (!confirm("이미지를 삭제하시겠습니까?")) return;
    const success = await deleteImage(id, filename);
    if (!success) alert("삭제 중 오류가 발생했습니다.");
  };

  return (
    <>
      <SearchBar value={search} onChange={setSearch} isSearching={isSearching} />

      {selectedIds.size > 0 && (
        <BulkTagBar
          selectedCount={selectedIds.size}
          showBulkTagInput={bulkTag.showBulkTagInput}
          bulkTagValue={bulkTag.bulkTagValue}
          onBulkTagValueChange={bulkTag.setBulkTagValue}
          onBulkTagSubmit={bulkTag.handleBulkTagSubmit}
          onOpenBulkTagInput={bulkTag.openBulkTagInput}
          onClearSelection={bulkTag.clearSelectionAndBulkTag}
          onCancelInput={bulkTag.closeBulkTagInput}
          isAddingBulkTag={bulkTag.isAddingBulkTag}
          inputRef={bulkTag.bulkTagInputRef}
        />
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
