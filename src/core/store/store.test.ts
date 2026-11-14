import { describe, expect, it } from "vitest";
import { createAppStore } from "@/core/store";
import { makePayload } from "@/test/fixtures";
import { refForBoard } from "@/core/domain/refs";

function setup() {
  const store = createAppStore();
  const test = makePayload();
  store.getState().hydrate(test.payload);
  return { store, test };
}

describe("store: elementos e histórico", () => {
  it("cria nós já selecionados e desfaz/refaz a criação", () => {
    const { store, test } = setup();
    const id = store.getState().addNode("note", { x: 120, y: 80 });
    expect(id).toBeTruthy();
    expect(store.getState().selection).toEqual([id]);
    expect(store.getState().boards[test.boardId].nodes[id as string].x).toBe(120);
    expect(store.getState().history.past).toHaveLength(1);

    store.getState().undo();
    expect(store.getState().boards[test.boardId].nodes[id as string]).toBeUndefined();

    store.getState().redo();
    expect(store.getState().boards[test.boardId].nodes[id as string]).toBeDefined();
  });

  it("agrupa digitação em uma única entrada de histórico", () => {
    const { store, test } = setup();
    const id = store.getState().addNode("note", { x: 0, y: 0 }) as string;
    store.getState().updateNode(id, { content: "a" }, { label: "Editar nota" });
    store.getState().updateNode(id, { content: "ab" }, { label: "Editar nota" });
    store.getState().updateNode(id, { content: "abc" }, { label: "Editar nota" });
    expect(store.getState().boards[test.boardId].nodes[id].content).toBe("abc");
    expect(store.getState().history.past).toHaveLength(2);
    store.getState().undo();
    expect(store.getState().boards[test.boardId].nodes[id].content).toBe("");
  });

  it("trata um arraste inteiro como uma transação de histórico", () => {
    const { store, test } = setup();
    const id = store.getState().addNode("card", { x: 200, y: 200 }) as string;
    store.getState().beginTransaction("Mover elementos");
    store.getState().moveNodes([id], { x: 10, y: 0 });
    store.getState().moveNodes([id], { x: 10, y: 5 });
    store.getState().endTransaction();
    expect(store.getState().boards[test.boardId].nodes[id].x).toBe(220);
    expect(store.getState().history.past).toHaveLength(2);
    store.getState().undo();
    expect(store.getState().boards[test.boardId].nodes[id].x).toBe(200);
  });

  it("adiciona elemento em coluna, reorganiza layout e move a coluna com os filhos", () => {
    const { store, test } = setup();
    const columnId = store.getState().addNode("column", { x: 100, y: 100 }) as string;
    const childId = store.getState().addNode("task", { x: 0, y: 0 }, { parentId: columnId }) as string;
    let board = store.getState().boards[test.boardId];
    expect(board.nodes[childId].parentId).toBe(columnId);
    expect(board.nodes[childId].x).toBe(board.nodes[columnId].x + 12);
    const initialHeight = board.nodes[columnId].h;

    store.getState().resizeNode(columnId, { x: 100, y: 100, w: 420, h: initialHeight });
    board = store.getState().boards[test.boardId];
    expect(board.nodes[childId].w).toBe(420 - 24);

    const childYBefore = board.nodes[childId].y;
    store.getState().moveNodes([columnId], { x: 60, y: 40 });
    board = store.getState().boards[test.boardId];
    expect(board.nodes[columnId].x).toBe(160);
    expect(board.nodes[childId].x).toBe(172);
    expect(board.nodes[childId].y).toBe(childYBefore + 40);
  });

  it("remove coluna junto com os filhos e conectores associados", () => {
    const { store, test } = setup();
    const columnId = store.getState().addNode("column", { x: 100, y: 100 }) as string;
    const childId = store.getState().addNode("note", { x: 0, y: 0 }, { parentId: columnId }) as string;
    const otherId = store.getState().addNode("card", { x: 500, y: 100 }) as string;
    store.getState().addConnector(
      { nodeId: childId, x: 0, y: 0 },
      { nodeId: otherId, x: 0, y: 0 },
    );
    expect(Object.keys(store.getState().boards[test.boardId].connectors)).toHaveLength(1);
    store.getState().removeNodes([columnId]);
    const board = store.getState().boards[test.boardId];
    expect(board.nodes[columnId]).toBeUndefined();
    expect(board.nodes[childId]).toBeUndefined();
    expect(board.nodes[otherId]).toBeDefined();
    expect(Object.keys(board.connectors)).toHaveLength(0);
  });

  it("duplica a seleção com novos identificadores", () => {
    const { store, test } = setup();
    const id = store.getState().addNode("checklist", { x: 50, y: 50 }) as string;
    store.getState().duplicateNodes([id]);
    const nodes = Object.values(store.getState().boards[test.boardId].nodes);
    expect(nodes).toHaveLength(2);
    expect(nodes[1].id).not.toBe(nodes[0].id);
    expect(nodes[1].x).toBe(86);
  });

  it("conclui tarefa e resolve comentário com autor local", () => {
    const { store, test } = setup();
    const taskId = store.getState().addNode("task", { x: 0, y: 0 }) as string;
    store.getState().toggleTask(taskId);
    expect(store.getState().boards[test.boardId].nodes[taskId].done).toBe(true);

    const commentId = store.getState().addNode("comment", { x: 0, y: 0 }) as string;
    store.getState().addCommentReply(commentId, "Revisar amanhã");
    store.getState().toggleCommentResolved(commentId);
    const comment = store.getState().boards[test.boardId].nodes[commentId];
    expect(comment.replies?.[0].content).toBe("Revisar amanhã");
    expect(comment.resolved).toBe(true);
  });

  it("registra referências bidirecionais para quadros", () => {
    const { store, test } = setup();
    const otherBoardId = store.getState().createBoard({ title: "Outro", open: false }) as string;
    const noteId = store.getState().addNode("note", { x: 0, y: 0 }) as string;
    store.getState().addReference(noteId, refForBoard(otherBoardId));
    const note = store.getState().boards[test.boardId].nodes[noteId];
    expect(note.references).toContain(refForBoard(otherBoardId));

    const imported = store.getState().boards[otherBoardId];
    expect(imported.title).toBe("Outro");
    expect(store.getState().boards[test.boardId].childOrder).not.toContain(otherBoardId);
  });
});
