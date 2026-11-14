import { useEffect, useState } from "react";
import { ChevronRight, FolderOpen, LayoutTemplate, Plus } from "lucide-react";
import type { Board } from "@/core/domain/types";
import { boardPath, boardStats } from "@/core/domain/tree";
import { useAppStore } from "@/core/store";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { openDialogs } from "@/features/shell/dialogActions";

export function BoardHeader({ board }: { board: Board }) {
  const boards = useAppStore((state) => state.boards);
  const openBoard = useAppStore((state) => state.openBoard);
  const renameBoard = useAppStore((state) => state.renameBoard);
  const addBoardNode = useAppStore((state) => state.addBoardNode);
  const [title, setTitle] = useState(board.title);

  useEffect(() => {
    setTitle(board.title);
  }, [board.id, board.title]);

  const path = boardPath(boards, board.id);
  const stats = boardStats(board);

  const commitTitle = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setTitle(board.title);
      return;
    }
    if (trimmed !== board.title) renameBoard(board.id, trimmed);
  };

  return (
    <div
      data-canvas-ui
      className="absolute left-4 top-4 z-20 flex max-w-[min(560px,calc(100%-360px))] flex-col gap-0.5"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
        {path.map((item, index) => (
          <span key={item.id} className="flex min-w-0 items-center gap-1">
            {index > 0 ? <ChevronRight className="h-3 w-3 shrink-0 opacity-50" /> : null}
            {index === path.length - 1 ? (
              <span className="flex items-center gap-1 truncate font-medium text-foreground">
                <FolderOpen className="h-3 w-3 shrink-0" />
                {item.title}
              </span>
            ) : (
              <button
                type="button"
                className="truncate hover:text-foreground hover:underline"
                onClick={() => openBoard(item.id)}
              >
                {item.title}
              </button>
            )}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={commitTitle}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              event.currentTarget.blur();
            }
            if (event.key === "Escape") {
              setTitle(board.title);
              event.currentTarget.blur();
            }
          }}
          className="min-w-0 flex-1 rounded-md bg-transparent px-1 py-0.5 text-[17px] font-semibold tracking-tight outline-none transition-colors hover:bg-card/60 focus:bg-card focus:shadow-sm"
          aria-label="Título do quadro"
        />
        <div className="flex shrink-0 items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="bg-card/60 backdrop-blur hover:bg-card"
                onClick={() => openDialogs.templates()}
                aria-label="Modelos"
              >
                <LayoutTemplate className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Modelos</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="bg-card/60 backdrop-blur hover:bg-card"
                onClick={() => addBoardNode(board.id, { x: 40 + Math.random() * 60, y: 40 + Math.random() * 60 })}
                aria-label="Novo subquadro"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Novo subquadro neste canvas</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className={cn("flex items-center gap-2 pl-1 text-[10.5px] text-muted-foreground")}>
        <span>{stats.nodes} {stats.nodes === 1 ? "elemento" : "elementos"}</span>
        <span className="opacity-40">·</span>
        <span>{stats.boards} {stats.boards === 1 ? "subquadro" : "subquadros"}</span>
        <span className="opacity-40">·</span>
        <span>
          {stats.tasksDone}/{stats.tasks} tarefas
        </span>
      </div>
    </div>
  );
}
