import { useMemo, useState } from "react";
import { ArrowRightLeft, ChevronRight, Copy, Search } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/core/store";
import { useActiveBoardId } from "@/core/store/selectors";
import { COLOR_DOT_CLASS } from "@/core/domain/constants";
import { buildBoardTree, type BoardTreeNode } from "@/core/domain/tree";
import type { Board } from "@/core/domain/types";
import { cn, plural } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BoardOption {
  board: Board;
  depth: number;
}

function flattenTree(nodes: BoardTreeNode[], result: BoardOption[] = []): BoardOption[] {
  for (const node of nodes) {
    result.push({ board: node.board, depth: node.depth });
    flattenTree(node.children, result);
  }
  return result;
}

/** Escolhe o quadro de destino para mover ou copiar os elementos selecionados. */
export function NodeTransferDialog() {
  const transfer = useAppStore((state) => state.nodeTransfer);
  const close = useAppStore((state) => state.closeNodeTransfer);
  const transferNodes = useAppStore((state) => state.transferNodes);
  const openBoard = useAppStore((state) => state.openBoard);
  const boards = useAppStore((state) => state.boards);
  const workspaceId = useAppStore((state) => state.activeWorkspaceId);
  const activeBoardId = useActiveBoardId();
  const [query, setQuery] = useState("");

  const options = useMemo(() => {
    const term = query.trim().toLowerCase();
    return flattenTree(buildBoardTree(boards, workspaceId)).filter(({ board }) => {
      if (board.id === activeBoardId) return false;
      return term === "" || board.title.toLowerCase().includes(term);
    });
  }, [boards, workspaceId, activeBoardId, query]);

  const mode = transfer?.mode ?? "move";
  const isMove = mode === "move";
  const count = transfer?.nodeIds.length ?? 0;

  const closeDialog = () => {
    setQuery("");
    close();
  };

  const run = (board: Board) => {
    if (!transfer) return;
    const result = transferNodes(transfer.nodeIds, board.id, transfer.mode);
    if (!result) {
      toast.error("Não foi possível transferir os elementos.");
      return;
    }
    toast.success(`${isMove ? "Movido" : "Copiado"} para "${result.title}"`, {
      description: `${result.count} ${plural(result.count, "elemento", "elementos")} · Ctrl+Z desfaz`,
      action: { label: "Abrir", onClick: () => openBoard(result.boardId) },
    });
    closeDialog();
  };

  return (
    <Dialog open={Boolean(transfer)} onOpenChange={(open) => (open ? undefined : closeDialog())}>
      <DialogContent className="max-w-md gap-0 p-0">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle className="flex items-center gap-2">
            {isMove ? (
              <ArrowRightLeft className="h-4 w-4 text-primary" />
            ) : (
              <Copy className="h-4 w-4 text-primary" />
            )}
            {isMove ? "Mover para outro quadro" : "Copiar para outro quadro"}
          </DialogTitle>
          <DialogDescription>
            {count} {plural(count, "elemento selecionado", "elementos selecionados")} —{" "}
            {isMove
              ? "o conteúdo sai deste quadro e aparece centralizado no destino."
              : "uma cópia é criada no destino e os originais continuam aqui."}
          </DialogDescription>
        </DialogHeader>

        <div className="relative border-b border-border px-4 py-2">
          <Search className="pointer-events-none absolute left-[26px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar quadro de destino…"
            className="h-8 pl-8 text-[12.5px]"
            autoFocus
          />
        </div>

        <div className="scrollbar-thin max-h-[52vh] min-h-[132px] overflow-y-auto p-2">
          {options.length === 0 ? (
            <p className="px-3 py-8 text-center text-[11.5px] leading-relaxed text-muted-foreground">
              {query.trim()
                ? "Nenhum quadro encontrado."
                : "Crie outro quadro neste espaço para poder mover ou copiar elementos."}
            </p>
          ) : (
            options.map(({ board, depth }) => {
              const total = Object.keys(board.nodes).length;
              return (
                <button
                  key={board.id}
                  type="button"
                  onClick={() => run(board)}
                  className="group/dest flex w-full items-center gap-2 rounded-none border border-transparent px-2 py-1.5 text-left transition-colors hover:border-border hover:bg-accent"
                >
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      COLOR_DOT_CLASS[board.color] ?? "bg-primary",
                    )}
                  />
                  <span
                    className="min-w-0 flex-1 truncate text-[12.5px]"
                    style={{ paddingLeft: depth * 12 }}
                  >
                    {board.title}
                  </span>
                  <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                    {total} {plural(total, "item", "itens")}
                  </span>
                  <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/dest:opacity-100" />
                </button>
              );
            })
          )}
        </div>

        <DialogFooter className="border-t border-border px-4 py-3">
          <Button variant="ghost" size="sm" onClick={closeDialog}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
