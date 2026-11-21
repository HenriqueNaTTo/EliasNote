import { useEffect } from "react";
import { isEditableTarget } from "@/lib/utils";
import { SHORTCUTS, eventMatches } from "@/lib/hotkeys";
import { useAppStore } from "@/core/store";
import { defaultSize } from "@/core/domain/constants";
import type { NodeType } from "@/core/domain/types";
import { persistenceService } from "@/core/persistence/persistenceService";
import { openDialogs } from "@/features/shell/dialogActions";
import { fitBoardToView, viewportCenter, zoomBy, zoomTo } from "@/features/canvas/viewportActions";

const ALLOWED_WHILE_EDITING = new Set([
  "undo",
  "redo",
  "search",
  "save-now",
  "settings",
  "close-tab",
  "zoom-in",
  "zoom-out",
  "zoom-reset",
  "toggle-theme",
  "export",
  "tasks",
  "present",
]);

function createNodeAtCenter(type: NodeType): void {
  const state = useAppStore.getState();
  const center = viewportCenter();
  const size = defaultSize(type);
  const stagger = (Object.keys(state.boards[state.tabs.find((tab) => tab.id === state.activeTabId)?.boardId ?? ""]?.nodes ?? {}).length % 6) * 26;
  const id = state.addNode(type, {
    x: Math.round(center.x - size.w / 2 + stagger),
    y: Math.round(center.y - size.h / 2 + stagger),
  });
  if (id && type === "drawing") state.openDrawing(id);
  if (id && (type === "text" || type === "code")) state.setEditingNode(id);
}

function openSelected(): void {
  const state = useAppStore.getState();
  if (state.selection.length !== 1) return;
  const board = state.tabs.find((tab) => tab.id === state.activeTabId)
    ? state.boards[state.tabs.find((tab) => tab.id === state.activeTabId)?.boardId ?? ""]
    : undefined;
  const node = board?.nodes[state.selection[0]];
  if (!node) return;
  if (node.type === "board" && node.childBoardId) state.openBoard(node.childBoardId);
  else if (node.type === "drawing") state.openDrawing(node.id);
  else state.setEditingNode(node.id);
}

function runAction(actionId: string): void {
  const state = useAppStore.getState();
  switch (actionId) {
    case "new-note":
      createNodeAtCenter("note");
      break;
    case "new-text":
      createNodeAtCenter("text");
      break;
    case "new-code":
      createNodeAtCenter("code");
      break;
    case "new-card":
      createNodeAtCenter("card");
      break;
    case "new-task":
      createNodeAtCenter("task");
      break;
    case "new-checklist":
      createNodeAtCenter("checklist");
      break;
    case "new-column":
      createNodeAtCenter("column");
      break;
    case "new-drawing":
      createNodeAtCenter("drawing");
      break;
    case "new-comment":
      createNodeAtCenter("comment");
      break;
    case "new-board":
      state.createBoard({});
      break;
    case "connector-tool":
      state.setTool("connector");
      break;
    case "select-tool":
      state.setTool("select");
      break;
    case "pan-tool":
      state.setTool("pan");
      break;
    case "undo":
      state.undo();
      break;
    case "redo":
      state.redo();
      break;
    case "duplicate":
      if (state.selection.length > 0) state.duplicateNodes(state.selection);
      break;
    case "delete":
      if (state.selectedConnectors.length > 0) {
        for (const id of state.selectedConnectors) state.removeConnector(id);
      } else if (state.selection.length > 0) {
        state.removeNodes(state.selection);
      }
      break;
    case "select-all":
      state.selectAll();
      break;
    case "add-child-board":
      openSelected();
      break;
    case "close-tab":
      if (state.activeTabId) state.closeTab(state.activeTabId);
      break;
    case "next-tab":
      state.cycleTab(1);
      break;
    case "zoom-in":
      zoomBy(1.2);
      break;
    case "zoom-out":
      zoomBy(1 / 1.2);
      break;
    case "zoom-reset":
      zoomTo(1);
      break;
    case "zoom-fit":
      fitBoardToView();
      break;
    case "toggle-sidebar":
      state.toggleSidebar();
      break;
    case "toggle-inspector":
      state.updateSettings({ inspectorOpen: !state.settings.inspectorOpen });
      break;
    case "save-now":
      void persistenceService.flushNow();
      break;
    case "export":
      openDialogs.export();
      break;
    case "settings":
      openDialogs.settings();
      break;
    case "backups":
      openDialogs.backups();
      break;
    case "templates":
      openDialogs.templates();
      break;
    case "search":
      openDialogs.search();
      break;
    case "tasks":
      openDialogs.tasks();
      break;
    case "present":
      state.startPresentation();
      break;
    case "toggle-theme":
      state.toggleTheme();
      break;
    default:
      break;
  }
}

/** Registra os atalhos globais do aplicativo (respeitando as customizações). */
export function useAppHotkeys(): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const state = useAppStore.getState();
      if (state.presentation) return;
      const editing = isEditableTarget(event.target);

      // Diálogo de mover/copiar entre quadros bloqueia os atalhos do canvas.
      if (state.nodeTransfer) {
        if (event.key === "Escape") state.closeNodeTransfer();
        return;
      }

      if (event.key === "Escape") {
        if (state.dialog) return;
        if (state.editingNodeId) {
          state.setEditingNode(null);
          event.preventDefault();
          return;
        }
        if (state.activeTool !== "select") {
          state.setTool("select");
          event.preventDefault();
          return;
        }
        if (state.selection.length > 0) {
          state.clearSelection();
          event.preventDefault();
        }
        return;
      }

      if (state.dialog) return;

      const overrides = state.settings.shortcuts;
      let matched: string | null = null;
      for (const shortcut of SHORTCUTS) {
        const combo = overrides[shortcut.id] ?? shortcut.combo;
        if (eventMatches(event, combo)) {
          matched = shortcut.id;
          break;
        }
      }
      if (matched === "redo" && eventMatches(event, "Mod+Shift+Z")) matched = "redo";
      if (!matched && eventMatches(event, "Mod+Y")) matched = "redo";
      if (!matched && event.key === "Backspace") matched = "delete";

      if (matched) {
        if (editing && !ALLOWED_WHILE_EDITING.has(matched)) return;
        event.preventDefault();
        runAction(matched);
        return;
      }

      if (editing) return;

      if (event.key === "Enter" && state.selection.length === 1) {
        event.preventDefault();
        openSelected();
        return;
      }

      if (event.key.startsWith("Arrow") && state.selection.length > 0) {
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1;
        const delta = {
          ArrowLeft: { x: -step, y: 0 },
          ArrowRight: { x: step, y: 0 },
          ArrowUp: { x: 0, y: -step },
          ArrowDown: { x: 0, y: step },
        }[event.key];
        if (delta) state.moveNodes(state.selection, delta);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
