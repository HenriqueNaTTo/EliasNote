import { describe, expect, it } from "vitest";
import { createBoard, createNode } from "./factories";
import type { Board, CanvasNode } from "./types";
import {
  MAX_TAG_LENGTH,
  collectBoardTags,
  nodeHasTag,
  normalizeTag,
  tagKey,
  uniqueTags,
  visibleNodeIdsForTag,
} from "./tags";

function addNode(board: Board, seed: Parameters<typeof createNode>[1]): CanvasNode {
  const node = createNode(board.id, seed);
  board.nodes[node.id] = node;
  return node;
}

function board(): Board {
  return createBoard({ workspaceId: "ws", title: "Balanceamento" });
}

describe("etiquetas: normalização", () => {
  it("remove #, espaços e limita o tamanho", () => {
    expect(normalizeTag("  #combate  ")).toBe("combate");
    expect(normalizeTag("#balanceamento   de   dano")).toBe("balanceamento de dano");
    expect(normalizeTag("")).toBe("");
    expect(normalizeTag("x".repeat(MAX_TAG_LENGTH + 10))).toHaveLength(MAX_TAG_LENGTH);
    expect(tagKey("#Combate")).toBe("combate");
  });

  it("remove duplicatas por chave case-insensitive", () => {
    expect(uniqueTags(["Boss", "boss", " #BOSS ", "", "arte"])).toEqual(["Boss", "arte"]);
  });
});

describe("etiquetas: quadro", () => {
  it("conta uma vez por elemento e ignora ocultos", () => {
    const target = board();
    addNode(target, { type: "note", x: 0, y: 0, tags: ["combate", "Boss"] });
    addNode(target, { type: "task", x: 0, y: 0, tags: ["boss", "arte"] });
    addNode(target, { type: "card", x: 0, y: 0, tags: ["oculta"], hidden: true });

    expect(collectBoardTags(target)).toEqual([
      { key: "boss", label: "Boss", count: 2 },
      { key: "arte", label: "arte", count: 1 },
      { key: "combate", label: "combate", count: 1 },
    ]);
  });

  it("compara etiquetas sem diferenciar maiúsculas", () => {
    const note = addNode(board(), { type: "note", x: 0, y: 0, tags: ["Combate"] });
    expect(nodeHasTag(note, "#combate")).toBe(true);
    expect(nodeHasTag(note, "arte")).toBe(false);
  });

  it("mantém colunas ancestrais e filhos de uma coluna marcada", () => {
    const target = board();
    const column = addNode(target, { type: "column", x: 0, y: 0, title: "Sistemas" });
    const taggedChild = addNode(target, {
      type: "task",
      x: 0,
      y: 0,
      title: "Balancear dano",
      parentId: column.id,
      tags: ["combate"],
    });
    const sibling = addNode(target, { type: "task", x: 0, y: 0, title: "Arte", parentId: column.id });
    const unused = addNode(target, { type: "note", x: 0, y: 0, tags: ["arte"] });

    const visible = visibleNodeIdsForTag(target, "combate");
    expect(visible).toEqual(new Set([column.id, taggedChild.id]));
    expect(visible.has(sibling.id)).toBe(false);
    expect(visible.has(unused.id)).toBe(false);

    const taggedColumn = addNode(target, {
      type: "column",
      x: 0,
      y: 0,
      title: "Interface",
      tags: ["ui"],
    });
    const child = addNode(target, { type: "note", x: 0, y: 0, parentId: taggedColumn.id });
    const columnVisible = visibleNodeIdsForTag(target, "ui");
    expect(columnVisible.has(taggedColumn.id)).toBe(true);
    expect(columnVisible.has(child.id)).toBe(true);
  });
});
