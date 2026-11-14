import type { Rect, Point } from "@/lib/geometry";
import { rectsIntersect } from "@/lib/geometry";
import type { CanvasNode, ID } from "./types";

export function nodeRect(node: CanvasNode): Rect {
  return { x: node.x, y: node.y, w: node.w, h: node.h };
}

export function nodesBounds(nodes: CanvasNode[]): Rect | null {
  if (nodes.length === 0) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const node of nodes) {
    if (node.hidden) continue;
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + node.w);
    maxY = Math.max(maxY, node.y + node.h);
  }
  if (!Number.isFinite(minX)) return null;
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/**
 * Ordena os nós para renderização: pilha por `z`, com os filhos de uma coluna
 * imediatamente após a coluna (somente DOM order, sem z-index fracionário).
 */
export function renderOrder(nodes: Record<ID, CanvasNode>): CanvasNode[] {
  const all = Object.values(nodes);
  const orphanChildren = all.filter((node) => node.parentId && !nodes[node.parentId]);
  const roots = all
    .filter((node) => !node.parentId || !nodes[node.parentId])
    .sort((a, b) => a.z - b.z || a.createdAt - b.createdAt);

  const ordered: CanvasNode[] = [];
  for (const node of roots) {
    ordered.push(node);
    if (node.type === "column") {
      const children = all
        .filter((child) => child.parentId === node.id)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.createdAt - b.createdAt);
      ordered.push(...children);
    }
  }
  for (const orphan of orphanChildren) {
    if (!ordered.includes(orphan)) ordered.push(orphan);
  }
  return ordered;
}

/** Filtra somente nós visíveis no viewport (culling) com margem de segurança. */
export function visibleNodes(
  ordered: CanvasNode[],
  worldRect: Rect,
  margin = 320,
): CanvasNode[] {
  const view = {
    x: worldRect.x - margin,
    y: worldRect.y - margin,
    w: worldRect.w + margin * 2,
    h: worldRect.h + margin * 2,
  };
  return ordered.filter((node) => !node.hidden && rectsIntersect(nodeRect(node), view));
}

/** Retorna a coluna sob o ponto informado, ignorando os próprios filhos. */
export function columnAtPoint(
  nodes: Record<ID, CanvasNode>,
  point: Point,
  excludeIds: ID[] = [],
  ignoreId?: ID,
): CanvasNode | null {
  const candidates = Object.values(nodes)
    .filter(
      (node) =>
        node.type === "column" &&
        !node.hidden &&
        !node.locked &&
        node.id !== ignoreId &&
        !excludeIds.includes(node.id),
    )
    .sort((a, b) => b.z - a.z);
  for (const column of candidates) {
    if (
      point.x >= column.x &&
      point.x <= column.x + column.w &&
      point.y >= column.y &&
      point.y <= column.y + column.h
    ) {
      return column;
    }
  }
  return null;
}

/** Verifica se o nó está inserido em uma coluna e retorna o id da coluna. */
export function parentColumnId(node: CanvasNode): ID | null {
  return node.parentId ?? null;
}

export function maxZ(nodes: Record<ID, CanvasNode>): number {
  return Object.values(nodes).reduce((max, node) => Math.max(max, node.z), 0);
}

export function minZ(nodes: Record<ID, CanvasNode>): number {
  return Object.values(nodes).reduce((min, node) => Math.min(min, node.z), Number.MAX_SAFE_INTEGER);
}

/** Desloca todos os nós de uma coluna junto com ela, mantendo o layout. */
export function shiftColumnChildren(
  nodes: Record<ID, CanvasNode>,
  columnId: ID,
  dx: number,
  dy: number,
): CanvasNode[] {
  return Object.values(nodes)
    .filter((node) => node.parentId === columnId)
    .map((node) => ({ ...node, x: node.x + dx, y: node.y + dy }));
}

export function clampSize(value: number, min: number): number {
  return Math.max(min, Math.round(value));
}
