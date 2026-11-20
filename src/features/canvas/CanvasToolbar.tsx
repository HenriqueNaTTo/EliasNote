import { useState } from "react";
import {
  CheckSquare,
  Code2,
  Columns3,
  Hand,
  ImagePlus,
  LayoutDashboard,
  Link2,
  ListChecks,
  MessageCircle,
  MousePointer2,
  MoveUpRight,
  PenTool,
  Redo2,
  Square,
  StickyNote,
  Type,
  Undo2,
} from "lucide-react";
import { useAppStore } from "@/core/store";
import { useActiveBoard } from "@/core/store/selectors";
import { useCanRedo, useCanUndo } from "@/core/store/selectors";
import { cn } from "@/lib/utils";
import { normalizeUrl } from "@/lib/platform";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { ToolId } from "@/core/domain/types";
import { viewportCenter } from "./viewportActions";

const TOOLS: { id: ToolId; label: string; shortcut?: string; icon: typeof StickyNote }[] = [
  { id: "select", label: "Selecionar", shortcut: "V", icon: MousePointer2 },
  { id: "pan", label: "Mover canvas", shortcut: "H", icon: Hand },
  { id: "note", label: "Nota", shortcut: "N", icon: StickyNote },
  { id: "text", label: "Texto", shortcut: "⇧T", icon: Type },
  { id: "code", label: "Código", shortcut: "⇧C", icon: Code2 },
  { id: "card", label: "Cartão", shortcut: "C", icon: Square },
  { id: "task", label: "Tarefa", shortcut: "T", icon: CheckSquare },
  { id: "checklist", label: "Checklist", shortcut: "L", icon: ListChecks },
  { id: "column", label: "Coluna", shortcut: "⇧K", icon: Columns3 },
  { id: "drawing", label: "Desenho Excalidraw", shortcut: "D", icon: PenTool },
  { id: "comment", label: "Comentário", shortcut: "M", icon: MessageCircle },
  { id: "connector", label: "Conector", shortcut: "R", icon: MoveUpRight },
];

export function CanvasToolbar() {
  const activeTool = useAppStore((state) => state.activeTool);
  const setTool = useAppStore((state) => state.setTool);
  const board = useActiveBoard();
  const undo = useAppStore((state) => state.undo);
  const redo = useAppStore((state) => state.redo);
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const addBoardNode = useAppStore((state) => state.addBoardNode);
  const addNode = useAppStore((state) => state.addNode);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const createNestedBoard = () => {
    if (!board) return;
    const center = viewportCenter();
    addBoardNode(board.id, { x: Math.round(center.x - 150), y: Math.round(center.y - 100) });
  };

  const openMediaPicker = () => {
    document.getElementById("canvas-file-input")?.click();
  };

  const submitLink = () => {
    if (!board) return;
    const center = viewportCenter();
    const url = normalizeUrl(linkUrl);
    addNode("link", { x: Math.round(center.x - 150), y: Math.round(center.y - 70) }, {
      title: linkTitle.trim() || url,
      url,
    });
    setLinkOpen(false);
    setLinkTitle("");
    setLinkUrl("");
  };

  return (
    <>
      <div
        data-canvas-ui
        className="absolute bottom-4 left-1/2 z-20 flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-none border border-border bg-popover/95 p-1 backdrop-blur shadow-floating scrollbar-thin"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-0.5">
          <ToolbarAction label="Desfazer" shortcut="Ctrl+Z" onClick={undo} disabled={!canUndo}>
            <Undo2 className="h-4 w-4" />
          </ToolbarAction>
          <ToolbarAction label="Refazer" shortcut="Ctrl+Shift+Z" onClick={redo} disabled={!canRedo}>
            <Redo2 className="h-4 w-4" />
          </ToolbarAction>
        </div>
        <span className="mx-0.5 h-6 w-px shrink-0 bg-border" />
        <div className="flex items-center gap-0.5">
          {TOOLS.map((tool) => (
            <ToolbarAction
              key={tool.id}
              label={tool.label}
              shortcut={tool.shortcut}
              active={activeTool === tool.id}
              onClick={() => setTool(tool.id)}
            >
              <tool.icon className="h-4 w-4" />
            </ToolbarAction>
          ))}
        </div>
        <span className="mx-0.5 h-6 w-px shrink-0 bg-border" />
        <div className="flex items-center gap-0.5">
          <ToolbarAction label="Quadro aninhado" onClick={createNestedBoard}>
            <LayoutDashboard className="h-4 w-4" />
          </ToolbarAction>
          <ToolbarAction label="Imagem, vídeo ou arquivo" onClick={openMediaPicker}>
            <ImagePlus className="h-4 w-4" />
          </ToolbarAction>
          <ToolbarAction label="Link" onClick={() => setLinkOpen(true)}>
            <Link2 className="h-4 w-4" />
          </ToolbarAction>
        </div>
      </div>

      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar link</DialogTitle>
            <DialogDescription>Salve uma referência com título e endereço.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="link-title">
                Título
              </label>
              <Input
                id="link-title"
                value={linkTitle}
                onChange={(event) => setLinkTitle(event.target.value)}
                placeholder="Nome da referência"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="link-url">
                Endereço
              </label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(event) => setLinkUrl(event.target.value)}
                placeholder="https://…"
                onKeyDown={(event) => {
                  if (event.key === "Enter") submitLink();
                }}
              />
              <p className="text-[11px] text-muted-foreground">
                Links abrem no navegador padrão. O conteúdo do app permanece 100% offline.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setLinkOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={submitLink} disabled={!linkUrl.trim()}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ToolbarAction({
  label,
  shortcut,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  shortcut?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={active ? "default" : "ghost"}
          size="icon-sm"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          aria-pressed={active}
          className={cn(
            "h-8 w-8 shrink-0 rounded-lg",
            active ? "shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {label}
        {shortcut ? <span className="ml-1.5 opacity-60">{shortcut}</span> : null}
      </TooltipContent>
    </Tooltip>
  );
}
