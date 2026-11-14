import { DEFAULT_SETTINGS } from "@/core/domain/constants";
import { createSeedState } from "@/core/domain/factories";
import { useAppStore } from "@/core/store";
import { getAdapter } from "./persistence/adapter";
import { persistenceService } from "./persistence/persistenceService";
import { loadPersisted } from "./persistence/repository";

export interface BootstrapResult {
  storageKind: "sqlite" | "indexeddb" | "memory";
  restored: boolean;
  error?: string;
}

/**
 * Carrega os dados locais. Se não existir nada, cria o quadro de boas-vindas.
 * O serviço de autosave é iniciado antes da hidratação para persistir o seed.
 */
export async function bootstrapApplication(): Promise<BootstrapResult> {
  const store = useAppStore;
  const adapter = await getAdapter();
  persistenceService.start(store, adapter);

  try {
    const payload = await loadPersisted(adapter);
    if (payload && payload.workspaceOrder.length > 0) {
      store.getState().hydrate(payload);
      return { storageKind: adapter.kind, restored: true };
    }
  } catch (error) {
    console.error("[EliasNote] Falha ao carregar dados", error);
    store.getState().setStatus("error", error instanceof Error ? error.message : "Falha ao carregar dados");
  }

  const seed = createSeedState(DEFAULT_SETTINGS);
  store.getState().hydrate({
    workspaces: seed.workspaces,
    workspaceOrder: seed.workspaceOrder,
    activeWorkspaceId: seed.activeWorkspaceId,
    boards: seed.boards,
    tabs: seed.tabs,
    activeTabId: seed.activeTabId,
    viewports: seed.viewports,
    settings: DEFAULT_SETTINGS,
    customTemplates: [],
    storageKind: adapter.kind,
  });
  return { storageKind: adapter.kind, restored: false };
}
