import { useState } from "react";
import { updateNotes } from "@/lib/api/update";

export function useUpdateNotes() {
  const [isSaving, setIsSaving] = useState(false);

  const saveNotes = async (id: string, notes: string): Promise<boolean> => {
    setIsSaving(true);
    try {
      const ok = await updateNotes(id, notes);
      return ok;
    } catch {
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { saveNotes, isSaving };
}
