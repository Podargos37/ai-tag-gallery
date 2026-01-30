// src/components/ImageModal.tsx
"use client";

// 1. Save 아이콘 임포트 추가
import { X, Info, Tag, Calendar, FileText, Save } from "lucide-react";
import { useState } from "react";

interface ImageModalProps {
  image: any;
  onClose: () => void;
}

export default function ImageModal({ image, onClose }: ImageModalProps) {
  const [notes, setNotes] = useState(image?.notes || "");
  const [isSaving, setIsSaving] = useState(false);

  if (!image) return null;

  const handleSaveNotes = async () => {
    setIsSaving(true); // 로딩 시작
    try {
      const res = await fetch("/api/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }, // JSON 전송 명시
        body: JSON.stringify({ id: image.id, notes }),
      });
      if (res.ok) {
        image.notes = notes; // 로컬 데이터 동기화
        alert("메모가 저장되었습니다!");
      }
    } catch (e) {
      alert("저장 실패");
    } finally {
      setIsSaving(false); // 로딩 종료
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12" onClick={onClose}>
      <div className="absolute inset-0 backdrop-blur-xl animate-in fade-in duration-300" />

      <div
        className="relative z-[110] w-full max-w-6xl h-full max-h-[85vh] bg-slate-900/90 rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col md:flex-row animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- 왼쪽: 이미지 영역 --- */}
        <div className="flex-1 flex items-center justify-center overflow-hidden relative group">
          <img src={`/uploads/${image.filename}`} className="w-full h-full object-contain" alt={image.originalName} />
        </div>

        {/* --- 오른쪽: 정보 사이드바 --- */}
        <div className="w-full md:w-80 lg:w-96 bg-slate-900 border-l border-white/5 flex flex-col">
          {/* 상단: 제목 및 닫기 버튼 (기존과 동일) */}
          <div className="p-6 border-b border-white/5 flex justify-between items-start">
            <div className="overflow-hidden text-white">
              <h3 className="font-semibold truncate leading-tight mb-1">{image.originalName}</h3>
              <p className="text-white/40 text-xs flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {new Date(image.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg text-white/50 hover:text-white"><X className="w-6 h-6" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Metadata 섹션 (기존과 동일) */}
            <section>
              <h4 className="text-white/20 text-[10px] uppercase tracking-[0.2em] font-bold mb-4 flex items-center gap-2"><Info className="w-3 h-3" /> Metadata</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-white/40">ID</span><span className="text-white/80 font-mono text-xs">{image.id}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Format</span><span className="text-white/80 uppercase">{image.filename.split('.').pop()}</span></div>
              </div>
            </section>

            {/* Tags 섹션 (기존과 동일) */}
            <section>
              <h4 className="text-white/20 text-[10px] uppercase tracking-[0.2em] font-bold mb-4 flex items-center gap-2"><Tag className="w-3 h-3" /> Tags</h4>
              <div className="flex flex-wrap gap-2">
                {image.tags.map((t: string) => (
                  <span key={t} className="px-3 py-1.5 bg-indigo-500/10 text-indigo-300 rounded-lg text-xs border border-indigo-500/20">#{t}</span>
                ))}
              </div>
            </section>
          </div>

          {/* 푸터: 메모 작성 칸 수정 */}
          <div className="p-6 bg-white/5 border-t border-white/5 flex flex-col gap-3">
            <h4 className="text-white/20 text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2">
              <FileText className="w-3 h-3" /> Personal Notes
            </h4>
            <textarea
              placeholder="메모를 입력하고 Save를 눌러 저장하세요..."
              className="w-full h-32 bg-black/20 border border-white/5 rounded-xl p-3 text-sm text-white/80 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none transition-all"
              value={notes} // defaultValue 대신 value 사용
              onChange={(e) => setNotes(e.target.value)} // 상태 업데이트 연결
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-[10px] text-white/10 italic truncate max-w-[120px]">
                Saved to {image.id}.json
              </span>
              <button
                onClick={handleSaveNotes}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-lg text-sm font-medium transition-all shadow-lg"
              >
                {isSaving ? "Saving..." : <><Save className="w-4 h-4" /> Save</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}