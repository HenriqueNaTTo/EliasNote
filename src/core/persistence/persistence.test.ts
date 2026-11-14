import { describe, expect, it } from "vitest";
import { MemoryAdapter } from "@/core/persistence/memory";
import {
  buildBackupSnapshot,
  loadPersisted,
  restoreBackup,
  writeAppDocument,
  writeBoard,
  writeSettings,
} from "@/core/persistence/repository";
import { PersistenceService } from "@/core/persistence/persistenceService";
import { createAppStore } from "@/core/store";
import { makePayload } from "@/test/fixtures";

describe("persistência local", () => {
  it("grava e reconstrói o estado com migrações", async () => {
    const adapter = new MemoryAdapter();
    await adapter.init();
    const test = makePayload();
    const board = test.payload.boards[test.boardId];
    const state = {
      workspaces: test.payload.workspaces,
      workspaceOrder: test.payload.workspaceOrder,
      activeWorkspaceId: test.payload.activeWorkspaceId,
      boards: test.payload.boards,
      tabs: test.payload.tabs,
      activeTabId: test.payload.activeTabId,
      viewports: test.payload.viewports ?? {},
      settings: test.settings,
      customTemplates: [],
    };
    await writeAppDocument(adapter, state);
    await writeSettings(adapter, state.settings);
    await writeBoard(adapter, board);

    const loaded = await loadPersisted(adapter);
    expect(loaded).not.toBeNull();
    expect(loaded?.boards[test.boardId].title).toBe("Projeto");
    expect(loaded?.activeWorkspaceId).toBe(test.workspaceId);
    expect(loaded?.settings?.authorName).toBe(state.settings.authorName);
    expect(loaded?.storageKind).toBe("memory");
  });

  it("normaliza documentos antigos e corrompidos", async () => {
    const adapter = new MemoryAdapter();
    await adapter.init();
    await adapter.writeDoc("app", "main", {
      version: 1,
      workspaces: { ws: { id: "ws", name: "Antigo" } },
      workspaceOrder: ["ws"],
      activeWorkspaceId: "ws",
      tabs: [{ id: "t1", boardId: "b1", workspaceId: "ws" }],
      activeTabId: "t1",
    });
    await adapter.writeDoc("board", "b1", {
      id: "b1",
      workspaceId: "ws",
      title: "Quadro antigo",
      nodes: {
        n1: { id: "n1", type: "task", x: "10", title: "Tarefa" },
        invalido: { type: "note" },
      },
      connectors: {
        c1: { from: { nodeId: "n1" }, to: { x: 10, y: 20 }, kind: "elbow" },
      },
    });

    const loaded = await loadPersisted(adapter);
    const board = loaded?.boards.b1;
    expect(board?.nodes.n1.x).toBe(10);
    expect(board?.nodes.invalido).toBeUndefined();
    expect(board?.connectors.c1.kind).toBe("elbow");
    expect(board?.connectors.c1.arrowEnd).toBe(true);
  });

  it("cria backup completo e restaura os quadros", async () => {
    const adapter = new MemoryAdapter();
    await adapter.init();
    const test = makePayload();
    const snapshot = await buildBackupSnapshot(
      {
        workspaces: test.payload.workspaces,
        workspaceOrder: test.payload.workspaceOrder,
        activeWorkspaceId: test.payload.activeWorkspaceId,
        boards: test.payload.boards,
        tabs: test.payload.tabs,
        activeTabId: test.payload.activeTabId,
        viewports: test.payload.viewports ?? {},
        settings: test.settings,
        customTemplates: [],
      },
      "memory",
    );
    const info = await adapter.createBackup("Teste", snapshot, 5);
    expect(await adapter.listBackups()).toHaveLength(1);

    const restored = await restoreBackup(adapter, info.id);
    expect(restored?.boards[test.boardId].title).toBe("Projeto");
    await adapter.deleteBackup(info.id);
    expect(await adapter.listBackups()).toHaveLength(0);
  });

  it("autosalva apenas quadros alterados e restaura backup pelo serviço", async () => {
    const adapter = new MemoryAdapter();
    await adapter.init();
    const store = createAppStore();
    const test = makePayload();
    store.getState().hydrate(test.payload);
    const service = new PersistenceService();
    service.start(store, adapter);
    await service.flushNow();

    store.getState().addNode("note", { x: 10, y: 10 });
    await service.flushNow();
    const stored = await loadPersisted(adapter);
    const nodeCount = Object.keys(stored?.boards[test.boardId].nodes ?? {}).length;
    expect(nodeCount).toBe(1);

    await service.createBackup("Antes de mudanças");
    store.getState().addNode("task", { x: 50, y: 50 });
    await service.flushNow();
    const backups = await service.listBackups();
    expect(backups).toHaveLength(1);
    const restoredOk = await service.restoreFromBackup(backups[0].id);
    expect(restoredOk).toBe(true);
    expect(Object.keys(store.getState().boards[test.boardId].nodes)).toHaveLength(1);

    service.stop();
  });
});
