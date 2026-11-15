import { useMemo } from "react";
import { PenTool, Sparkles } from "lucide-react";
import { useAppStore } from "@/core/store";
import { Button } from "@/components/ui/button";
import { stopDrag } from "./nodeUi";
import type { NodeProps } from "./types";

export function DrawingNode({ node }: NodeProps) {
  const openDrawing = useAppStore((state) => state.openDrawing);
  const scene = node.scene;
  const elementCount = scene?.elements.length ?? 0;

  const thumbnail = useMemo(() => scene?.thumbnail ?? null, [scene?.thumbnail]);

  return (
    <div className="group/drawing relative flex h-full w-full flex-col overflow-hidden rounded-none border border-border bg-card">
      <div className="relative min-h-0 flex-1 overflow-hidden bg-[#fdfdfc] dark:bg-[#111214]">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={node.title || "Desenho"}
            draggable={false}
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
            {elementCount === 0 ? (
              <>
                <PenTool className="h-6 w-6 opacity-40" />
                <span className="text-[11px] font-medium">Desenho vazio</span>
                <span className="text-[10px] opacity-60">Formas, traços e texto</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 opacity-40" />
                <span className="text-[11px] opacity-70">{elementCount} elementos</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-border px-2.5 py-1.5">
        <span className="line-clamp-1 flex-1 text-[11px] font-medium">{node.title || "Desenho"}</span>
        <div className="flex items-center gap-1" data-no-drag>
          <Button
            data-no-drag
            onPointerDown={stopDrag}
            size="xs"
            variant="ghost"
            className="h-6 rounded-none px-1.5 text-[10px] opacity-0 transition-opacity group-hover/drawing:opacity-100"
            onClick={() => openDrawing(node.id)}
          >
            <PenTool className="h-3 w-3" /> Editar
          </Button>
        </div>
      </div>
    </div>
  );
}
