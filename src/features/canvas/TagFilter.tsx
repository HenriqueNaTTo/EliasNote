import { useMemo } from "react";
import { Check, Tag, X } from "lucide-react";
import type { Board } from "@/core/domain/types";
import { collectBoardTags, nodeHasTag, tagKey } from "@/core/domain/tags";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TagFilterProps {
  board: Board;
  /** Chave normalizada da etiqueta ativa, ou `null`. */
  value: string | null;
  onChange: (tag: string | null) => void;
}

/** Filtro de etiqueta do quadro; o estado fica no uiSlice por board. */
export function TagFilter({ board, value, onChange }: TagFilterProps) {
  const options = useMemo(() => collectBoardTags(board), [board]);
  const activeKey = value ? tagKey(value) : null;
  const selected = activeKey ? options.find((option) => option.key === activeKey) : undefined;
  const label = selected?.label ?? activeKey ?? "";

  const matchingCount = useMemo(
    () =>
      activeKey
        ? Object.values(board.nodes).filter(
            (node) => !node.hidden && nodeHasTag(node, activeKey),
          ).length
        : 0,
    [board, activeKey],
  );
  const total = useMemo(
    () => Object.values(board.nodes).filter((node) => !node.hidden).length,
    [board],
  );

  return (
    <div
      data-canvas-ui
      className="absolute right-4 top-4 z-20 flex flex-col items-end gap-1.5"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            aria-label="Filtrar por etiqueta"
            className={cn(
              "h-8 gap-1.5 rounded-none bg-card/90 px-2 text-[11px] shadow-sm",
              activeKey && "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
            )}
          >
            <Tag className="h-3.5 w-3.5" />
            <span className="max-w-[150px] truncate">
              {activeKey ? `#${label}` : "Etiquetas"}
            </span>
            {activeKey ? (
              <span className="rounded-full bg-primary/15 px-1 text-[9px] tabular-nums">
                {matchingCount}
              </span>
            ) : options.length > 0 ? (
              <span className="rounded-full bg-muted px-1 text-[9px] tabular-nums text-muted-foreground">
                {options.length}
              </span>
            ) : null}
          </Button>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-72 p-0">
          <div className="flex items-start justify-between gap-2 border-b border-border px-3 py-2">
            <div>
              <p className="text-xs font-semibold">Filtrar por etiqueta</p>
              <p className="text-[10px] text-muted-foreground">
                Mostre apenas elementos com a etiqueta.
              </p>
            </div>
            {activeKey ? (
              <button
                type="button"
                onClick={() => onChange(null)}
                aria-label="Limpar filtro"
                className="grid h-5 w-5 shrink-0 place-items-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          {options.length === 0 ? (
            <div className="flex flex-col items-center gap-1 px-3 py-7 text-center">
              <Tag className="h-5 w-5 text-muted-foreground/60" />
              <p className="text-xs font-medium">Nenhuma etiqueta neste quadro.</p>
              <p className="max-w-[210px] text-[10px] text-muted-foreground">
                Selecione um elemento e adicione etiquetas no inspector.
              </p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto p-1.5 scrollbar-thin">
              {options.map((option) => {
                const active = option.key === activeKey;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => onChange(active ? null : option.key)}
                    aria-pressed={active}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11px] transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-accent",
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">#{option.label}</span>
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] tabular-nums text-muted-foreground">
                      {option.count}
                    </span>
                    {active ? <Check className="h-3.5 w-3.5 shrink-0" /> : null}
                  </button>
                );
              })}
            </div>
          )}

          {activeKey ? (
            <div className="border-t border-border p-1.5">
              <Button
                variant="ghost"
                size="xs"
                className="w-full justify-start"
                onClick={() => onChange(null)}
              >
                <X className="h-3 w-3" /> Limpar filtro
              </Button>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>

      {activeKey ? (
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label={`Limpar filtro de etiqueta ${label}`}
          className="flex max-w-full items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] text-primary shadow-sm"
        >
          <span>
            {matchingCount} de {total}
          </span>
          <span className="opacity-50">·</span>
          <span className="max-w-[120px] truncate">#{label}</span>
          <X className="h-2.5 w-2.5" />
        </button>
      ) : null}
    </div>
  );
}
