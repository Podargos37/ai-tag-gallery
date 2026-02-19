"use client";

import { useState, useEffect } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { getExcludeTags, saveExcludeTags, bulkRemoveTags } from "@/lib/api";

export default function TagSettings() {
  const [tags, setTags] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bulkRemoving, setBulkRemoving] = useState(false);

  useEffect(() => {
    getExcludeTags()
      .then(setTags)
      .catch(() => setTags([]))
      .finally(() => setLoading(false));
  }, []);

  const add = async () => {
    const raw = input.split(",").map((s) => s.trim()).filter(Boolean);
    if (raw.length === 0) return;
    const existingLower = new Set(tags.map((x) => x.toLowerCase()));
    const toAdd = raw.filter((t) => !existingLower.has(t.toLowerCase()));
    if (toAdd.length === 0) {
      setInput("");
      return;
    }
    const next = [...tags, ...toAdd];
    setTags(next);
    setSaving(true);
    try {
      await saveExcludeTags(next);
    } catch (e) {
      console.error(e);
      setTags(tags);
    } finally {
      setSaving(false);
    }
    setInput("");
  };

  const remove = async (index: number) => {
    const next = tags.filter((_, i) => i !== index);
    setTags(next);
    setSaving(true);
    try {
      await saveExcludeTags(next);
    } catch (e) {
      console.error(e);
      setTags(tags);
    } finally {
      setSaving(false);
    }
  };

  const handleBulkRemove = async () => {
    if (tags.length === 0) return;
    if (!confirm("제외 목록에 있는 태그를 모든 이미지에서 제거합니다. 계속할까요?")) return;
    setBulkRemoving(true);
    try {
      const { updated } = await bulkRemoveTags(tags);
      alert(`${updated}개 이미지에서 해당 태그가 제거되었습니다.`);
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("일괄 제거 중 오류가 발생했습니다.");
    } finally {
      setBulkRemoving(false);
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
    <div className="space-y-4" style={{ color: "var(--foreground)" }}>
      <p className="text-sm opacity-70">
        업로드 시 WD14가 추천한 태그 중 아래 목록에 있는 태그는 자동으로 제외됩니다.
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder="제외할 태그 입력 (쉼표로 여러 개)"
          className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:opacity-40"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--surface-border)", color: "var(--foreground)" }}
        />
        <button
          type="button"
          onClick={add}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition shrink-0 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          {saving ? "저장 중..." : "추가"}
        </button>
      </div>
      <ul
        className="space-y-1.5 max-h-48 overflow-y-auto rounded-lg border p-2"
        style={{ borderColor: "var(--surface-border)", backgroundColor: "var(--surface)" }}
      >
        {tags.length === 0 ? (
          <li className="text-sm py-2 text-center opacity-40">제외 목록이 비어 있습니다.</li>
        ) : (
          tags.map((tag, i) => (
            <li
              key={`${tag}-${i}`}
              className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm"
              style={{ backgroundColor: "var(--surface)" }}
            >
              <span className="truncate">{tag}</span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="p-1 rounded opacity-60 hover:opacity-100 hover:bg-[var(--surface)] transition shrink-0"
                aria-label={`${tag} 제거`}
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))
        )}
      </ul>

      <div className="pt-4 border-t" style={{ borderColor: "var(--surface-border)" }}>
        <p className="text-sm opacity-60 mb-2">
          이미 저장된 이미지에서도 위 제외 목록 태그를 완전 일치로 일괄 제거할 수 있습니다.
        </p>
        <button
          type="button"
          onClick={handleBulkRemove}
          disabled={tags.length === 0 || bulkRemoving}
          className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-200 hover:bg-amber-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {bulkRemoving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              처리 중...
            </>
          ) : (
            "제외 목록 태그를 모든 이미지에서 제거"
          )}
        </button>
      </div>
    </div>
  );
}
