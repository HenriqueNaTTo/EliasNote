import { afterEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ObsidianImportDialog } from "./ObsidianImportDialog";
import { useAppStore } from "@/core/store";
import { makePayload } from "@/test/fixtures";

function vaultFile(path: string, content: string): File {
  const file = new File([content], path.split("/").pop() ?? "nota.md", { type: "text/markdown" });
  Object.defineProperty(file, "webkitRelativePath", { value: path });
  return file;
}

afterEach(() => {
  useAppStore.getState().closeDialog();
});

describe("diálogo de importação do Obsidian", () => {
  it("lê a pasta, mostra o resumo e importa em um workspace novo", async () => {
    const fixture = makePayload();
    useAppStore.getState().hydrate(fixture.payload);
    useAppStore.getState().openDialog("obsidian");

    render(<ObsidianImportDialog />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeTruthy();

    const files = [
      vaultFile("MeuCofre/Pasta/Nota A.md", "# Nota A\n\nLiga para [[Nota B]].\n"),
      vaultFile("MeuCofre/Pasta/Nota B.md", "# Nota B\n\nConteúdo B.\n"),
      vaultFile("MeuCofre/.obsidian/app.json", "{}"),
    ];

    fireEvent.change(input, { target: { files } });

    await waitFor(() => {
      expect(screen.getByText("MeuCofre")).toBeInTheDocument();
    });

    const notas = screen.getByText("Notas").parentElement;
    expect(notas?.textContent).toContain("2");

    fireEvent.click(screen.getByRole("button", { name: "Importar cofre" }));

    await waitFor(() => {
      expect(useAppStore.getState().activeWorkspaceId).not.toBe(fixture.workspaceId);
    });

    const state = useAppStore.getState();
    const workspace = state.workspaces[state.activeWorkspaceId];
    expect(workspace.name).toContain("Obsidian");
    const boards = Object.values(state.boards).filter((board) => board.workspaceId === workspace.id);
    const folder = boards.find((board) => board.title === "Pasta");
    expect(folder).toBeDefined();
    const notes = Object.values(folder?.nodes ?? {}).filter((node) => node.type === "note");
    expect(notes).toHaveLength(2);
    const noteA = notes.find((node) => node.title === "Nota A");
    expect(noteA?.content).toContain("eliasnote://node/");
    expect(noteA?.references?.length).toBe(1);
  });
});
