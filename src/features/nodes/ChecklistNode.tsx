import { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { useAppStore } from "@/core/store";
import { cn } from "@/lib/utils";
import { nodeColorClass, stopDrag } from "./nodeUi";
import type { NodeProps } from "./types";

export function ChecklistNode({ node }: NodeProps) {
  const updateNode = useAppStore((state) => state.updateNode);
  const addChecklistItem = useAppStore((state) => state.addChecklistItem);
  const updateChecklistItem = useAppStore((state) => state.updateChecklistItem);
  const removeChecklistItem = useAppStore((state) => state.removeChecklistItem);
  const [draft, setDraft] = useState("");

  const items = node.items ?? [];
  const done = items.filter((item) => item.done).length;

  const submitDraft = () => {
    const text = draft.trim();
    if (!text) return;
    addChecklistItem(node.id, text);
    setDraft("");
  };

  return (
    <div
      className={cn(
        "node-surface flex h-full flex-col overflow-hidden rounded-none border",
        nodeColorClass(node.color),
      )}
    >
      <div className="flex items-center gap-2 px-3 pb-2 pt-3">
        <input
          data-no-drag
          value={node.title ?? ""}
          onChange={(event) => updateNode(node.id, { title: event.target.value }, { label: "Editar checklist" })}
          onPointerDown={stopDrag}
          placeholder="Checklist"
          className="node-input min-w-0 flex-1 text-[13px] font-semibold placeholder:opacity-40"
        />
        <span className="shrink-0 rounded-none bg-current/10 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums opacity-75">
          {done}/{items.length}
        </span>
      </div>

      <div className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-0.5 overflow-auto px-2 pb-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="group/item flex items-start gap-2 rounded-none px-1.5 py-1 hover:bg-current/[0.06]"
          >
            <button
              type="button"
              data-no-drag
              onPointerDown={stopDrag}
              onClick={() => updateChecklistItem(node.id, item.id, { done: !item.done })}
              className={cn(
                "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-none border transition-colors",
                item.done
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-current/30 hover:border-current/60",
              )}
              aria-label={item.done ? "Desmarcar item" : "Concluir item"}
            >
              {item.done ? <Check className="h-2.5 w-2.5" strokeWidth={3.5} /> : null}
            </button>
            <input
              data-no-drag
              value={item.text}
              onChange={(event) =>
                updateChecklistItem(node.id, item.id, { text: event.target.value })
              }
              onPointerDown={stopDrag}
              className={cn(
                "node-input flex-1 text-[12.5px] leading-snug",
                item.done && "line-through opacity-50",
              )}
            />
            <button
              type="button"
              data-no-drag
              onPointerDown={stopDrag}
              onClick={() => removeChecklistItem(node.id, item.id)}
              className="mt-0.5 shrink-0 rounded p-0.5 opacity-0 transition-opacity hover:bg-black/10 group-hover/item:opacity-60 dark:hover:bg-white/10"
              aria-label="Remover item"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}

        <div className="flex items-center gap-2 px-1.5 py-1">
          <span className="grid h-4 w-4 place-items-center rounded-none border border-dashed border-current/25 opacity-50">
            <Plus className="h-2.5 w-2.5" />
          </span>
          <input
            data-no-drag
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onPointerDown={stopDrag}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submitDraft();
              }
            }}
            onBlur={submitDraft}
            placeholder="Adicionar item…"
            className="node-input flex-1 text-[12.5px] placeholder:opacity-40"
          />
        </div>
      </div>
    </div>
  );
}
