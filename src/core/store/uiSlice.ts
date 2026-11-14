import { clampZoom, zoomAtPoint } from "@/lib/geometry";
import { DEFAULT_SETTINGS } from "@/core/domain/constants";
import { createHistoryState } from "./history";
import { ensureNavigation } from "./helpers";
import type { AppStoreCreator } from "./slice";
import type { UiSlice } from "./types";

export const createUiSlice: AppStoreCreator<UiSlice> = (set, get) => ({
  viewports: {},
  canvasSize: { width: 0, height: 0 },
  sidebarCollapsed: false,
  dialog: null,
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
      if (dialog === "search" || dialog === "drawing") draft.editingNodeId = null;
    });
  },

  closeDialog: () => {
    set((draft) => {
      if (draft.dialog === "drawing") draft.drawingNodeId = null;
      draft.dialog = null;
    });
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
      draft.dialog = null;
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
