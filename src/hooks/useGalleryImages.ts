"use client";

import { useMemo } from "react";
import type { ImageItem } from "@/types/gallery";
import type { Folder } from "@/types/folders";
import { UNFOLDERED_ID } from "@/types/folders";

export interface UseGalleryImagesResult {
  /** 현재 폴더 필터(전체/폴더/미분류)에 맞는 이미지 목록 */
  baseImages: ImageItem[];
  /** 어떤 폴더에도 속하지 않은 이미지 개수 */
  unfolderedCount: number;
}

export function useGalleryImages(
  images: ImageItem[],
  folders: Folder[],
  selectedFolderId: string | null
): UseGalleryImagesResult {
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

  return { baseImages, unfolderedCount };
}
