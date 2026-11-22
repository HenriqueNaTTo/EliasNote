import { describe, expect, it } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAppStore } from "@/core/store";
import { TooltipProvider } from "@/components/ui/tooltip";
import { addNodeToPayload, makePayload } from "@/test/fixtures";
import { NoteDialog } from "./NoteDialog";

function renderNoteDialog() {
  return render(
    <TooltipProvider>
      <NoteDialog />
    </TooltipProvider>,
  );
}

describe("modal de edição de nota", () => {
  it("edita título e conteúdo em uma área ampla e fecha pelo botão", async () => {
    const test = makePayload();
    const note = addNodeToPayload(test, {
      type: "note",
      x: 0,
      y: 0,
      title: "Rascunho",
      content: "Conteúdo inicial",
    });
    useAppStore.getState().hydrate(test.payload);

    renderNoteDialog();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    act(() => useAppStore.getState().openNote(note.id));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Rascunho")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Conteúdo inicial")).toBeInTheDocument();

    const user = userEvent.setup();
    const title = screen.getByLabelText("Título da nota");
    await user.clear(title);
    await user.type(title, "Novo título");

    const editor = screen.getByPlaceholderText(/Escreva a nota em Markdown/);
    await user.type(editor, " adicional");

    const stored = useAppStore.getState().boards[test.boardId].nodes[note.id];
    expect(stored.title).toBe("Novo título");
    expect(stored.content).toContain("Conteúdo inicial adicional");

    await user.click(screen.getByRole("button", { name: "Fechar editor de nota" }));

    expect(useAppStore.getState().dialog).toBeNull();
    expect(useAppStore.getState().noteNodeId).toBeNull();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
