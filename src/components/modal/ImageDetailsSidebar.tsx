"use client";

import { X, Calendar } from "lucide-react";
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
}: {
  image: ImageItem;
  onClose: () => void;
  folders?: Folder[];
  onAddImageToFolder?: (folderId: string, imageId: string) => void;
  onRemoveImageFromFolder?: (folderId: string, imageId: string) => void;
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
    <div className="w-full md:w-80 lg:w-96 bg-slate-900 border-l border-white/5 flex flex-col">
      <header className="p-6 border-b border-white/5 flex justify-between items-start text-white">
        <div className="overflow-hidden">
          <h3 className="font-semibold truncate mb-1">{image.originalName}</h3>
          <p className="text-white/40 text-xs flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {new Date(image.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button onClick={onClose} className="text-white/50 hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <MetadataSection id={image.id} filename={image.filename} />

        <TagSection id={image.id} tags={image.tags} onTagsSaved={handleTagsSaved} />

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
      </div>
    </div>
  );
}

