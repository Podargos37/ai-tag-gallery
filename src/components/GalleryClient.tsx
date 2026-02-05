"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearch } from "@/hooks/useSearch";
import { useDelete } from "@/hooks/useDelete";
import { useGallerySelection } from "@/hooks/useGallerySelection";
import { useBulkTag } from "@/hooks/useBulkTag";
import { useFolders } from "@/hooks/useFolders";
import ImageModal from "./ImageModal";
import SearchBar from "./gallery/SearchBar";
import GalleryGrid from "./gallery/GalleryGrid";
import BulkTagBar from "./gallery/BulkTagBar";
import FolderSidebar from "./sidebar/FolderSidebar";

export default function GalleryClient({ initialImages }: { initialImages: any[] }) {
  const [images, setImages] = useState(initialImages);
  const {
    folders,
    selectedFolderId,
    setSelectedFolderId,
    loading: foldersLoading,
    addFolder,
    deleteFolder,
    addImageToFolder,
    removeImageFromFolder,
  } = useFolders();

  const baseImages = useMemo(() => {
    if (!selectedFolderId) return images;
    const folder = folders.find((f) => f.id === selectedFolderId);
    if (!folder) return images;
    const idSet = new Set(folder.imageIds);
    return images.filter((img) => idSet.has(img.id));
  }, [images, folders, selectedFolderId]);

  const { search, setSearch, filteredImages, setFilteredImages, isSearching } = useSearch(baseImages);
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
    <div className="flex gap-6 w-full min-h-[calc(100vh-6rem)]">
      <FolderSidebar
        folders={folders}
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        onAddFolder={addFolder}
        onDeleteFolder={deleteFolder}
        loading={foldersLoading}
      />

      {/* 갤러리 영역만 기존처럼 max-w-7xl 유지, 사이드바는 왼쪽 여백에 위치 */}
      <div className="flex-1 min-w-0 flex justify-center">
        <div className="w-full max-w-7xl space-y-8">
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
        </div>
      </div>

      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onNext={() => handleNavigate("next")}
          onPrev={() => handleNavigate("prev")}
          hasNext={currentIndex < filteredImages.length - 1}
          hasPrev={currentIndex > 0}
          folders={folders}
          onAddImageToFolder={addImageToFolder}
          onRemoveImageFromFolder={removeImageFromFolder}
        />
      )}
    </div>
  );
}
