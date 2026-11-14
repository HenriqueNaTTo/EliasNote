import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createHistorySlice } from "./historySlice";
import { createBoardSlice } from "./boardSlice";
import { createNodeSlice } from "./nodeSlice";
import { createUiSlice } from "./uiSlice";
import { createSettingsSlice } from "./settingsSlice";
import type { AppState } from "./types";

/**
 * Cria uma instância do store. Testes usam instâncias isoladas; o app usa o
 * singleton exportado abaixo.
 */
export function createAppStore(overrides?: Partial<AppState>) {
  return create<AppState>()(
    immer((set, get, api) => ({
      ...createHistorySlice(set, get, api),
      ...createBoardSlice(set, get, api),
      ...createNodeSlice(set, get, api),
      ...createUiSlice(set, get, api),
      ...createSettingsSlice(set, get, api),
      ...overrides,
    })),
  );
}

export type AppStore = ReturnType<typeof createAppStore>;

export const useAppStore = createAppStore();

export const appStore = useAppStore;
