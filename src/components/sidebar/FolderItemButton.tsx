"use client";

import type { LucideIcon } from "lucide-react";

const selectedClass =
  "bg-indigo-500/20";
const unselectedClass =
  "opacity-80 hover:opacity-100 hover:bg-[var(--surface)]";

interface FolderItemButtonProps {
  label: string;
  icon: LucideIcon;
  count?: number;
  selected: boolean;
  onClick: () => void;
  className?: string;
}

export default function FolderItemButton({
  label,
  icon: Icon,
  count,
  selected,
  onClick,
  className = "",
}: FolderItemButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors ${selected ? selectedClass : unselectedClass} ${className}`}
      style={{ color: selected ? "var(--accent)" : "var(--foreground)" }}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="truncate">{label}</span>
      {count !== undefined && (
        <span className="ml-auto text-xs opacity-60 shrink-0">{count}</span>
      )}
    </button>
  );
}
