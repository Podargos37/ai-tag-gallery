"use client";

import { useState, useEffect, useMemo } from "react";
import { Menu } from "lucide-react";
import { useSearch } from "@/hooks/useSearch";
import { useDelete } from "@/hooks/useDelete";
import { useGallerySelection } from "@/hooks/useGallerySelection";
import { useBulkTag } from "@/hooks/useBulkTag";
import { useFolders } from "@/hooks/useFolders";
import ImageModal from "./ImageModal";
import { BulkTagBar, GalleryGrid, SearchBar } from "./gallery";
import FolderSidebarLayout from "./sidebar/FolderSidebarLayout";
import type { ImageItem } from "@/types/gallery";

export default function GalleryClient({ initialImages }: { initialImages: ImageItem[] }) {
  const [images, setImages] = useState<ImageItem[]>(initialImages);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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
      <FolderSidebarLayout
        folders={folders}
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        onAddFolder={addFolder}
        onDeleteFolder={deleteFolder}
        loading={foldersLoading}
        mobileOpen={mobileSidebarOpen}
        onMobileOpenChange={setMobileSidebarOpen}
      />

      <div className="flex-1 min-w-0 flex justify-center">
        <div className="w-full max-w-7xl space-y-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition shrink-0"
              aria-label="폴더 메뉴 열기"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1 min-w-0">
              <SearchBar value={search} onChange={setSearch} isSearching={isSearching} />
            </div>
          </div>

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
