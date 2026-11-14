import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  MessageCircle,
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
import { nodeDisplayTitle } from "@/core/search/search";
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
import type { NodeProps } from "./types";

export function ColumnNode({ node, selected }: NodeProps) {
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
        "relative flex h-full flex-col rounded-2xl border border-dashed",
        nodeColorClass(node.color),
      )}
      style={{
        backgroundColor: "color-mix(in srgb, var(--node-bg) 62%, transparent)",
        borderColor: selected ? "hsl(var(--primary))" : "var(--node-border)",
      }}
    >
      <div className="flex h-[46px] shrink-0 items-center gap-1.5 px-2.5">
        <button
          type="button"
          data-no-drag
          onPointerDown={stopDrag}
          onClick={() => updateNode(node.id, { collapsed: !node.collapsed })}
          className="rounded p-0.5 opacity-60 hover:bg-current/10 hover:opacity-100"
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
          className="node-input min-w-0 flex-1 text-[12px] font-semibold uppercase tracking-wide placeholder:opacity-40"
        />
        <span className="shrink-0 rounded bg-current/10 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums opacity-70">
          {children.length}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              data-no-drag
              onPointerDown={stopDrag}
              variant="ghost"
              size="icon-xs"
              className="text-current opacity-60 hover:bg-current/10 hover:opacity-100"
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
        <div className="flex flex-1 items-start px-3 pt-1 text-[11px] opacity-55">
          {children.length} {children.length === 1 ? "item recolhido" : "itens recolhidos"}
        </div>
      ) : children.length === 0 ? (
        <div className="m-2.5 flex flex-1 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-current/20 px-3 text-center">
          <Plus className="h-4 w-4 opacity-30" />
          <p className="text-[11px] leading-snug opacity-50">
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

  const preview = useMemo(() => {
    if (!childBoard) return [];
    return Object.values(childBoard.nodes)
      .sort((a, b) => a.z - b.z)
      .slice(0, 10);
  }, [childBoard]);

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
        "node-surface relative flex h-full flex-col overflow-hidden rounded-xl border border-[var(--node-border)]",
        dropActive && "ring-2 ring-primary ring-offset-1",
      )}
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
      <div className="flex items-center gap-1.5 border-b border-current/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.09em] opacity-60">
        <LayoutDashboard className="h-3.5 w-3.5" />
        <span>Quadro aninhado</span>
        <button
          type="button"
          data-no-drag
          onPointerDown={stopDrag}
          onClick={() => node.childBoardId && openBoard(node.childBoardId)}
          className="ml-auto rounded bg-current/10 px-1.5 py-0.5 text-[10px] font-semibold normal-case tracking-normal hover:bg-current/20"
        >
          Abrir
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
        {editing ? (
          <input
            data-no-drag
            autoFocus
            value={node.title ?? ""}
            onChange={(event) => updateNode(node.id, { title: event.target.value }, { label: "Editar quadro" })}
            onPointerDown={stopDrag}
            className="node-input text-[15px] font-semibold"
          />
        ) : (
          <h3 className="text-[15px] font-semibold leading-snug">{childBoard?.title ?? node.title ?? "Quadro"}</h3>
        )}
        <p className="text-[11px] opacity-60">
          {stats.nodes} {stats.nodes === 1 ? "elemento" : "elementos"} · {stats.boards} subquadros ·{" "}
          {stats.tasksDone}/{stats.tasks} tarefas
        </p>

        <div className="mt-auto grid grid-cols-5 gap-1.5">
          {preview.length === 0 ? (
            <div className="col-span-5 rounded-lg border border-dashed border-current/20 px-2 py-4 text-center text-[10px] opacity-45">
              Quadro vazio — abra para começar
            </div>
          ) : (
            preview.map((child) => (
              <div
                key={child.id}
                className={cn("h-7 rounded-md border border-current/10", `node-color-${child.color}`)}
                style={{ backgroundColor: "var(--node-bg)" }}
                title={nodeDisplayTitle(child)}
              />
            ))
          )}
        </div>
      </div>

      {dropActive ? (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center rounded-xl bg-primary/10 ring-2 ring-primary/60">
          <span className="rounded-md bg-popover px-2 py-1 text-[10px] font-semibold shadow">
            Solte para adicionar ao quadro
          </span>
        </div>
      ) : null}
    </div>
  );
}

export function CommentNode({ node }: NodeProps) {
  const updateNode = useAppStore((state) => state.updateNode);
  const toggleResolved = useAppStore((state) => state.toggleCommentResolved);
  const addReply = useAppStore((state) => state.addCommentReply);

  return (
    <div className="node-surface flex h-full flex-col gap-1.5 overflow-hidden rounded-xl border">
      <div className="flex items-center gap-1.5 px-3 pt-2.5 text-[10px] font-semibold uppercase tracking-wide opacity-60">
        <MessageCircle className="h-3.5 w-3.5" />
        <span>Comentário</span>
        {node.resolved ? (
          <span className="ml-auto rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] text-emerald-700 dark:text-emerald-300">
            Resolvido
          </span>
        ) : (
          <span className="ml-auto rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] text-amber-700 dark:text-amber-300">
            Aberto
          </span>
        )}
      </div>

      <div className="px-3 text-[11px] opacity-60">
        {node.author ?? "Você"} · {timeAgo(node.updatedAt)}
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
          <div key={item.id} className="border-t border-current/10 py-1 text-[11px] leading-snug">
            <span className="font-semibold">{item.author}:</span>{" "}
            <span className="opacity-80">{truncate(item.content, 90)}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5 border-t border-current/10 px-3 py-1.5">
        <ReplyInput onSubmit={(text) => addReply(node.id, text)} />
        <button
          type="button"
          data-no-drag
          onPointerDown={stopDrag}
          onClick={() => toggleResolved(node.id)}
          className="shrink-0 rounded bg-current/10 px-2 py-1 text-[10px] font-semibold hover:bg-current/20"
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
