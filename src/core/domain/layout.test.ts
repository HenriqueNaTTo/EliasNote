import { describe, expect, it } from "vitest";
import { renderOrder, visibleNodes, nodesBounds, columnAtPoint, maxZ } from "./layout";
import { createNode, layoutColumnNodes } from "./factories";
import type { CanvasNode } from "./types";

function node(overrides: Partial<CanvasNode> & Pick<CanvasNode, "id" | "type">): CanvasNode {
  return createNode("board", { x: 0, y: 0, w: 100, h: 100, ...overrides });
}

describe("layout do canvas", () => {
  it("coloca filhos de coluna imediatamente após a coluna e respeita z", () => {
    const nodes: Record<string, CanvasNode> = {
      a: node({ id: "a", type: "note", z: 1 }),
      col: node({ id: "col", type: "column", z: 2 }),
      child: node({ id: "child", type: "task", z: 99, parentId: "col", order: 0 }),
      b: node({ id: "b", type: "card", z: 3 }),
    };
    const ordered = renderOrder(nodes).map((item) => item.id);
    expect(ordered).toEqual(["a", "col", "child", "b"]);
  });

  it("faz culling de milhares de elementos mantendo apenas os visíveis", () => {
    const ordered: CanvasNode[] = [];
    for (let index = 0; index < 5000; index += 1) {
      ordered.push(
        node({
          id: `node-${index}`,
          type: "note",
          x: (index % 100) * 400,
          y: Math.floor(index / 100) * 300,
        }),
      );
    }
    const visible = visibleNodes(ordered, { x: 0, y: 0, w: 1200, h: 800 }, 100);
    expect(visible.length).toBeGreaterThan(0);
    expect(visible.length).toBeLessThan(40);
  });

  it("calcula os limites ignorando elementos ocultos", () => {
    const bounds = nodesBounds([
      node({ id: "a", type: "note", x: 20, y: 30, w: 100, h: 50 }),
      node({ id: "b", type: "note", x: 200, y: 100, w: 60, h: 60, hidden: true }),
    ]);
    expect(bounds).toEqual({ x: 20, y: 30, w: 100, h: 50 });
    expect(nodesBounds([])).toBeNull();
  });

  it("encontra a coluna sob o ponto mesmo com sobreposição", () => {
    const nodes: Record<string, CanvasNode> = {
      c1: node({ id: "c1", type: "column", x: 0, y: 0, w: 300, h: 300, z: 1 }),
      c2: node({ id: "c2", type: "column", x: 100, y: 100, w: 300, h: 300, z: 2 }),
    };
    expect(columnAtPoint(nodes, { x: 200, y: 200 })?.id).toBe("c2");
    expect(columnAtPoint(nodes, { x: 500, y: 500 })).toBeNull();
  });

  it("recalcula a posição e a altura da coluna ao distribuir os filhos", () => {
    const column = node({ id: "col", type: "column", x: 100, y: 100, w: 320, h: 220 });
    const childA = node({ id: "a", type: "task", parentId: "col", order: 0, h: 60 });
    const childB = node({ id: "b", type: "note", parentId: "col", order: 1, h: 120 });
    const laidOut = layoutColumnNodes({ col: column, a: childA, b: childB }, column);
    expect(laidOut[0].x).toBe(112);
    expect(laidOut[0].y).toBe(158);
    expect(laidOut[1].y).toBe(158 + 60 + 10);
    expect(laidOut[0].w).toBe(320 - 24);
    expect(maxZ({ a: childA, b: childB })).toBeGreaterThan(0);
  });
});
