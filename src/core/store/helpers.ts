import type { Draft } from "immer";
import type { Board, CanvasNode, ID } from "@/core/domain/types";
import {
  columnContentHeight,
  layoutColumnNodes,
} from "@/core/domain/factories";
import type { AppState } from "./types";

export function boardById(state: Pick<AppState, "boards">, boardId: ID | null | undefined): Board | undefined {
  if (!boardId) return undefined;
  return state.boards[boardId];
}

export function activeBoard(state: Pick<AppState, "boards" | "tabs" | "activeTabId">): Board | undefined {
  const tab = state.tabs.find((candidate) => candidate.id === state.activeTabId);
  if (!tab) return undefined;
  return state.boards[tab.boardId];
}

export function activeBoardId(state: Pick<AppState, "tabs" | "activeTabId">): ID | null {
  return state.tabs.find((candidate) => candidate.id === state.activeTabId)?.boardId ?? null;
}

export function findNodeInBoard(board: Board | undefined, nodeId: ID): CanvasNode | undefined {
  return board?.nodes[nodeId];
}

export function locateNode(
  state: Pick<AppState, "boards">,
  nodeId: ID,
): { board: Board; node: CanvasNode } | null {
  for (const board of Object.values(state.boards)) {
    const node = board.nodes[nodeId];
    if (node) return { board, node };
  }
  return null;
}

export function relayoutColumn(draft: Draft<AppState>, boardId: ID, columnId: ID): void {
  const board = draft.boards[boardId];
  if (!board) return;
  const column = board.nodes[columnId];
  if (!column || column.type !== "column") return;
  const laidOut = layoutColumnNodes(board.nodes as Record<string, CanvasNode>, column as CanvasNode);
  for (const child of laidOut) {
    board.nodes[child.id] = child;
  }
  const contentHeight = columnContentHeight(board.nodes as Record<string, CanvasNode>, columnId);
  column.h = Math.max(column.h, contentHeight);
  board.updatedAt = Date.now();
}

export function relayoutColumnsOfBoard(draft: Draft<AppState>, boardId: ID): void {
  const board = draft.boards[boardId];
  if (!board) return;
  const columnIds = Object.values(board.nodes)
    .filter((node) => node.type === "column")
    .map((node) => node.id);
  for (const columnId of columnIds) relayoutColumn(draft, boardId, columnId);
}

/** Remove seleção e edição de itens que não existem mais no quadro ativo. */
export function pruneSelection(draft: Draft<AppState>): void {
  const board = activeBoard(draft as unknown as AppState);
  if (!board) {
    draft.selection = [];
    draft.selectedConnectors = [];
    draft.editingNodeId = null;
    if (draft.drawingNodeId) draft.drawingNodeId = null;
    return;
  }
  draft.selection = draft.selection.filter((id) => Boolean(board.nodes[id]));
  draft.selectedConnectors = draft.selectedConnectors.filter((id) => Boolean(board.connectors[id]));
  if (draft.editingNodeId && !board.nodes[draft.editingNodeId]) draft.editingNodeId = null;
  if (draft.drawingNodeId && !board.nodes[draft.drawingNodeId]) draft.drawingNodeId = null;
}

/** Garante que abas, quadro ativo e viewports estejam consistentes com os dados. */
export function ensureNavigation(draft: Draft<AppState>): void {
  if (!draft.workspaces[draft.activeWorkspaceId]) {
    draft.activeWorkspaceId = draft.workspaceOrder.find((id) => Boolean(draft.workspaces[id])) ?? "";
  }

  draft.tabs = draft.tabs.filter((tab) => Boolean(draft.boards[tab.boardId]));
  if (draft.tabs.length === 0) {
    const fallback = Object.values(draft.boards)
      .filter((board) => board.workspaceId === draft.activeWorkspaceId)
      .sort((a, b) => a.createdAt - b.createdAt)[0];
    if (fallback) {
      draft.tabs.push({
        id: `tab_${fallback.id}`,
        boardId: fallback.id,
        workspaceId: fallback.workspaceId,
      });
    }
  }

  const activeTab = draft.tabs.find((tab) => tab.id === draft.activeTabId);
  if (!activeTab) {
    const preferred = draft.tabs.find((tab) => tab.workspaceId === draft.activeWorkspaceId) ?? draft.tabs[0];
    draft.activeTabId = preferred?.id ?? null;
  }

  for (const tab of draft.tabs) {
    if (!draft.viewports[tab.boardId]) {
      draft.viewports[tab.boardId] = { x: 120, y: 100, zoom: 1 };
    }
  }

  const boardIds = new Set(Object.keys(draft.boards));
  for (const boardId of Object.keys(draft.viewports)) {
    if (!boardIds.has(boardId)) delete draft.viewports[boardId];
  }
  for (const workspaceId of Object.keys(draft.workspaces)) {
    if (!draft.workspaceOrder.includes(workspaceId)) draft.workspaceOrder.push(workspaceId);
  }
  draft.workspaceOrder = draft.workspaceOrder.filter((id) => Boolean(draft.workspaces[id]));
  pruneSelection(draft);
}

/** Abre (ou ativa) a aba de um quadro, expandindo ancestrais na árvore. */
export function openBoardInDraft(draft: Draft<AppState>, boardId: ID): void {
  const board = draft.boards[boardId];
  if (!board) return;
  draft.activeWorkspaceId = board.workspaceId;
  const existing = draft.tabs.find((tab) => tab.boardId === boardId);
  if (existing) {
    draft.activeTabId = existing.id;
  } else {
    const tab = { id: `tab_${boardId}_${Date.now().toString(36)}`, boardId, workspaceId: board.workspaceId };
    draft.tabs.push(tab);
    draft.activeTabId = tab.id;
  }
  let cursor = board.parentId ? draft.boards[board.parentId] : undefined;
  let guard = 0;
  while (cursor && guard < 64) {
    draft.expandedBoards[cursor.id] = true;
    cursor = cursor.parentId ? draft.boards[cursor.parentId] : undefined;
    guard += 1;
  }
  if (!draft.viewports[boardId]) draft.viewports[boardId] = { x: 120, y: 100, zoom: 1 };
  draft.selection = [];
  draft.selectedConnectors = [];
  draft.editingNodeId = null;
  draft.activeTool = "select";
}
