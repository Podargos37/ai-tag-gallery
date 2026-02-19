"use client";

import { useState } from "react";
import { FolderOpen, Folder, FolderMinus, Plus, Trash2, Loader2, X } from "lucide-react";
import type { Folder as FolderType } from "@/types/folders";
import { UNFOLDERED_ID } from "@/types/folders";

interface FolderSidebarProps {
  folders: FolderType[];
  selectedFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
  onAddFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  loading?: boolean;
  unfolderedCount?: number;
  /** 모바일 드로어로 띄울 때 true → 배경+닫기 버튼 */
  variant?: "inline" | "overlay";
  onClose?: () => void;
}

export default function FolderSidebar({
  folders,
  selectedFolderId,
  onSelectFolder,
  onAddFolder,
  onDeleteFolder,
  loading = false,
  unfolderedCount = 0,
  variant = "inline",
  onClose,
}: FolderSidebarProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const handleAdd = () => {
    const name = newName.trim();
    if (name) {
      onAddFolder(name);
      setNewName("");
      setIsAdding(false);
    }
  };

  const isOverlay = variant === "overlay";

  const panel = (
    <aside
      className={`flex flex-col border-r overflow-hidden ${
        isOverlay ? "w-72 max-w-[85vw] h-full rounded-r-xl shadow-xl" : "w-56 shrink-0 rounded-xl"
      }`}
      style={{ backgroundColor: "var(--sidebar-bg)", borderColor: "var(--surface-border)", color: "var(--foreground)" }}
    >
      <div
        className="p-3 border-b flex items-center justify-between"
        style={{ borderColor: "var(--surface-border)" }}
      >
        <h2 className="text-xs font-semibold uppercase tracking-wider px-2 py-1 opacity-60" style={{ color: "var(--foreground)" }}>
          폴더
        </h2>
        {isOverlay && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg opacity-70 hover:opacity-100 hover:bg-[var(--surface)] transition"
            style={{ color: "var(--foreground)" }}
            aria-label="사이드바 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 py-2">
        {loading ? (
          <div className="flex items-center justify-center py-8 opacity-40" style={{ color: "var(--foreground)" }}>
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onSelectFolder(null)}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors ${
                selectedFolderId === null ? "bg-indigo-500/20" : "opacity-80 hover:opacity-100 hover:bg-[var(--surface)]"
              }`}
              style={{ color: selectedFolderId === null ? "var(--accent)" : "var(--foreground)" }}
            >
              <FolderOpen className="w-4 h-4 shrink-0" />
              <span className="truncate">전체</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectFolder(UNFOLDERED_ID)}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors ${
                selectedFolderId === UNFOLDERED_ID ? "bg-indigo-500/20" : "opacity-80 hover:opacity-100 hover:bg-[var(--surface)]"
              }`}
              style={{ color: selectedFolderId === UNFOLDERED_ID ? "var(--accent)" : "var(--foreground)" }}
            >
              <FolderMinus className="w-4 h-4 shrink-0" />
              <span className="truncate">미분류</span>
              <span className="ml-auto text-xs opacity-60 shrink-0">
                {unfolderedCount}
              </span>
            </button>

            {folders.map((folder) => (
              <div
                key={folder.id}
                className="group flex items-center gap-2 px-4 py-2.5 pr-2"
              >
                <button
                  type="button"
                  onClick={() => onSelectFolder(folder.id)}
                  className={`flex-1 flex items-center gap-2 min-w-0 text-left transition-colors ${
                    selectedFolderId === folder.id ? "bg-indigo-500/20" : "opacity-80 hover:opacity-100 hover:bg-[var(--surface)]"
                  }`}
                  style={{ color: selectedFolderId === folder.id ? "var(--accent)" : "var(--foreground)" }}
                >
                  <Folder className="w-4 h-4 shrink-0" />
                  <span className="truncate">{folder.name}</span>
                  <span className="ml-auto text-xs opacity-60 shrink-0">
                    {folder.imageIds.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`"${folder.name}" 폴더를 삭제할까요?`)) {
                      onDeleteFolder(folder.id);
                    }
                  }}
                  className="p-1.5 rounded hover:text-red-500 hover:bg-[var(--surface)] opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: "var(--foreground)" }}
                  title="폴더 삭제"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {isAdding ? (
              <div className="flex items-center gap-1 px-3 py-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAdd();
                    if (e.key === "Escape") {
                      setNewName("");
                      setIsAdding(false);
                    }
                  }}
                  placeholder="폴더 이름"
                  className="flex-1 min-w-0 px-2 py-1.5 rounded border text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:opacity-50"
                  style={{ backgroundColor: "var(--surface)", borderColor: "var(--surface-border)", color: "var(--foreground)" }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAdd}
                  className="p-1.5 rounded bg-indigo-500 text-white hover:bg-indigo-600"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="w-full flex items-center gap-2 px-4 py-2.5 opacity-60 hover:opacity-80 hover:bg-[var(--surface)] transition-colors"
                style={{ color: "var(--foreground)" }}
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span className="text-sm">새 폴더</span>
              </button>
            )}
          </>
        )}
      </div>
    </aside>
  );

  if (isOverlay) {
    return (
      <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="폴더">
        <button
          type="button"
          className="absolute inset-0 bg-black/60"
          onClick={onClose}
          aria-label="닫기"
        />
        <div className="relative">{panel}</div>
      </div>
    );
  }
  return panel;
}
