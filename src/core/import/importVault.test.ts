import { describe, expect, it } from "vitest";
import { createAppStore } from "@/core/store";
import { makePayload } from "@/test/fixtures";
import { refForNode } from "@/core/domain/refs";
import { parseVaultEntries } from "./obsidianParser";
import { createVaultPlan } from "./obsidianPlan";
import type { VaultEntry } from "./vaultTypes";

function vaultEntries(): VaultEntry[] {
  return [
    {
      path: "Projeto/Nota A.md",
      name: "Nota A.md",
      size: 100,
      mime: "text/markdown",
      text: "# Nota A\n\nLiga para [[Nota B]] e usa ![[foto.png]].\n",
    },
    {
      path: "Projeto/Nota B.md",
      name: "Nota B.md",
      size: 60,
      mime: "text/markdown",
      text: "# Nota B\n\nConteúdo B.\n",
    },
    { path: "Projeto/foto.png", name: "foto.png", size: 2048, mime: "image/png" },
  ];
}

describe("ação importVault", () => {
  it("cria workspace, quadros, notas, referências e uma única entrada de histórico", () => {
    const store = createAppStore();
    const fixture = makePayload();
    store.getState().hydrate(fixture.payload);

    const model = parseVaultEntries(vaultEntries(), "Cofre");
    const plan = createVaultPlan(model, {
      workspaceName: "Obsidian · Cofre",
      rootBoardTitle: "Cofre",
      attachmentIds: { "Projeto/foto.png": "att_foto" },
    });

    const workspaceId = store.getState().importVault(plan);
    expect(workspaceId).toBeTruthy();

    const state = store.getState();
    expect(state.workspaces[workspaceId as string].name).toBe("Obsidian · Cofre");
    expect(state.activeWorkspaceId).toBe(workspaceId);

    const root = state.boards[plan.openBoardId];
    expect(root.title).toBe("Cofre");
    expect(root.nodes && Object.keys(root.nodes).length).toBeGreaterThan(0);

    const project = plan.boards.find((board) => board.title === "Projeto");
    expect(project).toBeDefined();
    const projectBoard = state.boards[project?.id ?? ""];
    expect(projectBoard.parentId).toBe(plan.openBoardId);

    const noteA = project?.nodes.find((node) => node.fields?.title === "Nota A");
    const noteB = project?.nodes.find((node) => node.fields?.title === "Nota B");
    expect(noteA).toBeDefined();
    expect(noteB).toBeDefined();

    const storedNote = projectBoard.nodes[noteA?.id ?? ""];
    expect(storedNote.content).toContain(`eliasnote://node/${noteB?.id}`);
    expect(storedNote.references).toContain(refForNode(noteB?.id ?? ""));
    const image = project?.nodes.find((node) => node.type === "image");
    expect(storedNote.references).toContain(refForNode(image?.id ?? ""));
    expect(projectBoard.nodes[image?.id ?? ""].attachmentId).toBe("att_foto");

    expect(state.history.past).toHaveLength(1);
    expect(state.tabs.some((tab) => tab.boardId === plan.openBoardId)).toBe(true);

    store.getState().undo();
    const undone = store.getState();
    expect(undone.workspaces[workspaceId as string]).toBeUndefined();
    expect(undone.boards[plan.openBoardId]).toBeUndefined();
    expect(undone.activeWorkspaceId).toBe(fixture.workspaceId);
  });
});
