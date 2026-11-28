import type { Tree } from "@lezer/common";
import { markdownLanguage } from "@codemirror/lang-markdown";

/**
 * Plano de “live preview” do editor de notas. A partir da árvore markdown,
 * separa o que deve ser escondido fora da linha ativa (marcadores), o que deve
 * virar widget (bolinha, checkbox, régua) e o que deve ser apenas estilizado.
 *
 * É uma função pura para poder ser testada sem CodeMirror/editor.
 */

export type LivePreviewLineKind =
  | "heading"
  | "quote"
  | "code"
  | "task"
  | "bullet"
  | "ordered"
  | "hr"
  | "table"
  | "paragraph";

export interface LivePreviewLine {
  /** 1-based. */
  number: number;
  from: number;
  to: number;
  kind: LivePreviewLineKind;
  headingLevel?: number;
}

export interface LivePreviewHidden {
  from: number;
  to: number;
  /** `markup` = sintaxe visível só na linha ativa; `url` = destino do link. */
  kind: "markup" | "url";
}

export interface LivePreviewWidget {
  from: number;
  to: number;
  kind: "bullet" | "task" | "hr";
  checked?: boolean;
}

export type LivePreviewMarkKind =
  | "strong"
  | "emphasis"
  | "strike"
  | "code"
  | "link"
  | "underline"
  | "sup"
  | "sub";

export interface LivePreviewMark {
  from: number;
  to: number;
  kind: LivePreviewMarkKind;
}

export interface LivePreviewPlan {
  lines: LivePreviewLine[];
  hidden: LivePreviewHidden[];
  widgets: LivePreviewWidget[];
  marks: LivePreviewMark[];
}

interface SyntaxNode {
  name: string;
  from: number;
  to: number;
}

const MARKUP_NODES = new Set([
  "HeaderMark",
  "QuoteMark",
  "EmphasisMark",
  "StrikethroughMark",
  "CodeMark",
  "CodeInfo",
  "LinkMark",
]);

const HEADING = /^ATXHeading([1-6])$/;

function buildLineStarts(source: string): number[] {
  const starts = [0];
  for (let index = 0; index < source.length; index += 1) {
    if (source[index] === "\n") starts.push(index + 1);
  }
  return starts;
}

function lineOf(starts: readonly number[], position: number): number {
  let low = 0;
  let high = starts.length - 1;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (starts[middle] <= position) low = middle;
    else high = middle - 1;
  }
  return low + 1;
}

function extendSpaces(source: string, position: number): number {
  let end = position;
  while (end < source.length && (source[end] === " " || source[end] === "\t")) end += 1;
  return end;
}

function contentBetween(
  node: SyntaxNode,
  children: readonly SyntaxNode[],
  name: string,
): { from: number; to: number } | null {
  const marks = children
    .filter(
      (child) => child.name === name && child.from >= node.from && child.to <= node.to,
    )
    .sort((a, b) => a.from - b.from);
  if (marks.length < 2) return null;
  return { from: marks[0].to, to: marks[marks.length - 1].from };
}

/**
 * Calcula as decorações para o documento.
 *
 * @param activeLines linhas (1-based) que devem mostrar a marcação.
 * @param options limita o cálculo ao intervalo visível e permite reaproveitar
 *                a árvore já parseada pelo editor.
 */
export function planLivePreview(
  source: string,
  activeLines: Iterable<number> = [],
  options: { fromLine?: number; toLine?: number; tree?: Tree } = {},
): LivePreviewPlan {
  const plan: LivePreviewPlan = { lines: [], hidden: [], widgets: [], marks: [] };
  if (!source) return plan;

  const starts = buildLineStarts(source);
  const active = new Set(activeLines);
  const firstLine = Math.max(1, options.fromLine ?? 1);
  const lastLine = Math.min(starts.length, options.toLine ?? starts.length);
  const tree = options.tree ?? markdownLanguage.parser.parse(source);

  const nodes: SyntaxNode[] = [];
  tree.iterate({
    enter: (node) => {
      nodes.push({ name: node.name, from: node.from, to: node.to });
    },
  });

  const byLine = new Map<number, SyntaxNode[]>();
  for (const node of nodes) {
    const line = lineOf(starts, node.from);
    if (line < firstLine || line > lastLine) continue;
    const bucket = byLine.get(line);
    if (bucket) bucket.push(node);
    else byLine.set(line, [node]);
  }

  const codeRanges = nodes.filter((node) => node.name === "FencedCode" || node.name === "CodeBlock");

  for (let number = firstLine; number <= lastLine; number += 1) {
    const from = starts[number - 1];
    const to = number < starts.length ? starts[number] - 1 : source.length;
    const text = source.slice(from, to);
    const trimmed = text.replace(/\r$/, "");
    if (!trimmed.trim()) continue;

    const lineNodes = byLine.get(number) ?? [];
    const hidden = !active.has(number);
    const inCode = codeRanges.some((range) => from >= range.from && from <= range.to);
    const kinds: LivePreviewLineKind[] = [];

    for (const node of lineNodes) {
      const heading = HEADING.exec(node.name);
      if (heading) {
        plan.lines.push({
          number,
          from,
          to,
          kind: "heading",
          headingLevel: Number(heading[1]),
        });
      }

      if (node.name === "QuoteMark") kinds.push("quote");

      if (node.name === "HorizontalRule") {
        if (hidden) plan.widgets.push({ from, to, kind: "hr" });
        kinds.push("hr");
      }

      if (node.name === "ListMark" && !inCode) {
        const markText = source.slice(node.from, node.to);
        const taskMarker = lineNodes.find((candidate) => candidate.name === "TaskMarker");
        if (taskMarker) {
          if (hidden) {
            const marker = source.slice(taskMarker.from, taskMarker.to);
            plan.widgets.push({
              from: node.from,
              to: extendSpaces(source, taskMarker.to),
              kind: "task",
              checked: /\[[xX]\]/.test(marker),
            });
          }
          kinds.push("task");
        } else if (/^[-*+]$/.test(markText)) {
          if (hidden) {
            plan.widgets.push({
              from: node.from,
              to: extendSpaces(source, node.to),
              kind: "bullet",
            });
          }
          kinds.push("bullet");
        } else {
          kinds.push("ordered");
        }
      }

      if (MARKUP_NODES.has(node.name)) {
        if (hidden) {
          plan.hidden.push({
            from: node.from,
            to: node.name === "HeaderMark" || node.name === "QuoteMark" ? extendSpaces(source, node.to) : node.to,
            kind: "markup",
          });
        }
        continue;
      }

      if (node.name === "URL" && hidden) {
        plan.hidden.push({ from: node.from, to: node.to, kind: "url" });
        continue;
      }

      const mark = markOf(node, lineNodes);
      if (mark) plan.marks.push(mark);
    }

    if (inCode) kinds.push("code");
    if (lineNodes.some((node) => node.name === "TableDelimiter" || node.name === "TableCell")) {
      kinds.push("table");
    }

    // <u>, <sup> e <sub> não têm nó próprio no Lezer: resolve com regex por linha.
    for (const tag of ["u", "sup", "sub"] as const) {
      const pattern = new RegExp(`<${tag}>(.*?)</${tag}>`, "g");
      for (const match of trimmed.matchAll(pattern)) {
        const start = from + (match.index ?? 0);
        const openEnd = start + tag.length + 2;
        const closeStart = start + match[0].length - (tag.length + 3);
        if (hidden) {
          plan.hidden.push({ from: start, to: openEnd, kind: "markup" });
          plan.hidden.push({ from: closeStart, to: start + match[0].length, kind: "markup" });
        }
        if (closeStart > openEnd) {
          plan.marks.push({ from: openEnd, to: closeStart, kind: tag === "u" ? "underline" : tag });
        }
      }
    }

    if (kinds.length > 0) {
      const hasHeading = kinds.includes("heading");
      const kind: LivePreviewLineKind = hasHeading
        ? "heading"
        : kinds.includes("code")
          ? "code"
          : kinds.includes("hr")
            ? "hr"
            : kinds.includes("task")
              ? "task"
              : kinds.includes("quote")
                ? "quote"
                : kinds.includes("bullet")
                  ? "bullet"
                  : kinds.includes("ordered")
                    ? "ordered"
                    : kinds.includes("table")
                      ? "table"
                      : "paragraph";
      const existing = plan.lines.find((line) => line.number === number);
      if (!existing) plan.lines.push({ number, from, to, kind });
      else if (existing.kind !== "heading") existing.kind = kind;
    }
  }

  plan.hidden.sort((a, b) => a.from - b.from || a.to - b.to);
  plan.widgets.sort((a, b) => a.from - b.from || a.to - b.to);
  plan.marks.sort((a, b) => a.from - b.from || a.to - b.to);
  plan.lines.sort((a, b) => a.number - b.number);
  return plan;
}

function markOf(node: SyntaxNode, lineNodes: readonly SyntaxNode[]): LivePreviewMark | null {
  switch (node.name) {
    case "StrongEmphasis": {
      const range = contentBetween(node, lineNodes, "EmphasisMark");
      return range ? { ...range, kind: "strong" } : null;
    }
    case "Emphasis": {
      const range = contentBetween(node, lineNodes, "EmphasisMark");
      return range ? { ...range, kind: "emphasis" } : null;
    }
    case "Strikethrough": {
      const range = contentBetween(node, lineNodes, "StrikethroughMark");
      return range ? { ...range, kind: "strike" } : null;
    }
    case "InlineCode": {
      const range = contentBetween(node, lineNodes, "CodeMark");
      return range ? { ...range, kind: "code" } : null;
    }
    case "Link": {
      const marks = lineNodes
        .filter((child) => child.name === "LinkMark" && child.from >= node.from && child.to <= node.to)
        .sort((a, b) => a.from - b.from);
      if (marks.length < 2) return null;
      return { from: marks[0].to, to: marks[1].from, kind: "link" };
    }
    default:
      return null;
  }
}

/** Linhas que o cursor/seleção está ocupando (1-based). */
export function activeLineNumbers(
  lineStarts: readonly number[],
  ranges: readonly { from: number; to: number }[],
): Set<number> {
  const lines = new Set<number>();
  for (const range of ranges) {
    const from = lineOf(lineStarts, range.from);
    const to = lineOf(lineStarts, range.to);
    for (let line = from; line <= to; line += 1) lines.add(line);
  }
  return lines;
}

export { buildLineStarts, lineOf };
