"use client";

import { Search, Loader2, X } from "lucide-react";
import { useSearch } from "@/hooks/useSearch";

export default function GalleryClient({ initialImages }: { initialImages: any[] }) {
  // 훅에서 모든 상태와 함수를 가져옵니다.
  const { search, setSearch, filteredImages, isSearching, deleteImage } = useSearch(initialImages);

  // 삭제 버튼 핸들러
  const handleDeleteClick = async (id: string, filename: string) => {
    if (!confirm("이미지를 삭제하시겠습니까?")) return;

    const success = await deleteImage(id, filename);
    if (success) {
      alert("삭제되었습니다.");
    } else {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      {/* 검색 섹션 */}
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

      {/* 갤러리 그리드 섹션 */}
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
              className="group aspect-[3/4] bg-slate-800 rounded-2xl overflow-hidden relative border border-white/5 hover:border-indigo-500/50 transition-all duration-300"
            >
              {/* 삭제 버튼 */}
              <button
                onClick={() => handleDeleteClick(img.id, img.filename)}
                className="absolute top-2 right-2 z-10 p-1.5 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 backdrop-blur-md"
              >
                <X className="w-4 h-4" />
              </button>

              {/* 이미지 출력 */}
              <img
                src={`/uploads/${img.filename}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                alt={img.originalName}
                loading="lazy"
              />

              {/* 하단 정보 오버레이 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                <div className="flex flex-wrap gap-1 mb-2">
                  {img.tags.slice(0, 5).map((t: string) => (
                    <span
                      key={t}
                      className="text-[10px] bg-indigo-500/80 text-white px-1.5 py-0.5 rounded backdrop-blur-sm"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
                <p className="text-xs font-medium text-white truncate">{img.originalName}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 결과가 없을 때 보여줄 화면 */}
        {filteredImages.length === 0 && !isSearching && (
          <div className="text-center py-20 text-white/30">
            검색 결과가 없습니다.
          </div>
        )}
      </section>
    </>
  );
}