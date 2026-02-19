"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import SettingsModal from "./settings/SettingsModal";

export default function SettingsButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 rounded-full bg-slate-700 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-[var(--background)]"
        aria-label="설정"
      >
        <Settings className="w-4 h-4" />
        설정
      </button>
      <SettingsModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
