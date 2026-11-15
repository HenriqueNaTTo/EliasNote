import type { Point } from "@/lib/geometry";
import { screenToWorld } from "@/lib/geometry";
import { uid } from "@/lib/utils";
import type { Draft } from "immer";
import type { AppStoreCreator } from "./slice";
import type { AppState, BoardSlice } from "./types";
import type { Board, CanvasNode, Connector, ID, Tab, TemplateDefinition } from "@/core/domain/types";
import {
  cloneNode,
  createBoard,
  createNode,
  createWorkspace,
} from "@/core/domain/factories";
import {
  TEMPLATES,
  boardToTemplatePayload,
  instantiateTemplate,
} from "@/core/domain/templates";
import { descendantBoardIds, isDescendantOf } from "@/core/domain/tree";
import { maxZ, nodesBounds } from "@/core/domain/layout";
import {
  activeBoard,
  duplicateBoardInDraft,
  ensureNavigation,
  openBoardInDraft,
  relayoutColumn,
} from "./helpers";

const byCreatedAt = (a: Board, b: Board) => a.createdAt - b.createdAt;

/** Insere um template no quadro informado (precisa rodar dentro de um commit). */
function insertTemplate(draft: Draft<AppState>, boardId: ID, templateId: string, anchor?: Point): void {
  const board = draft.boards[boardId];
  if (!board) return;
  const template = [...TEMPLATES, ...draft.customTemplates].find((candidate) => candidate.id === templateId);
  if (!template) return;

  const viewport = draft.viewports[boardId] ?? { x: 120, y: 100, zoom: 1 };
  const size = draft.canvasSize;
  const worldCenter =
    size.width > 0 && size.height > 0
      ? screenToWorld({ x: size.width / 2, y: size.height / 2 }, viewport)
      : { x: 400, y: 300 };
  const origin = anchor ?? { x: Math.round(worldCenter.x - 280), y: Math.round(worldCenter.y - 160) };

  const payload = template.build();
  const { nodes, connectors } = instantiateTemplate(board as Board, payload, origin);
  for (const node of nodes) board.nodes[node.id] = node;
  for (const connector of connectors) board.connectors[connector.id] = connector;
  board.updatedAt = Date.now();
  draft.selection = nodes.filter((node) => !node.parentId).map((node) => node.id);
  draft.selectedConnectors = [];
}

export const createBoardSlice: AppStoreCreator<BoardSlice> = (set, get) => ({
  workspaces: {},
  workspaceOrder: [],
  activeWorkspaceId: "",
  boards: {},
  tabs: [],
  activeTabId: null,
  expandedBoards: {},
  customTemplates: [],

  createWorkspace: (name = "Novo espaço") => {
    const workspace = createWorkspace(name);
    get().commit("Criar espaço de trabalho", (draft) => {
      draft.workspaces[workspace.id] = workspace;
      draft.workspaceOrder.push(workspace.id);
      draft.activeWorkspaceId = workspace.id;
      draft.activeTabId = null;
    });
    return workspace.id;
  },

  renameWorkspace: (id, name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    get().commit("Renomear espaço", (draft) => {
      const workspace = draft.workspaces[id];
      if (!workspace) return;
      workspace.name = trimmed;
      workspace.updatedAt = Date.now();
    });
  },

  deleteWorkspace: (id) => {
    const state = get();
    if (state.workspaceOrder.length <= 1) return;
    get().commit("Excluir espaço", (draft) => {
      const boardIds = Object.values(draft.boards)
        .filter((board) => board.workspaceId === id)
        .map((board) => board.id);
      for (const boardId of boardIds) {
        delete draft.boards[boardId];
      }
      draft.tabs = draft.tabs.filter((tab) => tab.workspaceId !== id);
      draft.workspaceOrder = draft.workspaceOrder.filter((workspaceId) => workspaceId !== id);
      delete draft.workspaces[id];
      if (draft.activeWorkspaceId === id) {
        draft.activeWorkspaceId = draft.workspaceOrder[0] ?? "";
      }
      ensureNavigation(draft);
    });
  },

  setActiveWorkspace: (id) => {
    set((draft) => {
      const workspace = draft.workspaces[id];
      if (!workspace) return;
      draft.activeWorkspaceId = id;
      const workspaceTabs = draft.tabs.filter((tab) => tab.workspaceId === id);
      if (workspaceTabs.length > 0) {
        draft.activeTabId = workspaceTabs[0].id;
      } else {
        const root = Object.values(draft.boards)
          .filter((board) => board.workspaceId === id && !board.parentId)
          .sort(byCreatedAt)[0];
        if (root) {
          const tab: Tab = { id: uid("tab"), boardId: root.id, workspaceId: id };
          draft.tabs.push(tab);
          draft.activeTabId = tab.id;
        } else {
          draft.activeTabId = null;
        }
      }
      draft.selection = [];
      draft.selectedConnectors = [];
      draft.editingNodeId = null;
    });
  },

  createBoard: (options = {}) => {
    const state = get();
    const { parentId = null, title = "Novo quadro", templateId, open = true } = options;
    const workspaceId = options.workspaceId ?? state.activeWorkspaceId;
    if (!state.workspaces[workspaceId]) return null;
    if (parentId && !state.boards[parentId]) return null;

    const board = createBoard({ workspaceId, parentId, title, color: "none" });
    get().commit("Criar quadro", (draft) => {
      draft.boards[board.id] = board;
      draft.viewports[board.id] = { x: 120, y: 100, zoom: 1 };
      if (parentId) {
        const parent = draft.boards[parentId];
        if (parent) {
          parent.childOrder.push(board.id);
          parent.updatedAt = Date.now();
          draft.expandedBoards[parentId] = true;
        }
      }
      if (templateId) insertTemplate(draft, board.id, templateId);
      if (open) {
        const tab: Tab = { id: uid("tab"), boardId: board.id, workspaceId };
        draft.tabs.push(tab);
        draft.activeTabId = tab.id;
        draft.activeWorkspaceId = workspaceId;
        draft.selection = [];
        draft.editingNodeId = null;
      }
    });
    return board.id;
  },

  renameBoard: (id, title) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    get().commit(
      "Renomear quadro",
      (draft) => {
        const board = draft.boards[id];
        if (!board) return;
        board.title = trimmed;
        board.updatedAt = Date.now();
        for (const candidate of Object.values(draft.boards)) {
          for (const node of Object.values(candidate.nodes)) {
            if (node.type === "board" && node.childBoardId === id) {
              node.title = trimmed;
            }
          }
        }
      },
      { coalesceKey: `board:title:${id}` },
    );
  },

  updateBoard: (id, patch) => {
    get().commit(
      "Atualizar quadro",
      (draft) => {
        const board = draft.boards[id];
        if (!board) return;
        Object.assign(board, patch);
        board.updatedAt = Date.now();
      },
      { coalesceKey: `board:update:${id}` },
    );
  },

  deleteBoard: (id) => {
    const state = get();
    if (!state.boards[id]) return;
    const ids = [id, ...descendantBoardIds(state.boards, id)];
    get().commit("Excluir quadro", (draft) => {
      const removed = new Set(ids);
      for (const boardId of ids) {
        const board = draft.boards[boardId];
        if (!board) continue;
        if (board.parentId) {
          const parent = draft.boards[board.parentId];
          if (parent) parent.childOrder = parent.childOrder.filter((childId) => childId !== boardId);
        }
        delete draft.boards[boardId];
      }
      draft.tabs = draft.tabs.filter((tab) => !removed.has(tab.boardId));
      for (const boardId of Object.keys(draft.viewports)) {
        if (removed.has(boardId)) delete draft.viewports[boardId];
      }
      for (const boardId of Object.keys(draft.expandedBoards)) {
        if (removed.has(boardId)) delete draft.expandedBoards[boardId];
      }
      for (const board of Object.values(draft.boards)) {
        for (const node of Object.values(board.nodes)) {
          if (node.type === "board" && node.childBoardId && removed.has(node.childBoardId)) {
            delete board.nodes[node.id];
          }
        }
      }
      ensureNavigation(draft);
    });
  },

  moveBoard: (id, parentId, index) => {
    const state = get();
    if (!state.boards[id]) return;
    if (parentId && (parentId === id || isDescendantOf(state.boards, parentId, id))) return;
    get().commit("Mover quadro", (draft) => {
      const board = draft.boards[id];
      if (!board) return;
      if (board.parentId) {
        const oldParent = draft.boards[board.parentId];
        if (oldParent) oldParent.childOrder = oldParent.childOrder.filter((childId) => childId !== id);
      }
      board.parentId = parentId;
      board.updatedAt = Date.now();
      if (parentId) {
        const parent = draft.boards[parentId];
        if (parent) {
          const current = parent.childOrder.filter((childId) => childId !== id);
          const position = index === undefined ? current.length : Math.max(0, Math.min(index, current.length));
          current.splice(position, 0, id);
          parent.childOrder = current;
          parent.updatedAt = Date.now();
          board.workspaceId = parent.workspaceId;
          draft.expandedBoards[parentId] = true;
        }
      } else {
        board.workspaceId = draft.activeWorkspaceId;
        const siblings = Object.values(draft.boards)
          .filter((candidate) => candidate.workspaceId === board.workspaceId && !candidate.parentId)
          .sort(byCreatedAt)
          .filter((candidate) => candidate.id !== board.id);
        const position = index === undefined ? siblings.length : Math.max(0, Math.min(index, siblings.length));
        siblings.splice(position, 0, board);
        const base = Date.now() - siblings.length * 1000;
        siblings.forEach((candidate, position2) => {
          candidate.createdAt = base + position2 * 1000;
        });
      }
      ensureNavigation(draft);
    });
  },

  duplicateBoard: (id) => {
    const state = get();
    const source = state.boards[id];
    if (!source) return null;
    let createdId: ID | null = null;

    get().commit("Duplicar quadro", (draft) => {
      const duplicateRootId = duplicateBoardInDraft(draft, id, source.parentId, {
        titleSuffix: " (cópia)",
        offset: 48,
      });
      if (!duplicateRootId) return;
      createdId = duplicateRootId;
      if (source.parentId) {
        const parent = draft.boards[source.parentId];
        if (parent) {
          const index = parent.childOrder.indexOf(source.id);
          const nextOrder = [...parent.childOrder];
          nextOrder.splice(index >= 0 ? index + 1 : nextOrder.length, 0, duplicateRootId);
          parent.childOrder = nextOrder;
        }
      }
      openBoardInDraft(draft, duplicateRootId);
    });

    return createdId;
  },

  openBoard: (boardId) => {
    set((draft) => {
      openBoardInDraft(draft, boardId);
    });
  },

  closeTab: (tabId) => {
    set((draft) => {
      const index = draft.tabs.findIndex((tab) => tab.id === tabId);
      if (index === -1) return;
      const wasActive = draft.activeTabId === tabId;
      draft.tabs.splice(index, 1);
      if (!wasActive) return;
      const next = draft.tabs[index] ?? draft.tabs[index - 1] ?? draft.tabs[0];
      draft.activeTabId = next?.id ?? null;
      if (next) {
        draft.activeWorkspaceId = next.workspaceId;
        ensureNavigation(draft);
      } else {
        draft.selection = [];
        draft.editingNodeId = null;
      }
    });
  },

  setActiveTab: (tabId) => {
    set((draft) => {
      const tab = draft.tabs.find((candidate) => candidate.id === tabId);
      if (!tab || !draft.boards[tab.boardId]) return;
      draft.activeTabId = tab.id;
      draft.activeWorkspaceId = tab.workspaceId;
      draft.selection = [];
      draft.selectedConnectors = [];
      draft.editingNodeId = null;
      draft.activeTool = "select";
    });
  },

  cycleTab: (direction) => {
    set((draft) => {
      if (draft.tabs.length === 0) return;
      const index = draft.tabs.findIndex((tab) => tab.id === draft.activeTabId);
      const nextIndex = (index + direction + draft.tabs.length) % draft.tabs.length;
      const tab = draft.tabs[nextIndex];
      draft.activeTabId = tab.id;
      draft.activeWorkspaceId = tab.workspaceId;
      draft.selection = [];
    });
  },

  toggleBoardExpanded: (id) => {
    set((draft) => {
      draft.expandedBoards[id] = !draft.expandedBoards[id];
    });
  },

  setBoardExpanded: (id, expanded) => {
    set((draft) => {
      draft.expandedBoards[id] = expanded;
    });
  },

  applyTemplate: (templateId, anchor) => {
    const board = activeBoard(get());
    if (!board) return;
    get().commit("Aplicar template", (draft) => {
      insertTemplate(draft, board.id, templateId, anchor);
    });
  },

  saveBoardAsTemplate: (name) => {
    const board = activeBoard(get());
    if (!board) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    const payload = boardToTemplatePayload(board, trimmed);
    const template: TemplateDefinition = {
      id: uid("tpl"),
      name: trimmed,
      description: `${Object.keys(board.nodes).length} elementos salvos deste quadro`,
      category: "projeto",
      accent: board.color,
      payload,
      custom: true,
      build: () => payload,
    };
    set((draft) => {
      draft.customTemplates.push(template);
    });
  },

  deleteCustomTemplate: (id) => {
    set((draft) => {
      draft.customTemplates = draft.customTemplates.filter((template) => template.id !== id);
    });
  },

  importNodes: (nodes, connectors = [], targetBoardId) => {
    const state = get();
    const board = targetBoardId ? state.boards[targetBoardId] : activeBoard(state);
    if (!board || nodes.length === 0) return;

    const bounds = nodesBounds(nodes) ?? { x: 0, y: 0, w: 0, h: 0 };
    const viewport = state.viewports[board.id] ?? { x: 120, y: 100, zoom: 1 };
    const worldCenter =
      state.canvasSize.width > 0
        ? screenToWorld({ x: state.canvasSize.width / 2, y: state.canvasSize.height / 2 }, viewport)
        : { x: 400, y: 300 };
    const offset = {
      x: Math.round(worldCenter.x - bounds.x - bounds.w / 2),
      y: Math.round(worldCenter.y - bounds.y - bounds.h / 2),
    };
    const baseZ = maxZ(board.nodes) + 1;
    const idMap = new Map<ID, ID>();
    const imported: CanvasNode[] = [];

    for (const node of [...nodes].sort((a, b) => a.createdAt - b.createdAt)) {
      const cloned = cloneNode(node, {
        boardId: board.id,
        parentId: null,
        order: node.order,
        x: node.x + offset.x,
        y: node.y + offset.y,
        z: baseZ + imported.length,
        childBoardId: undefined,
      });
      idMap.set(node.id, cloned.id);
      imported.push(cloned);
    }
    for (const node of nodes) {
      const cloned = imported.find((candidate) => candidate.id === idMap.get(node.id));
      if (!cloned) continue;
      if (node.parentId && idMap.has(node.parentId)) {
        cloned.parentId = idMap.get(node.parentId) ?? null;
      }
    }

    const mappedConnectors: Connector[] = [];
    for (const connector of connectors) {
      const cloned: Connector = {
        ...connector,
        id: uid("conn"),
        boardId: board.id,
        from: {
          nodeId: connector.from.nodeId ? idMap.get(connector.from.nodeId) ?? null : null,
          x: connector.from.x + offset.x,
          y: connector.from.y + offset.y,
        },
        to: {
          nodeId: connector.to.nodeId ? idMap.get(connector.to.nodeId) ?? null : null,
          x: connector.to.x + offset.x,
          y: connector.to.y + offset.y,
        },
      };
      mappedConnectors.push(cloned);
    }

    get().commit("Importar conteúdo", (draft) => {
      const target = draft.boards[board.id];
      if (!target) return;
      for (const node of imported) target.nodes[node.id] = node;
      for (const connector of mappedConnectors) target.connectors[connector.id] = connector;
      target.updatedAt = Date.now();
      draft.selection = imported.map((node) => node.id);
      draft.selectedConnectors = [];
      draft.activeTool = "select";
    });
  },

  importVault: (plan) => {
    if (!plan.boards.length) return null;
    const workspace = createWorkspace(plan.workspaceName, "lilac");
    get().commit("Importar cofre Obsidian", (draft) => {
      draft.workspaces[workspace.id] = workspace;
      draft.workspaceOrder.push(workspace.id);

      const timestamp = Date.now();
      for (const boardPlan of plan.boards) {
        const board = createBoard({
          id: boardPlan.id,
          workspaceId: workspace.id,
          parentId: boardPlan.parentId,
          title: boardPlan.title,
          color: boardPlan.color,
        });
        board.childOrder = [...boardPlan.childBoardIds];

        boardPlan.nodes.forEach((nodePlan, index) => {
          const node = createNode(board.id, {
            ...nodePlan.fields,
            id: nodePlan.id,
            type: nodePlan.type,
            x: nodePlan.x,
            y: nodePlan.y,
            w: nodePlan.w,
            h: nodePlan.h,
            z: timestamp + index,
            color: nodePlan.color ?? nodePlan.fields?.color ?? "none",
            parentId: nodePlan.parentId ?? nodePlan.fields?.parentId ?? null,
            order: nodePlan.order ?? nodePlan.fields?.order,
          });
          if (nodePlan.references?.length) {
            node.references = Array.from(
              new Set([...(nodePlan.fields?.references ?? []), ...nodePlan.references]),
            );
          }
          board.nodes[node.id] = node;
        });

        for (const connector of boardPlan.connectors) {
          board.connectors[connector.id] = {
            id: connector.id,
            boardId: board.id,
            from: { nodeId: connector.fromNodeId, x: 0, y: 0 },
            to: { nodeId: connector.toNodeId, x: 0, y: 0 },
            kind: connector.kind ?? "curve",
            label: connector.label,
            color: connector.color ?? "lilac",
            dashed: connector.dashed ?? false,
            arrowStart: connector.arrowStart ?? false,
            arrowEnd: connector.arrowEnd !== false,
            createdAt: timestamp,
            updatedAt: timestamp,
          };
        }

        draft.boards[board.id] = board;
        draft.viewports[board.id] = { x: 120, y: 100, zoom: 1 };
        for (const node of Object.values(board.nodes)) {
          if (node.type === "column") relayoutColumn(draft, board.id, node.id);
        }
        if (board.parentId) draft.expandedBoards[board.parentId] = true;
      }

      draft.activeWorkspaceId = workspace.id;
      const openBoardId = plan.boards.some((board) => board.id === plan.openBoardId)
        ? plan.openBoardId
        : plan.boards[0]?.id;
      if (openBoardId) {
        openBoardInDraft(draft, openBoardId);
      } else {
        draft.activeTabId = null;
        draft.selection = [];
      }
    });
    return workspace.id;
  },
});

// Mantém o contrato do slice exportado pelo módulo.
export type { BoardSlice };
