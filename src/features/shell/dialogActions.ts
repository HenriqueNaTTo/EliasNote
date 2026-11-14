import { useAppStore } from "@/core/store";
import type { DialogKind } from "@/core/store/types";

/** Ações de diálogo desacopladas de hooks, usadas por atalhos e menus. */
export const openDialogs = {
  search: () => useAppStore.getState().openDialog("search"),
  settings: (section?: "geral" | "aparencia" | "canvas" | "atalhos" | "dados" | "sobre") => {
    const state = useAppStore.getState();
    if (section) state.setSettingsSection(section);
    state.openDialog("settings");
  },
  templates: () => useAppStore.getState().openDialog("templates"),
  backups: () => useAppStore.getState().openDialog("backups"),
  export: () => useAppStore.getState().openDialog("export"),
  import: () => useAppStore.getState().openDialog("import"),
  obsidian: () => useAppStore.getState().openDialog("obsidian"),
  shortcuts: () => {
    const state = useAppStore.getState();
    state.setSettingsSection("atalhos");
    state.openDialog("settings");
  },
  about: () => {
    const state = useAppStore.getState();
    state.setSettingsSection("sobre");
    state.openDialog("settings");
  },
  drawing: (nodeId: string) => useAppStore.getState().openDrawing(nodeId),
  close: () => useAppStore.getState().closeDialog(),
} satisfies Record<string, (...args: never[]) => void>;

export function openDialog(kind: DialogKind): void {
  useAppStore.getState().openDialog(kind);
}
