"use client";

import { X, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { MetadataSection } from "./modal/MetadataSection";
import { TagSection } from "./modal/TagSection";
import { NoteSection } from "./modal/NoteSection";

export default function ImageModal({ image, onClose }: { image: any; onClose: () => void }) {
  const [notes, setNotes] = useState(image?.notes || "");
  const [isSaving, setIsSaving] = useState(false);
  // 태그 변경 시 화면을 강제로 새로 고침하기 위한 상태
  const [tagUpdateTick, setTagUpdateTick] = useState(0);

  useEffect(() => {
    if (image) {
      setNotes(image.notes || "");
    }
  }, [image]);

  if (!image) return null;

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: image.id, notes }),
      });
      if (res.ok) {
        image.notes = notes;
        alert("메모가 저장되었습니다!");
      }
    } catch (e) {
      alert("저장 실패");
    } finally {
      setIsSaving(false);
    }
  };

  // 태그 업데이트 시 호출될 핸들러
  const handleTagsUpdate = (newTags: string[]) => {
    image.tags = newTags; // 메모리상의 데이터 변경
    setTagUpdateTick(prev => prev + 1); // 상태를 변경하여 리렌더링 유도
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12" onClick={onClose}>
      <div className="absolute inset-0 backdrop-blur-xl animate-in fade-in duration-300" />

      <div className="relative w-full max-w-6xl h-full max-h-[85vh] bg-slate-900/90 rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col md:flex-row" onClick={(e) => e.stopPropagation()}>
        <div className="flex-1 flex items-center justify-center bg-black/20">
          <img src={`/uploads/${image.filename}`} className="w-full h-full object-contain" alt={image.originalName} />
        </div>

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

            {/* 수정된 TagSection 연결 */}
            <TagSection
              id={image.id}
              tags={image.tags}
              onTagsUpdate={handleTagsUpdate}
            />

            <NoteSection
              notes={notes}
              setNotes={setNotes}
              onSave={handleSaveNotes}
              isSaving={isSaving}
              fileId={image.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}