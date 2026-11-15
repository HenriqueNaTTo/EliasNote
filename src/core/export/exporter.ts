import type { Board, CanvasNode, Connector, NodeColor } from "@/core/domain/types";
import { NODE_LABELS } from "@/core/domain/constants";
import { boardPath } from "@/core/domain/tree";
import { formatDateTime, safeJsonParse } from "@/lib/utils";
import { markdownToSearchText } from "@/core/search/search";

export const BOARD_EXPORT_KIND = "eliasnote.board";
export const WORKSPACE_EXPORT_KIND = "eliasnote.workspace";
export const EXPORT_VERSION = 1;

export interface BoardExportFile {
  kind: typeof BOARD_EXPORT_KIND;
  version: number;
  exportedAt: string;
  board: Board;
}

export interface WorkspaceExportFile {
  kind: typeof WORKSPACE_EXPORT_KIND;
  version: number;
  exportedAt: string;
  workspaceId: string;
  workspaceName: string;
  boards: Board[];
}

export function serializeBoard(board: Board): string {
  const payload: BoardExportFile = {
    kind: BOARD_EXPORT_KIND,
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    board,
  };
  return JSON.stringify(payload, null, 2);
}

export function serializeWorkspace(
  boards: Record<string, Board>,
  workspaceId: string,
  workspaceName: string,
): string {
  const payload: WorkspaceExportFile = {
    kind: WORKSPACE_EXPORT_KIND,
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    workspaceId,
    workspaceName,
    boards: Object.values(boards)
      .filter((board) => board.workspaceId === workspaceId)
      .sort((a, b) => a.createdAt - b.createdAt),
  };
  return JSON.stringify(payload, null, 2);
}

function nodeMarkdown(node: CanvasNode, depth: number): string {
  const indent = "  ".repeat(depth);
  const lines: string[] = [];
  const title = node.title?.trim() || NODE_LABELS[node.type];
  switch (node.type) {
    case "note": {
      lines.push(`${indent}### ${title}`);
      if (node.content?.trim()) lines.push("", node.content.trim());
      break;
    }
    case "text": {
      if (node.content?.trim()) {
        lines.push(`${indent}${node.content.trim()}`);
      }
      break;
    }
    case "card": {
      lines.push(`${indent}### ${title}`);
      if (node.description?.trim()) lines.push("", node.description.trim());
      break;
    }
    case "task": {
      lines.push(`${indent}- [${node.done ? "x" : " "}] ${title}${node.priority === "high" ? " **!**" : ""}`);
      break;
    }
    case "checklist": {
      lines.push(`${indent}### ${title}`);
      for (const item of node.items ?? []) {
        lines.push(`${indent}- [${item.done ? "x" : " "}] ${item.text}`);
      }
      break;
    }
    case "link": {
      lines.push(`${indent}- [${title}](${node.url ?? ""})`);
      break;
    }
    case "file":
    case "image":
    case "video": {
      lines.push(`${indent}- **${NODE_LABELS[node.type]}:** ${node.name ?? title}`);
      if (node.caption) lines.push(`${indent}  ${node.caption}`);
      break;
    }
    case "board": {
      lines.push(`${indent}- **Quadro:** ${title}`);
      break;
    }
    case "drawing": {
      lines.push(`${indent}- **Desenho:** ${title} (${node.scene?.elements.length ?? 0} elementos)`);
      break;
    }
    case "comment": {
      lines.push(`${indent}> **Comentário (${node.author ?? "local"}):** ${node.content ?? ""}`);
      if (node.resolved) lines.push(`${indent}> Resolvido`);
      break;
    }
    default: {
      lines.push(`${indent}- ${title}`);
    }
  }
  return lines.join("\n");
}

/** Exporta o quadro como Markdown legível, com colunas aninhadas. */
export function boardToMarkdown(board: Board, boards?: Record<string, Board>): string {
  const parts: string[] = [];
  const path = boards ? boardPath(boards, board.id) : [board];
  parts.push(`# ${board.title}`);
  parts.push("");
  parts.push(`_Exportado em ${formatDateTime(Date.now())}_`);
  if (path.length > 1) parts.push("", `Caminho: ${path.map((item) => item.title).join(" / ")}`);
  if (board.description) parts.push("", board.description);

  const columns = Object.values(board.nodes).filter((node) => node.type === "column");
  for (const column of columns) {
    parts.push("", `## ${column.title ?? "Coluna"}`);
    const children = Object.values(board.nodes)
      .filter((node) => node.parentId === column.id)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    for (const child of children) {
      parts.push("", nodeMarkdown(child, 0));
    }
  }

  const loose = Object.values(board.nodes)
    .filter((node) => !node.parentId)
    .sort((a, b) => a.y - b.y || a.x - b.x);
  parts.push("", "## Elementos");
  for (const node of loose) {
    if (node.type === "column") continue;
    parts.push("", nodeMarkdown(node, 0));
  }

  const tasks = Object.values(board.nodes)
    .flatMap((node) => {
      if (node.type === "task") return [{ text: node.title ?? "", done: Boolean(node.done) }];
      return (node.items ?? []).map((item) => ({ text: item.text, done: item.done }));
    })
    .filter((task) => task.text);
  if (tasks.length > 0) {
    parts.push("", "## Tarefas");
    for (const task of tasks) parts.push(`- [${task.done ? "x" : " "}] ${task.text}`);
  }

  return parts.join("\n");
}

/** Resumo textual do quadro (usado em buscas e na sidebar). */
export function boardSummary(board: Board): string {
  const nodes = Object.values(board.nodes);
  const text = nodes
    .map((node) => [node.title, node.content, node.description].filter(Boolean).join(" "))
    .join(" ");
  return markdownToSearchText(text);
}

export function connectorColorHex(color: NodeColor): string {
  const map: Record<NodeColor, string> = {
    none: "#94a3b8",
    amber: "#d99e1b",
    rose: "#e0648a",
    sky: "#3d8fd6",
    mint: "#2f9e74",
    lilac: "#8a63e8",
    sand: "#b98145",
    slate: "#6b7280",
  };
  return map[color];
}

export function parseJsonFile<T>(raw: string): T | null {
  return safeJsonParse<T>(raw, null as unknown as T);
}

export interface BoardBundle {
  boards: Board[];
  nodes: CanvasNode[];
  connectors: Connector[];
}

export function boardsToBundle(boards: Board[]): BoardBundle {
  return {
    boards,
    nodes: boards.flatMap((board) => Object.values(board.nodes)),
    connectors: boards.flatMap((board) => Object.values(board.connectors)),
  };
}
