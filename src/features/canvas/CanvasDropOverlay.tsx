import { Upload } from "lucide-react";

export function CanvasDropOverlay({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute inset-3 z-40 flex items-center justify-center rounded-2xl border-2 border-dashed border-primary/60 bg-primary/[0.06] backdrop-blur-[1px]">
      <div className="flex items-center gap-2 rounded-xl bg-popover px-4 py-2.5 text-sm font-medium shadow-floating">
        <Upload className="h-4 w-4 text-primary" />
        Solte para adicionar ao quadro
      </div>
    </div>
  );
}
