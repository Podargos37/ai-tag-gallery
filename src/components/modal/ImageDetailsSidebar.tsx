"use client";

import { X, Calendar, Trash2, Info, Wrench, ImageUp, FileOutput, Scissors } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"info" | "tools">("info");
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

      {/* 탭 버튼 */}
      <div
        className="flex border-b"
        style={{ borderColor: "var(--surface-border)" }}
      >
        <button
          onClick={() => setActiveTab("info")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeTab === "info"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "opacity-60 hover:opacity-100"
          }`}
          style={{ color: activeTab === "info" ? undefined : "var(--foreground)" }}
        >
          <Info className="w-4 h-4" />
          정보
        </button>
        <button
          onClick={() => setActiveTab("tools")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeTab === "tools"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "opacity-60 hover:opacity-100"
          }`}
          style={{ color: activeTab === "tools" ? undefined : "var(--foreground)" }}
        >
          <Wrench className="w-4 h-4" />
          도구
        </button>
      </div>

      <div
        className="flex-1 overflow-y-auto p-6 space-y-8"
        style={{ color: "var(--foreground)" }}
      >
        {activeTab === "info" ? (
          <>
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
          </>
        ) : (
          /* 도구 탭 */
          <div className="space-y-4">
            <h4 className="text-sm font-semibold opacity-70 mb-4">이미지 도구</h4>
            
            {/* 업스케일 */}
            <button
              type="button"
              className="flex items-center gap-3 w-full p-4 rounded-lg border transition-colors hover:bg-white/5"
              style={{ borderColor: "var(--surface-border)" }}
              onClick={() => alert("업스케일 기능 준비 중")}
            >
              <div className="p-2 rounded-lg bg-green-500/20">
                <ImageUp className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-left">
                <p className="font-medium">업스케일</p>
                <p className="text-xs opacity-60">Real-ESRGAN으로 해상도 향상</p>
              </div>
            </button>

            {/* 파일 변환 */}
            <button
              type="button"
              className="flex items-center gap-3 w-full p-4 rounded-lg border transition-colors hover:bg-white/5"
              style={{ borderColor: "var(--surface-border)" }}
              onClick={() => alert("파일 변환 기능 준비 중")}
            >
              <div className="p-2 rounded-lg bg-purple-500/20">
                <FileOutput className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-left">
                <p className="font-medium">파일 변환</p>
                <p className="text-xs opacity-60">PNG, JPG, WebP 변환</p>
              </div>
            </button>

            {/* 누끼 (배경 제거) */}
            <button
              type="button"
              className="flex items-center gap-3 w-full p-4 rounded-lg border transition-colors hover:bg-white/5"
              style={{ borderColor: "var(--surface-border)" }}
              onClick={() => alert("누끼 기능 준비 중")}
            >
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Scissors className="w-5 h-5 text-orange-400" />
              </div>
              <div className="text-left">
                <p className="font-medium">누끼 (배경 제거)</p>
                <p className="text-xs opacity-60">MobileSAM으로 객체 추출</p>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

