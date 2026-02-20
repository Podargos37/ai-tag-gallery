"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Menu, ImagePlus } from "lucide-react";
import { useSearch } from "@/hooks/useSearch";
import { useDelete } from "@/hooks/useDelete";
import { useGallerySelection } from "@/hooks/useGallerySelection";
import { useBulkTag } from "@/hooks/useBulkTag";
import { useFolders } from "@/hooks/useFolders";
import { useGalleryImages } from "@/hooks/useGalleryImages";
import { useUpload } from "@/hooks/useUpload";
import { searchSimilar } from "@/lib/api/search-similar";
import ImageModal from "./ImageModal";
import SimilarImagesDrawer from "./similar/SimilarImagesDrawer";
import { BulkTagBar, GalleryGrid, SearchBar } from "./gallery";
import FolderSidebarLayout from "./sidebar/FolderSidebarLayout";
import type { ImageItem } from "@/types/gallery";

export default function GalleryClient({ initialImages }: { initialImages: ImageItem[] }) {
  const [images, setImages] = useState<ImageItem[]>(initialImages);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [similarDrawerOpen, setSimilarDrawerOpen] = useState(false);
  const [similarQueryImage, setSimilarQueryImage] = useState<ImageItem | null>(null);
  const [similarResults, setSimilarResults] = useState<ImageItem[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);
  const { uploadImages, isUploading, phase, progress, totalFiles } = useUpload();
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
    removeImageIdFromAllFolders,
  } = useFolders();

  const { baseImages, unfolderedCount } = useGalleryImages(
    images,
    folders,
    selectedFolderId
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
    hasNext,
    hasPrev,
    isRandomSlideshow,
    startRandomSlideshow,
    clearRandomSlideshow,
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
    if (success) {
      setImages((prev) => prev.filter((img) => img.id !== id));
      await removeImageIdFromAllFolders(id);
    } else {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteFromModal = useCallback(
    async (img: ImageItem) => {
      const success = await deleteImage(img.id, img.filename);
      if (success) {
        setImages((prev) => prev.filter((i) => i.id !== img.id));
        await removeImageIdFromAllFolders(img.id);
        setSelectedImage(null);
      } else {
        alert("삭제 중 오류가 발생했습니다.");
      }
    },
    [deleteImage, removeImageIdFromAllFolders, setSelectedImage]
  );

  const handleSearchSimilar = useCallback(async (image: ImageItem) => {
    setSimilarQueryImage(image);
    setSimilarResults([]);
    setSimilarLoading(true);
    setSimilarDrawerOpen(true);
    try {
      const results = await searchSimilar(image.id, 20);
      setSimilarResults(results);
    } catch {
      setSimilarResults([]);
    } finally {
      setSimilarLoading(false);
    }
  }, []);

  const handleImageCreated = useCallback((newImage: ImageItem) => {
    setImages((prev) => [newImage, ...prev]);
  }, []);

  const currentFolderName = folders.find((f) => f.id === selectedFolderId)?.name;

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (
      e.dataTransfer.types.includes("Files") &&
      !e.dataTransfer.types.includes("application/x-gallery-images")
    ) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounterRef.current = 0;

      if (e.dataTransfer.types.includes("application/x-gallery-images")) {
        return;
      }

      const files = e.dataTransfer.files;
      if (files.length === 0) return;

      const imageFiles = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (imageFiles.length === 0) {
        alert("이미지 파일만 업로드할 수 있습니다.");
        return;
      }

      const result = await uploadImages(imageFiles, { skipReload: true });

      if (result.success && result.images.length > 0) {
        setImages((prev) => [...result.images, ...prev]);

        if (
          selectedFolderId &&
          selectedFolderId !== "__all__" &&
          selectedFolderId !== "__unfoldered__"
        ) {
          const newImageIds = result.images.map((img) => img.id);
          await addImagesToFolder(selectedFolderId, newImageIds);
        }
      }
    },
    [uploadImages, selectedFolderId, addImagesToFolder]
  );

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
      for (const id of deletedIds) {
        await removeImageIdFromAllFolders(id);
      }
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
    <div
      className="flex gap-6 w-full h-[calc(100vh-7.5rem)] min-h-0 relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {(isDragging || isUploading) && (
        <div className="absolute inset-0 z-50 pointer-events-none">
          <div
            className={`absolute inset-0 rounded-2xl border-4 border-dashed flex flex-col items-center justify-center transition-all duration-200 ${
              isDragging
                ? "bg-indigo-500/20 border-indigo-400"
                : "bg-black/60 border-transparent"
            }`}
          >
            {isDragging ? (
              <>
                <ImagePlus className="w-16 h-16 text-indigo-300 mb-4" />
                <span className="text-white text-xl font-semibold">
                  여기에 이미지를 놓으세요
                </span>
                {currentFolderName && (
                  <span className="text-indigo-200 text-sm mt-2">
                    &quot;{currentFolderName}&quot; 폴더에 추가됩니다
                  </span>
                )}
                {!currentFolderName &&
                  selectedFolderId !== "__unfoldered__" && (
                    <span className="text-white/60 text-sm mt-2">
                      전체 갤러리에 추가됩니다
                    </span>
                  )}
              </>
            ) : (
              <>
                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4" />
                <span className="text-white text-lg font-medium">
                  {phase === "uploading" ? "업로드 중..." : "처리 중..."}
                </span>
                <span className="text-white/60 text-sm mt-1">
                  {totalFiles}개 파일 {progress !== null && `· ${progress}%`}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      <FolderSidebarLayout
        folders={folders}
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        onAddFolder={addFolder}
        onDeleteFolder={deleteFolder}
        onAddImagesToFolder={addImagesToFolder}
        loading={foldersLoading}
        unfolderedCount={unfolderedCount}
        mobileOpen={mobileSidebarOpen}
        onMobileOpenChange={setMobileSidebarOpen}
      />

      <div className="flex-1 min-w-0 min-h-0 flex flex-col">
        <div className="relative z-30 shrink-0 space-y-4 pb-4">
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
          <div className="w-full">
            <GalleryGrid
              images={filteredImages}
              isSearching={isSearching}
              selectedIds={selectedIds}
              onSelectImage={setSelectedImage}
              onCardSelectionClick={handleCardSelectionClick}
              onCardToggleOne={handleCardToggleOne}
              onDeleteImage={handleDeleteClick}
              onSearchSimilar={handleSearchSimilar}
            />
          </div>
        </div>
      </div>

      {similarDrawerOpen && (
        <SimilarImagesDrawer
          open={similarDrawerOpen}
          onClose={() => setSimilarDrawerOpen(false)}
          queryImage={similarQueryImage}
          results={similarResults}
          loading={similarLoading}
          onSelectImage={(img) => {
            setSelectedImage(img);
          }}
        />
      )}

      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => {
            clearRandomSlideshow();
            setSelectedImage(null);
          }}
          onNext={() => handleNavigate("next")}
          onPrev={() => handleNavigate("prev")}
          hasNext={hasNext}
          hasPrev={hasPrev}
          isRandomSlideshow={isRandomSlideshow}
          onToggleRandomSlideshow={isRandomSlideshow ? clearRandomSlideshow : startRandomSlideshow}
          folders={folders}
          onAddImageToFolder={addImageToFolder}
          onRemoveImageFromFolder={removeImageFromFolder}
          onDelete={handleDeleteFromModal}
          onImageCreated={handleImageCreated}
        />
      )}
    </div>
  );
}
