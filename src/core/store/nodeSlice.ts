import type { Draft } from "immer";
import { uid } from "@/lib/utils";
import type { AppStoreCreator } from "./slice";
import type { AddNodeOptions, NodeSlice } from "./types";
import type { AppState } from "./types";
import type {
  CanvasNode,
  ChecklistItem,
  ConnectorEndpoint,
  DrawingScene,
  EntityRef,
  ID,
} from "@/core/domain/types";
import { NODE_LABELS, NODE_WIDTHS, defaultSize } from "@/core/domain/constants";
import {
  childNodesOf,
  cloneNode,
  createChecklistItem,
  createConnector,
  createNode,
} from "@/core/domain/factories";
import {
  activeBoard,
  activeBoardId,
  locateNode,
  relayoutColumn,
} from "./helpers";
import { clampSize, maxZ, minZ } from "@/core/domain/layout";

function findInDraft(draft: Draft<AppState>, nodeId: ID) {
  for (const boardId of Object.keys(draft.boards)) {
    const board = draft.boards[boardId];
    const node = board.nodes[nodeId];
    if (node) return { board, node };
  }
  return null;
}

function collectWithColumnChildren(board: { nodes: Record<ID, CanvasNode> }, ids: ID[]): ID[] {
  const result = new Set(ids);
  let changed = true;
  while (changed) {
    changed = false;
    for (const node of Object.values(board.nodes)) {
      if (node.parentId && result.has(node.parentId) && !result.has(node.id)) {
        result.add(node.id);
        changed = true;
      }
    }
  }
  return Array.from(result);
}

export const createNodeSlice: AppStoreCreator<NodeSlice> = (set, get) => ({
  selection: [],
  selectedConnectors: [],
  activeTool: "select",
  editingNodeId: null,
  drawingNodeId: null,

  addNode: (type, position, options: AddNodeOptions = {}) => {
    const state = get();
    const board = options.boardId
      ? state.boards[options.boardId]
      : activeBoard(state);
    if (!board) return null;
    const isActiveBoard = activeBoardId(state) === board.id;

    const size = defaultSize(type);
    const parentColumn =
      options.parentId && board.nodes[options.parentId]?.type === "column"
        ? board.nodes[options.parentId]
        : undefined;
    const order = parentColumn ? childNodesOf(board.nodes, parentColumn.id).length : undefined;
    const node = createNode(board.id, {
      type,
      x: Math.round(position.x),
      y: Math.round(position.y),
      w: options.w ?? size.w,
      h: options.h ?? size.h,
      z: maxZ(board.nodes) + 1,
      color: options.color ?? (type === "note" ? "amber" : "none"),
      parentId: parentColumn?.id ?? null,
      order,
      title: options.title,
      content: options.content,
      attachmentId: options.attachmentId,
      src: options.src,
      name: options.name,
      mime: options.mime,
      size: options.size,
      url: options.url,
      author: options.author ?? state.settings.authorName,
      childBoardId: options.childBoardId,
      ...options.fields,
    });

    get().commit(`Adicionar ${NODE_LABELS[type].toLowerCase()}`, (draft) => {
      const target = draft.boards[board.id];
      if (!target) return;
      target.nodes[node.id] = node;
      target.updatedAt = Date.now();
      if (parentColumn) relayoutColumn(draft, board.id, parentColumn.id);
      if (isActiveBoard) {
        draft.selection = [node.id];
        draft.selectedConnectors = [];
        draft.editingNodeId = null;
      }
    });
    return node.id;
  },

  addBoardNode: (boardId, position, title = "Novo quadro") => {
    const state = get();
    const board = state.boards[boardId];
    if (!board) return null;
    const size = NODE_WIDTHS.board;
    const childBoardId = get().createBoard({
      parentId: board.id,
      workspaceId: board.workspaceId,
      title,
      open: false,
    });
    if (!childBoardId) return null;

    const node = createNode(board.id, {
      type: "board",
      x: Math.round(position.x),
      y: Math.round(position.y),
      w: size.w,
      h: size.h,
      z: maxZ(board.nodes) + 1,
      title,
      childBoardId,
      color: "sky",
    });

    get().commit("Criar subquadro", (draft) => {
      const target = draft.boards[board.id];
      if (!target) return;
      target.nodes[node.id] = node;
      target.childOrder = target.childOrder.includes(childBoardId)
        ? target.childOrder
        : [...target.childOrder, childBoardId];
      target.updatedAt = Date.now();
      draft.selection = [node.id];
      draft.editingNodeId = null;
    });
    return node.id;
  },

  updateNode: (nodeId, patch, options = {}) => {
    const located = locateNode(get(), nodeId);
    if (!located) return;
    const label = options.label ?? "Editar elemento";
    get().commit(
      label,
      (draft) => {
        const found = findInDraft(draft, nodeId);
        if (!found) return;
        const { board, node } = found;
        const previousParent = node.parentId ?? null;
        Object.assign(node, patch, { updatedAt: Date.now() });
        const nextParent = node.parentId ?? null;
        if (nextParent !== previousParent) {
          if (previousParent) relayoutColumn(draft, board.id, previousParent);
          if (nextParent) {
            const siblings = childNodesOf(board.nodes as Record<ID, CanvasNode>, nextParent);
            node.order = siblings.filter((candidate) => candidate.id !== node.id).length;
            relayoutColumn(draft, board.id, nextParent);
          }
        } else if (nextParent) {
          relayoutColumn(draft, board.id, nextParent);
        }
        board.updatedAt = Date.now();
      },
      { coalesceKey: options.coalesceKey ?? `node:${nodeId}` },
    );
  },

  updateNodes: (ids, patch, options = {}) => {
    if (ids.length === 0) return;
    const state = get();
    const board = activeBoard(state);
    if (!board) return;
    get().commit(
      options.label ?? "Editar seleção",
      (draft) => {
        const target = draft.boards[board.id];
        if (!target) return;
        const columns = new Set<string>();
        for (const id of ids) {
          const node = target.nodes[id];
          if (!node) continue;
          Object.assign(node, patch, { updatedAt: Date.now() });
          if (node.parentId) columns.add(node.parentId);
        }
        for (const columnId of columns) relayoutColumn(draft, board.id, columnId);
        target.updatedAt = Date.now();
      },
      { coalesceKey: options.coalesceKey ?? `nodes:${ids.join(",")}` },
    );
  },

  updateNodeSilent: (nodeId, patch) => {
    set((draft) => {
      const found = findInDraft(draft, nodeId);
      if (!found) return;
      Object.assign(found.node, patch, { updatedAt: Date.now() });
    });
  },

  removeNodes: (ids) => {
    const state = get();
    const board = activeBoard(state);
    if (!board) return;
    const unlocked = ids.filter((id) => board.nodes[id] && !board.nodes[id].locked);
    if (unlocked.length === 0) return;
    const toRemove = collectWithColumnChildren(board, unlocked);

    get().commit("Excluir elementos", (draft) => {
      const target = draft.boards[board.id];
      if (!target) return;
      const parentColumns = new Set<string>();
      for (const id of toRemove) {
        const node = target.nodes[id];
        if (!node) continue;
        delete target.nodes[id];
        if (node.parentId) parentColumns.add(node.parentId);
        if (node.type === "board" && node.childBoardId) {
          const childBoard = draft.boards[node.childBoardId];
          if (childBoard && childBoard.parentId === target.id) {
            childBoard.parentId = null;
            target.childOrder = target.childOrder.filter((childId) => childId !== node.childBoardId);
          }
        }
      }
      for (const connector of Object.values(target.connectors)) {
        if (
          (connector.from.nodeId && toRemove.includes(connector.from.nodeId)) ||
          (connector.to.nodeId && toRemove.includes(connector.to.nodeId))
        ) {
          delete target.connectors[connector.id];
        }
      }
      for (const columnId of parentColumns) relayoutColumn(draft, board.id, columnId);
      target.updatedAt = Date.now();
      draft.selection = draft.selection.filter((id) => !toRemove.includes(id));
      draft.selectedConnectors = draft.selectedConnectors.filter((id) => Boolean(target.connectors[id]));
      if (draft.editingNodeId && toRemove.includes(draft.editingNodeId)) draft.editingNodeId = null;
      if (draft.drawingNodeId && toRemove.includes(draft.drawingNodeId)) {
        draft.drawingNodeId = null;
        if (draft.dialog === "drawing") draft.dialog = null;
      }
    });
  },

  duplicateNodes: (ids) => {
    const state = get();
    const board = activeBoard(state);
    if (!board) return;
    const sourceIds = collectWithColumnChildren(board, ids).filter((id) => !board.nodes[id].locked);
    if (sourceIds.length === 0) return;
    const idMap = new Map<ID, ID>();
    const clones: CanvasNode[] = [];
    const baseZ = maxZ(board.nodes) + 1;
    for (const id of sourceIds) {
      const node = board.nodes[id];
      if (!node) continue;
      const cloned = cloneNode(node, {
        parentId: null,
        order: node.order,
        z: baseZ + clones.length,
        x: node.x + 36,
        y: node.y + 36,
      });
      idMap.set(node.id, cloned.id);
      clones.push(cloned);
    }
    for (const node of clones) {
      const original = board.nodes[sourceIds.find((id) => idMap.get(id) === node.id) ?? ""];
      if (original?.parentId && idMap.has(original.parentId)) {
        node.parentId = idMap.get(original.parentId) ?? null;
      }
    }

    get().commit("Duplicar elementos", (draft) => {
      const target = draft.boards[board.id];
      if (!target) return;
      for (const node of clones) target.nodes[node.id] = node;
      target.updatedAt = Date.now();
      draft.selection = clones.map((node) => node.id);
      draft.selectedConnectors = [];
    });
  },

  moveNodes: (ids, delta) => {
    if (ids.length === 0 || (delta.x === 0 && delta.y === 0)) return;
    const board = activeBoard(get());
    if (!board) return;
    get().commit("Mover elementos", (draft) => {
      const target = draft.boards[board.id];
      if (!target) return;
      const columns = new Set<string>();
      for (const id of ids) {
        const node = target.nodes[id];
        if (!node || node.locked) continue;
        if (node.parentId) {
          const previousParent = node.parentId;
          node.parentId = null;
          node.order = undefined;
          relayoutColumn(draft, board.id, previousParent);
        }
        node.x += delta.x;
        node.y += delta.y;
        node.updatedAt = Date.now();
        if (node.type === "column") columns.add(node.id);
      }
      for (const columnId of columns) relayoutColumn(draft, board.id, columnId);
      target.updatedAt = Date.now();
    });
  },

  resizeNode: (nodeId, rect) => {
    const located = locateNode(get(), nodeId);
    if (!located || located.node.locked) return;
    const { w: minW, h: minH } = NODE_WIDTHS[located.node.type];
    get().commit(
      "Redimensionar",
      (draft) => {
        const found = findInDraft(draft, nodeId);
        if (!found) return;
        const { board, node } = found;
        node.x = Math.round(rect.x);
        node.y = Math.round(rect.y);
        node.w = clampSize(rect.w, minW);
        node.h = clampSize(rect.h, minH);
        node.updatedAt = Date.now();
        if (node.type === "column") relayoutColumn(draft, board.id, node.id);
        board.updatedAt = Date.now();
      },
      { coalesceKey: `resize:${nodeId}` },
    );
  },

  select: (ids) => {
    set((draft) => {
      draft.selection = Array.from(new Set(ids));
      draft.selectedConnectors = [];
      draft.editingNodeId = null;
    });
  },

  toggleSelect: (id) => {
    set((draft) => {
      draft.selection = draft.selection.includes(id)
        ? draft.selection.filter((candidate) => candidate !== id)
        : [...draft.selection, id];
      draft.selectedConnectors = [];
    });
  },

  selectAll: () => {
    const board = activeBoard(get());
    if (!board) return;
    set((draft) => {
      draft.selection = Object.values(board.nodes)
        .filter((node) => !node.hidden && !node.locked)
        .map((node) => node.id);
      draft.selectedConnectors = Object.keys(board.connectors);
    });
  },

  clearSelection: () => {
    set((draft) => {
      draft.selection = [];
      draft.selectedConnectors = [];
      draft.editingNodeId = null;
    });
  },

  selectConnector: (id) => {
    set((draft) => {
      draft.selectedConnectors = id ? [id] : [];
      draft.selection = [];
      draft.editingNodeId = null;
    });
  },

  setTool: (tool) => {
    set((draft) => {
      draft.activeTool = tool;
      draft.editingNodeId = null;
      if (tool !== "select" && tool !== "connector") {
        draft.selection = [];
        draft.selectedConnectors = [];
      }
    });
  },

  setEditingNode: (id) => {
    set((draft) => {
      draft.editingNodeId = id;
      if (id) {
        draft.selection = [id];
        draft.selectedConnectors = [];
      }
    });
  },

  openDrawing: (nodeId) => {
    set((draft) => {
      draft.drawingNodeId = nodeId;
      draft.dialog = nodeId ? "drawing" : null;
      if (nodeId) {
        draft.selection = [nodeId];
        draft.editingNodeId = null;
      }
    });
  },

  updateDrawingScene: (nodeId, scene: DrawingScene, thumbnail) => {
    get().commit("Editar desenho", (draft) => {
      const found = findInDraft(draft, nodeId);
      if (!found) return;
      found.node.scene = {
        ...scene,
        thumbnail: thumbnail === undefined ? scene.thumbnail : thumbnail,
        updatedAt: Date.now(),
      };
      found.node.updatedAt = Date.now();
      found.board.updatedAt = Date.now();
    });
  },

  bringToFront: (ids) => {
    const board = activeBoard(get());
    if (!board) return;
    get().commit("Trazer para frente", (draft) => {
      const target = draft.boards[board.id];
      if (!target) return;
      let cursor = maxZ(target.nodes as Record<ID, CanvasNode>);
      for (const id of ids) {
        const node = target.nodes[id];
        if (!node) continue;
        cursor += 1;
        node.z = cursor;
        node.updatedAt = Date.now();
      }
      target.updatedAt = Date.now();
    });
  },

  sendToBack: (ids) => {
    const board = activeBoard(get());
    if (!board) return;
    get().commit("Enviar para trás", (draft) => {
      const target = draft.boards[board.id];
      if (!target) return;
      let cursor = minZ(target.nodes as Record<ID, CanvasNode>);
      for (const id of ids) {
        const node = target.nodes[id];
        if (!node) continue;
        cursor -= 1;
        node.z = cursor;
        node.updatedAt = Date.now();
      }
      target.updatedAt = Date.now();
    });
  },

  toggleTask: (id) => {
    get().commit(
      "Alternar tarefa",
      (draft) => {
        const found = findInDraft(draft, id);
        if (!found) return;
        found.node.done = !found.node.done;
        found.node.updatedAt = Date.now();
        found.board.updatedAt = Date.now();
      },
      { coalesceKey: `task:${id}` },
    );
  },

  addChecklistItem: (nodeId, text = "") => {
    get().commit(
      "Adicionar item",
      (draft) => {
        const found = findInDraft(draft, nodeId);
        if (!found) return;
        found.node.items = [...(found.node.items ?? []), createChecklistItem(text)];
        found.node.updatedAt = Date.now();
      },
      { coalesceKey: `checklist:add:${nodeId}` },
    );
  },

  updateChecklistItem: (nodeId, itemId, patch: Partial<ChecklistItem>) => {
    get().commit(
      "Editar item",
      (draft) => {
        const found = findInDraft(draft, nodeId);
        if (!found || !found.node.items) return;
        found.node.items = found.node.items.map((item) =>
          item.id === itemId ? { ...item, ...patch } : item,
        );
        found.node.updatedAt = Date.now();
      },
      { coalesceKey: `checklist:item:${nodeId}:${itemId}` },
    );
  },

  removeChecklistItem: (nodeId, itemId) => {
    get().commit("Remover item", (draft) => {
      const found = findInDraft(draft, nodeId);
      if (!found || !found.node.items) return;
      found.node.items = found.node.items.filter((item) => item.id !== itemId);
      found.node.updatedAt = Date.now();
    });
  },

  reorderChecklist: (nodeId, from, to) => {
    get().commit("Reordenar checklist", (draft) => {
      const found = findInDraft(draft, nodeId);
      if (!found || !found.node.items) return;
      const items = [...found.node.items];
      if (from < 0 || from >= items.length) return;
      const [item] = items.splice(from, 1);
      items.splice(Math.max(0, Math.min(to, items.length)), 0, item);
      found.node.items = items;
      found.node.updatedAt = Date.now();
    });
  },

  addConnector: (from: ConnectorEndpoint, to: ConnectorEndpoint) => {
    const board = activeBoard(get());
    if (!board) return null;
    const connector = createConnector(board.id, from.nodeId ?? null, to.nodeId ?? null);
    connector.from = { ...from };
    connector.to = { ...to };
    get().commit("Criar conector", (draft) => {
      const target = draft.boards[board.id];
      if (!target) return;
      target.connectors[connector.id] = connector;
      target.updatedAt = Date.now();
      draft.selectedConnectors = [connector.id];
      draft.selection = [];
      draft.activeTool = "select";
    });
    return connector.id;
  },

  updateConnector: (id, patch) => {
    get().commit(
      "Editar conector",
      (draft) => {
        for (const board of Object.values(draft.boards)) {
          const connector = board.connectors[id];
          if (!connector) continue;
          Object.assign(connector, patch, { updatedAt: Date.now() });
          board.updatedAt = Date.now();
          return;
        }
      },
      { coalesceKey: `connector:${id}` },
    );
  },

  removeConnector: (id) => {
    get().commit("Excluir conector", (draft) => {
      for (const board of Object.values(draft.boards)) {
        if (board.connectors[id]) {
          delete board.connectors[id];
          board.updatedAt = Date.now();
        }
      }
      draft.selectedConnectors = draft.selectedConnectors.filter((candidate) => candidate !== id);
    });
  },

  addReference: (nodeId, ref: EntityRef) => {
    get().commit("Adicionar referência", (draft) => {
      const found = findInDraft(draft, nodeId);
      if (!found) return;
      const references = found.node.references ?? [];
      if (references.includes(ref)) return;
      found.node.references = [...references, ref];
      found.node.updatedAt = Date.now();
    });
  },

  removeReference: (nodeId, ref) => {
    get().commit("Remover referência", (draft) => {
      const found = findInDraft(draft, nodeId);
      if (!found || !found.node.references) return;
      found.node.references = found.node.references.filter((candidate) => candidate !== ref);
      found.node.updatedAt = Date.now();
    });
  },

  addCommentReply: (nodeId, content) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    get().commit(
      "Responder comentário",
      (draft) => {
        const found = findInDraft(draft, nodeId);
        if (!found) return;
        found.node.replies = [
          ...(found.node.replies ?? []),
          {
            id: uid("reply"),
            author: draft.settings.authorName,
            content: trimmed,
            createdAt: Date.now(),
          },
        ];
        found.node.updatedAt = Date.now();
      },
      { coalesceKey: `comment:${nodeId}` },
    );
  },

  toggleCommentResolved: (nodeId) => {
    get().commit("Resolver comentário", (draft) => {
      const found = findInDraft(draft, nodeId);
      if (!found) return;
      found.node.resolved = !found.node.resolved;
      found.node.updatedAt = Date.now();
    });
  },
});

export type { NodeSlice };
