import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAppStore } from "@/core/store";
import { activeBoard } from "@/core/store/helpers";
import { boardStats } from "@/core/domain/tree";
import { nodesBounds } from "@/core/domain/layout";
import { importFiles } from "@/core/media/attachments";
import { cn, timeAgo, truncate } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { NodeTypeIcon, nodeColorClass, stopDrag } from "./nodeUi";
import type { NodeColor } from "@/core/domain/types";
import type { NodeProps } from "./types";

const BOARD_TILE_COLORS: Record<NodeColor, string> = {
  none: "#2F6FED",
  sky: "#2F80ED",
  mint: "#0F9D6E",
  rose: "#E0473D",
  amber: "#C97C05",
  lilac: "#7C3AED",
  sand: "#B45309",
  slate: "#475569",
};

export function ColumnNode({ node }: NodeProps) {
  const board = useAppStore(activeBoard);
  const updateNode = useAppStore((state) => state.updateNode);
  const addNode = useAppStore((state) => state.addNode);
  const removeNodes = useAppStore((state) => state.removeNodes);
  const openDrawing = useAppStore((state) => state.openDrawing);

  const children = useMemo(
    () =>
      Object.values(board?.nodes ?? {})
        .filter((child) => child.parentId === node.id)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [board?.nodes, node.id],
  );

  const addChild = (type: Parameters<typeof addNode>[0]) => {
    const id = addNode(type, { x: node.x + 12, y: node.y + 46 }, { parentId: node.id });
    if (id && type === "drawing") openDrawing(id);
  };

  return (
    <div
      className={cn(
        "group/column node-column relative flex h-full flex-col overflow-hidden border",
        nodeColorClass(node.color),
      )}
    >
      <div className="node-column-bar flex h-[46px] shrink-0 items-center gap-1.5 border-b px-1">
        <button
          type="button"
          data-no-drag
          onPointerDown={stopDrag}
          onClick={() => updateNode(node.id, { collapsed: !node.collapsed })}
          className="rounded-none p-0.5 text-muted-foreground opacity-70 hover:bg-foreground/5 hover:opacity-100"
          aria-label={node.collapsed ? "Expandir coluna" : "Recolher coluna"}
        >
          {node.collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        <input
          data-no-drag
          value={node.title ?? ""}
          onChange={(event) => updateNode(node.id, { title: event.target.value }, { label: "Editar coluna" })}
          onPointerDown={stopDrag}
          placeholder="Coluna"
          className="node-input min-w-0 flex-1 text-[12.5px] font-semibold placeholder:opacity-40"
        />
        <span className="shrink-0 px-1 text-[10px] font-medium tabular-nums text-muted-foreground">
          {children.length}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              data-no-drag
              onPointerDown={stopDrag}
              variant="ghost"
              size="icon-xs"
              className="rounded-none text-muted-foreground opacity-60 hover:bg-foreground/5 hover:opacity-100"
              aria-label="Ações da coluna"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Adicionar à coluna</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => addChild("note")}>
              <NodeTypeIcon type="note" /> Nota
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addChild("text")}>
              <NodeTypeIcon type="text" /> Texto
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addChild("code")}>
              <NodeTypeIcon type="code" /> Código
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addChild("task")}>
              <NodeTypeIcon type="task" /> Tarefa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addChild("checklist")}>
              <NodeTypeIcon type="checklist" /> Checklist
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addChild("card")}>
              <NodeTypeIcon type="card" /> Cartão
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addChild("drawing")}>
              <NodeTypeIcon type="drawing" /> Desenho
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => updateNode(node.id, { collapsed: !node.collapsed })}>
              {node.collapsed ? <ChevronDown /> : <ChevronUpGlyph />}
              {node.collapsed ? "Expandir" : "Recolher"}
            </DropdownMenuItem>
            <DropdownMenuItem destructive onClick={() => removeNodes([node.id])}>
              <Trash2 /> Excluir coluna e itens
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {node.collapsed ? (
        <div className="flex flex-1 items-start px-1 pt-1.5 text-[11px] text-muted-foreground">
          {children.length} {children.length === 1 ? "item recolhido" : "itens recolhidos"}
        </div>
      ) : children.length === 0 ? (
        <div className="m-1 flex flex-1 flex-col items-center justify-center gap-1.5 rounded-none border border-dashed border-border px-3 text-center">
          <Plus className="h-4 w-4 text-muted-foreground/50" />
          <p className="text-[11px] leading-snug text-muted-foreground">
            Arraste elementos para esta coluna ou use o menu
          </p>
        </div>
      ) : (
        <div className="flex-1" />
      )}
    </div>
  );
}

function ChevronUpGlyph() {
  return <ChevronDown className="rotate-180" />;
}

export function BoardNode({ node, editing }: NodeProps) {
  const childBoard = useAppStore((state) => (node.childBoardId ? state.boards[node.childBoardId] : undefined));
  const updateNode = useAppStore((state) => state.updateNode);
  const openBoard = useAppStore((state) => state.openBoard);
  const [dropActive, setDropActive] = useState(false);
  const dropMode = useAppStore((state) =>
    node.childBoardId && state.nodeDrag?.overBoardId === node.childBoardId ? state.nodeDrag.mode : null,
  );
  const dropCount = useAppStore((state) =>
    node.childBoardId && state.nodeDrag?.overBoardId === node.childBoardId ? state.nodeDrag.nodeIds.length : 0,
  );
  const justReceived = useAppStore((state) =>
    Boolean(node.childBoardId && state.dropFlash?.boardId === node.childBoardId),
  );

  const stats = childBoard ? boardStats(childBoard) : { nodes: 0, tasks: 0, tasksDone: 0, boards: 0 };

  const attachFiles = async (files: File[]) => {
    if (!childBoard) return;
    const bounds = nodesBounds(Object.values(childBoard.nodes));
    const position = bounds
      ? { x: Math.round(bounds.x + bounds.w + 40), y: Math.round(bounds.y) }
      : { x: 140, y: 140 };
    try {
      const store = useAppStore.getState();
      store.beginTransaction("Adicionar imagens ao quadro");
      let ids: string[] = [];
      try {
        ids = await importFiles(files, position, { boardId: childBoard.id });
        store.endTransaction();
      } catch (error) {
        store.cancelTransaction();
        throw error;
      }
      if (ids.length === 0) {
        toast.error("Nenhum arquivo pôde ser adicionado.");
        return;
      }
      toast.success(
        ids.length === 1
          ? `Anexo adicionado ao quadro "${childBoard.title}"`
          : `${ids.length} anexos adicionados ao quadro "${childBoard.title}"`,
        { description: "Abra o quadro para ver e organizar os itens." },
      );
    } catch (error) {
      toast.error("Falha ao adicionar ao quadro", {
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const isFileDrag = (event: React.DragEvent<HTMLDivElement>) =>
    event.dataTransfer.types.includes("Files");

  return (
    <div
      className={cn(
        "relative flex h-full flex-col justify-between overflow-hidden rounded-none border border-black/10 p-3 text-white transition-[transform,box-shadow] duration-150 ease-out",
        dropActive && "ring-2 ring-primary ring-offset-1",
        dropMode && "scale-[1.025] shadow-floating ring-2 ring-white/90",
        justReceived && "animate-drop-pop",
      )}
      style={{ backgroundColor: BOARD_TILE_COLORS[node.color] }}
      data-drop-target="board"
      onDragOver={(event) => {
        if (!isFileDrag(event)) return;
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = "copy";
        setDropActive(true);
      }}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) return;
        setDropActive(false);
      }}
      onDrop={(event) => {
        if (!isFileDrag(event)) return;
        event.preventDefault();
        event.stopPropagation();
        setDropActive(false);
        const files = Array.from(event.dataTransfer.files);
        if (files.length > 0) void attachFiles(files);
      }}
    >
      <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.12em] text-white/80">
        <LayoutDashboard className="h-4 w-4" />
        <span>Quadro</span>
        <button
          type="button"
          data-no-drag
          onPointerDown={stopDrag}
          onClick={() => node.childBoardId && openBoard(node.childBoardId)}
          className="ml-auto rounded-none border border-white/30 px-1.5 py-0.5 text-[10px] font-medium normal-case tracking-normal text-white transition-colors hover:bg-white/15"
        >
          Abrir
        </button>
      </div>

      <div className="min-w-0">
        {editing ? (
          <input
            data-no-drag
            autoFocus
            value={node.title ?? ""}
            onChange={(event) => updateNode(node.id, { title: event.target.value }, { label: "Editar quadro" })}
            onPointerDown={stopDrag}
            className="node-input text-[16px] font-semibold text-white placeholder:text-white/50"
          />
        ) : (
          <h3 className="line-clamp-2 text-[16px] font-semibold leading-snug">
            {childBoard?.title ?? node.title ?? "Quadro"}
          </h3>
        )}
        <p className="mt-1 text-[10.5px] text-white/75">
          {stats.nodes} {stats.nodes === 1 ? "elemento" : "elementos"} · {stats.boards} subquadros
        </p>
      </div>

      {dropActive ? (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center rounded-none bg-black/20 ring-2 ring-white/70">
          <span className="rounded-none bg-white px-2 py-1 text-[10px] font-semibold text-foreground shadow">
            Solte para adicionar ao quadro
          </span>
        </div>
      ) : null}

      {dropMode ? (
        <div className="pointer-events-none absolute inset-0 z-30 flex animate-[node-drop-in_140ms_ease-out] flex-col items-center justify-center gap-1.5 rounded-none bg-black/45 backdrop-blur-[1px]">
          <span className="rounded-none bg-white px-2.5 py-1 text-[10.5px] font-semibold text-foreground shadow">
            {dropMode === "copy" ? "Soltar para copiar" : "Soltar para mover"} {dropCount}{" "}
            {dropCount === 1 ? "elemento" : "elementos"}
          </span>
          <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-white/80">
            {dropMode === "copy" ? "Nova cópia no quadro" : "Segure Alt para copiar"}
          </span>
        </div>
      ) : null}

      {justReceived ? (
        <span className="node-drop-flash pointer-events-none absolute inset-0 z-20 bg-white" aria-hidden />
      ) : null}
    </div>
  );
}

export function CommentNode({ node }: NodeProps) {
  const updateNode = useAppStore((state) => state.updateNode);
  const toggleResolved = useAppStore((state) => state.toggleCommentResolved);
  const addReply = useAppStore((state) => state.addCommentReply);

  return (
    <div
      className={cn(
        "node-surface flex h-full flex-col gap-2 overflow-hidden rounded-none border",
        nodeColorClass(node.color),
      )}
    >
      <div className="flex items-center gap-2 px-3 pt-3">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-none bg-primary/10 text-[10px] font-semibold uppercase text-primary">
          {(node.author ?? "Você").slice(0, 1)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold">{node.author ?? "Você"}</p>
          <p className="text-[9.5px] text-muted-foreground">{timeAgo(node.updatedAt)}</p>
        </div>
        <span
          className={cn(
            "ml-auto rounded-none px-1.5 py-0.5 text-[9px] font-medium",
            node.resolved
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
              : "bg-amber-500/15 text-amber-700 dark:text-amber-300",
          )}
        >
          {node.resolved ? "Resolvido" : "Aberto"}
        </span>
      </div>

      <textarea
        data-no-drag
        value={node.content ?? ""}
        onChange={(event) => updateNode(node.id, { content: event.target.value }, { label: "Editar comentário" })}
        onPointerDown={stopDrag}
        placeholder="Escreva um comentário…"
        className="node-input scrollbar-thin min-h-0 flex-1 resize-none px-3 text-[12.5px] leading-relaxed placeholder:opacity-40"
      />

      <div className="scrollbar-thin max-h-24 overflow-auto px-3">
        {(node.replies ?? []).slice(-3).map((item) => (
          <div key={item.id} className="border-t border-border py-1 text-[11px] leading-snug">
            <span className="font-semibold">{item.author}:</span>{" "}
            <span className="opacity-80">{truncate(item.content, 90)}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 border-t border-border px-3 py-1.5">
        <ReplyInput onSubmit={(text) => addReply(node.id, text)} />
        <button
          type="button"
          data-no-drag
          onPointerDown={stopDrag}
          onClick={() => toggleResolved(node.id)}
          className="shrink-0 rounded-none bg-foreground/5 px-2 py-1 text-[10px] font-semibold hover:bg-foreground/10"
        >
          {node.resolved ? "Reabrir" : "Resolver"}
        </button>
      </div>
    </div>
  );
}

function ReplyInput({ onSubmit }: { onSubmit: (text: string) => void }) {
  return (
    <input
      data-no-drag
      onPointerDown={stopDrag}
      placeholder="Responder…"
      onKeyDown={(event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        const value = event.currentTarget.value.trim();
        if (!value) return;
        onSubmit(value);
        event.currentTarget.value = "";
      }}
      className="node-input min-w-0 flex-1 text-[11px] placeholder:opacity-40"
    />
  );
}
