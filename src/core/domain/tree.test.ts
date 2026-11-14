import { describe, expect, it } from "vitest";
import { buildBoardTree, boardPath, descendantBoardIds, isDescendantOf, orderedChildren, reorderList, boardStats } from "./tree";
import { createBoard, createNode, createWorkspace } from "./factories";

function fixture() {
  const workspace = createWorkspace("WS");
  const rootA = createBoard({ workspaceId: workspace.id, title: "A" });
  const rootB = createBoard({ workspaceId: workspace.id, title: "B" });
  const child1 = createBoard({ workspaceId: workspace.id, title: "A1", parentId: rootA.id });
  const child2 = createBoard({ workspaceId: workspace.id, title: "A2", parentId: rootA.id });
  rootA.childOrder = [child2.id, child1.id];
  const boards = {
    [rootA.id]: rootA,
    [rootB.id]: rootB,
    [child1.id]: child1,
    [child2.id]: child2,
  };
  return { workspace, rootA, rootB, child1, child2, boards };
}

describe("árvore de quadros", () => {
  it("usa childOrder para ordenar os filhos", () => {
    const { boards, rootA, child1, child2 } = fixture();
    const ordered = orderedChildren(boards, rootA);
    expect(ordered.map((board) => board.id)).toEqual([child2.id, child1.id]);
    const tree = buildBoardTree(boards, rootA.workspaceId);
    const rootNode = tree.find((node) => node.board.id === rootA.id);
    expect(rootNode?.children.map((child) => child.board.title)).toEqual(["A2", "A1"]);
  });

  it("calcula caminho e descendentes", () => {
    const { boards, rootA, child1, child2 } = fixture();
    expect(boardPath(boards, child1.id).map((board) => board.title)).toEqual(["A", "A1"]);
    expect(descendantBoardIds(boards, rootA.id).sort()).toEqual([child1.id, child2.id].sort());
    expect(isDescendantOf(boards, child1.id, rootA.id)).toBe(true);
    expect(isDescendantOf(boards, rootA.id, child1.id)).toBe(false);
  });

  it("reordena listas sem mutar a original", () => {
    const list = ["a", "b", "c"];
    expect(reorderList(list, "c", 0)).toEqual(["c", "a", "b"]);
    expect(list).toEqual(["a", "b", "c"]);
  });

  it("conta tarefas de nós e checklists", () => {
    const { rootA } = fixture();
    const nodeTask = createNode(rootA.id, { type: "task", x: 0, y: 0, title: "T", done: true });
    const nodeChecklist = createNode(rootA.id, {
      type: "checklist",
      x: 0,
      y: 0,
      title: "C",
      items: [
        { id: "1", text: "um", done: true },
        { id: "2", text: "dois", done: false },
      ],
    });
    rootA.nodes[nodeTask.id] = nodeTask;
    rootA.nodes[nodeChecklist.id] = nodeChecklist;
    expect(boardStats(rootA)).toEqual({ nodes: 2, boards: 0, tasks: 3, tasksDone: 2 });
  });
});
