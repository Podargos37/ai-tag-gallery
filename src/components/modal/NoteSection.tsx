// src/components/modal/NoteSection.tsx
import { FileText, Save } from "lucide-react";

interface NoteSectionProps {
  notes: string;
  setNotes: (val: string) => void;
  onSave: () => void;
  isSaving: boolean;
  fileId: string;
}

export const NoteSection = ({ notes, setNotes, onSave, isSaving, fileId }: NoteSectionProps) => (
  <footer className="p-6 bg-white/5 border-t border-white/5 flex flex-col gap-3">
    <h4 className="text-white/20 text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2">
      <FileText className="w-3 h-3" /> Personal Notes
    </h4>
    <textarea
      className="w-full h-32 bg-black/20 border border-white/5 rounded-xl p-3 text-sm text-white/80 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none transition-all"
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      placeholder="메모를 입력하세요..."
    />
    <div className="flex justify-between items-center mt-2">
      <span className="text-[10px] text-white/10 italic truncate max-w-[120px]">Saved to {fileId}.json</span>
      <button
        onClick={onSave}
        disabled={isSaving}
        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all"
      >
        {isSaving ? "Saving..." : <><Save className="w-4 h-4" /> Save</>}
      </button>
    </div>
  </footer>
);