"use client";

import { X } from "lucide-react";

interface SidebarHeaderProps {
  title: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export default function SidebarHeader({
  title,
  onClose,
  showCloseButton = false,
}: SidebarHeaderProps) {
  return (
    <div
      className="p-3 border-b flex items-center justify-between"
      style={{ borderColor: "var(--surface-border)" }}
    >
      <h2
        className="text-xs font-semibold uppercase tracking-wider px-2 py-1 opacity-60"
        style={{ color: "var(--foreground)" }}
      >
        {title}
      </h2>
      {showCloseButton && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg opacity-70 hover:opacity-100 hover:bg-[var(--surface)] transition"
          style={{ color: "var(--foreground)" }}
          aria-label="사이드바 닫기"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
