import { X } from "lucide-react";
import { useAppStore } from "@/core/store";
import { NODE_LABELS } from "@/core/domain/constants";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NodeTypeIcon } from "./nodeUi";
import { MarkdownEditor } from "./MarkdownEditor";

/**
 * Edição de nota em uma área grande. O cartão no canvas pode ficar pequeno
 * demais para o conteúdo; o modal preserva o editor Markdown completo.
 */
export function NoteDialog() {
  const open = useAppStore((state) => state.dialog === "note");
  const closeDialog = useAppStore((state) => state.closeDialog);
  const updateNode = useAppStore((state) => state.updateNode);
  const noteFontSize = useAppStore((state) => state.settings.noteFontSize);
  const node = useAppStore((state) => {
    if (!state.noteNodeId) return undefined;
    for (const board of Object.values(state.boards)) {
      const found = board.nodes[state.noteNodeId];
      if (found) return found;
    }
    return undefined;
  });
  const boardTitle = useAppStore((state) => {
    if (!state.noteNodeId) return "";
    for (const board of Object.values(state.boards)) {
      if (board.nodes[state.noteNodeId]) return board.title;
    }
    return "";
  });

  if (!open || !node || node.type !== "note") return null;

  return (
    <Dialog open={open} onOpenChange={(value) => (value ? undefined : closeDialog())}>
      <DialogContent
        className="flex h-[min(92vh,880px)] w-[min(96vw,1100px)] max-w-none flex-col gap-0 overflow-hidden p-0"
        hideClose
      >
        <DialogTitle className="sr-only">Editar nota</DialogTitle>

        <header className="flex shrink-0 items-center gap-2.5 border-b border-border px-4 py-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300">
            <NodeTypeIcon type="note" className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <Input
              value={node.title ?? ""}
              onChange={(event) =>
                updateNode(node.id, { title: event.target.value }, { label: "Editar título da nota" })
              }
              placeholder="Título da nota"
              aria-label="Título da nota"
              className="h-8 border-transparent bg-transparent px-1 text-[15px] font-semibold shadow-none focus-visible:border-input"
            />
            <p className="truncate px-1 text-[10px] text-muted-foreground">
              {boardTitle} · {NODE_LABELS[node.type]} · {node.w}×{node.h}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={closeDialog}
            aria-label="Fechar editor de nota"
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col px-6 py-4">
          <MarkdownEditor
            value={node.content ?? ""}
            onChange={(value) => updateNode(node.id, { content: value }, { label: "Editar nota" })}
            autoFocus
            ariaLabel="Conteúdo da nota"
            fontSize={noteFontSize}
            className="h-full"
            placeholder="Escreva a nota em Markdown… use # título, - lista, - [ ] tarefa e **negrito**"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
