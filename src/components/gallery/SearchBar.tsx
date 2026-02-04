"use client";

import { Search, Loader2 } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  isSearching: boolean;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  isSearching,
  placeholder = "동물, 풍경, 음식 등 의미로 검색해보세요...",
}: SearchBarProps) {
  return (
    <section className="flex flex-col items-center py-10">
      <div className="w-full max-w-2xl relative group">
        {isSearching ? (
          <Loader2 className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500 w-5 h-5 animate-spin" />
        ) : (
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-slate-900 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-2xl"
        />
      </div>
    </section>
  );
}
