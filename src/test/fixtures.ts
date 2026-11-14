import type { AppSettings, Board, CanvasNode, ID, TemplatePayload } from "@/core/domain/types";
import { DEFAULT_SETTINGS } from "@/core/domain/constants";
import { createBoard, createNode, createWorkspace, layoutColumnNodes } from "@/core/domain/factories";
import type { HydratePayload } from "@/core/store/types";

export interface TestWorkspace {
  payload: HydratePayload;
  workspaceId: ID;
  boardId: ID;
  settings: AppSettings;
}

/** Cria um payload de hidratação mínimo, com um quadro vazio. */
export function makePayload(workspaceName = "Teste"): TestWorkspace {
  const workspace = createWorkspace(workspaceName);
  const board = createBoard({ workspaceId: workspace.id, title: "Projeto" });
  const tabId = `tab_${board.id}`;
  const settings: AppSettings = { ...DEFAULT_SETTINGS };
  const payload: HydratePayload = {
    workspaces: { [workspace.id]: workspace },
    workspaceOrder: [workspace.id],
    activeWorkspaceId: workspace.id,
    boards: { [board.id]: board },
    tabs: [{ id: tabId, boardId: board.id, workspaceId: workspace.id }],
    activeTabId: tabId,
    viewports: { [board.id]: { x: 0, y: 0, zoom: 1 } },
    settings,
    customTemplates: [],
    storageKind: "memory",
  };
  return { payload, workspaceId: workspace.id, boardId: board.id, settings };
}

export function addNodeToPayload(
  test: TestWorkspace,
  seed: Parameters<typeof createNode>[1],
): CanvasNode {
  const board = test.payload.boards[test.boardId];
  const node = createNode(board.id, seed);
  if (node.parentId) {
    const column = board.nodes[node.parentId];
    if (column) {
      const laidOut = layoutColumnNodes({ ...board.nodes, [node.id]: node }, column);
      for (const child of laidOut) board.nodes[child.id] = child;
      return board.nodes[node.id];
    }
  }
  board.nodes[node.id] = node;
  return node;
}

export function boardOf(test: TestWorkspace): Board {
  return test.payload.boards[test.boardId];
}

export const TEMPLATE_PAYLOAD: TemplatePayload = {
  title: "Teste",
  items: [
    {
      key: "col",
      type: "column",
      x: 40,
      y: 40,
      w: 300,
      h: 260,
      fields: { title: "Coluna", color: "sky" },
      children: [
        { key: "t1", type: "task", x: 0, y: 0, w: 280, h: 60, fields: { title: "Tarefa 1" } },
        { key: "t2", type: "note", x: 0, y: 0, w: 280, h: 120, fields: { title: "Nota 1", content: "Conteúdo" } },
      ],
    },
    { key: "n1", type: "note", x: 400, y: 40, w: 300, h: 200, fields: { title: "Nota solta", content: "Texto" } },
  ],
  connectors: [{ fromKey: "col", toKey: "n1", label: "liga" }],
};
