import { describe, expect, it } from "vitest";
import { searchBoards, findBacklinks, markdownToSearchText, makeSnippet } from "./search";
import { makePayload, addNodeToPayload } from "@/test/fixtures";
import type { Board, ID } from "@/core/domain/types";
import { refForBoard, refForNode } from "@/core/domain/refs";
import { createBoard, createNode } from "@/core/domain/factories";

function boardsFixture(): { boards: Record<ID, Board>; boardId: ID } {
  const test = makePayload();
  const note = addNodeToPayload(test, {
    type: "note",
    x: 0,
    y: 0,
    title: "Planejamento do lançamento",
    content: "Precisamos revisar o **cronograma** e as tarefas críticas.",
  });
  addNodeToPayload(test, {
    type: "checklist",
    x: 0,
    y: 0,
    title: "Checklist de QA",
    items: [{ id: "i1", text: "Testar navegação por teclado", done: false }],
  });
  addNodeToPayload(test, { type: "task", x: 0, y: 0, title: "Enviar convite aos clientes" });
  test.payload.boards[test.boardId].nodes[note.id].references = [refForBoard("outro")];
  return { boards: test.payload.boards, boardId: test.boardId };
}

describe("busca global", () => {
  it("encontra por título, conteúdo e itens de checklist", () => {
    const { boards } = boardsFixture();
    const titles = searchBoards(boards, "lançamento").map((result) => result.title);
    expect(titles[0]).toContain("Planejamento");
    expect(searchBoards(boards, "cronograma").length).toBeGreaterThan(0);
    expect(searchBoards(boards, "teclado").length).toBeGreaterThan(0);
    expect(searchBoards(boards, "inexistente")).toHaveLength(0);
  });

  it("filtra por tipo e por quadro", () => {
    const { boards, boardId } = boardsFixture();
    const tasks = searchBoards(boards, "", { type: "task" });
    expect(tasks.every((result) => result.type === "task")).toBe(true);
    expect(searchBoards(boards, "convite", { type: "note" })).toHaveLength(0);
    expect(searchBoards(boards, "", { boardId }).length).toBeGreaterThan(0);
  });

  it("retorna vazio para quadro sem correspondência", () => {
    const { boards } = boardsFixture();
    expect(searchBoards(boards, "zzz", { type: "drawing" })).toHaveLength(0);
  });

  it("normaliza markdown e gera snippets com contexto", () => {
    expect(markdownToSearchText("# Título\n\n- [ ] tarefa **forte**")).toBe("Título tarefa forte");
    const snippet = makeSnippet("um texto longo com palavra-chave no meio do conteúdo", "palavra-chave", 40);
    expect(snippet).toContain("palavra-chave");
  });

  it("calcula backlinks de quadro e de elemento", () => {
    const { boards, boardId } = boardsFixture();
    const note = Object.values(boards[boardId].nodes).find((node) => node.title?.includes("Planejamento"));
    expect(note).toBeDefined();

    const child = createBoard({ workspaceId: Object.keys(boards)[0], title: "Filho" });
    const childNode = createNode(boardId, { type: "board", x: 0, y: 0, childBoardId: child.id, title: "Filho" });
    boards[boardId].nodes[childNode.id] = childNode;
    boards[child.id] = child;

    const boardBacklinks = findBacklinks(boards, refForBoard(child.id));
    expect(boardBacklinks).toHaveLength(1);
    expect(boardBacklinks[0].board.id).toBe(boardId);

    const noteBacklinks = findBacklinks(boards, refForNode(note?.id ?? ""));
    expect(noteBacklinks).toHaveLength(0);
    const other = Object.values(boards[boardId].nodes).find((node) => node.type === "task");
    if (other && note) {
      other.references = [refForNode(note.id)];
      expect(findBacklinks(boards, refForNode(note.id))).toHaveLength(1);
    }
  });
});
