import { useMemo } from "react";
import { DEFAULT_VIEWPORT, viewportWorldRect, type Size, type Viewport } from "@/lib/geometry";
import type { Board, CanvasNode, EntityRef, ID } from "@/core/domain/types";
import { visibleNodes as filterVisible, renderOrder } from "@/core/domain/layout";
import { buildBoardTree, type BoardTreeNode } from "@/core/domain/tree";
import { activeBoard as activeBoardOf } from "./helpers";
import { useAppStore } from "./index";
import { findBacklinks, type BacklinkSource } from "@/core/search/search";

export function useActiveBoard(): Board | undefined {
  return useAppStore((state) => activeBoardOf(state));
}

export function useActiveBoardId(): ID | null {
  return useAppStore((state) => {
    const tab = state.tabs.find((candidate) => candidate.id === state.activeTabId);
    return tab?.boardId ?? null;
  });
}

export function useBoard(boardId: ID | null | undefined): Board | undefined {
  return useAppStore((state) => (boardId ? state.boards[boardId] : undefined));
}

export function useViewport(boardId: ID | null): Viewport {
  return useAppStore((state) => (boardId ? state.viewports[boardId] ?? DEFAULT_VIEWPORT : DEFAULT_VIEWPORT));
}

export function useRenderNodes(board: Board | undefined): CanvasNode[] {
  const nodes = board?.nodes;
  return useMemo(() => (nodes ? renderOrder(nodes) : []), [nodes]);
}

export function useVisibleBoardNodes(
  board: Board | undefined,
  viewport: Viewport,
  size: Size,
): CanvasNode[] {
  const ordered = useRenderNodes(board);
  return useMemo(() => {
    if (!size.width || !size.height) return ordered;
    return filterVisible(ordered, viewportWorldRect(viewport, size));
  }, [ordered, viewport, size]);
}

export function useSelection(): ID[] {
  return useAppStore((state) => state.selection);
}

export function useSelectedNodes(): CanvasNode[] {
  const board = useActiveBoard();
  const selection = useSelection();
  return useMemo(() => {
    if (!board) return [];
    return selection
      .map((id) => board.nodes[id])
      .filter((node): node is CanvasNode => Boolean(node));
  }, [board, selection]);
}

export function useBoardTree(workspaceId: ID): BoardTreeNode[] {
  const boards = useAppStore((state) => state.boards);
  return useMemo(() => buildBoardTree(boards, workspaceId), [boards, workspaceId]);
}

export function useCanUndo(): boolean {
  return useAppStore((state) => state.history.past.length > 0);
}

export function useCanRedo(): boolean {
  return useAppStore((state) => state.history.future.length > 0);
}

export function useUndoLabel(): string | null {
  return useAppStore((state) => state.history.past[state.history.past.length - 1]?.label ?? null);
}

export function useBacklinks(target: EntityRef | null): BacklinkSource[] {
  const boards = useAppStore((state) => state.boards);
  return useMemo(() => (target ? findBacklinks(boards, target) : []), [boards, target]);
}

export function useBoardNodeCount(boardId: ID | null): number {
  return useAppStore((state) => (boardId ? Object.keys(state.boards[boardId]?.nodes ?? {}).length : 0));
}

/** Seleciona a ferramenta ativa (evita re-render em componentes que não usam). */
export function useActiveTool() {
  return useAppStore((state) => state.activeTool);
}

export function useIsSidebarCollapsed(): boolean {
  return useAppStore((state) => state.sidebarCollapsed);
}
