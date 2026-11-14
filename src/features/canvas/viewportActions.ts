import { DEFAULT_VIEWPORT, fitViewport, zoomAtPoint } from "@/lib/geometry";
import { useAppStore } from "@/core/store";
import { activeBoard, activeBoardId } from "@/core/store/helpers";
import { nodesBounds } from "@/core/domain/layout";
import type { ID } from "@/core/domain/types";

export function zoomBy(factor: number): void {
  const state = useAppStore.getState();
  const boardId = activeBoardId(state);
  if (!boardId) return;
  const viewport = state.viewports[boardId] ?? DEFAULT_VIEWPORT;
  const anchor = { x: state.canvasSize.width / 2, y: state.canvasSize.height / 2 };
  state.setViewport(boardId, zoomAtPoint(viewport, viewport.zoom * factor, anchor));
}

export function zoomTo(zoom: number): void {
  const state = useAppStore.getState();
  const boardId = activeBoardId(state);
  if (!boardId) return;
  const viewport = state.viewports[boardId] ?? DEFAULT_VIEWPORT;
  const anchor = { x: state.canvasSize.width / 2, y: state.canvasSize.height / 2 };
  state.setViewport(boardId, zoomAtPoint(viewport, zoom, anchor));
}

export function fitBoardToView(boardId?: ID): void {
  const state = useAppStore.getState();
  const targetId = boardId ?? activeBoardId(state);
  if (!targetId) return;
  const board = state.boards[targetId];
  if (!board) return;
  const bounds = nodesBounds(Object.values(board.nodes));
  if (!bounds) {
    state.setViewport(targetId, { x: 120, y: 100, zoom: 1 });
    return;
  }
  const padded = {
    x: bounds.x - 40,
    y: bounds.y - 60,
    w: bounds.w + 80,
    h: bounds.h + 140,
  };
  state.setViewport(targetId, fitViewport(padded, state.canvasSize, 64, 1.15));
}

export function centerOnWorldPoint(point: { x: number; y: number }, zoom?: number): void {
  const state = useAppStore.getState();
  const boardId = activeBoardId(state);
  if (!boardId) return;
  const viewport = state.viewports[boardId] ?? DEFAULT_VIEWPORT;
  const nextZoom = zoom ?? viewport.zoom;
  state.setViewport(boardId, {
    zoom: nextZoom,
    x: state.canvasSize.width / 2 - point.x * nextZoom,
    y: state.canvasSize.height / 2 - point.y * nextZoom,
  });
}

export function focusNode(nodeId: ID): void {
  const state = useAppStore.getState();
  const board = activeBoard(state);
  const node = board?.nodes[nodeId];
  if (!board || !node) return;
  const previous = state.viewports[board.id] ?? DEFAULT_VIEWPORT;
  centerOnWorldPoint(
    { x: node.x + node.w / 2, y: node.y + node.h / 2 },
    Math.max(previous.zoom, 0.85),
  );
  state.select([nodeId]);
}

/** Ponto central do viewport atual, em coordenadas do mundo. */
export function viewportCenter(): { x: number; y: number } {
  const state = useAppStore.getState();
  const boardId = activeBoardId(state);
  const viewport = boardId ? state.viewports[boardId] ?? DEFAULT_VIEWPORT : DEFAULT_VIEWPORT;
  return {
    x: (state.canvasSize.width / 2 - viewport.x) / viewport.zoom,
    y: (state.canvasSize.height / 2 - viewport.y) / viewport.zoom,
  };
}
