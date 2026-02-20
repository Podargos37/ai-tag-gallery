"use client";

import { X, Calendar, Trash2, Info, Wrench, ImageUp, FileOutput, Scissors, ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
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
  onImageCreated,
  onOpenNukki,
}: {
  image: ImageItem;
  onClose: () => void;
  folders?: Folder[];
  onAddImageToFolder?: (folderId: string, imageId: string) => void;
  onRemoveImageFromFolder?: (folderId: string, imageId: string) => void;
  onDelete?: (image: ImageItem) => void | Promise<void>;
  onImageCreated?: (newImage: ImageItem) => void;
  onOpenNukki?: () => void;
}) {
  const [notes, setNotes] = useState(image?.notes || "");
  const [metadataTick, setMetadataTick] = useState(0);
  const [activeTab, setActiveTab] = useState<"info" | "tools">("info");
  const { saveNotes, isSaving } = useUpdateNotes();

  // 업스케일 상태
  const [upscaleExpanded, setUpscaleExpanded] = useState(false);
  const [upscaleScale, setUpscaleScale] = useState(2.0);
  const [isUpscaling, setIsUpscaling] = useState(false);

  const handleUpscale = useCallback(async () => {
    if (isUpscaling) return;
    setIsUpscaling(true);
    try {
      const res = await fetch("/api/upscale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageId: image.id,
          scale: upscaleScale,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`업스케일 실패: ${data.error || "알 수 없는 오류"}`);
        return;
      }
      alert(`업스케일 완료! 새 이미지가 갤러리에 추가되었습니다.`);
      if (onImageCreated && data.image) {
        onImageCreated(data.image);
      }
      setUpscaleExpanded(false);
    } catch (e) {
      alert("업스케일 중 오류가 발생했습니다.");
      console.error(e);
    } finally {
      setIsUpscaling(false);
    }
  }, [image.id, upscaleScale, isUpscaling, onImageCreated]);

  // 파일 변환 상태
  const [convertExpanded, setConvertExpanded] = useState(false);
  const [convertFormat, setConvertFormat] = useState<"png" | "jpg" | "webp">("png");
  const [convertQuality, setConvertQuality] = useState(85);
  const [isConverting, setIsConverting] = useState(false);

  const handleConvert = useCallback(async () => {
    if (isConverting) return;
    setIsConverting(true);
    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageId: image.id,
          format: convertFormat,
          quality: convertQuality,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`변환 실패: ${data.error || "알 수 없는 오류"}`);
        return;
      }
      alert(`변환 완료! 새 이미지가 갤러리에 추가되었습니다.`);
      if (onImageCreated && data.image) {
        onImageCreated(data.image);
      }
      setConvertExpanded(false);
    } catch (e) {
      alert("변환 중 오류가 발생했습니다.");
      console.error(e);
    } finally {
      setIsConverting(false);
    }
  }, [image.id, convertFormat, convertQuality, isConverting, onImageCreated]);

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
            <div
              className="rounded-lg border overflow-hidden"
              style={{ borderColor: "var(--surface-border)" }}
            >
              <button
                type="button"
                className="flex items-center gap-3 w-full p-4 transition-colors hover:bg-white/5"
                onClick={() => setUpscaleExpanded(!upscaleExpanded)}
              >
                <div className="p-2 rounded-lg bg-green-500/20">
                  <ImageUp className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium">업스케일</p>
                  <p className="text-xs opacity-60">Real-ESRGAN으로 해상도 향상</p>
                </div>
                <ChevronDown
                  className={`w-5 h-5 opacity-50 transition-transform ${
                    upscaleExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
              
              {upscaleExpanded && (
                <div className="p-4 pt-0 space-y-4">
                  {/* 배율 슬라이더 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium opacity-70">
                        배율
                      </label>
                      <span className="text-sm font-bold text-green-400">
                        {upscaleScale.toFixed(1)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1.5"
                      max="4.0"
                      step="0.1"
                      value={upscaleScale}
                      onChange={(e) => setUpscaleScale(parseFloat(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                    <div className="flex justify-between text-xs opacity-40 mt-1">
                      <span>1.5x</span>
                      <span>4.0x</span>
                    </div>
                  </div>

                  {/* 예상 결과 크기 */}
                  {image.width && image.height && (
                    <div className="text-xs opacity-60 bg-white/5 rounded-lg p-3">
                      <p>현재: {image.width} × {image.height}</p>
                      <p>결과: {Math.round(image.width * upscaleScale)} × {Math.round(image.height * upscaleScale)}</p>
                    </div>
                  )}

                  {/* 경고 */}
                  <p className="text-xs text-yellow-400/80">
                    ⚠️ GPU 없으면 수십 초~수 분 소요될 수 있습니다
                  </p>

                  {/* 업스케일 버튼 */}
                  <button
                    type="button"
                    onClick={handleUpscale}
                    disabled={isUpscaling}
                    className="w-full py-2.5 rounded-lg text-sm font-medium bg-green-500/20 border border-green-500/40 hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isUpscaling ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        업스케일 중...
                      </>
                    ) : (
                      <>
                        <ImageUp className="w-4 h-4" />
                        {upscaleScale.toFixed(1)}x 업스케일
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* 파일 변환 */}
            <div
              className="rounded-lg border overflow-hidden"
              style={{ borderColor: "var(--surface-border)" }}
            >
              <button
                type="button"
                className="flex items-center gap-3 w-full p-4 transition-colors hover:bg-white/5"
                onClick={() => setConvertExpanded(!convertExpanded)}
              >
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <FileOutput className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium">파일 변환</p>
                  <p className="text-xs opacity-60">PNG, JPG, WebP 변환</p>
                </div>
                <ChevronDown
                  className={`w-5 h-5 opacity-50 transition-transform ${
                    convertExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
              
              {convertExpanded && (
                <div className="p-4 pt-0 space-y-4">
                  {/* 포맷 선택 */}
                  <div>
                    <label className="text-xs font-medium opacity-70 mb-2 block">
                      변환 포맷
                    </label>
                    <div className="flex gap-2">
                      {(["png", "jpg", "webp"] as const).map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => setConvertFormat(fmt)}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            convertFormat === fmt
                              ? "bg-purple-500/30 border-purple-500/50 text-purple-300"
                              : "bg-white/5 border-white/10 hover:bg-white/10"
                          } border`}
                        >
                          {fmt.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 품질 선택 (JPG, WebP만) */}
                  {convertFormat !== "png" && (
                    <div>
                      <label className="text-xs font-medium opacity-70 mb-2 block">
                        품질: {convertQuality}%
                      </label>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        step={5}
                        value={convertQuality}
                        onChange={(e) => setConvertQuality(Number(e.target.value))}
                        className="w-full accent-purple-500"
                      />
                      <div className="flex justify-between text-xs opacity-50 mt-1">
                        <span>낮음 (작은 파일)</span>
                        <span>높음 (좋은 품질)</span>
                      </div>
                    </div>
                  )}

                  {/* 변환 버튼 */}
                  <button
                    type="button"
                    onClick={handleConvert}
                    disabled={isConverting}
                    className="w-full py-2.5 rounded-lg text-sm font-medium bg-purple-500/20 border border-purple-500/40 hover:bg-purple-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isConverting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        변환 중...
                      </>
                    ) : (
                      <>
                        <FileOutput className="w-4 h-4" />
                        {convertFormat.toUpperCase()}로 변환
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* 누끼 (배경 제거) */}
            <button
              type="button"
              className="flex items-center gap-3 w-full p-4 rounded-lg border transition-colors hover:bg-white/5"
              style={{ borderColor: "var(--surface-border)" }}
              onClick={onOpenNukki}
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

