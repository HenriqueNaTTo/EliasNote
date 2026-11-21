export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 3;
export const DEFAULT_ZOOM = 1;
export const DEFAULT_VIEWPORT: Viewport = { x: 0, y: 0, zoom: DEFAULT_ZOOM };

export function clampZoom(zoom: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

export function screenToWorld(point: Point, viewport: Viewport): Point {
  return {
    x: (point.x - viewport.x) / viewport.zoom,
    y: (point.y - viewport.y) / viewport.zoom,
  };
}

export function worldToScreen(point: Point, viewport: Viewport): Point {
  return {
    x: point.x * viewport.zoom + viewport.x,
    y: point.y * viewport.zoom + viewport.y,
  };
}

/** Zoom mantendo o ponto sob o cursor fixo na tela. */
export function zoomAtPoint(viewport: Viewport, nextZoom: number, anchor: Point): Viewport {
  const zoom = clampZoom(nextZoom);
  const world = screenToWorld(anchor, viewport);
  return {
    zoom,
    x: anchor.x - world.x * zoom,
    y: anchor.y - world.y * zoom,
  };
}

export function rectsIntersect(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function pointInRect(point: Point, rect: Rect): boolean {
  return (
    point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h
  );
}

export function rectFromPoints(a: Point, b: Point): Rect {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    w: Math.abs(a.x - b.x),
    h: Math.abs(a.y - b.y),
  };
}

export function normalizeRect(rect: Rect): Rect {
  return {
    x: Math.min(rect.x, rect.x + rect.w),
    y: Math.min(rect.y, rect.y + rect.h),
    w: Math.abs(rect.w),
    h: Math.abs(rect.h),
  };
}

export function unionRects(rects: Rect[]): Rect | null {
  if (rects.length === 0) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const rect of rects) {
    minX = Math.min(minX, rect.x);
    minY = Math.min(minY, rect.y);
    maxX = Math.max(maxX, rect.x + rect.w);
    maxY = Math.max(maxY, rect.y + rect.h);
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

export function expandRect(rect: Rect, padding: number): Rect {
  return {
    x: rect.x - padding,
    y: rect.y - padding,
    w: rect.w + padding * 2,
    h: rect.h + padding * 2,
  };
}

export function rectContainsRect(outer: Rect, inner: Rect): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.w <= outer.x + outer.w &&
    inner.y + inner.h <= outer.y + outer.h
  );
}

export function centerOf(rect: Rect): Point {
  return { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 };
}

/** Calcula o viewport que enquadra um retângulo do mundo dentro de uma área de tela. */
export function fitViewport(
  bounds: Rect,
  container: Size,
  padding = 80,
  maxZoom = 1.2,
  minZoom = MIN_ZOOM,
): Viewport {
  if (container.width <= 0 || container.height <= 0) return DEFAULT_VIEWPORT;
  const availableW = Math.max(40, container.width - padding * 2);
  const availableH = Math.max(40, container.height - padding * 2);
  const zoom = Math.min(
    maxZoom,
    Math.max(minZoom, Math.min(availableW / Math.max(bounds.w, 1), availableH / Math.max(bounds.h, 1))),
  );
  return {
    zoom,
    x: container.width / 2 - (bounds.x + bounds.w / 2) * zoom,
    y: container.height / 2 - (bounds.y + bounds.h / 2) * zoom,
  };
}

export function viewportWorldRect(viewport: Viewport, container: Size): Rect {
  const topLeft = screenToWorld({ x: 0, y: 0 }, viewport);
  return {
    x: topLeft.x,
    y: topLeft.y,
    w: container.width / viewport.zoom,
    h: container.height / viewport.zoom,
  };
}

export function snapToGrid(value: number, grid: number): number {
  if (grid <= 0) return value;
  return Math.round(value / grid) * grid;
}

/** Ponto onde a reta do centro até o alvo cruza a borda do retângulo. */
export function anchorPoint(rect: Rect, target: Point): Point {
  const center = centerOf(rect);
  const dx = target.x - center.x;
  const dy = target.y - center.y;
  if (dx === 0 && dy === 0) return center;

  const halfWidth = rect.w / 2;
  const halfHeight = rect.h / 2;
  const scaleX = dx === 0 ? Number.POSITIVE_INFINITY : halfWidth / Math.abs(dx);
  const scaleY = dy === 0 ? Number.POSITIVE_INFINITY : halfHeight / Math.abs(dy);
  // A menor escala positiva é exatamente a borda que a reta centro→alvo cruza.
  const scale = Math.min(scaleX, scaleY, 1);

  return { x: center.x + dx * scale, y: center.y + dy * scale };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export interface ConnectorGeometry {
  path: string;
  start: Point;
  end: Point;
  mid: Point;
  startAngle: number;
  endAngle: number;
}

/** Curva suave entre dois pontos, com saída horizontal/vertical conforme a direção dominante. */
export function connectorGeometry(
  from: Point,
  to: Point,
  options: { kind?: "curve" | "straight" | "elbow"; curvature?: number } = {},
): ConnectorGeometry {
  const { kind = "curve", curvature = 0.42 } = options;
  const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  if (kind === "straight") {
    return {
      path: `M ${from.x} ${from.y} L ${to.x} ${to.y}`,
      start: from,
      end: to,
      mid,
      startAngle: Math.atan2(to.y - from.y, to.x - from.x),
      endAngle: Math.atan2(to.y - from.y, to.x - from.x),
    };
  }
  if (kind === "elbow") {
    const horizontal = Math.abs(to.x - from.x) >= Math.abs(to.y - from.y);
    const corner = horizontal ? { x: mid.x, y: from.y } : { x: from.x, y: mid.y };
    const corner2 = horizontal ? { x: mid.x, y: to.y } : { x: to.x, y: mid.y };
    return {
      path: `M ${from.x} ${from.y} L ${corner.x} ${corner.y} L ${corner2.x} ${corner2.y} L ${to.x} ${to.y}`,
      start: from,
      end: to,
      mid,
      startAngle: Math.atan2(corner.y - from.y, corner.x - from.x),
      endAngle: Math.atan2(to.y - corner2.y, to.x - corner2.x),
    };
  }
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const axis = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
  const c1 = axis === "x" ? { x: from.x + dx * curvature, y: from.y } : { x: from.x, y: from.y + dy * curvature };
  const c2 = axis === "x" ? { x: to.x - dx * curvature, y: to.y } : { x: to.x, y: to.y - dy * curvature };
  return {
    path: `M ${from.x} ${from.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${to.x} ${to.y}`,
    start: from,
    end: to,
    mid: {
      x: 0.125 * from.x + 0.375 * c1.x + 0.375 * c2.x + 0.125 * to.x,
      y: 0.125 * from.y + 0.375 * c1.y + 0.375 * c2.y + 0.125 * to.y,
    },
    startAngle: Math.atan2(c1.y - from.y, c1.x - from.x),
    endAngle: Math.atan2(to.y - c2.y, to.x - c2.x),
  };
}

export function arrowHeadPath(tip: Point, angle: number, size = 9): string {
  const left = {
    x: tip.x - size * Math.cos(angle - Math.PI / 7),
    y: tip.y - size * Math.sin(angle - Math.PI / 7),
  };
  const right = {
    x: tip.x - size * Math.cos(angle + Math.PI / 7),
    y: tip.y - size * Math.sin(angle + Math.PI / 7),
  };
  return `M ${tip.x} ${tip.y} L ${left.x} ${left.y} M ${tip.x} ${tip.y} L ${right.x} ${right.y}`;
}

export function rotatePoint(point: Point, origin: Point, degrees: number): Point {
  const radians = (degrees * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const dx = point.x - origin.x;
  const dy = point.y - origin.y;
  return { x: origin.x + dx * cos - dy * sin, y: origin.y + dx * sin + dy * cos };
}

/** Limita o deslocamento para manter ao menos parte do item dentro do viewport visível. */
export function clampViewport(viewport: Viewport): Viewport {
  return {
    zoom: clampZoom(viewport.zoom),
    x: clamp(viewport.x, -400_000, 400_000),
    y: clamp(viewport.y, -400_000, 400_000),
  };
}
