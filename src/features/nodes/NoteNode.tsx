import { PenTool } from "lucide-react";
import { useAppStore } from "@/core/store";
import { parseRef, refForNode } from "@/core/domain/refs";
import type { CanvasNode } from "@/core/domain/types";
import { cn } from "@/lib/utils";
import { MarkdownEditor } from "./MarkdownEditor";
import { MarkdownView } from "./MarkdownView";
import { NodeTypeIcon, nodeColorClass, stopDrag } from "./nodeUi";
import type { NodeProps } from "./types";

export function NoteNode({ node, editing, selected }: NodeProps) {
  const updateNode = useAppStore((state) => state.updateNode);
  const addNode = useAppStore((state) => state.addNode);
  const addReference = useAppStore((state) => state.addReference);
  const openDrawing = useAppStore((state) => state.openDrawing);
  const board = useAppStore((state) => {
    const tab = state.tabs.find((candidate) => candidate.id === state.activeTabId);
    return tab ? state.boards[tab.boardId] : undefined;
  });
  const content = node.content ?? "";
  const words = content.split(/\s+/).filter(Boolean).length;

  const linkedDrawings = (node.references ?? [])
    .map((reference) => parseRef(reference))
    .filter((parsed): parsed is { kind: "node"; id: string } => parsed?.kind === "node")
    .map((parsed) => board?.nodes[parsed.id])
    .filter((candidate): candidate is CanvasNode => candidate?.type === "drawing")
    .slice(0, 3);

  const createLinkedDrawing = () => {
    const drawingId = addNode("drawing", { x: node.x + node.w + 24, y: node.y }, {
      parentId: node.parentId ?? null,
      title: "Desenho da nota",
    });
    if (!drawingId) return;
    addReference(node.id, refForNode(drawingId));
    openDrawing(drawingId);
  };

  return (
    <div
      className={cn(
        "node-surface flex h-full flex-col overflow-hidden rounded-xl border",
        nodeColorClass(node.color),
      )}
    >
      <div className="flex items-center gap-1.5 px-3 pb-1 pt-2.5 text-[10px] font-semibold uppercase tracking-[0.09em] opacity-55">
        <NodeTypeIcon type="note" />
        <span>Nota</span>
        {selected && !editing ? (
          <button
            type="button"
            data-no-drag
            onPointerDown={stopDrag}
            onClick={createLinkedDrawing}
            className="ml-1 rounded p-0.5 opacity-70 hover:bg-current/10 hover:opacity-100"
            title="Criar desenho vinculado a esta nota"
            aria-label="Criar desenho vinculado"
          >
            <PenTool className="h-3 w-3" />
          </button>
        ) : null}
        <span className="ml-auto font-normal normal-case tracking-normal opacity-80">
          {words > 0 ? `${words} ${words === 1 ? "palavra" : "palavras"}` : ""}
        </span>
      </div>
      <div className={cn("scrollbar-thin flex min-h-0 flex-1 flex-col overflow-auto px-3 pb-3", editing && "gap-2")}>
        {editing ? (
          <input
            data-no-drag
            value={node.title ?? ""}
            onChange={(event) => updateNode(node.id, { title: event.target.value }, { label: "Editar nota" })}
            onPointerDown={stopDrag}
            placeholder="Título da nota"
            className="node-input shrink-0 border-b border-current/10 pb-1 text-sm font-semibold placeholder:opacity-40"
          />
        ) : (
          node.title?.trim() && <h3 className="mb-0.5 shrink-0 text-sm font-semibold leading-snug">{node.title}</h3>
        )}

        {editing ? (
          <MarkdownEditor
            value={content}
            onChange={(value) => updateNode(node.id, { content: value }, { label: "Editar nota" })}
            autoFocus
            className="min-h-0 flex-1"
            placeholder="Escreva em Markdown… use # título, - lista, - [ ] tarefa"
          />
        ) : (
          <MarkdownView
            source={content}
            className="text-[13px] leading-relaxed opacity-95"
            emptyPlaceholder="Duplo clique para escrever…"
          />
        )}

        {!editing && linkedDrawings.length > 0 ? (
          <div className="mt-2 grid shrink-0 grid-cols-2 gap-1.5">
            {linkedDrawings.map((drawing) => (
              <button
                key={drawing.id}
                type="button"
                data-no-drag
                onPointerDown={stopDrag}
                onClick={() => openDrawing(drawing.id)}
                className="group/link relative h-16 overflow-hidden rounded-lg border border-current/15 bg-white/60 text-left dark:bg-black/20"
                title={`Editar ${drawing.title || "desenho"}`}
              >
                {drawing.scene?.thumbnail ? (
                  <img
                    src={drawing.scene.thumbnail}
                    alt={drawing.title || "Desenho"}
                    className="h-full w-full object-contain p-1"
                    draggable={false}
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[10px] opacity-60">
                    {drawing.title || "Desenho"}
                  </span>
                )}
                <span className="absolute inset-x-0 bottom-0 bg-black/55 px-1 py-0.5 text-[9px] font-medium text-white opacity-0 transition-opacity group-hover/link:opacity-100">
                  Editar desenho
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
