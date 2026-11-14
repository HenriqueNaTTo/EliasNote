import type { AppStore } from "@/core/store";
import type { AppState } from "@/core/store/types";
import type { BackupInfo, ID } from "@/core/domain/types";
import { formatDateTime } from "@/lib/utils";
import {
  buildBackupSnapshot,
  deleteBoardDoc,
  restoreBackup,
  writeAppDocument,
  writeBoard,
  writeSettings,
} from "./repository";
import type { StorageAdapter } from "./types";

const DEFAULT_FLUSH_DELAY = 700;

/**
 * Serviço de autosave: observa o store, escreve apenas os quadros alterados e
 * mantém backups rotativos. Nunca bloqueia a UI (tudo assíncrono e enfileirado).
 */
export class PersistenceService {
  private store: AppStore | null = null;
  private adapter: StorageAdapter | null = null;
  private unsubscribe: (() => void) | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private backupTimer: ReturnType<typeof setInterval> | null = null;
  private dirtyBoards = new Set<ID>();
  private deletedBoards = new Set<ID>();
  private metaDirty = false;
  private settingsDirty = false;
  private generation = 0;
  private queue: Promise<void> = Promise.resolve();
  private lastBackupAt = 0;
  private boundBeforeUnload: (() => void) | null = null;
  private boundVisibility: (() => void) | null = null;

  get storageKind(): StorageAdapter["kind"] | null {
    return this.adapter?.kind ?? null;
  }

  start(store: AppStore, adapter: StorageAdapter): void {
    this.stop();
    this.store = store;
    this.adapter = adapter;
    this.lastBackupAt = store.getState().settings.lastBackupAt ?? 0;
    this.unsubscribe = store.subscribe((state, prev) => {
      this.onChange(state, prev);
    });
    this.backupTimer = setInterval(() => {
      void this.maybeAutoBackup();
    }, 60_000);

    // Se o store já tem dados (ex.: serviço reiniciado), grava o estado atual.
    if (store.getState().hydrated) {
      this.markEverythingDirty();
      this.schedule(store.getState().settings.autosaveDelay || DEFAULT_FLUSH_DELAY);
    }

    if (typeof window !== "undefined") {
      this.boundBeforeUnload = () => {
        void this.flushNow();
      };
      this.boundVisibility = () => {
        if (document.visibilityState === "hidden") void this.flushNow();
      };
      window.addEventListener("beforeunload", this.boundBeforeUnload);
      document.addEventListener("visibilitychange", this.boundVisibility);
    }
  }

  stop(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    if (this.backupTimer) clearInterval(this.backupTimer);
    this.backupTimer = null;
    this.unsubscribe?.();
    this.unsubscribe = null;
    if (typeof window !== "undefined") {
      if (this.boundBeforeUnload) window.removeEventListener("beforeunload", this.boundBeforeUnload);
      if (this.boundVisibility) document.removeEventListener("visibilitychange", this.boundVisibility);
    }
    this.boundBeforeUnload = null;
    this.boundVisibility = null;
    this.store = null;
    this.adapter = null;
  }

  private onChange(state: AppState, prev: AppState): void {
    if (!state.hydrated) return;
    let changed = false;

    if (state.boards !== prev.boards) {
      for (const [id, board] of Object.entries(state.boards)) {
        if (prev.boards[id] !== board) {
          this.dirtyBoards.add(id);
          changed = true;
        }
      }
      for (const id of Object.keys(prev.boards)) {
        if (!state.boards[id]) {
          this.deletedBoards.add(id);
          this.dirtyBoards.delete(id);
          changed = true;
        }
      }
    }

    if (
      state.workspaces !== prev.workspaces ||
      state.workspaceOrder !== prev.workspaceOrder ||
      state.activeWorkspaceId !== prev.activeWorkspaceId ||
      state.tabs !== prev.tabs ||
      state.activeTabId !== prev.activeTabId ||
      state.viewports !== prev.viewports ||
      state.customTemplates !== prev.customTemplates
    ) {
      this.metaDirty = true;
      changed = true;
    }

    if (state.settings !== prev.settings) {
      this.settingsDirty = true;
      changed = true;
    }

    if (!changed) return;
    this.generation += 1;
    if (state.status !== "saving") state.setStatus("saving");
    this.schedule(state.settings.autosaveDelay || DEFAULT_FLUSH_DELAY);
  }

  private schedule(delay = DEFAULT_FLUSH_DELAY): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.flushNow();
    }, delay);
  }

  /** Garante que tudo que está pendente seja gravado agora. */
  flushNow(): Promise<void> {
    const run = this.queue.then(() => this.doFlush());
    this.queue = run.catch(() => undefined);
    return run;
  }

  private async doFlush(): Promise<void> {
    if (!this.store || !this.adapter) return;
    const state = this.store.getState();
    if (!state.hydrated) return;

    const generation = this.generation;
    const boards = Array.from(this.dirtyBoards);
    const deleted = Array.from(this.deletedBoards);
    const meta = this.metaDirty;
    const settings = this.settingsDirty;
    this.dirtyBoards.clear();
    this.deletedBoards.clear();
    this.metaDirty = false;
    this.settingsDirty = false;

    if (!meta && !settings && boards.length === 0 && deleted.length === 0) return;

    try {
      if (meta) await writeAppDocument(this.adapter, state);
      if (settings) await writeSettings(this.adapter, state.settings);
      for (const id of boards) {
        const board = state.boards[id];
        if (board) await writeBoard(this.adapter, board);
      }
      for (const id of deleted) await deleteBoardDoc(this.adapter, id);
      state.markSaved();
    } catch (error) {
      state.setStatus("error", error instanceof Error ? error.message : "Falha ao salvar");
      return;
    }

    if (generation !== this.generation) {
      this.schedule(state.settings.autosaveDelay || DEFAULT_FLUSH_DELAY);
    }
  }

  async createBackup(label?: string): Promise<BackupInfo | null> {
    if (!this.store || !this.adapter) return null;
    const state = this.store.getState();
    const snapshot = await buildBackupSnapshot(state, this.adapter.kind);
    const info = await this.adapter.createBackup(
      label ?? `Backup ${formatDateTime(Date.now())}`,
      snapshot,
      Math.max(1, state.settings.backupRetention),
    );
    this.lastBackupAt = info.createdAt;
    state.updateSettings({ lastBackupAt: info.createdAt });
    return info;
  }

  async listBackups(): Promise<BackupInfo[]> {
    if (!this.adapter) return [];
    return this.adapter.listBackups();
  }

  async deleteBackup(id: string): Promise<void> {
    await this.adapter?.deleteBackup(id);
  }

  async restoreFromBackup(id: string): Promise<boolean> {
    if (!this.store || !this.adapter) return false;
    const payload = await restoreBackup(this.adapter, id);
    if (!payload) return false;
    this.store.getState().hydrate(payload);
    this.markEverythingDirty();
    await this.flushNow();
    return true;
  }

  markEverythingDirty(): void {
    if (!this.store) return;
    for (const id of Object.keys(this.store.getState().boards)) this.dirtyBoards.add(id);
    this.metaDirty = true;
    this.settingsDirty = true;
    this.generation += 1;
  }

  private async maybeAutoBackup(): Promise<void> {
    if (!this.store) return;
    const state = this.store.getState();
    const minutes = state.settings.backupIntervalMinutes;
    if (!minutes || minutes <= 0) return;
    const last = Math.max(this.lastBackupAt, state.settings.lastBackupAt ?? 0);
    if (Date.now() - last < minutes * 60_000) return;
    try {
      await this.createBackup();
    } catch (error) {
      console.warn("[EliasNote] Falha ao criar backup automático", error);
    }
  }
}

export const persistenceService = new PersistenceService();
