import { describe, expect, it } from "vitest";
import {
  DEFAULT_SKETCH_STYLE,
  arrowHeadPath,
  createSketch,
  duplicateElements,
  elementBounds,
  elementPath,
  hitTestElement,
  moveElement,
  sanitizeSketch,
  sketchBounds,
  sketchViewBox,
  strokePath,
  type SketchElement,
} from "./sketch";

const style = { ...DEFAULT_SKETCH_STYLE };

const rectangle: SketchElement = {
  id: "shape-1",
  kind: "rect",
  style,
  rect: { x: 100, y: 50, w: 80, h: 40 },
};

const stroke: SketchElement = {
  id: "stroke-1",
  kind: "stroke",
  style,
  points: [
    { x: 10, y: 10 },
    { x: 40, y: 30 },
    { x: 70, y: 12 },
  ],
};

const text: SketchElement = {
  id: "text-1",
  kind: "text",
  style,
  at: { x: 0, y: 0 },
  text: "Duas\nlinhas",
  fontSize: 20,
};

describe("modelo do desenho nativo", () => {
  it("cria um documento vazio e válido", () => {
    const sketch = createSketch();
    expect(sketch.version).toBe(1);
    expect(sketch.elements).toEqual([]);
  });

  it("calcula limites de formas, traços e texto", () => {
    expect(elementBounds(rectangle)).toEqual({ x: 100, y: 50, w: 80, h: 40 });
    expect(elementBounds(stroke)).toEqual({ x: 10, y: 10, w: 60, h: 20 });
    const textBounds = elementBounds(text);
    expect(textBounds.h).toBeGreaterThan(40);
    expect(textBounds.w).toBeGreaterThan(20);

    const bounds = sketchBounds([rectangle, stroke, text]);
    expect(bounds).not.toBeNull();
    expect(bounds?.x).toBeLessThanOrEqual(0);
    expect(bounds?.w).toBeGreaterThanOrEqual(180);
    expect(sketchViewBox([rectangle]).startsWith("76 26")).toBe(true);
  });

  it("atinge o contorno e o interior conforme o preenchimento", () => {
    expect(hitTestElement(rectangle, { x: 100, y: 70 }, 4)).toBe(true);
    expect(hitTestElement(rectangle, { x: 140, y: 70 }, 4)).toBe(false);
    expect(hitTestElement({ ...rectangle, style: { ...style, fill: "#eee" } }, { x: 140, y: 70 }, 4)).toBe(true);
    expect(hitTestElement(stroke, { x: 40, y: 31 }, 4)).toBe(true);
    expect(hitTestElement(stroke, { x: 40, y: 70 }, 4)).toBe(false);
  });

  it("move elementos de todos os tipos", () => {
    const movedShape = moveElement(rectangle, { x: 10, y: -5 });
    expect(movedShape.kind === "rect" && movedShape.rect).toEqual({ x: 110, y: 45, w: 80, h: 40 });

    const movedStroke = moveElement(stroke, { x: 5, y: 5 });
    expect(movedStroke.kind === "stroke" && movedStroke.points[0]).toEqual({ x: 15, y: 15 });

    const movedText = moveElement(text, { x: 2, y: 3 });
    expect(movedText.kind === "text" && movedText.at).toEqual({ x: 2, y: 3 });
  });

  it("duplica elementos selecionados com novos ids e deslocamento", () => {
    const clones = duplicateElements([rectangle, stroke, text], [rectangle.id, text.id]);
    expect(clones).toHaveLength(2);
    expect(clones[0].id).not.toBe(rectangle.id);
    expect(clones[1].id).not.toBe(text.id);
    expect(elementBounds(clones[0])).toEqual({ x: 124, y: 74, w: 80, h: 40 });
    expect(clones[1].kind === "text" && clones[1].at).toEqual({ x: 24, y: 24 });
    expect(duplicateElements([rectangle], [])).toEqual([]);
  });

  it("gera caminhos SVG com curvas e setas", () => {
    expect(strokePath([{ x: 0, y: 0 }])).toContain("M 0 0");
    expect(strokePath(stroke.kind === "stroke" ? stroke.points : [])).toContain("C ");
    expect(elementPath(rectangle)).toBe("M 100 50 H 180 V 90 H 100 Z");
    expect(
      arrowHeadPath({
        id: "arrow-1",
        kind: "arrow",
        style,
        from: { x: 0, y: 0 },
        to: { x: 100, y: 0 },
      }),
    ).toContain("L");
  });

  it("normaliza dados carregados e descarta elementos inválidos", () => {
    const sketch = sanitizeSketch({
      version: 99,
      updatedAt: 1234,
      elements: [
        { id: "a", kind: "rect", rect: { x: 10, y: 10, w: -20, h: 5 }, style: { stroke: "#000", width: 999 } },
        { id: "b", kind: "stroke", points: [{ x: 1, y: 2 }, { x: "x", y: 2 }] },
        { id: "c", kind: "desconhecido" },
        null,
      ],
    });

    expect(sketch?.version).toBe(1);
    expect(sketch?.updatedAt).toBe(1234);
    expect(sketch?.elements).toHaveLength(2);
    const shape = sketch?.elements[0];
    expect(shape?.kind === "rect" && shape.rect).toEqual({ x: -10, y: 10, w: 20, h: 5 });
    expect(shape?.style.width).toBe(24);
    const line = sketch?.elements[1];
    expect(line?.kind === "stroke" && line.points).toEqual([{ x: 1, y: 2 }]);

    expect(sanitizeSketch(null)).toBeNull();
    expect(sanitizeSketch({ elements: "não é lista" })).toBeNull();
  });
});
