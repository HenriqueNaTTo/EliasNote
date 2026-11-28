import { uid } from "@/lib/utils";

/**
 * Modelo do desenho nativo do EliasNote. É um documento vetorial simples e
 * serializável (pontos, retângulos e texto), desenhado em SVG pelo app — sem
 * depender de bibliotecas de desenho.
 */

export const SKETCH_VERSION = 1;

export interface SketchPoint {
  x: number;
  y: number;
}

export interface SketchRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SketchStyle {
  /** Cor do traço (hex/rgb). */
  stroke: string;
  /** `none` ou uma cor de preenchimento. */
  fill: string;
  /** Espessura do traço em unidades do desenho. */
  width: number;
  dashed: boolean;
  /** 0.2 a 1. */
  opacity: number;
}

interface SketchElementBase {
  id: string;
  style: SketchStyle;
}

export interface SketchStrokeElement extends SketchElementBase {
  kind: "stroke";
  points: SketchPoint[];
}

export interface SketchSegmentElement extends SketchElementBase {
  kind: "line" | "arrow";
  from: SketchPoint;
  to: SketchPoint;
}

export interface SketchShapeElement extends SketchElementBase {
  kind: "rect" | "ellipse" | "diamond";
  rect: SketchRect;
}

export interface SketchTextElement extends SketchElementBase {
  kind: "text";
  at: SketchPoint;
  text: string;
  fontSize: number;
}

export type SketchElement =
  | SketchStrokeElement
  | SketchSegmentElement
  | SketchShapeElement
  | SketchTextElement;

export type SketchTool =
  | "select"
  | "hand"
  | "pen"
  | "line"
  | "arrow"
  | "rect"
  | "ellipse"
  | "diamond"
  | "text"
  | "eraser";

export interface SketchDocument {
  version: number;
  elements: SketchElement[];
  updatedAt: number;
}

export const DEFAULT_SKETCH_STYLE: SketchStyle = {
  stroke: "#1f2328",
  fill: "none",
  width: 2,
  dashed: false,
  opacity: 1,
};

/** Paleta fixa: o desenho é sempre desenhado sobre uma “folha” clara. */
export const SKETCH_STROKE_COLORS: { value: string; label: string }[] = [
  { value: "#1f2328", label: "Grafite" },
  { value: "#e5484d", label: "Vermelho" },
  { value: "#f5a524", label: "Âmbar" },
  { value: "#30a46c", label: "Verde" },
  { value: "#3d8fd6", label: "Azul" },
  { value: "#8a63e8", label: "Violeta" },
  { value: "#e0648a", label: "Rosa" },
  { value: "#6b7280", label: "Cinza" },
];

export const SKETCH_FILL_COLORS: { value: string; label: string }[] = [
  { value: "none", label: "Sem preenchimento" },
  { value: "#f5e6a8", label: "Amarelo" },
  { value: "#f3c6d0", label: "Rosa" },
  { value: "#c7e3f7", label: "Azul" },
  { value: "#c5ecd9", label: "Verde" },
  { value: "#ded1f8", label: "Lilás" },
  { value: "#f0d8c0", label: "Areia" },
];

export const SKETCH_WIDTHS = [1, 2, 4, 7] as const;

export const SKETCH_FONT_SIZE = 20;

const MAX_ELEMENTS = 1500;
const MAX_POINTS_PER_STROKE = 6000;
const MAX_TEXT_LENGTH = 8000;

export function createSketch(): SketchDocument {
  return { version: SKETCH_VERSION, elements: [], updatedAt: Date.now() };
}

export function createSketchStyle(overrides: Partial<SketchStyle> = {}): SketchStyle {
  return { ...DEFAULT_SKETCH_STYLE, ...overrides };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function finite(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function sanitizePoint(value: unknown): SketchPoint | null {
  if (!isRecord(value)) return null;
  if (typeof value.x !== "number" || typeof value.y !== "number") return null;
  if (!Number.isFinite(value.x) || !Number.isFinite(value.y)) return null;
  return { x: value.x, y: value.y };
}

function sanitizeStyle(value: unknown): SketchStyle {
  const raw = isRecord(value) ? value : {};
  return {
    stroke: typeof raw.stroke === "string" && raw.stroke.trim() ? raw.stroke : DEFAULT_SKETCH_STYLE.stroke,
    fill: typeof raw.fill === "string" && raw.fill.trim() ? raw.fill : DEFAULT_SKETCH_STYLE.fill,
    width: clamp(finite(raw.width, DEFAULT_SKETCH_STYLE.width), 0.5, 24),
    dashed: Boolean(raw.dashed),
    opacity: clamp(finite(raw.opacity, 1), 0.15, 1),
  };
}

function sanitizeRect(value: unknown): SketchRect | null {
  if (!isRecord(value)) return null;
  const x = finite(value.x, Number.NaN);
  const y = finite(value.y, Number.NaN);
  const w = finite(value.w, Number.NaN);
  const h = finite(value.h, Number.NaN);
  if (![x, y, w, h].every(Number.isFinite)) return null;
  return normalizeRect({ x, y, w, h });
}

/** Retângulo sempre com largura/altura positivas (arraste para qualquer lado). */
export function normalizeRect(rect: SketchRect): SketchRect {
  const x = rect.w < 0 ? rect.x + rect.w : rect.x;
  const y = rect.h < 0 ? rect.y + rect.h : rect.y;
  return { x, y, w: Math.abs(rect.w), h: Math.abs(rect.h) };
}

function sanitizeElement(raw: unknown): SketchElement | null {
  if (!isRecord(raw) || typeof raw.id !== "string") return null;
  const style = sanitizeStyle(raw.style);
  switch (raw.kind) {
    case "stroke": {
      if (!Array.isArray(raw.points) || raw.points.length === 0) return null;
      const points = raw.points
        .slice(0, MAX_POINTS_PER_STROKE)
        .map(sanitizePoint)
        .filter((point): point is SketchPoint => Boolean(point));
      return points.length > 0 ? { id: raw.id, kind: "stroke", style, points } : null;
    }
    case "line":
    case "arrow": {
      const from = sanitizePoint(raw.from);
      const to = sanitizePoint(raw.to);
      return from && to ? { id: raw.id, kind: raw.kind, style, from, to } : null;
    }
    case "rect":
    case "ellipse":
    case "diamond": {
      const rect = sanitizeRect(raw.rect);
      return rect ? { id: raw.id, kind: raw.kind, style, rect } : null;
    }
    case "text": {
      const at = sanitizePoint(raw.at);
      if (!at) return null;
      const text = typeof raw.text === "string" ? raw.text.slice(0, MAX_TEXT_LENGTH) : "";
      return {
        id: raw.id,
        kind: "text",
        style,
        at,
        text,
        fontSize: clamp(finite(raw.fontSize, SKETCH_FONT_SIZE), 8, 96),
      };
    }
    default:
      return null;
  }
}

/** Normaliza dados lidos do disco. Devolve `null` quando não há documento válido. */
export function sanitizeSketch(raw: unknown): SketchDocument | null {
  if (!isRecord(raw) || !Array.isArray(raw.elements)) return null;
  const elements = raw.elements
    .slice(0, MAX_ELEMENTS)
    .map(sanitizeElement)
    .filter((element): element is SketchElement => Boolean(element));
  return {
    version: SKETCH_VERSION,
    elements,
    updatedAt: finite(raw.updatedAt, Date.now()),
  };
}

export function sketchElementCount(sketch: SketchDocument | undefined | null): number {
  return sketch?.elements.length ?? 0;
}

export function sketchBounds(sketch: SketchDocument | readonly SketchElement[]): SketchRect | null {
  const elements: readonly SketchElement[] = Array.isArray(sketch)
    ? (sketch as readonly SketchElement[])
    : (sketch as SketchDocument).elements;
  if (elements.length === 0) return null;
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const element of elements) {
    const bounds = elementBounds(element);
    minX = Math.min(minX, bounds.x);
    minY = Math.min(minY, bounds.y);
    maxX = Math.max(maxX, bounds.x + bounds.w);
    maxY = Math.max(maxY, bounds.y + bounds.h);
  }
  if (!Number.isFinite(minX) || !Number.isFinite(minY)) return null;
  return { x: minX, y: minY, w: Math.max(1, maxX - minX), h: Math.max(1, maxY - minY) };
}

/** Largura aproximada de uma linha de texto (fonte sem serifa). */
function textWidth(line: string, fontSize: number): number {
  return Math.max(fontSize * 0.6, line.length * fontSize * 0.56);
}

export function elementBounds(element: SketchElement): SketchRect {
  switch (element.kind) {
    case "stroke": {
      let minX = Number.POSITIVE_INFINITY;
      let minY = Number.POSITIVE_INFINITY;
      let maxX = Number.NEGATIVE_INFINITY;
      let maxY = Number.NEGATIVE_INFINITY;
      for (const point of element.points) {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      }
      return { x: minX, y: minY, w: Math.max(1, maxX - minX), h: Math.max(1, maxY - minY) };
    }
    case "line":
    case "arrow":
      return normalizeRect({
        x: Math.min(element.from.x, element.to.x),
        y: Math.min(element.from.y, element.to.y),
        w: Math.abs(element.to.x - element.from.x),
        h: Math.abs(element.to.y - element.from.y),
      });
    case "rect":
    case "ellipse":
    case "diamond":
      return normalizeRect(element.rect);
    case "text": {
      const lines = textLines(element.text);
      const width = Math.max(...lines.map((line) => textWidth(line, element.fontSize)), element.fontSize);
      return {
        x: element.at.x,
        y: element.at.y,
        w: width,
        h: Math.max(1, lines.length * element.fontSize * 1.32),
      };
    }
    default:
      return { x: 0, y: 0, w: 1, h: 1 };
  }
}

function distanceToSegment(point: SketchPoint, a: SketchPoint, b: SketchPoint): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return Math.hypot(point.x - a.x, point.y - a.y);
  const t = clamp(((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared, 0, 1);
  return Math.hypot(point.x - (a.x + t * dx), point.y - (a.y + t * dy));
}

function distanceToRectBorder(point: SketchPoint, rect: SketchRect): number {
  const innerX = clamp(point.x, rect.x, rect.x + rect.w);
  const innerY = clamp(point.y, rect.y, rect.y + rect.h);
  const inside = innerX === point.x && innerY === point.y;
  if (!inside) return Math.hypot(point.x - innerX, point.y - innerY);
  return Math.min(point.x - rect.x, rect.x + rect.w - point.x, point.y - rect.y, rect.y + rect.h - point.y);
}

export function hitTestElement(element: SketchElement, point: SketchPoint, tolerance = 6): boolean {
  const strokeTolerance = Math.max(tolerance, element.style.width / 2 + 2);
  switch (element.kind) {
    case "stroke":
      return element.points.some((candidate, index) => {
        if (index === 0) return Math.hypot(point.x - candidate.x, point.y - candidate.y) <= strokeTolerance;
        return distanceToSegment(point, element.points[index - 1], candidate) <= strokeTolerance;
      });
    case "line":
    case "arrow":
      return distanceToSegment(point, element.from, element.to) <= strokeTolerance;
    case "rect":
    case "diamond": {
      const rect = normalizeRect(element.rect);
      if (element.style.fill !== "none") {
        return (
          point.x >= rect.x - tolerance &&
          point.x <= rect.x + rect.w + tolerance &&
          point.y >= rect.y - tolerance &&
          point.y <= rect.y + rect.h + tolerance
        );
      }
      return distanceToRectBorder(point, rect) <= strokeTolerance;
    }
    case "ellipse": {
      const rect = normalizeRect(element.rect);
      const rx = Math.max(0.5, rect.w / 2);
      const ry = Math.max(0.5, rect.h / 2);
      const cx = rect.x + rx;
      const cy = rect.y + ry;
      const normalized = ((point.x - cx) / rx) ** 2 + ((point.y - cy) / ry) ** 2;
      if (element.style.fill !== "none") return normalized <= 1.12;
      const outer = ((point.x - cx) / (rx + strokeTolerance)) ** 2 + ((point.y - cy) / (ry + strokeTolerance)) ** 2;
      const inner = ((point.x - cx) / Math.max(1, rx - strokeTolerance)) ** 2 +
        ((point.y - cy) / Math.max(1, ry - strokeTolerance)) ** 2;
      return outer <= 1 && inner >= 1;
    }
    case "text": {
      const bounds = elementBounds(element);
      return (
        point.x >= bounds.x - tolerance &&
        point.x <= bounds.x + bounds.w + tolerance &&
        point.y >= bounds.y - tolerance &&
        point.y <= bounds.y + bounds.h + tolerance
      );
    }
    default:
      return false;
  }
}

/** Primeiro elemento atingido, do topo para a base. */
export function topmostElementAt(
  elements: readonly SketchElement[],
  point: SketchPoint,
  tolerance = 6,
): SketchElement | null {
  for (let index = elements.length - 1; index >= 0; index -= 1) {
    if (hitTestElement(elements[index], point, tolerance)) return elements[index];
  }
  return null;
}

export function moveElement(element: SketchElement, delta: SketchPoint): SketchElement {
  const dx = delta.x;
  const dy = delta.y;
  switch (element.kind) {
    case "stroke":
      return {
        ...element,
        points: element.points.map((point) => ({ x: point.x + dx, y: point.y + dy })),
      };
    case "line":
    case "arrow":
      return {
        ...element,
        from: { x: element.from.x + dx, y: element.from.y + dy },
        to: { x: element.to.x + dx, y: element.to.y + dy },
      };
    case "rect":
    case "ellipse":
    case "diamond":
      return { ...element, rect: { ...element.rect, x: element.rect.x + dx, y: element.rect.y + dy } };
    case "text":
      return { ...element, at: { x: element.at.x + dx, y: element.at.y + dy } };
    default:
      return element;
  }
}

export function moveElements(elements: readonly SketchElement[], delta: SketchPoint): SketchElement[] {
  return elements.map((element) => moveElement(element, delta));
}

/** Caminho SVG de traços, formas e segmentos. Texto é renderizado à parte. */
export function elementPath(element: SketchElement): string {
  switch (element.kind) {
    case "stroke":
      return strokePath(element.points);
    case "line":
    case "arrow":
      return `M ${element.from.x} ${element.from.y} L ${element.to.x} ${element.to.y}`;
    case "rect": {
      const rect = normalizeRect(element.rect);
      return `M ${rect.x} ${rect.y} H ${rect.x + rect.w} V ${rect.y + rect.h} H ${rect.x} Z`;
    }
    case "ellipse": {
      const rect = normalizeRect(element.rect);
      const rx = rect.w / 2;
      const ry = rect.h / 2;
      const cx = rect.x + rx;
      const cy = rect.y + ry;
      return `M ${cx - rx} ${cy} a ${rx} ${ry} 0 1 0 ${rx * 2} 0 a ${rx} ${ry} 0 1 0 ${-rx * 2} 0 Z`;
    }
    case "diamond": {
      const rect = normalizeRect(element.rect);
      const cx = rect.x + rect.w / 2;
      const cy = rect.y + rect.h / 2;
      return `M ${cx} ${rect.y} L ${rect.x + rect.w} ${cy} L ${cx} ${rect.y + rect.h} L ${rect.x} ${cy} Z`;
    }
    default:
      return "";
  }
}

/** Traço suavizado com Catmull-Rom convertido em curvas cúbicas. */
export function strokePath(points: readonly SketchPoint[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) {
    const { x, y } = points[0];
    return `M ${x} ${y} l 0.01 0`;
  }
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index - 1] ?? points[index];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[index + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return path;
}

export function strokeDashArray(style: SketchStyle): string | undefined {
  return style.dashed ? `${Math.max(4, style.width * 4)} ${Math.max(3, style.width * 2.5)}` : undefined;
}

/** Ponta da seta como um caminho preenchido. */
export function arrowHeadPath(element: SketchSegmentElement): string {
  const angle = Math.atan2(element.to.y - element.from.y, element.to.x - element.from.x);
  const size = Math.max(9, element.style.width * 4.5);
  const left = {
    x: element.to.x - size * Math.cos(angle - Math.PI / 7),
    y: element.to.y - size * Math.sin(angle - Math.PI / 7),
  };
  const right = {
    x: element.to.x - size * Math.cos(angle + Math.PI / 7),
    y: element.to.y - size * Math.sin(angle + Math.PI / 7),
  };
  return `M ${element.to.x} ${element.to.y} L ${left.x} ${left.y} L ${right.x} ${right.y} Z`;
}

export function textLines(text: string): string[] {
  return text.split("\n");
}

export function sketchViewBox(elements: readonly SketchElement[], padding = 24): string {
  const bounds = sketchBounds(elements);
  if (!bounds) return `0 0 320 ${padding * 2 + 180}`;
  return `${bounds.x - padding} ${bounds.y - padding} ${bounds.w + padding * 2} ${bounds.h + padding * 2}`;
}

/** Cria um elemento novo com id único a partir de um esqueleto. */
export function sketchElement<T extends Omit<SketchElement, "id">>(element: T): SketchElement {
  return { ...element, id: uid("sk") } as unknown as SketchElement;
}

/** Duplica os elementos selecionados com novos IDs, deslocados para não sumirem sob o original. */
export function duplicateElements(
  elements: readonly SketchElement[],
  ids: Iterable<string>,
  offset: SketchPoint = { x: 24, y: 24 },
): SketchElement[] {
  const selected = new Set(ids);
  return elements
    .filter((element) => selected.has(element.id))
    .map((element) => moveElement({ ...element, id: uid("sk") } as SketchElement, offset));
}
