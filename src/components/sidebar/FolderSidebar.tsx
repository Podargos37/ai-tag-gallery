"use client";

import { FolderOpen, FolderMinus, Loader2 } from "lucide-react";
import type { Folder as FolderType } from "@/types/folders";
import { UNFOLDERED_ID } from "@/types/folders";
import FolderItemButton from "./FolderItemButton";
import FolderRow from "./FolderRow";
import AddFolderBlock from "./AddFolderBlock";
import SidebarHeader from "./SidebarHeader";
import OverlaySidebar from "./OverlaySidebar";

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
  const isOverlay = variant === "overlay";

  const panel = (
    <aside
      className={`flex flex-col border-r overflow-hidden ${
        isOverlay
          ? "w-72 max-w-[85vw] h-full rounded-r-xl shadow-xl"
          : "w-56 shrink-0 rounded-xl"
      }`}
      style={{
        backgroundColor: "var(--sidebar-bg)",
        borderColor: "var(--surface-border)",
        color: "var(--foreground)",
      }}
    >
      <SidebarHeader
        title="폴더"
        onClose={onClose}
        showCloseButton={isOverlay}
      />

      <div className="flex-1 overflow-y-auto min-h-0 py-2">
        {loading ? (
          <div
            className="flex items-center justify-center py-8 opacity-40"
            style={{ color: "var(--foreground)" }}
          >
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : (
          <>
            <FolderItemButton
              label="전체"
              icon={FolderOpen}
              selected={selectedFolderId === null}
              onClick={() => onSelectFolder(null)}
            />
            <FolderItemButton
              label="미분류"
              icon={FolderMinus}
              count={unfolderedCount}
              selected={selectedFolderId === UNFOLDERED_ID}
              onClick={() => onSelectFolder(UNFOLDERED_ID)}
            />
            {folders.map((folder) => (
              <FolderRow
                key={folder.id}
                folder={folder}
                selected={selectedFolderId === folder.id}
                onSelect={() => onSelectFolder(folder.id)}
                onDelete={() => onDeleteFolder(folder.id)}
              />
            ))}
            <AddFolderBlock onAddFolder={onAddFolder} />
          </>
        )}
      </div>
    </aside>
  );

  if (isOverlay && onClose) {
    return (
      <OverlaySidebar onClose={onClose} ariaLabel="폴더">
        {panel}
      </OverlaySidebar>
    );
  }
  return panel;
}
