// src/components/modal/sections/NoteSection.tsx
import { FileText, Save } from "lucide-react";

interface NoteSectionProps {
  notes: string;
  setNotes: (val: string) => void;
  onSave: () => void;
  isSaving: boolean;
  fileId: string;
}

export const NoteSection = ({ notes, setNotes, onSave, isSaving, fileId }: NoteSectionProps) => (
  <footer
    className="p-6 border-t flex flex-col gap-3"
    style={{ backgroundColor: "var(--surface)", borderColor: "var(--surface-border)" }}
  >
    <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2 opacity-50">
      <FileText className="w-3 h-3" /> Personal Notes
    </h4>
    <textarea
      className="w-full h-32 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none transition-all placeholder:opacity-50"
      style={{ backgroundColor: "var(--surface)", borderColor: "var(--surface-border)", color: "var(--foreground)", borderWidth: "1px" }}
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      placeholder="메모를 입력하세요..."
    />
    <div className="flex justify-between items-center mt-2">
      <span className="text-[10px] italic truncate max-w-[120px] opacity-40">Saved to {fileId}.json</span>
      <button
        onClick={onSave}
        disabled={isSaving}
        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50"
      >
        {isSaving ? (
          "Saving..."
        ) : (
          <>
            <Save className="w-4 h-4" /> Save
          </>
        )}
      </button>
    </div>
  </footer>
);

