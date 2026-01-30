// src/hooks/useSearch.ts
import { useState, useEffect } from "react";
import { searchSemantic } from "@/lib/api";

export function useSearch(initialImages: any[]) {
  const [search, setSearch] = useState("");
  const [filteredImages, setFilteredImages] = useState(initialImages);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (!search.trim()) {
        setFilteredImages(initialImages);
        return;
      }

      setIsSearching(true);
      try {
        const allUniqueTags = Array.from(new Set(initialImages.flatMap((img) => img.tags)));
        const { match_tags } = await searchSemantic(search, allUniqueTags);

        const filtered = initialImages.filter((img) =>
          img.tags.some((tag: string) => match_tags.includes(tag)) ||
          img.originalName.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredImages(filtered);
      } catch (error) {
        const fallback = initialImages.filter((img) =>
          img.tags.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase()))
        );
        setFilteredImages(fallback);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, initialImages]);

  // setFilteredImages를 반환하여 useDelete가 사용할 수 있게 합니다.
  return { search, setSearch, filteredImages, setFilteredImages, isSearching };
}