// src/hooks/useSearch.ts
import { useState, useEffect, useCallback } from "react";
import { searchSemantic } from "@/lib/api";
import type { ImageItem } from "@/types/gallery";

export function useSearch(initialImages: ImageItem[]) {
  const [search, setSearch] = useState("");
  const [filteredImages, setFilteredImages] = useState<ImageItem[]>(initialImages);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setFilteredImages(initialImages);
  }, [initialImages]);

  const runSearch = useCallback(() => {
    const searchTerm = search.toLowerCase().trim();

    if (!searchTerm) {
      setFilteredImages(initialImages);
      return;
    }

    setIsSearching(true);
    (async () => {
      try {
        const allUniqueTags = Array.from(new Set(initialImages.flatMap((img) => img.tags ?? [])));
        const { match_tags } = await searchSemantic(searchTerm, allUniqueTags);

        const filtered = initialImages.filter((img) => {
          const matchTags = (img.tags ?? []).some((tag) => match_tags.includes(tag));
          const matchName = img.originalName.toLowerCase().includes(searchTerm);
          const matchNotes = img.notes && img.notes.toLowerCase().includes(searchTerm);
          return matchTags || matchName || matchNotes;
        });
        setFilteredImages(filtered);
      } catch (error) {
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
    })();
  }, [search, initialImages]);

  return { search, setSearch, filteredImages, setFilteredImages, isSearching, runSearch };
}
