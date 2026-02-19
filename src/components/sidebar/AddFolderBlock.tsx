"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

interface AddFolderBlockProps {
  onAddFolder: (name: string) => void;
}

export default function AddFolderBlock({ onAddFolder }: AddFolderBlockProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const handleAdd = () => {
    const name = newName.trim();
    if (name) {
      onAddFolder(name);
      setNewName("");
      setIsAdding(false);
    }
  };

  if (isAdding) {
    return (
      <div className="flex items-center gap-1 px-3 py-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
            if (e.key === "Escape") {
              setNewName("");
              setIsAdding(false);
            }
          }}
          placeholder="폴더 이름"
          className="flex-1 min-w-0 px-2 py-1.5 rounded border text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:opacity-50"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--surface-border)",
            color: "var(--foreground)",
          }}
          autoFocus
        />
        <button
          type="button"
          onClick={handleAdd}
          className="p-1.5 rounded bg-indigo-500 text-white hover:bg-indigo-600"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsAdding(true)}
      className="w-full flex items-center gap-2 px-4 py-2.5 opacity-60 hover:opacity-80 hover:bg-[var(--surface)] transition-colors"
      style={{ color: "var(--foreground)" }}
    >
      <Plus className="w-4 h-4 shrink-0" />
      <span className="text-sm">새 폴더</span>
    </button>
  );
}
