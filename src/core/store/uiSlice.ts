import { clampZoom, zoomAtPoint } from "@/lib/geometry";
import { DEFAULT_SETTINGS } from "@/core/domain/constants";
import { presentationBoardIds } from "@/core/domain/tree";
import { createHistoryState } from "./history";
import { activeBoard, ensureNavigation } from "./helpers";
import type { AppStoreCreator } from "./slice";
import type { AppState, UiSlice } from "./types";

export const createUiSlice: AppStoreCreator<UiSlice> = (set, get) => ({
  viewports: {},
  canvasSize: { width: 0, height: 0 },
  sidebarCollapsed: false,
  dialog: null,
  tagFilters: {},
  presentation: null,
  nodeTransfer: null,
  nodeDrag: null,
  dropFlash: null,
  settingsSection: "geral",
  inspectorTab: "props",
  status: "idle",
  lastSavedAt: null,
  lastError: null,
  hydrated: false,
  attachmentsVersion: 0,
  storageKind: "indexeddb",

  setViewport: (boardId, viewport) => {
    set((draft) => {
      draft.viewports[boardId] = {
        x: Math.round(viewport.x * 100) / 100,
        y: Math.round(viewport.y * 100) / 100,
        zoom: clampZoom(viewport.zoom),
      };
    });
  },

  panViewport: (boardId, dx, dy) => {
    set((draft) => {
      const current = draft.viewports[boardId] ?? { x: 0, y: 0, zoom: 1 };
      draft.viewports[boardId] = { x: current.x + dx, y: current.y + dy, zoom: current.zoom };
    });
  },

  zoomViewport: (boardId, zoom, anchorClient) => {
    set((draft) => {
      const current = draft.viewports[boardId] ?? { x: 0, y: 0, zoom: 1 };
      const size = draft.canvasSize;
      const anchor = anchorClient ?? { x: size.width / 2, y: size.height / 2 };
      draft.viewports[boardId] = zoomAtPoint(current, zoom, anchor);
    });
  },

  resetViewport: (boardId) => {
    set((draft) => {
      const current = draft.viewports[boardId] ?? { x: 0, y: 0, zoom: 1 };
      const size = draft.canvasSize;
      if (size.width === 0 || size.height === 0) {
        draft.viewports[boardId] = { x: 60, y: 60, zoom: 1 };
        return;
      }
      const centerWorldX = (size.width / 2 - current.x) / current.zoom;
      const centerWorldY = (size.height / 2 - current.y) / current.zoom;
      draft.viewports[boardId] = {
        zoom: 1,
        x: size.width / 2 - centerWorldX,
        y: size.height / 2 - centerWorldY,
      };
    });
  },

  setCanvasSize: (size) => {
    const current = get().canvasSize;
    if (current.width === size.width && current.height === size.height) return;
    set((draft) => {
      draft.canvasSize = size;
    });
  },

  setSidebarCollapsed: (collapsed) => {
    set((draft) => {
      draft.sidebarCollapsed = collapsed;
    });
  },

  toggleSidebar: () => {
    set((draft) => {
      draft.sidebarCollapsed = !draft.sidebarCollapsed;
    });
  },

  openDialog: (dialog) => {
    set((draft) => {
      draft.dialog = dialog;
      if (dialog !== "drawing") draft.drawingNodeId = null;
      if (dialog !== "note") draft.noteNodeId = null;
      if (dialog === "search" || dialog === "tasks" || dialog === "drawing" || dialog === "note") {
        draft.editingNodeId = null;
      }
    });
  },

  closeDialog: () => {
    set((draft) => {
      if (draft.dialog === "drawing") draft.drawingNodeId = null;
      if (draft.dialog === "note") draft.noteNodeId = null;
      draft.dialog = null;
    });
  },

  setTagFilter: (boardId, tag) => {
    set((draft) => {
      if (tag) draft.tagFilters[boardId] = tag;
      else delete draft.tagFilters[boardId];
    });
  },

  startPresentation: () => {
    const state = get();
    if (state.presentation) return;
    const active = activeBoard(state);
    if (!active) return;

    const sequence = presentationBoardIds(state.boards, state.activeWorkspaceId);
    const boardIds = sequence.includes(active.id) ? sequence : [active.id, ...sequence];
    const index = Math.max(0, boardIds.indexOf(active.id));

    set((draft) => {
      draft.presentation = {
        boardIds,
        index,
        tabs: draft.tabs.map((tab) => ({ ...tab })),
        activeTabId: draft.activeTabId,
        activeWorkspaceId: draft.activeWorkspaceId,
        viewports: { ...draft.viewports },
      };
      draft.dialog = null;
      draft.drawingNodeId = null;
      draft.noteNodeId = null;
      draft.editingNodeId = null;
      draft.selection = [];
      draft.selectedConnectors = [];
      draft.nodeTransfer = null;
      draft.nodeDrag = null;
      draft.dropFlash = null;
      draft.activeTool = "select";
    });
  },

  stopPresentation: () => {
    const current = get().presentation;
    if (!current) return;
    set((draft) => {
      draft.tabs = current.tabs.map((tab) => ({ ...tab }));
      draft.activeTabId = current.activeTabId;
      draft.activeWorkspaceId = current.activeWorkspaceId;
      draft.viewports = { ...current.viewports };
      draft.presentation = null;
      draft.dialog = null;
      draft.drawingNodeId = null;
      draft.noteNodeId = null;
      draft.editingNodeId = null;
      draft.selection = [];
      draft.selectedConnectors = [];
      draft.nodeTransfer = null;
      draft.nodeDrag = null;
      draft.dropFlash = null;
      draft.activeTool = "select";
    });
  },

  presentationNext: () => {
    const current = get().presentation;
    if (!current) return;
    const index = Math.min(current.index + 1, current.boardIds.length - 1);
    if (index === current.index) return;
    set((draft) => {
      if (draft.presentation) draft.presentation.index = index;
    });
    get().openBoard(current.boardIds[index]);
  },

  presentationPrevious: () => {
    const current = get().presentation;
    if (!current) return;
    const index = Math.max(current.index - 1, 0);
    if (index === current.index) return;
    set((draft) => {
      if (draft.presentation) draft.presentation.index = index;
    });
    get().openBoard(current.boardIds[index]);
  },

  openNodeTransfer: (nodeIds, mode) => {
    set((draft) => {
      const board = activeBoard(draft as unknown as AppState);
      const ids = board
        ? nodeIds.filter((id) => board.nodes[id] && !board.nodes[id].locked)
        : [];
      if (ids.length === 0) return;
      draft.nodeTransfer = { nodeIds: ids, mode };
      draft.editingNodeId = null;
    });
  },

  closeNodeTransfer: () => {
    set((draft) => {
      draft.nodeTransfer = null;
    });
  },

  startNodeDrag: (nodeIds) => {
    if (nodeIds.length === 0) return;
    set((draft) => {
      draft.nodeDrag = { nodeIds: [...nodeIds], overBoardId: null, mode: "move" };
    });
  },

  hoverNodeDragTarget: (boardId, mode) => {
    set((draft) => {
      const current = draft.nodeDrag;
      if (!current) return;
      if (current.overBoardId === boardId && current.mode === mode) return;
      draft.nodeDrag = { ...current, overBoardId: boardId, mode };
    });
  },

  endNodeDrag: () => {
    set((draft) => {
      draft.nodeDrag = null;
    });
  },

  flashDropTarget: (boardId) => {
    const at = Date.now();
    set((draft) => {
      draft.dropFlash = { boardId, at };
    });
    setTimeout(() => {
      set((draft) => {
        if (draft.dropFlash?.at === at) draft.dropFlash = null;
      });
    }, 640);
  },

  setSettingsSection: (section) => {
    set((draft) => {
      draft.settingsSection = section;
    });
  },

  setInspectorTab: (tab) => {
    set((draft) => {
      draft.inspectorTab = tab;
    });
  },

  setStatus: (status, error = null) => {
    set((draft) => {
      draft.status = status;
      draft.lastError = error;
      if (status === "saved") draft.lastSavedAt = Date.now();
    });
  },

  markSaved: (at) => {
    set((draft) => {
      draft.status = "saved";
      draft.lastSavedAt = at ?? Date.now();
      draft.lastError = null;
    });
  },

  setHydrated: (hydrated) => {
    set((draft) => {
      draft.hydrated = hydrated;
    });
  },

  bumpAttachments: () => {
    set((draft) => {
      draft.attachmentsVersion += 1;
    });
  },

  setStorageKind: (kind) => {
    set((draft) => {
      draft.storageKind = kind;
    });
  },

  hydrate: (payload) => {
    set((draft) => {
      draft.workspaces = payload.workspaces;
      draft.workspaceOrder = payload.workspaceOrder;
      draft.activeWorkspaceId = payload.activeWorkspaceId;
      draft.boards = payload.boards;
      draft.tabs = payload.tabs;
      draft.activeTabId = payload.activeTabId;
      draft.settings = { ...DEFAULT_SETTINGS, ...(payload.settings ?? {}) };
      draft.customTemplates = payload.customTemplates ?? [];
      draft.viewports = payload.viewports ? { ...payload.viewports } : {};
      draft.expandedBoards = {};
      for (const board of Object.values(draft.boards)) {
        if (board.parentId) draft.expandedBoards[board.parentId] = true;
      }
      draft.selection = [];
      draft.selectedConnectors = [];
      draft.editingNodeId = null;
      draft.drawingNodeId = null;
      draft.noteNodeId = null;
      draft.dialog = null;
      draft.tagFilters = {};
      draft.presentation = null;
      draft.nodeTransfer = null;
      draft.nodeDrag = null;
      draft.dropFlash = null;
      draft.sidebarCollapsed = false;
      draft.status = "idle";
      draft.lastError = null;
      draft.hydrated = true;
      draft.storageKind = payload.storageKind ?? draft.storageKind;
      draft.history = createHistoryState();
      draft.transaction = null;
      ensureNavigation(draft);
    });
  },
});
