import { useEffect } from "react";
import { ChevronLeft, ChevronRight, Presentation, X } from "lucide-react";
import { useAppStore } from "@/core/store";
import { Button } from "@/components/ui/button";
import { fitBoardToView } from "@/features/canvas/viewportActions";

/** Controles e navegação do modo apresentação. O canvas fica por baixo. */
export function PresentationMode() {
  const presentation = useAppStore((state) => state.presentation);
  const boards = useAppStore((state) => state.boards);
  const canvasSize = useAppStore((state) => state.canvasSize);
  const stopPresentation = useAppStore((state) => state.stopPresentation);
  const presentationNext = useAppStore((state) => state.presentationNext);
  const presentationPrevious = useAppStore((state) => state.presentationPrevious);

  const boardId = presentation?.boardIds[presentation.index] ?? null;
  const board = boardId ? boards[boardId] : undefined;
  const total = presentation?.boardIds.length ?? 0;
  const atStart = !presentation || presentation.index <= 0;
  const atEnd = !presentation || presentation.index >= total - 1;

  // O chrome some e o canvas muda de tamanho; enquadra depois do layout estabilizar.
  useEffect(() => {
    if (!boardId) return;
    let frame = 0;
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => fitBoardToView(boardId));
    });
    return () => cancelAnimationFrame(frame);
  }, [boardId, canvasSize.width, canvasSize.height]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        stopPresentation();
        return;
      }
      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        event.stopImmediatePropagation();
        presentationPrevious();
        return;
      }
      if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault();
        event.stopImmediatePropagation();
        presentationNext();
      }
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [presentationNext, presentationPrevious, stopPresentation]);

  if (!presentation) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50"
      role="region"
      aria-label="Modo apresentação"
    >
      <div className="pointer-events-auto absolute right-4 top-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={stopPresentation}
          aria-label="Sair do modo apresentação"
          className="gap-1.5 shadow-panel"
        >
          <X className="h-3.5 w-3.5" />
          Sair
          <span className="rounded border border-border px-1 text-[9px] text-muted-foreground">Esc</span>
        </Button>
      </div>

      <div className="pointer-events-auto absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 border border-border bg-popover/95 px-2 py-1.5 shadow-floating backdrop-blur">
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={atStart}
          onClick={presentationPrevious}
          aria-label="Quadro anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex min-w-[160px] max-w-[min(460px,60vw)] flex-col items-center px-1 text-center">
          <span className="flex items-center gap-1.5 text-[12px] font-medium">
            <Presentation className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate">{board?.title ?? "Quadro"}</span>
          </span>
          <span className="text-[9.5px] tabular-nums text-muted-foreground">
            {presentation.index + 1} / {total}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          disabled={atEnd}
          onClick={presentationNext}
          aria-label="Próximo quadro"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <p className="pointer-events-none absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] text-muted-foreground">
        ← → navegar · Esc sair
      </p>
    </div>
  );
}
