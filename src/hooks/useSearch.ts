// src/hooks/useSearch.ts
import { useState, useEffect } from "react";
import { searchSemantic } from "@/lib/api";
import type { ImageItem } from "@/types/gallery";

export function useSearch(initialImages: ImageItem[]) {
  const [search, setSearch] = useState("");
  const [filteredImages, setFilteredImages] = useState<ImageItem[]>(initialImages);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      const searchTerm = search.toLowerCase().trim(); // 검색어 소문자화 및 공백 제거

      if (!searchTerm) {
        setFilteredImages(initialImages);
        return;
      }

      setIsSearching(true);
      try {
        const allUniqueTags = Array.from(new Set(initialImages.flatMap((img) => img.tags ?? [])));
        const { match_tags } = await searchSemantic(searchTerm, allUniqueTags);

        const filtered = initialImages.filter((img) => {
          // 1. 시맨틱 태그 매칭
          const matchTags = (img.tags ?? []).some((tag) => match_tags.includes(tag));
          // 2. 파일명 매칭
          const matchName = img.originalName.toLowerCase().includes(searchTerm);
          // 3. 메모 내용 매칭 (새로 추가)
          const matchNotes = img.notes && img.notes.toLowerCase().includes(searchTerm);

          return matchTags || matchName || matchNotes;
        });
        setFilteredImages(filtered);
      } catch (error) {
        // 시맨틱 검색 실패 시 일반 텍스트 매칭으로 폴백
        const fallback = initialImages.filter((img) => {
          const matchTags = (img.tags ?? []).some((tag) => tag.toLowerCase().includes(searchTerm));
          const matchName = img.originalName.toLowerCase().includes(searchTerm);
          const matchNotes = img.notes && img.notes.toLowerCase().includes(searchTerm);

          return matchTags || matchName || matchNotes;
        });
        setFilteredImages(fallback);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, initialImages]);

  return { search, setSearch, filteredImages, setFilteredImages, isSearching };
}