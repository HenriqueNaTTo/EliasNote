import type { AppStoreCreator } from "./slice";
import type { HistorySlice } from "./types";
import {
  captureHistoryData,
  createHistoryState,
  pushHistoryEntry,
  redoHistory,
  sameHistoryData,
  transactionFrom,
  undoHistory,
} from "./history";
import { ensureNavigation } from "./helpers";
import type { Draft } from "immer";
import type { AppState, HistoryDataSnapshot } from "./types";

function applySnapshot(draft: Draft<AppState>, data: HistoryDataSnapshot): void {
  draft.boards = data.boards;
  draft.workspaces = data.workspaces;
  draft.workspaceOrder = data.workspaceOrder;
  draft.activeWorkspaceId = data.activeWorkspaceId;
}

export const createHistorySlice: AppStoreCreator<HistorySlice> = (set, get) => ({
  history: createHistoryState(),
  transaction: null,

  commit: (label, mutator, options) => {
    const before = captureHistoryData(get());
    set((draft) => {
      mutator(draft);
    });
    if (get().transaction) return;
    const after = captureHistoryData(get());
    if (sameHistoryData(before, after)) return;
    set((draft) => {
      draft.history = pushHistoryEntry(draft.history, {
        label,
        before,
        after,
        coalesceKey: options?.coalesceKey,
      });
    });
  },

  beginTransaction: (label) => {
    const state = get();
    if (state.transaction) return;
    set((draft) => {
      draft.transaction = transactionFrom(label, state);
      draft.history.future = [];
    });
  },

  endTransaction: () => {
    const state = get();
    const transaction = state.transaction;
    if (!transaction) return;
    const after = captureHistoryData(state);
    set((draft) => {
      draft.transaction = null;
      if (!sameHistoryData(transaction.before, after)) {
        draft.history = pushHistoryEntry(draft.history, {
          label: transaction.label,
          before: transaction.before,
          after,
        });
      }
    });
  },

  cancelTransaction: () => {
    const state = get();
    const transaction = state.transaction;
    if (!transaction) return;
    set((draft) => {
      applySnapshot(draft, transaction.before);
      draft.transaction = null;
      ensureNavigation(draft);
    });
  },

  undo: () => {
    const state = get();
    const { history, entry } = undoHistory(state.history);
    if (!entry) return;
    set((draft) => {
      applySnapshot(draft, entry.before);
      draft.history = history;
      draft.transaction = null;
      ensureNavigation(draft);
    });
  },

  redo: () => {
    const state = get();
    const { history, entry } = redoHistory(state.history);
    if (!entry) return;
    set((draft) => {
      applySnapshot(draft, entry.after);
      draft.history = history;
      draft.transaction = null;
      ensureNavigation(draft);
    });
  },

  clearHistory: () => {
    set((draft) => {
      draft.history = createHistoryState();
      draft.transaction = null;
    });
  },
});
