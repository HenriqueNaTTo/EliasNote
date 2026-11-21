import { describe, expect, it } from "vitest";
import {
  anchorPoint,
  centerOf,
  connectorGeometry,
  fitViewport,
  rectFromPoints,
  rectsIntersect,
  screenToWorld,
  snapToGrid,
  worldToScreen,
  zoomAtPoint,
} from "./geometry";

describe("geometria do canvas", () => {
  it("converte entre coordenadas de tela e mundo", () => {
    const viewport = { x: 120, y: -40, zoom: 2 };
    const screen = worldToScreen({ x: 30, y: 10 }, viewport);
    expect(screen).toEqual({ x: 180, y: -20 });
    expect(screenToWorld(screen, viewport)).toEqual({ x: 30, y: 10 });
  });

  it("mantém o ponto sob o cursor fixo ao aplicar zoom", () => {
    const viewport = { x: 0, y: 0, zoom: 1 };
    const anchor = { x: 400, y: 300 };
    const before = screenToWorld(anchor, viewport);
    const zoomed = zoomAtPoint(viewport, 1.8, anchor);
    const after = screenToWorld(anchor, zoomed);
    expect(after.x).toBeCloseTo(before.x, 6);
    expect(after.y).toBeCloseTo(before.y, 6);
    expect(zoomed.zoom).toBeCloseTo(1.8, 6);
  });

  it("limita o zoom ao intervalo permitido", () => {
    expect(zoomAtPoint({ x: 0, y: 0, zoom: 1 }, 99, { x: 0, y: 0 }).zoom).toBe(3);
    expect(zoomAtPoint({ x: 0, y: 0, zoom: 1 }, 0.001, { x: 0, y: 0 }).zoom).toBe(0.1);
  });

  it("enquadra um retângulo no centro da área disponível", () => {
    const viewport = fitViewport({ x: 0, y: 0, w: 1000, h: 1000 }, { width: 800, height: 600 }, 100, 1);
    expect(viewport.zoom).toBeLessThanOrEqual(1);
    expect(viewport.zoom).toBeGreaterThan(0);
    const center = worldToScreen({ x: 500, y: 500 }, viewport);
    expect(center.x).toBeCloseTo(400, 5);
    expect(center.y).toBeCloseTo(300, 5);
  });

  it("detecta interseção de retângulos e normaliza retângulos invertidos", () => {
    expect(rectsIntersect({ x: 0, y: 0, w: 100, h: 100 }, { x: 90, y: 90, w: 50, h: 50 })).toBe(true);
    expect(rectsIntersect({ x: 0, y: 0, w: 100, h: 100 }, { x: 200, y: 200, w: 50, h: 50 })).toBe(false);
    const rect = rectFromPoints({ x: 100, y: 100 }, { x: 40, y: 20 });
    expect(rect).toEqual({ x: 40, y: 20, w: 60, h: 80 });
  });

  it("ancora conectores na interseção da reta até o centro do elemento", () => {
    const rect = { x: 0, y: 0, w: 100, h: 400 };
    const center = centerOf(rect);
    const target = { x: 200, y: 100 };
    const anchor = anchorPoint(rect, target);

    expect(anchor.x).toBeCloseTo(100, 6);
    expect(anchor.y).toBeCloseTo(166.6667, 3);
    expect(anchor.y - center.y).toBeCloseTo(((target.y - center.y) / (target.x - center.x)) * (anchor.x - center.x), 6);
  });

  it("não prende a âncora no canto em alvos diagonais", () => {
    const rect = { x: 0, y: 0, w: 100, h: 400 };
    const anchor = anchorPoint(rect, { x: 200, y: 500 });
    expect(anchor).toEqual({ x: 100, y: 300 });
    expect(anchor.y).not.toBe(400);
  });

  it("gera curva e seta com pontos válidos", () => {
    const geometry = connectorGeometry({ x: 0, y: 0 }, { x: 200, y: 100 });
    expect(geometry.path.startsWith("M 0 0")).toBe(true);
    expect(Number.isFinite(geometry.mid.x)).toBe(true);
    expect(geometry.path).toContain("C");
  });

  it("encaixa valores na grade", () => {
    expect(snapToGrid(17, 16)).toBe(16);
    expect(snapToGrid(25, 16)).toBe(32);
    expect(snapToGrid(25, 0)).toBe(25);
  });
});
