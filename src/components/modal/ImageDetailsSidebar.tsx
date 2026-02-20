"use client";

import { X, Calendar, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useUpdateNotes } from "@/hooks/useUpdateNotes";
import { MetadataSection } from "./sections/MetadataSection";
import { TagSection } from "./sections/TagSection";
import { NoteSection } from "./sections/NoteSection";
import { FolderSection } from "./sections/FolderSection";
import type { Folder } from "@/types/folders";
import type { ImageItem } from "@/types/gallery";

export default function ImageDetailsSidebar({
  image,
  onClose,
  folders = [],
  onAddImageToFolder,
  onRemoveImageFromFolder,
  onDelete,
}: {
  image: ImageItem;
  onClose: () => void;
  folders?: Folder[];
  onAddImageToFolder?: (folderId: string, imageId: string) => void;
  onRemoveImageFromFolder?: (folderId: string, imageId: string) => void;
  onDelete?: (image: ImageItem) => void | Promise<void>;
}) {
  const [notes, setNotes] = useState(image?.notes || "");
  const [metadataTick, setMetadataTick] = useState(0);
  const { saveNotes, isSaving } = useUpdateNotes();

  useEffect(() => {
    if (image) {
      setNotes(image.notes || "");
    }
  }, [image]);

  const handleSaveNotes = async () => {
    const ok = await saveNotes(image.id, notes);
    if (ok) {
      image.notes = notes;
      alert("메모가 저장되었습니다!");
    } else {
      alert("저장 실패");
    }
  };

  /** TagSection이 API 저장 후 호출. 부모는 메타 갱신(리렌더 동기화)만 담당 */
  const handleTagsSaved = (newTags: string[]) => {
    image.tags = newTags;
    setMetadataTick((prev) => prev + 1);
  };

  return (
    <div
      className="w-full md:w-80 lg:w-96 border-l flex flex-col"
      style={{ backgroundColor: "var(--sidebar-bg)", borderColor: "var(--surface-border)" }}
    >
      <header
        className="p-6 border-b flex justify-between items-start"
        style={{ borderColor: "var(--surface-border)", color: "var(--foreground)" }}
      >
        <div className="overflow-hidden">
          <h3 className="font-semibold truncate mb-1">{image.originalName}</h3>
          <p className="text-xs flex items-center gap-1 opacity-60">
            <Calendar className="w-3 h-3" /> {image.createdAt ? new Date(image.createdAt).toLocaleDateString() : '-'}
          </p>
        </div>
        <button onClick={onClose} className="opacity-50 hover:opacity-100 transition" style={{ color: "var(--foreground)" }}>
          <X className="w-6 h-6" />
        </button>
      </header>

      <div
        className="flex-1 overflow-y-auto p-6 space-y-8"
        style={{ color: "var(--foreground)" }}
      >
        <MetadataSection id={image.id} filename={image.filename} />

        <TagSection id={image.id} tags={image.tags ?? []} onTagsSaved={handleTagsSaved} />

        <NoteSection
          notes={notes}
          setNotes={setNotes}
          onSave={handleSaveNotes}
          isSaving={isSaving}
          fileId={image.id}
        />

        <FolderSection
          imageId={image.id}
          folders={folders}
          onAddImageToFolder={onAddImageToFolder}
          onRemoveImageFromFolder={onRemoveImageFromFolder}
        />

        {onDelete && (
          <div className="pt-4 border-t" style={{ borderColor: "var(--surface-border)" }}>
            <button
              type="button"
              onClick={async () => {
                if (!confirm("이 이미지를 삭제하시겠습니까?")) return;
                await onDelete(image);
              }}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium text-red-200 bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              이미지 삭제
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

