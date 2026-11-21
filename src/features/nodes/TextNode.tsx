import { useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import { useAppStore } from "@/core/store";
import { stepFontSize, textCssStyle, textFormatOf } from "@/lib/textStyle";
import { cn } from "@/lib/utils";
import { nodeColorClass, stopDrag } from "./nodeUi";
import type { NodeProps } from "./types";

/**
 * Texto avulso: sem moldura de cartão, escrito direto sobre o canvas.
 * O quadro inteiro é a área de escrita — duplo clique entra em edição.
 * Negrito, itálico, sublinhado, riscado, tamanho, fonte e alinhamento vêm
 * dos campos do nó (barra de formatação e inspector).
 */
export function TextNode({ node, editing, selected }: NodeProps) {
  const updateNode = useAppStore((state) => state.updateNode);
  const content = node.content ?? "";
  const style = textCssStyle(node);
  const format = textFormatOf(node);
  const contentRef = useRef<HTMLElement | null>(null);

  const toggle = (field: "bold" | "italic" | "underline" | "strike") =>
    updateNode(node.id, { [field]: !node[field] }, { label: "Formatar texto" });

  // Cresce junto com o texto e com o tamanho da fonte; o usuário ainda pode redimensionar à mão.
  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;
    const needed = Math.ceil(element.scrollHeight + 12);
    if (needed > node.h + 2) updateNode(node.id, { h: needed }, { label: "Ajustar altura do texto" });
  }, [
    content,
    node.h,
    node.fontSize,
    node.fontFamily,
    node.bold,
    node.italic,
    node.underline,
    node.strike,
    node.align,
    editing,
    updateNode,
    node.id,
  ]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(event.ctrlKey || event.metaKey)) return;
    const key = event.key.toLowerCase();
    if (key === "b") {
      event.preventDefault();
      toggle("bold");
      return;
    }
    if (key === "i") {
      event.preventDefault();
      toggle("italic");
      return;
    }
    if (key === "u") {
      event.preventDefault();
      toggle("underline");
      return;
    }
    if (key === "x" && event.shiftKey) {
      event.preventDefault();
      toggle("strike");
      return;
    }
    if (key === "=" || key === "+") {
      event.preventDefault();
      updateNode(node.id, { fontSize: stepFontSize(format.fontSize, 2) }, { label: "Formatar texto" });
      return;
    }
    if (key === "-" || key === "_") {
      event.preventDefault();
      updateNode(node.id, { fontSize: stepFontSize(format.fontSize, -2) }, { label: "Formatar texto" });
    }
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
          ref={(element) => {
            contentRef.current = element;
          }}
          data-no-drag
          autoFocus
          value={content}
          onChange={(event) => updateNode(node.id, { content: event.target.value }, { label: "Editar texto" })}
          onPointerDown={stopDrag}
          onKeyDown={handleKeyDown}
          placeholder="Escreva algo…"
          style={style}
          className="node-input scrollbar-thin min-h-0 flex-1 resize-none leading-relaxed placeholder:opacity-40"
        />
      ) : (
        <p
          ref={(element) => {
            contentRef.current = element;
          }}
          style={style}
          className="scrollbar-thin min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words leading-relaxed"
        >
          {content.trim() ? content : <span className="opacity-35">Texto</span>}
        </p>
      )}
    </div>
  );
}
