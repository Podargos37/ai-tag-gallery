"use client";

import { useState } from "react";
import { useSearch } from "@/hooks/useSearch";
import { useDelete } from "@/hooks/useDelete";
import ImageModal from "./ImageModal";
import SearchBar from "./gallery/SearchBar";
import GalleryGrid from "./gallery/GalleryGrid";

export default function GalleryClient({ initialImages }: { initialImages: any[] }) {
  const { search, setSearch, filteredImages, setFilteredImages, isSearching } = useSearch(initialImages);
  const { deleteImage } = useDelete(setFilteredImages);

  const [selectedImage, setSelectedImage] = useState<any | null>(null);

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

  return (
    <>
      <SearchBar
        value={search}
        onChange={setSearch}
        isSearching={isSearching}
      />

      <GalleryGrid
        images={filteredImages}
        isSearching={isSearching}
        onSelectImage={setSelectedImage}
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
