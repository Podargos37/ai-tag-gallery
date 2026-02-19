"use client";

import { Folder } from "lucide-react";
import type { Folder as FolderType } from "@/types/folders";

export interface FolderSectionProps {
  imageId: string;
  folders: FolderType[];
  onAddImageToFolder?: (folderId: string, imageId: string) => void;
  onRemoveImageFromFolder?: (folderId: string, imageId: string) => void;
}

export function FolderSection({
  imageId,
  folders,
  onAddImageToFolder,
  onRemoveImageFromFolder,
}: FolderSectionProps) {
  if (folders.length === 0) {
    return (
      <section>
        <h4 className="text-[10px] uppercase font-bold mb-4 flex items-center gap-2 opacity-50">
          <Folder className="w-3 h-3" /> 폴더
        </h4>
        <p className="text-xs opacity-60">생성된 폴더가 없습니다. 왼쪽 사이드바에서 새 폴더를 만드세요.</p>
      </section>
    );
  }

  const toggle = (folder: FolderType) => {
    const inFolder = folder.imageIds.includes(imageId);
    if (inFolder && onRemoveImageFromFolder) {
      onRemoveImageFromFolder(folder.id, imageId);
    } else if (!inFolder && onAddImageToFolder) {
      onAddImageToFolder(folder.id, imageId);
    }
  };

  return (
    <section>
      <h4 className="text-[10px] uppercase font-bold mb-4 flex items-center gap-2 opacity-50">
        <Folder className="w-3 h-3" /> 폴더
      </h4>
      <p className="text-xs mb-3 opacity-60">이미지를 넣을 폴더를 선택하세요.</p>
      <ul className="space-y-1.5">
        {folders.map((folder) => {
          const checked = folder.imageIds.includes(imageId);
          return (
            <li key={folder.id}>
              <label className="flex items-center gap-2 cursor-pointer text-sm opacity-90 hover:opacity-100 transition-opacity">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(folder)}
                  className="rounded border-2 border-[var(--surface-border)] bg-[var(--surface)] text-indigo-500 focus:ring-indigo-500/50"
                />
                <span className="truncate">{folder.name}</span>
                <span className="text-xs shrink-0 opacity-60">({folder.imageIds.length})</span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
