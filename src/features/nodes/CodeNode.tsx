import { useEffect, useState } from "react";
import { Check, Code2, Copy } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/core/store";
import {
  AUTO_LANGUAGE,
  CODE_LANGUAGES,
  MAX_HIGHLIGHT_LENGTH,
  countLines,
  escapeCode,
  highlightCode,
  languageLabel,
  resolveLanguage,
} from "@/lib/code";
import { cn } from "@/lib/utils";
import { nodeColorClass, stopDrag } from "./nodeUi";
import type { NodeProps } from "./types";

const LANGUAGE_OPTIONS = [
  { id: AUTO_LANGUAGE, label: "Automático" },
  ...CODE_LANGUAGES.map((language) => ({ id: language.id, label: language.label })),
];

/**
 * Bloco de código com realce: linguagem explícita ou inferida pela extensão do
 * título (`player.gd` → GDScript), cópia e edição inline.
 */
export function CodeNode({ node, editing }: NodeProps) {
  const updateNode = useAppStore((state) => state.updateNode);
  const content = node.content ?? "";
  const language = resolveLanguage(node);
  const [html, setHtml] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (editing) return;
    let active = true;
    void highlightCode(content, language).then((value) => {
      if (active) setHtml(value);
    });
    return () => {
      active = false;
    };
  }, [content, language, editing]);

  const lines = countLines(content);
  const tooLong = content.length > MAX_HIGHLIGHT_LENGTH;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
      toast.success("Código copiado");
    } catch {
      toast.error("Não foi possível copiar o código");
    }
  };

  return (
    <div
      className={cn(
        "code-node flex h-full w-full flex-col overflow-hidden rounded-none border border-[var(--code-border)]",
        nodeColorClass(node.color),
      )}
    >
      <div
        className="flex h-8 shrink-0 items-center gap-1.5 border-b border-[var(--code-border)] bg-black/[0.04] px-2 dark:bg-white/[0.05]"
        data-no-drag
        onPointerDown={stopDrag}
      >
        <Code2 className="h-3.5 w-3.5 shrink-0 opacity-50" />
        <span className="min-w-0 flex-1 truncate text-[10.5px] font-semibold opacity-80">
          {node.title?.trim() || "código"}
        </span>
        <select
          value={node.language ?? AUTO_LANGUAGE}
          onChange={(event) =>
            updateNode(node.id, { language: event.target.value }, { label: "Linguagem do código" })
          }
          className="max-w-[130px] shrink-0 cursor-pointer truncate bg-transparent text-[10px] font-medium opacity-70 outline-none hover:opacity-100"
          title={languageLabel(language)}
          aria-label="Linguagem do código"
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="shrink-0 text-[9.5px] tabular-nums opacity-45">
          {lines} {lines === 1 ? "linha" : "linhas"}
        </span>
        <button
          type="button"
          onClick={() => void copy()}
          className="grid h-5 w-5 shrink-0 place-items-center rounded opacity-55 transition-opacity hover:opacity-100"
          title="Copiar código"
          aria-label="Copiar código"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>

      {editing ? (
        <textarea
          data-no-drag
          autoFocus
          spellCheck={false}
          value={content}
          onChange={(event) =>
            updateNode(node.id, { content: event.target.value }, { label: "Editar código" })
          }
          onPointerDown={stopDrag}
          onKeyDown={(event) => {
            if (event.key !== "Tab") return;
            event.preventDefault();
            const element = event.currentTarget;
            const start = element.selectionStart;
            const end = element.selectionEnd;
            const next = `${content.slice(0, start)}  ${content.slice(end)}`;
            updateNode(node.id, { content: next }, { label: "Editar código" });
            requestAnimationFrame(() => {
              element.selectionStart = start + 2;
              element.selectionEnd = start + 2;
            });
          }}
          placeholder="Cole ou escreva o código…"
          className="scrollbar-thin min-h-0 flex-1 resize-none bg-transparent px-3 py-2 font-mono text-[11.5px] leading-relaxed outline-none placeholder:opacity-40"
        />
      ) : (
        <pre
          className="scrollbar-thin min-h-0 flex-1 overflow-auto px-3 py-2 font-mono text-[11.5px] leading-relaxed"
          // O HTML vem do highlight.js e já sai sanitizado em `highlightCode`.
          dangerouslySetInnerHTML={{ __html: html || escapeCode(content) }}
        />
      )}

      {tooLong && !editing ? (
        <span className="shrink-0 border-t border-[var(--code-border)] px-2 py-1 text-[9.5px] opacity-55">
          Trecho grande — realce desativado acima de {MAX_HIGHLIGHT_LENGTH.toLocaleString("pt-BR")}{" "}
          caracteres.
        </span>
      ) : null}
    </div>
  );
}
