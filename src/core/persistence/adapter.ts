import { IndexedDbAdapter } from "./indexeddb";
import { MemoryAdapter } from "./memory";
import { TauriSqliteAdapter } from "./tauri";
import type { StorageAdapter } from "./types";

export function isTauriRuntime(): boolean {
  if (typeof window === "undefined") return false;
  const candidate = window as unknown as Record<string, unknown>;
  return "__TAURI_INTERNALS__" in candidate || "__TAURI__" in candidate;
}

let adapterPromise: Promise<StorageAdapter> | null = null;

/** Resolve o adaptador nativo (SQLite) ou o fallback local (IndexedDB). */
export function getAdapter(): Promise<StorageAdapter> {
  if (!adapterPromise) {
    adapterPromise = (async () => {
      if (isTauriRuntime()) {
        const adapter = new TauriSqliteAdapter();
        try {
          await adapter.init();
          return adapter;
        } catch (error) {
          console.warn("[EliasNote] SQLite indisponível, usando IndexedDB", error);
        }
      }
      if (typeof indexedDB !== "undefined") {
        try {
          const adapter = new IndexedDbAdapter();
          await adapter.init();
          return adapter;
        } catch (error) {
          console.warn("[EliasNote] IndexedDB indisponível, usando memória", error);
        }
      }
      const memory = new MemoryAdapter();
      await memory.init();
      return memory;
    })();
  }
  return adapterPromise;
}

export function resetAdapterForTests(): void {
  adapterPromise = null;
}
