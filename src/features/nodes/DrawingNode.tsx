import { useMemo } from "react";
import { PenTool, Sparkles } from "lucide-react";
import { useAppStore } from "@/core/store";
import { Button } from "@/components/ui/button";
import { SketchView } from "@/features/drawing/native/SketchView";
import { stopDrag } from "./nodeUi";
import type { NodeProps } from "./types";

/**
 * Cartão de desenho. Renderiza a prévia vetorial do desenho nativo ou a
 * miniatura de cenas Excalidraw antigas, conforme `drawingEngine`.
 */
export function DrawingNode({ node }: NodeProps) {
  const openDrawing = useAppStore((state) => state.openDrawing);
  const openSketch = useAppStore((state) => state.openSketch);
  const native =
    node.drawingEngine === "native" || (Boolean(node.sketch) && node.drawingEngine !== "excalidraw");
  const elementCount = native
    ? (node.sketch?.elements.length ?? 0)
    : (node.scene?.elements.length ?? 0);

  const thumbnail = useMemo(() => node.scene?.thumbnail ?? null, [node.scene?.thumbnail]);
  const open = () => (native ? openSketch(node.id) : openDrawing(node.id));

  return (
    <div className="group/drawing relative flex h-full w-full flex-col overflow-hidden rounded-none border border-border bg-card">
      <div className="relative min-h-0 flex-1 overflow-hidden bg-[#fdfdfc] dark:bg-[#111214]">
        {native ? (
          elementCount > 0 && node.sketch ? (
            <div className="h-full w-full p-2">
              <SketchView sketch={node.sketch} alt={node.title || "Desenho"} />
            </div>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <PenTool className="h-6 w-6 opacity-40" />
              <span className="text-[11px] font-medium">Desenho vazio</span>
              <span className="text-[10px] opacity-60">Caneta, formas, texto e setas</span>
            </div>
          )
        ) : thumbnail ? (
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
                <span className="text-[10px] opacity-60">Cena Excalidraw</span>
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
        <span className="shrink-0 text-[9px] uppercase tracking-wide text-muted-foreground">
          {native ? "Nativo" : "Excalidraw"}
        </span>
        <div className="flex items-center gap-1" data-no-drag>
          <Button
            data-no-drag
            onPointerDown={stopDrag}
            size="xs"
            variant="ghost"
            className="h-6 rounded-none px-1.5 text-[10px] opacity-0 transition-opacity group-hover/drawing:opacity-100"
            onClick={open}
          >
            <PenTool className="h-3 w-3" /> Editar
          </Button>
        </div>
      </div>
    </div>
  );
}
