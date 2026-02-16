"use client";

import FolderSidebar from "./FolderSidebar";
import type { Folder } from "@/types/folders";

interface FolderSidebarLayoutProps {
  folders: Folder[];
  selectedFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
  onAddFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  loading?: boolean;
  unfolderedCount?: number;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

export default function FolderSidebarLayout({
  folders,
  selectedFolderId,
  onSelectFolder,
  onAddFolder,
  onDeleteFolder,
  loading = false,
  unfolderedCount = 0,
  mobileOpen,
  onMobileOpenChange,
}: FolderSidebarLayoutProps) {
  const commonProps = {
    folders,
    selectedFolderId,
    onAddFolder,
    onDeleteFolder,
    loading,
    unfolderedCount,
  };

  return (
    <>
      <div className="hidden md:flex shrink-0">
        <FolderSidebar {...commonProps} onSelectFolder={onSelectFolder} />
      </div>

      {mobileOpen && (
        <FolderSidebar
          {...commonProps}
          variant="overlay"
          onSelectFolder={(id) => {
            onSelectFolder(id);
            onMobileOpenChange(false);
          }}
          onClose={() => onMobileOpenChange(false)}
        />
      )}
    </>
  );
}
