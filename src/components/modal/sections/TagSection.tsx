import { Tag as TagIcon, X } from "lucide-react";
import { useState } from "react";
import { updateTags } from "@/lib/api";

export interface TagSectionProps {
  id: string;
  tags: string[];
  /** 태그 저장 성공 시 호출. 부모는 이미지 메타 갱신(동기화)만 하면 됨 */
  onTagsSaved: (newTags: string[]) => void;
}

export const TagSection = ({ id, tags, onTagsSaved }: TagSectionProps) => {
  const [newTag, setNewTag] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const saveTags = async (updatedTags: string[]) => {
    setIsUpdating(true);
    try {
      const ok = await updateTags(id, updatedTags);
      if (ok) {
        onTagsSaved(updatedTags);
      } else {
        alert("태그 저장에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const raw = newTag.split(",").map((s) => s.trim()).filter(Boolean);
    if (raw.length === 0) return;
    e.preventDefault();
    const existing = new Set(tags.map((t) => t.toLowerCase()));
    const toAdd = raw.filter((t) => !existing.has(t.toLowerCase()));
    if (toAdd.length === 0) {
      setNewTag("");
      return;
    }
    saveTags([...tags, ...toAdd]);
    setNewTag("");
  };

  return (
    <section className={isUpdating ? "opacity-50 pointer-events-none" : ""}>
      <h4 className="text-white/20 text-[10px] uppercase font-bold mb-4 flex items-center gap-2">
        <TagIcon className="w-3 h-3" /> Tags
      </h4>

      {/* 태그 리스트 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((t) => (
          <span
            key={t}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 text-indigo-300 rounded-lg text-xs border border-indigo-500/20"
          >
            #{t}
            <X
              className="w-3 h-3 cursor-pointer hover:text-red-400 transition-colors"
              onClick={() => saveTags(tags.filter((tag) => tag !== t))}
            />
          </span>
        ))}
      </div>

      {/* 태그 입력창 */}
      <input
        type="text"
        value={newTag}
        onChange={(e) => setNewTag(e.target.value)}
        onKeyDown={handleAddTag}
        placeholder={isUpdating ? "저장 중..." : "태그 입력 후 엔터 (쉼표로 여러 개)"}
        className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all"
      />
    </section>
  );
};

