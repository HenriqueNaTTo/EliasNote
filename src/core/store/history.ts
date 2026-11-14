import type { HistoryDataSnapshot, HistoryState, TransactionState } from "./types";
import type { AppState } from "./types";
import { uid } from "@/lib/utils";

export const HISTORY_LIMIT = 80;
export const COALESCE_WINDOW = 1600;

export function createHistoryState(): HistoryState {
  return { past: [], future: [], lastAt: 0 };
}

export function captureHistoryData(state: AppState): HistoryDataSnapshot {
  return {
    boards: state.boards,
    workspaces: state.workspaces,
    workspaceOrder: state.workspaceOrder,
    activeWorkspaceId: state.activeWorkspaceId,
  };
}

export function sameHistoryData(a: HistoryDataSnapshot, b: HistoryDataSnapshot): boolean {
  return (
    a.boards === b.boards &&
    a.workspaces === b.workspaces &&
    a.workspaceOrder === b.workspaceOrder &&
    a.activeWorkspaceId === b.activeWorkspaceId
  );
}

export interface PushEntryInput {
  label: string;
  before: HistoryDataSnapshot;
  after: HistoryDataSnapshot;
  coalesceKey?: string;
  now?: number;
}

/**
 * Empilha uma entrada de histórico. Alterações consecutivas com a mesma
 * `coalesceKey` dentro da janela de tempo são fundidas em uma única entrada.
 */
export function pushHistoryEntry(history: HistoryState, input: PushEntryInput): HistoryState {
  const now = input.now ?? Date.now();
  const last = history.past[history.past.length - 1];
  const canMerge =
    Boolean(input.coalesceKey) &&
    Boolean(last) &&
    history.lastKey === input.coalesceKey &&
    now - history.lastAt <= COALESCE_WINDOW &&
    last.label === input.label;

  if (canMerge && last) {
    const past = [...history.past];
    past[past.length - 1] = { ...last, after: input.after, at: now };
    return { past, future: [], lastKey: input.coalesceKey, lastAt: now };
  }

  const entry = {
    id: uid("hist"),
    label: input.label,
    at: now,
    before: input.before,
    after: input.after,
  };
  const past = [...history.past, entry];
  if (past.length > HISTORY_LIMIT) past.splice(0, past.length - HISTORY_LIMIT);
  return { past, future: [], lastKey: input.coalesceKey, lastAt: now };
}

export function undoHistory(history: HistoryState): { history: HistoryState; entry: HistoryState["past"][number] | null } {
  const entry = history.past[history.past.length - 1] ?? null;
  if (!entry) return { history, entry: null };
  return {
    history: {
      past: history.past.slice(0, -1),
      future: [...history.future, entry],
      lastKey: undefined,
      lastAt: 0,
    },
    entry,
  };
}

export function redoHistory(history: HistoryState): { history: HistoryState; entry: HistoryState["past"][number] | null } {
  const entry = history.future[history.future.length - 1] ?? null;
  if (!entry) return { history, entry: null };
  return {
    history: {
      past: [...history.past, entry],
      future: history.future.slice(0, -1),
      lastKey: undefined,
      lastAt: 0,
    },
    entry,
  };
}

export function canUndo(history: HistoryState): boolean {
  return history.past.length > 0;
}

export function canRedo(history: HistoryState): boolean {
  return history.future.length > 0;
}

export function transactionFrom(label: string, state: AppState): TransactionState {
  return { label, before: captureHistoryData(state), at: Date.now() };
}
