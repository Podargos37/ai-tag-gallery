"use client";

import { useState } from "react";
import { FolderOpen, Folder, Plus, Trash2, Loader2 } from "lucide-react";
import type { Folder as FolderType } from "@/types/folders";

interface FolderSidebarProps {
  folders: FolderType[];
  selectedFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
  onAddFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  loading?: boolean;
}

export default function FolderSidebar({
  folders,
  selectedFolderId,
  onSelectFolder,
  onAddFolder,
  onDeleteFolder,
  loading = false,
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

  return (
    <aside className="w-56 shrink-0 flex flex-col border-r border-white/10 bg-slate-900/50 rounded-xl overflow-hidden">
      <div className="p-3 border-b border-white/10">
        <h2 className="text-xs font-semibold text-white/60 uppercase tracking-wider px-2 py-1">
          폴더
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 py-2">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-white/40">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onSelectFolder(null)}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors ${
                selectedFolderId === null
                  ? "bg-indigo-500/20 text-indigo-200"
                  : "text-white/80 hover:bg-white/5"
              }`}
            >
              <FolderOpen className="w-4 h-4 shrink-0" />
              <span className="truncate">전체</span>
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
                    selectedFolderId === folder.id
                      ? "bg-indigo-500/20 text-indigo-200"
                      : "text-white/80 hover:bg-white/5"
                  }`}
                >
                  <Folder className="w-4 h-4 shrink-0" />
                  <span className="truncate">{folder.name}</span>
                  <span className="ml-auto text-xs text-white/40 shrink-0">
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
                  className="p-1.5 rounded text-white/40 hover:text-red-400 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
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
                  className="flex-1 min-w-0 px-2 py-1.5 rounded bg-slate-800 border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                className="w-full flex items-center gap-2 px-4 py-2.5 text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors"
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
}
