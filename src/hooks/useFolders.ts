"use client";

import { useState, useEffect, useCallback } from "react";
import { getFolders, saveFolders } from "@/lib/api";
import type { Folder } from "@/types/folders";

function generateFolderId(): string {
  return `folder-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useFolders() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFolders();
      setFolders(data.folders ?? []);
    } catch (e) {
      console.error("Failed to load folders:", e);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const persist = useCallback(async (next: Folder[]) => {
    setFolders(next);
    try {
      await saveFolders(next);
    } catch (e) {
      console.error("Failed to save folders:", e);
    }
  }, []);

  const addFolder = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const newFolder: Folder = {
        id: generateFolderId(),
        name: trimmed,
        imageIds: [],
      };
      await persist([...folders, newFolder]);
    },
    [folders, persist]
  );

  const deleteFolder = useCallback(
    async (id: string) => {
      await persist(folders.filter((f) => f.id !== id));
      if (selectedFolderId === id) setSelectedFolderId(null);
    },
    [folders, selectedFolderId, persist]
  );

  const renameFolder = useCallback(
    async (id: string, name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      await persist(
        folders.map((f) => (f.id === id ? { ...f, name: trimmed } : f))
      );
    },
    [folders, persist]
  );

  const addImageToFolder = useCallback(
    async (folderId: string, imageId: string) => {
      await persist(
        folders.map((f) => {
          if (f.id !== folderId) return f;
          if (f.imageIds.includes(imageId)) return f;
          return { ...f, imageIds: [...f.imageIds, imageId] };
        })
      );
    },
    [folders, persist]
  );

  const addImagesToFolder = useCallback(
    async (folderId: string, imageIds: string[]) => {
      const idSet = new Set(imageIds);
      await persist(
        folders.map((f) => {
          if (f.id !== folderId) return f;
          const existing = new Set(f.imageIds);
          const toAdd = [...idSet].filter((id) => !existing.has(id));
          if (toAdd.length === 0) return f;
          return { ...f, imageIds: [...f.imageIds, ...toAdd] };
        })
      );
    },
    [folders, persist]
  );

  const removeImageFromFolder = useCallback(
    async (folderId: string, imageId: string) => {
      await persist(
        folders.map((f) =>
          f.id === folderId
            ? { ...f, imageIds: f.imageIds.filter((id) => id !== imageId) }
            : f
        )
      );
    },
    [folders, persist]
  );

  return {
    folders,
    selectedFolderId,
    setSelectedFolderId,
    loading,
    addFolder,
    deleteFolder,
    renameFolder,
    addImageToFolder,
    addImagesToFolder,
    removeImageFromFolder,
    refetch: load,
  };
}
