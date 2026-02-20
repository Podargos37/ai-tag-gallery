"use client";

import { useState } from "react";
import { Loader2, Database, Copy } from "lucide-react";
import { runBackfillEmbeddings } from "@/lib/api/backfill";
import { fetchDuplicateCandidates } from "@/lib/api/duplicate-candidates";
import type { ImageItem } from "@/types/gallery";
import DuplicateCandidatesModal from "./DuplicateCandidatesModal";

export default function BackfillSettings() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ updated: number; skipped: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [duplicateLoading, setDuplicateLoading] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState<ImageItem[][] | null>(null);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);

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

      <div>
        <h3 className="text-sm font-medium opacity-90 mb-1">중복 이미지 후보 찾기</h3>
        <p className="text-sm opacity-70 mb-3">
          CLIP 벡터 거리 기준으로 서로 유사한 이미지 그룹을 찾습니다. 벡터가 있는 이미지만 대상이며, 이미지 수가 많으면 수십 초 걸릴 수 있습니다.
        </p>
        <button
          type="button"
          onClick={async () => {
            setDuplicateLoading(true);
            setDuplicateGroups(null);
            setDuplicateModalOpen(false);
            try {
              const groups = await fetchDuplicateCandidates({ threshold: 0.2, maxGroups: 50 });
              setDuplicateGroups(groups);
              setDuplicateModalOpen(true);
            } catch {
              setDuplicateGroups([]);
              setDuplicateModalOpen(true);
            } finally {
              setDuplicateLoading(false);
            }
          }}
          disabled={duplicateLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-indigo-500/50 bg-indigo-500/20 text-indigo-200 text-sm font-medium hover:bg-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {duplicateLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              중복 찾는 중...
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              중복 이미지 찾기
            </>
          )}
        </button>
      </div>

      <DuplicateCandidatesModal
        open={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        groups={duplicateGroups ?? []}
      />

      <p className="text-xs opacity-50">
        나중에 썸네일 재생성, 태그 재분석 등 다른 유지보수 기능을 이 섹션에 추가할 수 있습니다.
      </p>
    </div>
  );
}
