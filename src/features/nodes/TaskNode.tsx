import { Check } from "lucide-react";
import { useAppStore } from "@/core/store";
import { cn, formatDate } from "@/lib/utils";
import { PRIORITY_LABELS } from "@/core/domain/constants";
import { priorityDotClass, stopDrag } from "./nodeUi";
import type { NodeProps } from "./types";

export function TaskNode({ node }: NodeProps) {
  const updateNode = useAppStore((state) => state.updateNode);
  const toggleTask = useAppStore((state) => state.toggleTask);
  const done = Boolean(node.done);

  return (
    <div className="node-surface flex h-full items-center gap-2.5 overflow-hidden rounded-xl border px-3">
      <button
        type="button"
        data-no-drag
        onPointerDown={stopDrag}
        onClick={() => toggleTask(node.id)}
        aria-label={done ? "Marcar como pendente" : "Marcar como concluída"}
        className={cn(
          "grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
          done ? "border-primary bg-primary text-primary-foreground" : "border-current/30 hover:border-current/60",
        )}
      >
        {done ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
      </button>

      <input
        data-no-drag
        value={node.title ?? ""}
        onChange={(event) => updateNode(node.id, { title: event.target.value }, { label: "Editar tarefa" })}
        onPointerDown={stopDrag}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
            useAppStore.getState().addNode("task", { x: node.x, y: node.y + node.h + 8 });
          }
        }}
        placeholder="Nova tarefa"
        className={cn(
          "node-input min-w-0 flex-1 text-[13px] font-medium placeholder:opacity-40",
          done && "line-through opacity-55",
        )}
      />

      <div className="flex shrink-0 items-center gap-1.5" data-no-drag>
        {node.due ? (
          <span className="rounded bg-current/10 px-1.5 py-0.5 text-[10px] font-medium opacity-80">
            {formatDate(new Date(`${node.due}T12:00:00`).getTime())}
          </span>
        ) : null}
        <span
          className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide opacity-60"
          title={`Prioridade ${PRIORITY_LABELS[node.priority ?? "medium"]}`}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", priorityDotClass(node.priority))} />
        </span>
      </div>
    </div>
  );
}
