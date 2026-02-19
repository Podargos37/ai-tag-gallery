"use client";

import { useState } from "react";
import { Tag, Palette, X } from "lucide-react";
import TagSettings from "./TagSettings";
import ThemeSettings from "./ThemeSettings";

type SettingsSection = "tag" | "theme";

const SECTIONS: { id: SettingsSection; label: string; icon: React.ReactNode }[] = [
  { id: "tag", label: "태그", icon: <Tag className="w-4 h-4" /> },
  { id: "theme", label: "테마", icon: <Palette className="w-4 h-4" /> },
];

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [section, setSection] = useState<SettingsSection>("tag");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-4xl h-[85vh] min-h-[520px] flex flex-col rounded-2xl border shadow-xl overflow-hidden"
        style={{ backgroundColor: "var(--modal-bg)", borderColor: "var(--surface-border)" }}
      >
        <div
          className="flex items-center justify-between shrink-0 border-b px-4 py-3"
          style={{ borderColor: "var(--surface-border)" }}
        >
          <h2 id="settings-title" className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
            설정
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg transition opacity-60 hover:opacity-100 hover:bg-[var(--surface)]"
            style={{ color: "var(--foreground)" }}
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          <nav
            className="w-40 shrink-0 border-r py-3 flex flex-col gap-0.5"
            style={{ borderColor: "var(--surface-border)" }}
          >
            {SECTIONS.map(({ id, label, icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSection(id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-left text-sm transition ${
                  section === id
                    ? "bg-indigo-600/30 border-r-2 border-indigo-400"
                    : "opacity-70 hover:opacity-100 hover:bg-[var(--surface)]"
                }`}
                style={{ color: "var(--foreground)", backgroundColor: section === id ? undefined : "transparent" }}
              >
                {icon}
                {label}
              </button>
            ))}
          </nav>

          <div className="flex-1 min-h-0 overflow-y-auto p-6">
            {section === "tag" && <TagSettings />}
            {section === "theme" && <ThemeSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}
