"use client";

import { useState } from "react";
import { Search, Loader2, X } from "lucide-react";
import { useSearch } from "@/hooks/useSearch";
import { useDelete } from "@/hooks/useDelete";
import ImageModal from "./ImageModal";

export default function GalleryClient({ initialImages }: { initialImages: any[] }) {
  const { search, setSearch, filteredImages, setFilteredImages, isSearching } = useSearch(initialImages);
  const { deleteImage } = useDelete(setFilteredImages);

  // 모달 상태 관리 (현재 선택된 이미지 객체)
  const [selectedImage, setSelectedImage] = useState<any | null>(null);

  // 현재 필터링된 목록에서 선택된 이미지의 인덱스를 찾습니다.
  const currentIndex = selectedImage
    ? filteredImages.findIndex((img) => img.id === selectedImage.id)
    : -1;

  // 이전/다음 이미지로 변경하는 함수
  const handleNavigate = (direction: 'prev' | 'next') => {
    if (currentIndex === -1) return;

    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    // 무한 루프 없이 범위 내에 있을 때만 업데이트
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
      {/* 1. 검색창 섹션 */}
      <section className="flex flex-col items-center py-10">
        <div className="w-full max-w-2xl relative group">
          {isSearching ? (
            <Loader2 className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500 w-5 h-5 animate-spin" />
          ) : (
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
          )}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="동물, 풍경, 음식 등 의미로 검색해보세요..."
            className="w-full bg-slate-900 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-2xl"
          />
        </div>
      </section>

      {/* 2. 갤러리 그리드 섹션 */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold italic uppercase tracking-wider">
            Gallery <span className="text-indigo-500 ml-2 text-sm">({filteredImages.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredImages.map((img) => (
            <div
              key={img.id}
              onClick={() => setSelectedImage(img)}
              className="group aspect-[3/4] bg-slate-800 rounded-2xl overflow-hidden relative border border-white/5 hover:border-indigo-500/50 transition-all duration-300 shadow-lg cursor-pointer"
            >
              <button
                onClick={(e) => handleDeleteClick(e, img.id, img.filename)}
                className="absolute top-3 right-3 z-20 p-1.5 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 backdrop-blur-md shadow-md"
              >
                <X className="w-4 h-4" />
              </button>

              <img
                src={`/thumbnails/${img.thumbnail}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                alt={img.originalName}
                loading="lazy"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end pointer-events-none">
                <div className="flex flex-wrap gap-1 mb-2">
                  {img.tags && img.tags.slice(0, 5).map((t: string) => (
                    <span key={t} className="text-[10px] bg-indigo-500/80 text-white px-1.5 py-0.5 rounded backdrop-blur-sm">
                      #{t}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] font-medium text-white/90 truncate">{img.originalName}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredImages.length === 0 && !isSearching && (
          <div className="text-center py-20 text-white/20 italic">
            검색 결과가 없습니다.
          </div>
        )}
      </section>

      {/* 3. 사진 크게 보기 모달 - 네비게이션 기능 추가 */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onNext={() => handleNavigate('next')}
          onPrev={() => handleNavigate('prev')}
          hasNext={currentIndex < filteredImages.length - 1}
          hasPrev={currentIndex > 0}
        />
      )}
    </>
  );
}