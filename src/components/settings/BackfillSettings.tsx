"use client";

import { useState } from "react";
import { Loader2, Database } from "lucide-react";
import { runBackfillEmbeddings } from "@/lib/api/backfill";

export default function BackfillSettings() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ updated: number; skipped: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBackfillEmbeddings = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const data = await runBackfillEmbeddings();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "백필 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" style={{ color: "var(--foreground)" }}>
      <div>
        <h3 className="text-sm font-medium opacity-90 mb-1">이미지 벡터 백필</h3>
        <p className="text-sm opacity-70 mb-3">
          이미 올려둔 이미지에 대해 유사 이미지 검색용 벡터를 계산해 DB에 넣습니다. 파일이
          public/uploads에 있는 이미지만 처리됩니다. 이미지 수에 따라 시간이 걸릴 수 있습니다.
        </p>
        <button
          type="button"
          onClick={handleBackfillEmbeddings}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              백필 실행 중...
            </>
          ) : (
            <>
              <Database className="w-4 h-4" />
              이미지 벡터 백필 실행
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      {result && !error && (
        <div className="text-sm opacity-90 p-3 rounded-lg bg-[var(--surface)]">
          <p className="font-medium mb-1">완료</p>
          <ul className="list-disc list-inside space-y-0.5 opacity-80">
            <li>벡터 갱신: {result.updated}건</li>
            <li>파일 없음/건너뜀: {result.skipped}건</li>
            <li>실패: {result.failed}건</li>
          </ul>
        </div>
      )}

      <p className="text-xs opacity-50">
        나중에 썸네일 재생성, 태그 재분석 등 다른 유지보수 기능을 이 섹션에 추가할 수 있습니다.
      </p>
    </div>
  );
}
