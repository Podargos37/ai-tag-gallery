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
        <h4 className="text-white/20 text-[10px] uppercase font-bold mb-4 flex items-center gap-2">
          <Folder className="w-3 h-3" /> 폴더
        </h4>
        <p className="text-white/40 text-xs">생성된 폴더가 없습니다. 왼쪽 사이드바에서 새 폴더를 만드세요.</p>
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
      <h4 className="text-white/20 text-[10px] uppercase font-bold mb-4 flex items-center gap-2">
        <Folder className="w-3 h-3" /> 폴더
      </h4>
      <p className="text-white/40 text-xs mb-3">이미지를 넣을 폴더를 선택하세요.</p>
      <ul className="space-y-1.5">
        {folders.map((folder) => {
          const checked = folder.imageIds.includes(imageId);
          return (
            <li key={folder.id}>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-white/80 hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(folder)}
                  className="rounded border-white/20 bg-slate-800 text-indigo-500 focus:ring-indigo-500/50"
                />
                <span className="truncate">{folder.name}</span>
                <span className="text-white/40 text-xs shrink-0">({folder.imageIds.length})</span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
