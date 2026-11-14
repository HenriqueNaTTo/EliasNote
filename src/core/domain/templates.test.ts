import { describe, expect, it } from "vitest";
import { TEMPLATES, boardToTemplatePayload, instantiateTemplate } from "./templates";
import { createBoard, createWorkspace } from "./factories";
import { TEMPLATE_PAYLOAD } from "@/test/fixtures";
import type { CanvasNode } from "./types";

function board() {
  const workspace = createWorkspace("Teste");
  return createBoard({ workspaceId: workspace.id, title: "Origem" });
}

describe("templates", () => {
  it("instancia colunas com filhos posicionados e conectores", () => {
    const target = board();
    const { nodes, connectors } = instantiateTemplate(target, TEMPLATE_PAYLOAD, { x: 100, y: 50 });
    expect(nodes).toHaveLength(4);
    expect(connectors).toHaveLength(1);
    const column = nodes.find((node) => node.type === "column") as CanvasNode;
    const children = nodes.filter((node) => node.parentId === column.id);
    expect(children).toHaveLength(2);
    expect(children[0].x).toBe(column.x + 12);
    expect(children[0].y).toBe(column.y + 46 + 12);
    expect(children[1].y).toBeGreaterThan(children[0].y);
    expect(column.h).toBeGreaterThanOrEqual(children[1].y + children[1].h - column.y);
    expect(connectors[0].from.nodeId).toBe(column.id);
  });

  it("mantém todos os templates embutidos válidos e com conteúdo", () => {
    expect(TEMPLATES.length).toBeGreaterThanOrEqual(8);
    for (const template of TEMPLATES) {
      const payload = template.build();
      expect(payload.items.length).toBeGreaterThan(0);
      const target = board();
      const { nodes } = instantiateTemplate(target, payload, { x: 0, y: 0 });
      expect(nodes.length).toBeGreaterThan(0);
      for (const node of nodes) {
        expect(Number.isFinite(node.x)).toBe(true);
        expect(node.w).toBeGreaterThan(0);
      }
    }
  });

  it("exporta o quadro como modelo e reimporta preservando conteúdo", () => {
    const target = board();
    const payload = TEMPLATE_PAYLOAD;
    const { nodes } = instantiateTemplate(target, payload, { x: 0, y: 0 });
    for (const node of nodes) target.nodes[node.id] = node;

    const exported = boardToTemplatePayload(target, "Meu modelo");
    expect(exported.items.length).toBe(2);
    const columnItem = exported.items.find((item) => item.type === "column");
    expect(columnItem?.children).toHaveLength(2);
    expect(exported.items.every((item) => !("content" in (item.fields ?? {}) && item.fields?.content === undefined))).toBe(true);
    expect(exported.title).toBe("Meu modelo");

    const second = board();
    const reimported = instantiateTemplate(second, exported, { x: 20, y: 20 });
    expect(reimported.nodes).toHaveLength(4);
    const note = reimported.nodes.find((node) => node.type === "note" && node.title === "Nota solta");
    expect(note?.content).toBe("Texto");
  });
});
