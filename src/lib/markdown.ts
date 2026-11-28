import { useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { stripHtml } from "@/lib/utils";

marked.setOptions({ gfm: true, breaks: true });

export function renderMarkdown(source: string): string {
  if (!source || !source.trim()) return "";
  const html = marked.parse(source, { async: false }) as string;
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ["target", "rel", "class", "checked", "disabled", "type"],
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "style"],
    // Permite links internos do EliasNote (notas/quadros importados do Obsidian).
    ALLOWED_URI_REGEXP:
      /^(?:(?:https?|mailto|tel|file|sms|data|blob|eliasnote):|[^a-z+.\-:]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
}

export function markdownToPlainText(source: string): string {
  return stripHtml(renderMarkdown(source));
}

export function useRenderedMarkdown(source: string): string {
  return useMemo(() => renderMarkdown(source), [source]);
}

export interface MarkdownStats {
  words: number;
  characters: number;
}

export function markdownStats(source: string): MarkdownStats {
  const text = markdownToPlainText(source);
  const words = text.split(/\s+/).filter(Boolean).length;
  return { words, characters: text.length };
}

/** Aplica uma ação de formatação simples em uma seleção de textarea. */
export type MarkdownAction =
  | "bold"
  | "italic"
  | "strike"
  | "underline"
  | "sup"
  | "sub"
  | "code"
  | "heading"
  | "bullet"
  | "numbered"
  | "task"
  | "quote"
  | "link"
  | "divider";

export interface TextSelection {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

export interface TextSelectionResult {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

export function applyMarkdownAction(state: TextSelection, action: MarkdownAction): TextSelectionResult {
  const { value, selectionStart, selectionEnd } = state;
  const selected = value.slice(selectionStart, selectionEnd);
  const before = value.slice(0, selectionStart);
  const after = value.slice(selectionEnd);

  const wrap = (prefix: string, suffix = prefix, placeholder = "texto") => {
    // Clicar de novo no mesmo estilo remove os marcadores em volta da seleção.
    if (
      selected &&
      before.endsWith(prefix) &&
      after.startsWith(suffix)
    ) {
      return {
        value: `${before.slice(0, -prefix.length)}${selected}${after.slice(suffix.length)}`,
        selectionStart: selectionStart - prefix.length,
        selectionEnd: selectionEnd - prefix.length,
      };
    }
    const inner = selected || placeholder;
    return {
      value: `${before}${prefix}${inner}${suffix}${after}`,
      selectionStart: before.length + prefix.length,
      selectionEnd: before.length + prefix.length + inner.length,
    };
  };

  const prefixLine = (prefix: string, placeholder: string) => {
    const lineStart = before.lastIndexOf("\n") + 1;
    const lineEnd = value.indexOf("\n", selectionEnd) === -1 ? value.length : value.indexOf("\n", selectionEnd);

    if (selected.includes("\n")) {
      const block = value.slice(lineStart, selectionEnd);
      const prefixed = block
        .split("\n")
        .map((line, index) => {
          if (index === 0) return `${prefix}${line}`;
          return `${prefix.replace(/\d+\./, `${index + 1}.`)}${line}`;
        })
        .join("\n");
      return {
        value: `${value.slice(0, lineStart)}${prefixed}${value.slice(selectionEnd)}`,
        selectionStart: lineStart + prefix.length,
        selectionEnd: lineStart + prefixed.length,
      };
    }

    const currentLine = value.slice(lineStart, lineEnd);
    const insertion = !selected && currentLine.trim() === "" ? `${prefix}${placeholder}` : prefix;
    return {
      value: `${value.slice(0, lineStart)}${insertion}${value.slice(lineStart)}`,
      selectionStart: lineStart + insertion.length,
      selectionEnd: lineStart + insertion.length,
    };
  };

  switch (action) {
    case "bold":
      return wrap("**", "**", "negrito");
    case "italic":
      return wrap("_", "_", "itálico");
    case "strike":
      return wrap("~~", "~~", "riscado");
    case "underline":
      return wrap("<u>", "</u>", "sublinhado");
    case "sup":
      return wrap("<sup>", "</sup>", "2");
    case "sub":
      return wrap("<sub>", "</sub>", "2");
    case "code":
      return selected.includes("\n")
        ? wrap("```\n", "\n```", "código")
        : wrap("`", "`", "código");
    case "heading":
      return prefixLine("## ", "Título");
    case "bullet":
      return prefixLine("- ", "Item");
    case "numbered":
      return prefixLine("1. ", "Item");
    case "task":
      return prefixLine("- [ ] ", "Tarefa");
    case "quote":
      return prefixLine("> ", "Citação");
    case "link": {
      const label = selected || "texto do link";
      return {
        value: `${before}[${label}](https://)${after}`,
        selectionStart: before.length + label.length + 3,
        selectionEnd: before.length + label.length + 11,
      };
    }
    case "divider": {
      const needsNewline = before.length > 0 && !before.endsWith("\n");
      const insertion = `${needsNewline ? "\n" : ""}---\n`;
      return {
        value: `${before}${insertion}${after}`,
        selectionStart: before.length + insertion.length,
        selectionEnd: before.length + insertion.length,
      };
    }
    default:
      return { value, selectionStart, selectionEnd };
  }
}

/** Extrai tarefas `- [ ]` de um markdown, usado pelo painel de tarefas do quadro. */
export function extractMarkdownTasks(source: string): { text: string; done: boolean }[] {
  const tasks: { text: string; done: boolean }[] = [];
  const pattern = /^\s*[-*]\s*\[( |x|X)\]\s+(.+)$/gm;
  let match: RegExpExecArray | null = null;
  while ((match = pattern.exec(source))) {
    tasks.push({ done: match[1].toLowerCase() === "x", text: match[2].trim() });
  }
  return tasks;
}
