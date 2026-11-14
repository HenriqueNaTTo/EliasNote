import { DEFAULT_SETTINGS } from "@/core/domain/constants";
import type { AppStoreCreator } from "./slice";
import type { SettingsSlice } from "./types";

export const createSettingsSlice: AppStoreCreator<SettingsSlice> = (set) => ({
  settings: DEFAULT_SETTINGS,

  updateSettings: (patch) => {
    set((draft) => {
      draft.settings = { ...draft.settings, ...patch };
    });
  },

  setShortcut: (actionId, combo) => {
    set((draft) => {
      const shortcuts = { ...draft.settings.shortcuts };
      if (!combo) {
        delete shortcuts[actionId];
      } else {
        shortcuts[actionId] = combo;
      }
      draft.settings.shortcuts = shortcuts;
    });
  },

  resetShortcuts: () => {
    set((draft) => {
      draft.settings.shortcuts = {};
    });
  },

  toggleTheme: () => {
    set((draft) => {
      const currentlyDark =
        typeof document !== "undefined" && document.documentElement.classList.contains("dark");
      draft.settings.theme = currentlyDark ? "light" : "dark";
    });
  },
});
