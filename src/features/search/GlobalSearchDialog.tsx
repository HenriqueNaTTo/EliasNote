import { useEffect, useMemo, useRef, useState } from "react";
import { CornerDownLeft, FileText, Search } from "lucide-react";
import { useAppStore } from "@/core/store";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { searchBoards } from "@/core/search/search";
import { NODE_LABELS } from "@/core/domain/constants";
import { boardPath } from "@/core/domain/tree";
import type { NodeType, SearchResult } from "@/core/domain/types";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { NodeTypeIcon } from "@/features/nodes/nodeUi";
import { focusNode } from "@/features/canvas/viewportActions";

const FILTERS: { id: NodeType | "all"; label: string }[] = [
  { id: "all", label: "Tudo" },
  { id: "note", label: "Notas" },
  { id: "text", label: "Textos" },
  { id: "code", label: "Código" },
  { id: "task", label: "Tarefas" },
  { id: "checklist", label: "Checklists" },
  { id: "board", label: "Quadros" },
  { id: "drawing", label: "Desenhos" },
  { id: "link", label: "Links" },
  { id: "image", label: "Imagens" },
  { id: "comment", label: "Comentários" },
];

export function GlobalSearchDialog() {
  const open = useAppStore((state) => state.dialog === "search");
  const close = useAppStore((state) => state.closeDialog);
  const boards = useAppStore((state) => state.boards);
  const openBoard = useAppStore((state) => state.openBoard);
  const select = useAppStore((state) => state.select);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<NodeType | "all">("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const debouncedQuery = useDebouncedValue(query, 110);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(
    () => searchBoards(boards, debouncedQuery, { type: filter, limit: 40 }),
    [boards, debouncedQuery, filter],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery, filter]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setFilter("all");
      setActiveIndex(0);
    }
  }, [open]);

  useEffect(() => {
    const element = listRef.current?.querySelector<HTMLElement>(`[data-result-index="${activeIndex}"]`);
    element?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const choose = (result: SearchResult) => {
    openBoard(result.boardId);
    requestAnimationFrame(() => {
      if (result.kind === "node") {
        select([result.id]);
        focusNode(result.id);
      }
    });
    close();
  };

  return (
    <Dialog open={open} onOpenChange={(value) => (value ? undefined : close())}>
      <DialogContent
        className="top-[10%] max-w-2xl translate-y-0 gap-0 overflow-hidden p-0"
        hideClose
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          document.getElementById("global-search-input")?.focus();
        }}
      >
        <DialogTitle className="sr-only">Busca global</DialogTitle>
        <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            id="global-search-input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar em todos os quadros, notas, tarefas e desenhos…"
            className="h-7 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            autoFocus
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActiveIndex((index) => Math.min(results.length - 1, index + 1));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveIndex((index) => Math.max(0, index - 1));
              } else if (event.key === "Enter") {
                event.preventDefault();
                const result = results[activeIndex];
                if (result) choose(result);
              }
            }}
          />
          <button
            type="button"
            onClick={close}
            className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-accent"
          >
            Esc
          </button>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto border-b border-border px-3 py-1.5 scrollbar-thin">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                filter === item.id
                  ? "bg-primary/12 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div ref={listRef} className="max-h-[52vh] min-h-[160px] overflow-y-auto p-2 scrollbar-thin">
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-1.5 py-10 text-center">
              <FileText className="h-5 w-5 text-muted-foreground/60" />
              <p className="text-xs text-muted-foreground">
                {query.trim() ? "Nada encontrado para esta busca." : "Nenhum elemento recente."}
              </p>
            </div>
          ) : (
            results.map((result, index) => (
              <button
                key={`${result.kind}:${result.id}`}
                data-result-index={index}
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(result)}
                className={cn(
                  "flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                  index === activeIndex ? "bg-accent" : "hover:bg-accent/60",
                )}
              >
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                  <NodeTypeIcon type={result.kind === "board" ? "board" : (result.type as NodeType)} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-[12.5px] font-medium">{result.title}</span>
                    <span className="shrink-0 text-[9.5px] uppercase tracking-wide text-muted-foreground">
                      {result.kind === "board" ? "Quadro" : NODE_LABELS[result.type as NodeType]}
                    </span>
                  </span>
                  {result.snippet ? (
                    <span className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{result.snippet}</span>
                  ) : null}
                  <span className="mt-0.5 block truncate text-[9.5px] text-muted-foreground/80">
                    {boardPath(boards, result.boardId)
                      .map((board) => board.title)
                      .join(" / ")}
                  </span>
                </span>
                {index === activeIndex ? (
                  <CornerDownLeft className="mt-1 h-3 w-3 shrink-0 text-muted-foreground" />
                ) : null}
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-3 py-1.5 text-[10px] text-muted-foreground">
          <span>{results.length} resultados</span>
          <span>↑ ↓ navegar · Enter abrir · Esc fechar</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
