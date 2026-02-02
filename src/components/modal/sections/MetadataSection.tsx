// src/components/modal/sections/MetadataSection.tsx
import { Info } from "lucide-react";

export const MetadataSection = ({ id, filename }: { id: string; filename: string }) => (
  <section>
    <h4 className="text-white/20 text-[10px] uppercase tracking-[0.2em] font-bold mb-4 flex items-center gap-2">
      <Info className="w-3 h-3" /> Metadata
    </h4>
    <div className="space-y-3 text-sm">
      <div className="flex justify-between">
        <span className="text-white/40">ID</span>
        <span className="text-white/80 font-mono text-xs">{id}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-white/40">Format</span>
        <span className="text-white/80 uppercase">{filename.split(".").pop()}</span>
      </div>
    </div>
  </section>
);

