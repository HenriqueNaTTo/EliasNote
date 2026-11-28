import { describe, expect, it } from "vitest";
import { DEFAULT_SKETCH_STYLE, type SketchDocument } from "@/core/domain/sketch";
import { sketchToSvg } from "./sketchExport";

const style = { ...DEFAULT_SKETCH_STYLE, fill: "#c7e3f7" };

const sketch: SketchDocument = {
  version: 1,
  updatedAt: 1,
  elements: [
    { id: "r", kind: "rect", style, rect: { x: 10, y: 20, w: 100, h: 60 } },
    {
      id: "s",
      kind: "stroke",
      style,
      points: [
        { x: 0, y: 0 },
        { x: 20, y: 10 },
        { x: 40, y: 0 },
      ],
    },
    { id: "a", kind: "arrow", style, from: { x: 0, y: 0 }, to: { x: 80, y: 40 } },
    {
      id: "t",
      kind: "text",
      style,
      at: { x: 5, y: 5 },
      text: "Sistema <b> & magia",
      fontSize: 20,
    },
  ],
};

describe("exportação do desenho nativo", () => {
  it("gera um SVG com fundo, formas, seta e texto escapado", () => {
    const svg = sketchToSvg(sketch);
    expect(svg.startsWith("<svg xmlns=")).toBe(true);
    expect(svg).toContain('fill="#ffffff"');
    expect(svg).toContain('fill="#c7e3f7"');
    expect(svg).toContain("H 110");
    expect(svg).toContain("Sistema &lt;b&gt; &amp; magia");
    expect(svg.match(/<path/g)?.length).toBeGreaterThanOrEqual(3);
    expect(svg).toContain("stroke-linecap=\"round\"");
    expect(svg).not.toContain("<b>");
  });

  it("mantém um SVG válido mesmo sem elementos", () => {
    const empty = sketchToSvg({ version: 1, updatedAt: 0, elements: [] });
    expect(empty).toContain("<svg");
    expect(empty).toContain("</svg>");
    expect(empty).not.toContain("<path");
  });

  it("permite exportar sem fundo", () => {
    const svg = sketchToSvg(sketch, { background: null, scale: 1 });
    expect(svg).not.toContain('fill="#ffffff"');
    expect(svg).toContain('width="');
  });
});
