import { useState, useEffect } from "react";
import { searchSemantic } from "@/lib/api";

export function useSearch(initialImages: any[]) {
  const [search, setSearch] = useState("");
  const [filteredImages, setFilteredImages] = useState(initialImages);
  const [isSearching, setIsSearching] = useState(false);

  const deleteImage = async (id: string, filename: string) => {
    try {
      const res = await fetch(`/api/delete?id=${id}&filename=${filename}`, { method: "DELETE" });
      if (res.ok) {
        setFilteredImages(prev => prev.filter(img => img.id !== id));
        return true;
      }
    } catch (error) {
      console.error(error);
    }
    return false;
  };

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
        // 폴백 로직
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

  return { search, setSearch, filteredImages, isSearching, deleteImage };
}