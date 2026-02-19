"use client";

import { Folder, Trash2 } from "lucide-react";
import type { Folder as FolderType } from "@/types/folders";
import FolderItemButton from "./FolderItemButton";

interface FolderRowProps {
  folder: FolderType;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export default function FolderRow({
  folder,
  selected,
  onSelect,
  onDelete,
}: FolderRowProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`"${folder.name}" 폴더를 삭제할까요?`)) {
      onDelete();
    }
  };

  return (
    <div className="group flex items-center gap-2 px-4 pr-2">
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
