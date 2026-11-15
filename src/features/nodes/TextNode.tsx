import { useAppStore } from "@/core/store";
import { cn } from "@/lib/utils";
import { nodeColorClass, stopDrag } from "./nodeUi";
import type { NodeProps } from "./types";

/**
 * Texto avulso: sem moldura de cartão, escrito direto sobre o canvas.
 * O quadro inteiro é a área de escrita — duplo clique entra em edição.
 */
export function TextNode({ node, editing, selected }: NodeProps) {
  const updateNode = useAppStore((state) => state.updateNode);
  const content = node.content ?? "";

  const handleChange = (element: HTMLTextAreaElement, value: string) => {
    updateNode(node.id, { content: value }, { label: "Editar texto" });
    // Cresce junto com o texto; o usuário ainda pode redimensionar à mão.
    const needed = Math.ceil(element.scrollHeight + 12);
    if (needed > node.h + 2) updateNode(node.id, { h: needed }, { label: "Editar texto" });
  };

  return (
    <div
      className={cn(
        "node-text flex h-full w-full flex-col overflow-hidden border border-transparent px-1.5 py-1",
        nodeColorClass(node.color),
        selected && "border-dashed border-current/30",
      )}
    >
      {editing ? (
        <textarea
          data-no-drag
          autoFocus
          value={content}
          onChange={(event) => handleChange(event.currentTarget, event.target.value)}
          onPointerDown={stopDrag}
          placeholder="Escreva algo…"
          className="node-input scrollbar-thin min-h-0 flex-1 resize-none text-[14px] leading-relaxed placeholder:opacity-40"
        />
      ) : (
        <p className="scrollbar-thin min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words text-[14px] leading-relaxed">
          {content.trim() ? content : <span className="opacity-35">Texto</span>}
        </p>
      )}
    </div>
  );
}
