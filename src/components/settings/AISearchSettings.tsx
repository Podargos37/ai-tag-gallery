"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { getSettings, patchSettings } from "@/lib/api";

const WD14_MIN = 0.2;
const WD14_MAX = 1.0;
const WD14_STEP = 0.05;
const SEMANTIC_MIN = 0.5;
const SEMANTIC_MAX = 0.95;
const SEMANTIC_STEP = 0.05;

export default function AISearchSettings() {
  const [wd14Threshold, setWd14Threshold] = useState(0.35);
  const [semanticSimilarityThreshold, setSemanticSimilarityThreshold] =
    useState(0.8);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings()
      .then((s) => {
        setWd14Threshold(s.wd14Threshold ?? 0.35);
        setSemanticSimilarityThreshold(s.semanticSimilarityThreshold ?? 0.8);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveWd14 = async (value: number) => {
    setWd14Threshold(value);
    setSaving(true);
    try {
      await patchSettings({ wd14Threshold: value });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const saveSemantic = async (value: number) => {
    setSemanticSimilarityThreshold(value);
    setSaving(true);
    try {
      await patchSettings({ semanticSimilarityThreshold: value });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm opacity-60" style={{ color: "var(--foreground)" }}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ color: "var(--foreground)" }}>
      <div>
        <label className="block text-sm font-medium opacity-90 mb-1">
          WD14 태그 민감도
        </label>
        <p className="text-sm opacity-70 mb-2">
          낮을수록 더 많은 태그가 붙고, 높을수록 적은 태그만 사용합니다. (0.2 ~ 1.0)
        </p>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={WD14_MIN}
            max={WD14_MAX}
            step={WD14_STEP}
            value={wd14Threshold}
            onChange={(e) => saveWd14(Number(e.target.value))}
            className="flex-1 h-2 rounded-lg appearance-none bg-[var(--surface)] accent-indigo-500"
          />
          <span className="w-12 text-sm tabular-nums">{wd14Threshold}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium opacity-90 mb-1">
          시맨틱 검색 유사도
        </label>
        <p className="text-sm opacity-70 mb-2">
          검색 시 이 값 이상인 태그만 매칭합니다. (0.5 ~ 0.95)
        </p>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={SEMANTIC_MIN}
            max={SEMANTIC_MAX}
            step={SEMANTIC_STEP}
            value={semanticSimilarityThreshold}
            onChange={(e) => saveSemantic(Number(e.target.value))}
            className="flex-1 h-2 rounded-lg appearance-none bg-[var(--surface)] accent-indigo-500"
          />
          <span className="w-12 text-sm tabular-nums">
            {semanticSimilarityThreshold}
          </span>
        </div>
      </div>

      {saving && (
        <p className="text-sm opacity-60 flex items-center gap-1">
          <Loader2 className="w-4 h-4 animate-spin" />
          저장 중...
        </p>
      )}
    </div>
  );
}
