"use client";

import { Tag, X, Trash2 } from "lucide-react";
import type { Folder as FolderType } from "@/types/folders";
import FolderAddDropdown from "./FolderAddDropdown";

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
  onBulkDelete?: () => void;
  isDeleting?: boolean;
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
  onBulkDelete,
  isDeleting = false,
}: BulkTagBarProps) {
  const showFolderButton = onBulkAddToFolder !== undefined;

  return (
    <div
      className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3 backdrop-blur-sm"
      style={{
        backgroundColor: "var(--modal-bg)",
        borderColor: "var(--surface-border)",
      }}
    >
      <span
        className="text-sm opacity-80"
        style={{ color: "var(--foreground)" }}
      >
        <strong style={{ color: "var(--foreground)" }}>{selectedCount}</strong>
        개 선택
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
            <FolderAddDropdown
              folders={folders}
              onSelect={onBulkAddToFolder}
            />
          )}
          {onBulkDelete && (
            <button
              type="button"
              onClick={onBulkDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/20 px-4 py-2 text-sm text-red-200 transition-colors hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              title="선택한 이미지 삭제"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? "삭제 중..." : "선택 삭제"}
            </button>
          )}
          <button
            type="button"
            onClick={onClearSelection}
            className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors hover:bg-[var(--surface)]"
            style={{
              borderColor: "var(--surface-border)",
              backgroundColor: "var(--surface)",
              color: "var(--foreground)",
            }}
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
            placeholder="추가할 태그 입력 후 Enter (쉼표로 여러 개)"
            className="flex-1 min-w-[160px] rounded-lg border px-3 py-2 text-sm placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--surface-border)",
              color: "var(--foreground)",
            }}
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
            className="rounded-lg border px-3 py-2 text-sm opacity-80 transition-colors hover:opacity-100"
            style={{
              borderColor: "var(--surface-border)",
              color: "var(--foreground)",
            }}
          >
            취소
          </button>
        </div>
      )}
    </div>
  );
}
