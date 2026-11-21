import { describe, expect, it, vi } from "vitest";
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

  it("seleciona apenas elementos visíveis quando há filtro de etiqueta", () => {
    const { store, test } = setup();
    const combat = store.getState().addNode("note", { x: 0, y: 0 }, { fields: { tags: ["combate"] } }) as string;
    store.getState().addNode("note", { x: 100, y: 0 }, { fields: { tags: ["arte"] } });

    store.getState().setTagFilter(test.boardId, "combate");
    store.getState().selectAll();
    expect(store.getState().selection).toEqual([combat]);
    expect(store.getState().selectedConnectors).toEqual([]);
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

describe("store: mover e copiar elementos entre quadros", () => {
  function setupWithTarget() {
    const context = setup();
    const targetBoardId = context.store
      .getState()
      .createBoard({ title: "Destino", open: false }) as string;
    return { ...context, targetBoardId };
  }

  it("move o elemento para o destino e desfaz tudo em uma única ação", () => {
    const { store, test, targetBoardId } = setupWithTarget();
    const noteId = store.getState().addNode("note", { x: 100, y: 100 }) as string;

    const result = store.getState().transferNodes([noteId], targetBoardId, "move");
    expect(result).toMatchObject({ boardId: targetBoardId, title: "Destino", count: 1, mode: "move" });
    expect(store.getState().boards[test.boardId].nodes[noteId]).toBeUndefined();

    const moved = store.getState().boards[targetBoardId].nodes[noteId];
    expect(moved.boardId).toBe(targetBoardId);
    // Centralizado na área visível (canvasSize vazio usa 400x300).
    expect(moved.x).toBe(400 - 280 / 2);
    expect(moved.y).toBe(300 - 220 / 2);

    store.getState().undo();
    expect(store.getState().boards[test.boardId].nodes[noteId]).toBeDefined();
    expect(store.getState().boards[targetBoardId].nodes[noteId]).toBeUndefined();
  });

  it("copia uma coluna com os filhos sem alterar a origem", () => {
    const { store, test, targetBoardId } = setupWithTarget();
    const columnId = store.getState().addNode("column", { x: 100, y: 100 }) as string;
    const childId = store.getState().addNode("note", { x: 0, y: 0 }, { parentId: columnId }) as string;

    expect(store.getState().transferNodes([columnId], targetBoardId, "copy")?.count).toBe(2);

    const source = store.getState().boards[test.boardId];
    expect(Object.keys(source.nodes)).toHaveLength(2);
    expect(source.nodes[childId].parentId).toBe(columnId);

    const targetNodes = Object.values(store.getState().boards[targetBoardId].nodes);
    expect(targetNodes).toHaveLength(2);
    const copiedColumn = targetNodes.find((node) => node.type === "column");
    const copiedChild = targetNodes.find((node) => node.type === "note");
    expect(copiedColumn?.id).not.toBe(columnId);
    expect(copiedChild?.parentId).toBe(copiedColumn?.id);
    expect(copiedChild?.id).not.toBe(childId);
    expect(copiedChild?.x).toBe((copiedColumn?.x ?? 0) + 12);
  });

  it("move a coluna junto com os filhos e reorganiza o layout no destino", () => {
    const { store, test, targetBoardId } = setupWithTarget();
    const columnId = store.getState().addNode("column", { x: 100, y: 100 }) as string;
    const childId = store.getState().addNode("note", { x: 0, y: 0 }, { parentId: columnId }) as string;

    expect(store.getState().transferNodes([columnId], targetBoardId, "move")?.count).toBe(2);

    const source = store.getState().boards[test.boardId];
    expect(source.nodes[columnId]).toBeUndefined();
    expect(source.nodes[childId]).toBeUndefined();

    const target = store.getState().boards[targetBoardId];
    expect(target.nodes[columnId].boardId).toBe(targetBoardId);
    expect(target.nodes[childId].parentId).toBe(columnId);
    expect(target.nodes[childId].x).toBe(target.nodes[columnId].x + 12);
  });

  it("leva o conector entre dois elementos movidos", () => {
    const { store, test, targetBoardId } = setupWithTarget();
    const firstId = store.getState().addNode("note", { x: 0, y: 0 }) as string;
    const secondId = store.getState().addNode("card", { x: 400, y: 0 }) as string;
    store.getState().addConnector({ nodeId: firstId, x: 0, y: 0 }, { nodeId: secondId, x: 0, y: 0 });

    store.getState().transferNodes([firstId, secondId], targetBoardId, "move");

    expect(Object.keys(store.getState().boards[test.boardId].connectors)).toHaveLength(0);
    const connectors = Object.values(store.getState().boards[targetBoardId].connectors);
    expect(connectors).toHaveLength(1);
    expect(connectors[0].from.nodeId).toBe(firstId);
    expect(connectors[0].to.nodeId).toBe(secondId);
  });

  it("leva o subquadro vinculado ao mover o cartão de quadro", () => {
    const { store, test, targetBoardId } = setupWithTarget();
    const boardNodeId = store.getState().addBoardNode(test.boardId, { x: 40, y: 40 }, "Filho") as string;
    const childBoardId = store.getState().boards[test.boardId].nodes[boardNodeId].childBoardId as string;
    expect(store.getState().boards[childBoardId].parentId).toBe(test.boardId);

    store.getState().transferNodes([boardNodeId], targetBoardId, "move");

    expect(store.getState().boards[childBoardId].parentId).toBe(targetBoardId);
    expect(store.getState().boards[targetBoardId].childOrder).toContain(childBoardId);
    expect(store.getState().boards[test.boardId].childOrder).not.toContain(childBoardId);
  });

  it("recusa destinos inválidos e elementos bloqueados", () => {
    const { store, test, targetBoardId } = setupWithTarget();
    const lockedId = store.getState().addNode("card", { x: 0, y: 0 }) as string;
    store.getState().updateNode(lockedId, { locked: true });

    expect(store.getState().transferNodes([lockedId], targetBoardId, "move")).toBeNull();
    expect(store.getState().boards[test.boardId].nodes[lockedId]).toBeDefined();
    expect(store.getState().boards[targetBoardId].nodes[lockedId]).toBeUndefined();
    expect(store.getState().transferNodes([lockedId], test.boardId, "move")).toBeNull();
  });

  it("controla o arraste até o quadro e o flash de confirmação", () => {
    vi.useFakeTimers();
    try {
      const { store, targetBoardId } = setupWithTarget();
      const noteId = store.getState().addNode("note", { x: 10, y: 10 }) as string;

      store.getState().startNodeDrag([noteId]);
      expect(store.getState().nodeDrag).toMatchObject({ nodeIds: [noteId], overBoardId: null, mode: "move" });

      store.getState().hoverNodeDragTarget(targetBoardId, "copy");
      expect(store.getState().nodeDrag).toMatchObject({ overBoardId: targetBoardId, mode: "copy" });

      store.getState().endNodeDrag();
      expect(store.getState().nodeDrag).toBeNull();

      store.getState().flashDropTarget(targetBoardId);
      expect(store.getState().dropFlash?.boardId).toBe(targetBoardId);
      vi.advanceTimersByTime(700);
      expect(store.getState().dropFlash).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});
