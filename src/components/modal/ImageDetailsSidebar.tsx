"use client";

import { X, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { updateNotes } from "@/lib/api";
import { MetadataSection } from "./sections/MetadataSection";
import { TagSection } from "./sections/TagSection";
import { NoteSection } from "./sections/NoteSection";

export default function ImageDetailsSidebar({
  image,
  onClose,
}: {
  image: any;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState(image?.notes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [tagUpdateTick, setTagUpdateTick] = useState(0);

  // 이미지가 변경될 때마다(다음/이전 버튼 클릭 시) 메모 상태를 동기화합니다.
  useEffect(() => {
    if (image) {
      setNotes(image.notes || "");
    }
  }, [image]);

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      const ok = await updateNotes(image.id, notes);
      if (ok) {
        image.notes = notes;
        alert("메모가 저장되었습니다!");
      } else {
        alert("저장 실패");
      }
    } catch (e) {
      alert("저장 실패");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTagsUpdate = (newTags: string[]) => {
    image.tags = newTags;
    setTagUpdateTick((prev) => prev + 1);
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

        <TagSection id={image.id} tags={image.tags} onTagsUpdate={handleTagsUpdate} />

        <NoteSection
          notes={notes}
          setNotes={setNotes}
          onSave={handleSaveNotes}
          isSaving={isSaving}
          fileId={image.id}
        />
      </div>
    </div>
  );
}

