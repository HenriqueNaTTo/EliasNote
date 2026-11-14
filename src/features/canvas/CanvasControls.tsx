import { Maximize2, Minus, Plus } from "lucide-react";
import { useAppStore } from "@/core/store";
import { useViewport } from "@/core/store/selectors";
import { cleanZoomLabel } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Board } from "@/core/domain/types";
import { Minimap } from "./Minimap";
import { fitBoardToView, zoomBy, zoomTo } from "./viewportActions";

export function CanvasControls({ board }: { board: Board }) {
  const viewport = useViewport(board.id);
  const showMinimap = useAppStore((state) => state.settings.showMinimap);

  return (
    <div data-canvas-ui className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-2">
      {showMinimap ? <Minimap board={board} /> : null}
      <div className="glass-panel flex items-center gap-0.5 rounded-xl border border-border p-1 shadow-panel">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={() => zoomBy(1 / 1.2)} aria-label="Diminuir zoom">
              <Minus className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Diminuir zoom</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="xs" className="min-w-[52px] font-medium tabular-nums">
              {cleanZoomLabel(viewport.zoom)}%
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Zoom</DropdownMenuLabel>
            {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map((value) => (
              <DropdownMenuItem key={value} onClick={() => zoomTo(value)}>
                {Math.round(value * 100)}%
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => zoomTo(1)}>Redefinir para 100%</DropdownMenuItem>
            <DropdownMenuItem onClick={() => fitBoardToView(board.id)}>Enquadrar quadro</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={() => zoomBy(1.2)} aria-label="Aumentar zoom">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Aumentar zoom</TooltipContent>
        </Tooltip>

        <span className="mx-0.5 h-5 w-px bg-border" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={() => fitBoardToView(board.id)} aria-label="Enquadrar quadro">
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Enquadrar quadro (Shift+1)</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
