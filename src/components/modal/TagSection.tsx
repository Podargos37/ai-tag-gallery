// src/components/modal/TagSection.tsx
import { Tag } from "lucide-react";

export const TagSection = ({ tags }: { tags: string[] }) => (
  <section>
    <h4 className="text-white/20 text-[10px] uppercase tracking-[0.2em] font-bold mb-4 flex items-center gap-2">
      <Tag className="w-3 h-3" /> Tags
    </h4>
    <div className="flex flex-wrap gap-2">
      {tags.map((t) => (
        <span key={t} className="px-3 py-1.5 bg-indigo-500/10 text-indigo-300 rounded-lg text-xs border border-indigo-500/20">
          #{t}
        </span>
      ))}
    </div>
  </section>
);