"use client";

import { useState, useRef, useEffect } from "react";
import { Tag, X, FolderPlus, Folder } from "lucide-react";
import type { Folder as FolderType } from "@/types/folders";

interface BulkTagBarProps {
  selectedCount: number;
  showBulkTagInput: boolean;
  bulkTagValue: string;
  onBulkTagValueChange: (value: string) => void;
  onBulkTagSubmit: () => void;
  onOpenBulkTagInput: () => void;
  onClearSelection: () => void;
  onCancelInput: () => void;
  isAddingBulkTag: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  folders?: FolderType[];
  onBulkAddToFolder?: (folderId: string) => void;
}

export default function BulkTagBar({
  selectedCount,
  showBulkTagInput,
  bulkTagValue,
  onBulkTagValueChange,
  onBulkTagSubmit,
  onOpenBulkTagInput,
  onClearSelection,
  onCancelInput,
  isAddingBulkTag,
  inputRef,
  folders = [],
  onBulkAddToFolder,
}: BulkTagBarProps) {
  const [folderDropdownOpen, setFolderDropdownOpen] = useState(false);
  const folderDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!folderDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (folderDropdownRef.current && !folderDropdownRef.current.contains(e.target as Node)) {
        setFolderDropdownOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFolderDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [folderDropdownOpen]);

  const handleFolderSelect = (folderId: string) => {
    onBulkAddToFolder?.(folderId);
    setFolderDropdownOpen(false);
  };

  const hasFolders = folders.length > 0;
  const showFolderButton = onBulkAddToFolder !== undefined;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3 backdrop-blur-sm">
      <span className="text-sm text-white/80">
        <strong className="text-white">{selectedCount}</strong>개 선택
      </span>
      {!showBulkTagInput ? (
        <>
          <button
            type="button"
            onClick={onOpenBulkTagInput}
            className="flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
          >
            <Tag className="w-4 h-4" />
            태그 추가
          </button>
          {showFolderButton && (
            <div className="relative" ref={folderDropdownRef}>
              <button
                type="button"
                onClick={() => hasFolders && setFolderDropdownOpen((v) => !v)}
                disabled={!hasFolders}
                title={!hasFolders ? "폴더가 없습니다. 왼쪽에서 새 폴더를 만드세요." : undefined}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FolderPlus className="w-4 h-4" />
                폴더에 추가
              </button>
              {folderDropdownOpen && hasFolders && (
                <div className="absolute left-0 top-full z-10 mt-1 min-w-[160px] rounded-lg border border-white/10 bg-slate-800 py-1 shadow-xl">
                  {folders.map((folder) => (
                    <button
                      key={folder.id}
                      type="button"
                      onClick={() => handleFolderSelect(folder.id)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white/90 transition-colors hover:bg-white/10"
                    >
                      <Folder className="w-4 h-4 shrink-0 text-white/60" />
                      {folder.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={onClearSelection}
            className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/10"
          >
            <X className="w-4 h-4" />
            선택 해제
          </button>
        </>
      ) : (
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={bulkTagValue}
            onChange={(e) => onBulkTagValueChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onBulkTagSubmit();
              if (e.key === "Escape") onCancelInput();
            }}
            placeholder="추가할 태그 입력 후 Enter"
            className="flex-1 min-w-[160px] rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <button
            type="button"
            onClick={onBulkTagSubmit}
            disabled={!bulkTagValue.trim() || isAddingBulkTag}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
          >
            {isAddingBulkTag ? "추가 중..." : "추가"}
          </button>
          <button
            type="button"
            onClick={onCancelInput}
            className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white/60 hover:text-white"
          >
            취소
          </button>
        </div>
      )}
    </div>
  );
}
