import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import {
  DEFAULT_SKETCH_STYLE,
  createSketch,
  createSketchStyle,
  type SketchElement,
} from "@/core/domain/sketch";
import { SketchEditor } from "./SketchEditor";

function renderEditor(onChange = vi.fn()) {
  const result = render(
    <SketchEditor
      doc={createSketch()}
      tool="rect"
      style={createSketchStyle()}
      selectedIds={[]}
      fitNonce={0}
      onToolChange={vi.fn()}
      onSelectionChange={vi.fn()}
      onChange={onChange}
    />,
  );
  const svg = result.container.querySelector("svg");
  expect(svg).not.toBeNull();
  return { ...result, svg: svg as SVGSVGElement, onChange };
}

describe("editor do desenho nativo", () => {
  it("desenha um retângulo por arraste e salva no histórico", () => {
    const { svg, onChange } = renderEditor();
    fireEvent.pointerDown(svg, { button: 0, clientX: 20, clientY: 20, pointerId: 1 });
    fireEvent.pointerMove(svg, { clientX: 140, clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(svg, { clientX: 140, clientY: 100, pointerId: 1 });

    expect(onChange).toHaveBeenCalled();
    const [elements, options] = onChange.mock.calls.at(-1) as [SketchElement[], { history?: boolean }];
    expect(options?.history).toBe(true);
    const shape = elements.find((element) => element.kind === "rect");
    expect(shape?.kind).toBe("rect");
    expect(shape?.style).toEqual(DEFAULT_SKETCH_STYLE);
    if (shape?.kind === "rect") {
      expect(Number.isFinite(shape.rect.x)).toBe(true);
      expect(shape.rect.w).toBeGreaterThan(50);
      expect(shape.rect.h).toBeGreaterThan(30);
    }
  });

  it("cria uma forma de tamanho padrão ao clicar sem arrastar", () => {
    const { svg, onChange } = renderEditor();
    fireEvent.pointerDown(svg, { button: 0, clientX: 10, clientY: 10, pointerId: 2 });
    fireEvent.pointerUp(svg, { clientX: 10, clientY: 10, pointerId: 2 });
    const [elements] = onChange.mock.calls.at(-1) as [SketchElement[]];
    const shape = elements.find((element) => element.kind === "rect");
    expect(shape?.kind === "rect" && shape.rect.w).toBe(150);
    expect(shape?.kind === "rect" && shape.rect.h).toBe(100);
  });
});
