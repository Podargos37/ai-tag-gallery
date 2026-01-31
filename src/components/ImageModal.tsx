"use client";

import { X, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { MetadataSection } from "./modal/MetadataSection";
import { TagSection } from "./modal/TagSection";
import { NoteSection } from "./modal/NoteSection";

// GalleryClient에서 넘겨주는 새로운 Props들을 타입에 추가합니다.
export default function ImageModal({
  image,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev
}: {
  image: any;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
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

  // 키보드 화살표 이벤트를 등록합니다.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && hasNext) onNext();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    // 모달이 닫힐 때 이벤트 리스너를 제거하여 메모리 누수를 방지합니다.
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasNext, hasPrev, onNext, onPrev, onClose]);

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

  const handleTagsUpdate = (newTags: string[]) => {
    image.tags = newTags;
    setTagUpdateTick(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12" onClick={onClose}>
      <div className="absolute inset-0 backdrop-blur-xl animate-in fade-in duration-300" />

      <div
        className="relative w-full max-w-6xl h-full max-h-[85vh] bg-slate-900/90 rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 이미지 영역: 마우스를 올리면 이동 버튼이 나타납니다. */}
        <div className="flex-1 flex items-center justify-center bg-black/20 relative group">
          {/* 이전 버튼 */}
          {hasPrev && (
            <button
              onClick={onPrev}
              className="absolute left-4 z-10 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-500"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          <img
            src={`/uploads/${image.filename}`}
            className="w-full h-full object-contain"
            alt={image.originalName}
          />

          {/* 다음 버튼 */}
          {hasNext && (
            <button
              onClick={onNext}
              className="absolute right-4 z-10 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-500"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
        </div>

        {/* 정보 사이드바 영역 */}
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