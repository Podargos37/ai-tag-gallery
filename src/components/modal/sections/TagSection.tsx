// src/components/modal/sections/TagSection.tsx
import { Tag as TagIcon, X } from "lucide-react";
import { useState } from "react";

interface TagSectionProps {
  id: string;
  tags: string[];
  onTagsUpdate: (newTags: string[]) => void;
}

export const TagSection = ({ id, tags, onTagsUpdate }: TagSectionProps) => {
  const [newTag, setNewTag] = useState("");
  const [isUpdating, setIsUpdating] = useState(false); // 로딩 상태 추가

  const saveTags = async (updatedTags: string[]) => {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, tags: updatedTags }), // id와 tags를 함께 전송
      });

      if (res.ok) {
        onTagsUpdate(updatedTags);
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
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      // 중복 태그 방지 로직 포함
      if (!tags.includes(newTag.trim())) {
        saveTags([...tags, newTag.trim()]);
      }
      setNewTag("");
    }
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
        placeholder={isUpdating ? "저장 중..." : "태그 입력 후 엔터"}
        className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all"
      />
    </section>
  );
};

