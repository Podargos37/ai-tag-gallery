"use client";

import { useState, useRef, useEffect } from "react";
import { FolderPlus, Folder } from "lucide-react";
import type { Folder as FolderType } from "@/types/folders";

interface FolderAddDropdownProps {
  folders: FolderType[];
  onSelect: (folderId: string) => void;
  disabled?: boolean;
  title?: string;
}

export default function FolderAddDropdown({
  folders,
  onSelect,
  disabled = false,
  title,
}: FolderAddDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const hasFolders = folders.length > 0;
  const canOpen = hasFolders && !disabled;

  const handleSelect = (folderId: string) => {
    onSelect(folderId);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => canOpen && setOpen((v) => !v)}
        disabled={!hasFolders || disabled}
        title={
          title ??
          (!hasFolders ? "폴더가 없습니다. 왼쪽에서 새 폴더를 만드세요." : undefined)
        }
        className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[var(--surface)]"
        style={{
          borderColor: "var(--surface-border)",
          backgroundColor: "var(--surface)",
          color: "var(--foreground)",
        }}
      >
        <FolderPlus className="w-4 h-4" />
        폴더에 추가
      </button>
      {open && hasFolders && (
        <div
          className="absolute left-0 top-full z-10 mt-1 min-w-[160px] rounded-lg border py-1 shadow-xl"
          style={{
            backgroundColor: "var(--modal-bg)",
            borderColor: "var(--surface-border)",
          }}
        >
          {folders.map((folder) => (
            <button
              key={folder.id}
              type="button"
              onClick={() => handleSelect(folder.id)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--surface)]"
              style={{ color: "var(--foreground)" }}
            >
              <Folder
                className="w-4 h-4 shrink-0 opacity-60"
                style={{ color: "var(--foreground)" }}
              />
              {folder.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
