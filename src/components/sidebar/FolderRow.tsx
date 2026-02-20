"use client";

import { useState, useCallback } from "react";
import { Folder, Trash2 } from "lucide-react";
import type { Folder as FolderType } from "@/types/folders";
import FolderItemButton from "./FolderItemButton";

interface FolderRowProps {
  folder: FolderType;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onAddImages?: (folderId: string, imageIds: string[]) => void;
}

export default function FolderRow({
  folder,
  selected,
  onSelect,
  onDelete,
  onAddImages,
}: FolderRowProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`"${folder.name}" 폴더를 삭제할까요?`)) {
      onDelete();
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("application/x-gallery-images")) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const data = e.dataTransfer.getData("application/x-gallery-images");
      if (data && onAddImages) {
        try {
          const imageIds = JSON.parse(data) as string[];
          if (imageIds.length > 0) {
            onAddImages(folder.id, imageIds);
          }
        } catch {
          // ignore parse error
        }
      }
    },
    [folder.id, onAddImages]
  );

  return (
    <div
      className={`group flex items-center gap-2 px-4 pr-2 rounded-lg transition-colors ${
        isDragOver ? "bg-indigo-500/30 ring-2 ring-indigo-400" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex-1 min-w-0">
        <FolderItemButton
          label={folder.name}
          icon={Folder}
          count={folder.imageIds.length}
          selected={selected}
          onClick={onSelect}
        />
      </div>
      <button
        type="button"
        onClick={handleDelete}
        className="p-1.5 rounded hover:text-red-500 hover:bg-[var(--surface)] opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: "var(--foreground)" }}
        title="폴더 삭제"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
