import type { Board, CanvasNode, EntityRef, ID, NodeType, SearchResult } from "@/core/domain/types";
import { NODE_LABELS, nodeTexts } from "@/core/domain/constants";
import { boardPath } from "@/core/domain/tree";
import { stripHtml, truncate } from "@/lib/utils";

export interface SearchOptions {
  type?: NodeType | "all";
  boardId?: ID | "all";
  limit?: number;
  includeBoards?: boolean;
}

/** Converte markdown em texto simples para indexação e snippets. */
export function markdownToSearchText(source: string): string {
  return stripHtml(
    source
      .replace(/<[^>]*>/g, " ")
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`([^`]*)`/g, "$1")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/[*_~>#]/g, "")
      .replace(/^\s*[-+*]\s+(\[[ xX]\]\s*)?/gm, ""),
  );
}

function scoreField(text: string, query: string, weight: number): number {
  const haystack = text.toLowerCase();
  const needle = query.toLowerCase();
  if (!needle) return 0;
  const index = haystack.indexOf(needle);
  if (index === -1) return 0;
  if (haystack === needle) return weight * 2;
  if (index === 0) return Math.round(weight * 1.5);
  return weight;
}

export function makeSnippet(text: string, query: string, max = 120): string {
  const plain = markdownToSearchText(text);
  if (!plain) return "";
  const index = query ? plain.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (index === -1) return truncate(plain, max);
  const start = Math.max(0, index - Math.floor(max / 3));
  const slice = plain.slice(start, start + max);
  return `${start > 0 ? "…" : ""}${slice}${start + max < plain.length ? "…" : ""}`;
}

export function nodeDisplayTitle(node: CanvasNode): string {
  const title = node.title ? stripHtml(node.title) : "";
  if (title) return title;
  const name = node.name ? stripHtml(node.name) : "";
  if (name) return name;
  if (node.content?.trim()) return truncate(markdownToSearchText(node.content), 70);
  if (node.description?.trim()) return truncate(stripHtml(node.description), 70);
  if (node.url?.trim()) return node.url;
  if (node.type === "board") return "Quadro";
  if (node.items?.length) return truncate(stripHtml(node.items[0].text || "Checklist"), 70);
  return NODE_LABELS[node.type];
}

function scoreNode(node: CanvasNode, query: string): { score: number; snippet: string } {
  let score = 0;
  let snippet = "";

  if (node.title) {
    score += scoreField(node.title, query, 110);
    snippet = makeSnippet(node.title, query);
  }
  if (node.content) {
    const textScore = scoreField(markdownToSearchText(node.content), query, 55);
    score += textScore;
    if (textScore > 0) snippet = makeSnippet(node.content, query);
  }
  if (node.description) {
    const descriptionScore = scoreField(node.description, query, 45);
    score += descriptionScore;
    if (descriptionScore > 0 && !snippet) snippet = makeSnippet(node.description, query);
  }
  if (node.url) score += scoreField(node.url, query, 40);
  if (node.name) score += scoreField(node.name, query, 40);
  if (node.label) score += scoreField(node.label, query, 35);
  if (node.author) score += scoreField(node.author, query, 20);
  if (node.items?.length) {
    for (const item of node.items) {
      const itemScore = scoreField(item.text, query, 35);
      score += itemScore;
      if (itemScore > 0 && !snippet) snippet = makeSnippet(item.text, query);
    }
  }
  if (node.replies?.length) {
    for (const reply of node.replies) {
      const replyScore = scoreField(reply.content, query, 20);
      score += replyScore;
      if (replyScore > 0 && !snippet) snippet = makeSnippet(reply.content, query);
    }
  }
  if (node.tags?.length) {
    for (const tag of node.tags) score += scoreField(tag, query, 30);
  }
  if (!snippet) snippet = makeSnippet(nodeTexts(node).join(" "), query);

  // Nós mais recentes ganham prioridade em consultas vazias.
  if (!query) score += Math.min(60, Math.floor((node.updatedAt || 0) / 1e10));

  return { score, snippet };
}

/** Busca global em todos os quadros, com pontuação por campo. */
export function searchBoards(
  boards: Record<ID, Board>,
  query: string,
  options: SearchOptions = {},
): SearchResult[] {
  const { type = "all", boardId = "all", limit = 40, includeBoards = true } = options;
  const trimmed = query.trim();
  const results: SearchResult[] = [];

  for (const board of Object.values(boards)) {
    if (boardId !== "all" && board.id !== boardId) continue;

    if (includeBoards && type === "all") {
      const titleScore = scoreField(board.title, trimmed, 85);
      const descriptionScore = board.description ? scoreField(board.description, trimmed, 35) : 0;
      if (!trimmed || titleScore > 0 || descriptionScore > 0) {
        results.push({
          kind: "board",
          id: board.id,
          boardId: board.id,
          boardTitle: board.title,
          type: "board",
          title: board.title,
          snippet: boardPath(boards, board.id)
            .slice(0, -1)
            .map((parent) => parent.title)
            .join(" / "),
          score: trimmed ? titleScore + descriptionScore + 15 : 10,
        });
      }
    }

    for (const node of Object.values(board.nodes)) {
      if (node.hidden) continue;
      if (type !== "all" && node.type !== type) continue;
      if (!trimmed) {
        results.push({
          kind: "node",
          id: node.id,
          boardId: board.id,
          boardTitle: board.title,
          type: node.type,
          title: nodeDisplayTitle(node),
          snippet: makeSnippet(node.content ?? node.description ?? "", ""),
          score: Math.min(50, Math.max(0, 60 - (Date.now() - node.updatedAt) / 1e10)),
        });
        continue;
      }
      const { score, snippet } = scoreNode(node, trimmed);
      if (score <= 0) continue;
      results.push({
        kind: "node",
        id: node.id,
        boardId: board.id,
        boardTitle: board.title,
        type: node.type,
        title: nodeDisplayTitle(node),
        snippet,
        score,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, limit);
}

export interface BacklinkSource {
  board: Board;
  node: CanvasNode;
}

/** Encontra todos os elementos que apontam para a referência informada. */
export function findBacklinks(boards: Record<ID, Board>, target: EntityRef): BacklinkSource[] {
  const sources: BacklinkSource[] = [];
  for (const board of Object.values(boards)) {
    for (const node of Object.values(board.nodes)) {
      if (node.references?.includes(target)) {
        sources.push({ board, node });
        continue;
      }
      if (target.startsWith("board:") && node.type === "board" && node.childBoardId === target.slice(6)) {
        sources.push({ board, node });
      }
    }
  }
  return sources;
}

/** Lista todos os elementos de um quadro, incluindo filhos de colunas ordenados. */
export function flatBoardNodes(board: Board): CanvasNode[] {
  return Object.values(board.nodes).sort((a, b) => a.z - b.z);
}
