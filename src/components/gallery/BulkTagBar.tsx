"use client";

import { Tag, X } from "lucide-react";

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
}: BulkTagBarProps) {
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
