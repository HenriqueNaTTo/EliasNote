import { useAppStore } from "@/core/store";
import { cn } from "@/lib/utils";
import { nodeColorClass, stopDrag } from "./nodeUi";
import type { NodeProps } from "./types";

export function CardNode({ node, editing }: NodeProps) {
  const updateNode = useAppStore((state) => state.updateNode);

  return (
    <div
      className={cn(
        "node-surface flex h-full flex-col gap-2 overflow-hidden rounded-none border px-3.5 pb-3.5 pt-3.5",
        nodeColorClass(node.color),
      )}
    >
      {node.label?.trim() ? (
        <span className="w-fit text-[9px] font-semibold uppercase tracking-[0.12em] opacity-55">
          {node.label}
        </span>
      ) : null}
      <input
        data-no-drag
        value={node.title ?? ""}
        onChange={(event) => updateNode(node.id, { title: event.target.value }, { label: "Editar cartão" })}
        onPointerDown={stopDrag}
        placeholder="Título do cartão"
        className="node-input text-[15px] font-semibold leading-snug placeholder:opacity-40"
      />
      {editing ? (
        <textarea
          data-no-drag
          autoFocus
          value={node.description ?? ""}
          onChange={(event) =>
            updateNode(node.id, { description: event.target.value }, { label: "Editar cartão" })
          }
          onPointerDown={stopDrag}
          placeholder="Descrição…"
          className="node-input scrollbar-thin min-h-0 flex-1 resize-none text-xs leading-relaxed opacity-90 placeholder:opacity-40"
        />
      ) : (
        <p className="scrollbar-thin min-h-0 flex-1 overflow-auto whitespace-pre-wrap text-[12.5px] leading-relaxed opacity-75">
          {node.description?.trim() || "Duplo clique para adicionar uma descrição…"}
        </p>
      )}
    </div>
  );
}
