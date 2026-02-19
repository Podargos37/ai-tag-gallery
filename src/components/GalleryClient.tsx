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
import { UNFOLDERED_ID } from "@/types/folders";

export default function GalleryClient({ initialImages }: { initialImages: ImageItem[] }) {
  const [images, setImages] = useState<ImageItem[]>(initialImages);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const {
    folders,
    selectedFolderId,
    setSelectedFolderId,
    loading: foldersLoading,
    addFolder,
    deleteFolder,
    addImageToFolder,
    addImagesToFolder,
    removeImageFromFolder,
  } = useFolders();

  const idsInAnyFolder = useMemo(() => {
    const set = new Set<string>();
    for (const f of folders) for (const id of f.imageIds) set.add(id);
    return set;
  }, [folders]);

  const baseImages = useMemo(() => {
    if (selectedFolderId === UNFOLDERED_ID) {
      return images.filter((img) => !idsInAnyFolder.has(img.id));
    }
    if (!selectedFolderId) return images;
    const folder = folders.find((f) => f.id === selectedFolderId);
    if (!folder) return images;
    const idSet = new Set(folder.imageIds);
    return images.filter((img) => idSet.has(img.id));
  }, [images, folders, selectedFolderId, idsInAnyFolder]);

  const unfolderedCount = useMemo(
    () => images.filter((img) => !idsInAnyFolder.has(img.id)).length,
    [images, idsInAnyFolder]
  );

  const { search, setSearch, filteredImages, setFilteredImages, isSearching, runSearch } = useSearch(baseImages);
  const { deleteImage } = useDelete(setFilteredImages);

  const {
    selectedImage,
    setSelectedImage,
    selectedIds,
    handleCardSelectionClick,
    handleCardToggleOne,
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

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (count === 0) return;
    if (!confirm(`선택한 ${count}개의 이미지를 삭제할까요?`)) return;
    const toDelete = filteredImages.filter((img) => selectedIds.has(img.id));
    setIsBulkDeleting(true);
    const deletedIds = new Set<string>();
    try {
      for (const img of toDelete) {
        const ok = await deleteImage(img.id, img.filename);
        if (ok) deletedIds.add(img.id);
      }
      setImages((prev) => prev.filter((img) => !deletedIds.has(img.id)));
      if (selectedImage && deletedIds.has(selectedImage.id)) setSelectedImage(null);
      clearSelection();
      if (deletedIds.size < toDelete.length) {
        alert(`일부 삭제에 실패했습니다. (${toDelete.length - deletedIds.size}개)`);
      }
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return (
    <div className="flex gap-6 w-full h-[calc(100vh-7.5rem)] min-h-0">
      <FolderSidebarLayout
        folders={folders}
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        onAddFolder={addFolder}
        onDeleteFolder={deleteFolder}
        loading={foldersLoading}
        unfolderedCount={unfolderedCount}
        mobileOpen={mobileSidebarOpen}
        onMobileOpenChange={setMobileSidebarOpen}
      />

      <div className="flex-1 min-w-0 min-h-0 flex flex-col">
        <div className="shrink-0 space-y-4 pb-4">
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
              <SearchBar value={search} onChange={setSearch} isSearching={isSearching} onSubmit={runSearch} />
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
              folders={folders}
              onBulkAddToFolder={(folderId) => {
                addImagesToFolder(folderId, Array.from(selectedIds));
              }}
              onBulkDelete={handleBulkDelete}
              isDeleting={isBulkDeleting}
            />
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto flex justify-center">
          <div className="w-full max-w-7xl">
            <GalleryGrid
              images={filteredImages}
              isSearching={isSearching}
              selectedIds={selectedIds}
              onSelectImage={setSelectedImage}
              onCardSelectionClick={handleCardSelectionClick}
              onCardToggleOne={handleCardToggleOne}
              onDeleteImage={handleDeleteClick}
            />
          </div>
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
