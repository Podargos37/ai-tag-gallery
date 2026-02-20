"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import { X, ZoomIn, ZoomOut, RotateCcw, Loader2, Trash2, MousePointer2, Eye } from "lucide-react";
import type { ImageItem } from "@/types/gallery";

interface ClickPoint {
  x: number;
  y: number;
  label: 1;
}

type Mode = "extract" | "remove";

interface NukkiEditorProps {
  image: ImageItem;
  onClose: () => void;
  onComplete: (newImage: ImageItem) => void;
}

function ZoomControls() {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  return (
    <div className="flex items-center gap-1 bg-black/60 rounded-lg p-1 backdrop-blur-sm">
      <button
        type="button"
        onClick={() => zoomOut()}
        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        title="축소 (휠 다운)"
      >
        <ZoomOut className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => resetTransform()}
        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        title="리셋"
      >
        <RotateCcw className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => zoomIn()}
        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        title="확대 (휠 업)"
      >
        <ZoomIn className="w-5 h-5" />
      </button>
    </div>
  );
}

export default function NukkiEditor({ image, onClose, onComplete }: NukkiEditorProps) {
  const [points, setPoints] = useState<ClickPoint[]>([]);
  const [mode, setMode] = useState<Mode>("extract");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [maskData, setMaskData] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    setMaskData(null);
  }, [points, mode]);

  const addPoint = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning || isProcessing || isPreviewing) return;

    const img = imageRef.current;
    if (!img) return;

    const rect = img.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const scaleX = image.width! / rect.width;
    const scaleY = image.height! / rect.height;

    const imageX = Math.round(clickX * scaleX);
    const imageY = Math.round(clickY * scaleY);

    if (imageX < 0 || imageX > image.width! || imageY < 0 || imageY > image.height!) {
      return;
    }

    setPoints((prev) => [...prev, { x: imageX, y: imageY, label: 1 }]);
  }, [image.width, image.height, isPanning, isProcessing, isPreviewing]);

  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    addPoint(e);
  }, [addPoint]);

  const removePoint = useCallback((index: number) => {
    setPoints((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearPoints = useCallback(() => {
    setPoints([]);
    setMaskData(null);
  }, []);

  const handlePreview = useCallback(async () => {
    if (points.length === 0 || isPreviewing) return;

    setIsPreviewing(true);
    try {
      const res = await fetch("/api/remove-bg/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageId: image.id,
          points: points,
          mode: mode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(`미리보기 실패: ${data.error || "알 수 없는 오류"}`);
        return;
      }

      setMaskData(data.mask);
    } catch (e) {
      console.error(e);
      alert("미리보기 중 오류가 발생했습니다.");
    } finally {
      setIsPreviewing(false);
    }
  }, [points, image.id, mode, isPreviewing]);

  const handleExecute = useCallback(async () => {
    if (points.length === 0 || isProcessing) return;

    setIsProcessing(true);
    try {
      const res = await fetch("/api/remove-bg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageId: image.id,
          points: points,
          mode: mode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(`실패: ${data.error || "알 수 없는 오류"}`);
        return;
      }

      if (data.image) {
        onComplete(data.image);
      }
    } catch (e) {
      console.error(e);
      alert("처리 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  }, [points, image.id, mode, isProcessing, onComplete]);

  const getPointStyle = (point: ClickPoint) => {
    return {
      left: `${(point.x / image.width!) * 100}%`,
      top: `${(point.y / image.height!) * 100}%`,
    };
  };

  return (
    <div 
      className="fixed inset-0 z-[200] flex flex-col bg-black text-white"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 헤더 */}
      <header className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">누끼 편집</h2>
          <span className="text-sm opacity-60">{image.originalName}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </header>

      {/* 메인 영역 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 이미지 뷰어 */}
        <div ref={containerRef} className="flex-1 relative overflow-hidden bg-neutral-900">
          <TransformWrapper
            initialScale={1}
            minScale={0.2}
            maxScale={10}
            wheel={{ step: 0.1 }}
            doubleClick={{ disabled: true }}
            panning={{ 
              velocityDisabled: true,
              activationKeys: ["Space"],
            }}
            onPanningStart={() => setIsPanning(true)}
            onPanningStop={() => setIsPanning(false)}
          >
            {() => (
              <>
                <div className="absolute top-4 left-4 z-10">
                  <ZoomControls />
                </div>

                <TransformComponent
                  wrapperStyle={{ width: "100%", height: "100%" }}
                  contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <div
                    className="relative inline-block cursor-crosshair"
                    onContextMenu={handleContextMenu}
                  >
                    <img
                      ref={imageRef}
                      src={`/api/file?filename=${encodeURIComponent(image.filename)}`}
                      alt={image.originalName}
                      className="max-w-full max-h-[calc(100vh-200px)] object-contain select-none"
                      draggable={false}
                    />
                    
                    {/* 마스크 오버레이 (줄무늬 패턴) */}
                    {maskData && (
                      <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          maskImage: `url(data:image/png;base64,${maskData})`,
                          WebkitMaskImage: `url(data:image/png;base64,${maskData})`,
                          maskSize: "100% 100%",
                          WebkitMaskSize: "100% 100%",
                          backgroundImage: mode === "extract" 
                            ? "repeating-linear-gradient(45deg, rgba(34, 197, 94, 0.6), rgba(34, 197, 94, 0.6) 4px, rgba(34, 197, 94, 0.2) 4px, rgba(34, 197, 94, 0.2) 8px)"
                            : "repeating-linear-gradient(45deg, rgba(239, 68, 68, 0.6), rgba(239, 68, 68, 0.6) 4px, rgba(239, 68, 68, 0.2) 4px, rgba(239, 68, 68, 0.2) 8px)",
                        }}
                      />
                    )}
                    
                    {/* 마스크 테두리 */}
                    {maskData && (
                      <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          maskImage: `url(data:image/png;base64,${maskData})`,
                          WebkitMaskImage: `url(data:image/png;base64,${maskData})`,
                          maskSize: "100% 100%",
                          WebkitMaskSize: "100% 100%",
                          boxShadow: mode === "extract" 
                            ? "inset 0 0 0 3px rgba(34, 197, 94, 1)" 
                            : "inset 0 0 0 3px rgba(239, 68, 68, 1)",
                        }}
                      />
                    )}
                    
                    {/* 클릭 포인트 표시 */}
                    {points.map((point, idx) => (
                      <div
                        key={idx}
                        className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg cursor-pointer transition-transform hover:scale-125 bg-blue-500 flex items-center justify-center text-[10px] font-bold"
                        style={getPointStyle(point)}
                        onClick={(e) => {
                          e.stopPropagation();
                          removePoint(idx);
                        }}
                        title="클릭하여 삭제"
                      >
                        {idx + 1}
                      </div>
                    ))}
                  </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>

        {/* 사이드 패널 */}
        <div className="w-80 border-l border-white/10 flex flex-col bg-white/5">
          {/* 도움말 */}
          <div className="p-4 border-b border-white/10">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <MousePointer2 className="w-4 h-4" />
              사용법
            </h3>
            <ul className="text-sm opacity-70 space-y-1">
              <li><span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>우클릭: 영역 선택</li>
              <li className="opacity-50 pt-1">휠: 확대/축소</li>
              <li className="opacity-50">Space+드래그: 이동</li>
            </ul>
          </div>

          {/* 모드 선택 */}
          <div className="p-4 border-b border-white/10">
            <h3 className="font-medium mb-3">작업 모드</h3>
            <div className="space-y-2">
              <label className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${mode === "extract" ? "bg-green-500/20 border border-green-500/50" : "bg-white/5 border border-transparent hover:bg-white/10"}`}>
                <input
                  type="radio"
                  name="mode"
                  value="extract"
                  checked={mode === "extract"}
                  onChange={() => setMode("extract")}
                  className="accent-green-500"
                />
                <div>
                  <p className="font-medium text-green-400">추출</p>
                  <p className="text-xs opacity-60">선택한 영역만 남기기</p>
                </div>
              </label>
              <label className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${mode === "remove" ? "bg-red-500/20 border border-red-500/50" : "bg-white/5 border border-transparent hover:bg-white/10"}`}>
                <input
                  type="radio"
                  name="mode"
                  value="remove"
                  checked={mode === "remove"}
                  onChange={() => setMode("remove")}
                  className="accent-red-500"
                />
                <div>
                  <p className="font-medium text-red-400">제거</p>
                  <p className="text-xs opacity-60">선택한 영역 삭제하기</p>
                </div>
              </label>
            </div>
          </div>

          {/* 포인트 목록 */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">선택 포인트 ({points.length})</h3>
              {points.length > 0 && (
                <button
                  type="button"
                  onClick={clearPoints}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  전체 삭제
                </button>
              )}
            </div>

            {points.length === 0 ? (
              <p className="text-sm opacity-50 text-center py-8">
                이미지를 <strong>우클릭</strong>하여<br />포인트를 추가하세요
              </p>
            ) : (
              <div className="space-y-2">
                {points.map((point, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-500 text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-sm opacity-70">
                        ({point.x}, {point.y})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePoint(idx)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 하단 버튼 */}
          <div className="p-4 border-t border-white/10 space-y-3">
            {/* 미리보기 버튼 */}
            <button
              type="button"
              onClick={handlePreview}
              disabled={points.length === 0 || isPreviewing || isProcessing}
              className="w-full py-2.5 rounded-lg font-medium bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 border border-white/20"
            >
              {isPreviewing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  미리보기 중...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  미리보기
                </>
              )}
            </button>

            {/* 실행 버튼 */}
            <button
              type="button"
              onClick={handleExecute}
              disabled={points.length === 0 || isProcessing || isPreviewing}
              className={`w-full py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 ${
                mode === "extract" 
                  ? "bg-green-500 hover:bg-green-600" 
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  처리 중...
                </>
              ) : (
                <>{mode === "extract" ? "추출하기" : "제거하기"}</>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 rounded-lg text-sm opacity-60 hover:opacity-100 hover:bg-white/10 transition-all"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
