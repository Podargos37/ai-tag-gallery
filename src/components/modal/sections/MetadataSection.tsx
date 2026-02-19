// src/components/modal/sections/MetadataSection.tsx
import { Info } from "lucide-react";

export const MetadataSection = ({ id, filename }: { id: string; filename: string }) => (
  <section>
    <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-4 flex items-center gap-2 opacity-50">
      <Info className="w-3 h-3" /> Metadata
    </h4>
    <div className="space-y-3 text-sm">
      <div className="flex justify-between">
        <span className="opacity-60">ID</span>
        <span className="font-mono text-xs opacity-90">{id}</span>
      </div>
      <div className="flex justify-between">
        <span className="opacity-60">Format</span>
        <span className="uppercase opacity-90">{filename.split(".").pop()}</span>
      </div>
    </div>
  </section>
);

