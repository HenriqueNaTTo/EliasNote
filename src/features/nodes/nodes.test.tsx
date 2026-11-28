import { describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAppStore } from "@/core/store";
import { makePayload, addNodeToPayload } from "@/test/fixtures";
import { TaskNode } from "./TaskNode";
import { ChecklistNode } from "./ChecklistNode";
import { NoteNode } from "./NoteNode";
import { TextNode } from "./TextNode";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { CanvasNode } from "@/core/domain/types";

function harnessFor(nodeId: string, boardId: string): () => CanvasNode {
  return () => useAppStore.getState().boards[boardId].nodes[nodeId];
}

describe("nós do canvas", () => {
  it("conclui uma tarefa ao clicar no checkbox", async () => {
    const test = makePayload();
    const task = addNodeToPayload(test, { type: "task", x: 0, y: 0, title: "Revisar proposta" });
    useAppStore.getState().hydrate(test.payload);
    const user = userEvent.setup();

    function TaskHarness() {
      const node = useAppStore((state) => state.boards[test.boardId].nodes[task.id]);
      return <TaskNode node={node} editing={false} selected={false} />;
    }

    render(<TaskHarness />);
    await user.click(screen.getByLabelText("Marcar como concluída"));
    expect(harnessFor(task.id, test.boardId)().done).toBe(true);
    expect(screen.getByLabelText("Marcar como pendente")).toBeInTheDocument();
  });

  it("adiciona e remove itens de checklist", async () => {
    const test = makePayload();
    const checklist = addNodeToPayload(test, {
      type: "checklist",
      x: 0,
      y: 0,
      title: "Entrega",
      items: [{ id: "item-1", text: "Primeiro", done: false }],
    });
    useAppStore.getState().hydrate(test.payload);
    const user = userEvent.setup();

    function ChecklistHarness() {
      const node = useAppStore((state) => state.boards[test.boardId].nodes[checklist.id]);
      return <ChecklistNode node={node} editing={false} selected={false} />;
    }

    render(<ChecklistHarness />);
    const input = screen.getByPlaceholderText("Adicionar item…");
    await user.type(input, "Segundo item{enter}");
    expect(harnessFor(checklist.id, test.boardId)().items).toHaveLength(2);
    expect(screen.getByDisplayValue("Segundo item")).toBeInTheDocument();

    await user.click(screen.getAllByLabelText("Concluir item")[0]);
    expect(harnessFor(checklist.id, test.boardId)().items?.[0].done).toBe(true);
  });

  it("edita o conteúdo da nota em markdown e renderiza a prévia", async () => {
    const test = makePayload();
    const note = addNodeToPayload(test, {
      type: "note",
      x: 0,
      y: 0,
      title: "Rascunho",
      content: "**Importante**",
    });
    useAppStore.getState().hydrate(test.payload);
    const user = userEvent.setup();

    function NoteHarness({ editing }: { editing: boolean }) {
      const node = useAppStore((state) => state.boards[test.boardId].nodes[note.id]);
      return <NoteNode node={node} editing={editing} selected={false} />;
    }

    const { rerender } = render(
      <TooltipProvider>
        <NoteHarness editing={false} />
      </TooltipProvider>,
    );
    expect(screen.getByText("Importante")).toBeInTheDocument();
    expect(screen.getByText("Rascunho")).toBeInTheDocument();

    rerender(
      <TooltipProvider>
        <NoteHarness editing />
      </TooltipProvider>,
    );
    const editor = screen.getByRole("textbox", { name: "Conteúdo da nota" });
    await user.type(editor, " adicional");
    expect(harnessFor(note.id, test.boardId)().content).toContain("adicional");
  });

  it("mostra miniaturas de desenhos vinculados dentro da nota", () => {
    const test = makePayload();
    const note = addNodeToPayload(test, { type: "note", x: 0, y: 0, title: "Com esboço", content: "Veja o esboço" });
    const drawing = addNodeToPayload(test, { type: "drawing", x: 400, y: 0, title: "Esboço" });
    test.payload.boards[test.boardId].nodes[note.id].references = [`node:${drawing.id}`];
    useAppStore.getState().hydrate(test.payload);

    function NoteHarness() {
      const node = useAppStore((state) => state.boards[test.boardId].nodes[note.id]);
      return <NoteNode node={node} editing={false} selected />;
    }

    render(
      <TooltipProvider>
        <NoteHarness />
      </TooltipProvider>,
    );

    expect(screen.getByTitle("Editar Esboço")).toBeInTheDocument();
    expect(screen.getByText("Esboço")).toBeInTheDocument();
    expect(screen.getByLabelText("Criar desenho vinculado")).toBeInTheDocument();
  });

  it("abre a nota em modal pelo botão do cartão", async () => {
    const test = makePayload();
    const note = addNodeToPayload(test, { type: "note", x: 0, y: 0, title: "Nota curta", content: "Texto" });
    useAppStore.getState().hydrate(test.payload);

    function NoteHarness() {
      const node = useAppStore((state) => state.boards[test.boardId].nodes[note.id]);
      return <NoteNode node={node} editing={false} selected />;
    }

    render(
      <TooltipProvider>
        <NoteHarness />
      </TooltipProvider>,
    );

    const user = userEvent.setup();
    await user.click(screen.getByLabelText("Abrir nota em modal"));

    expect(useAppStore.getState().dialog).toBe("note");
    expect(useAppStore.getState().noteNodeId).toBe(note.id);
  });

  it("escreve texto avulso sem moldura de nota", async () => {
    const test = makePayload();
    const text = addNodeToPayload(test, { type: "text", x: 1, y: 1, content: "" });
    useAppStore.getState().hydrate(test.payload);

    function TextHarness() {
      const node = useAppStore((state) => state.boards[test.boardId].nodes[text.id]);
      const editing = useAppStore((state) => state.editingNodeId === text.id);
      return <TextNode node={node} editing={editing} selected={editing} />;
    }

    render(<TextHarness />);
    expect(screen.getByText("Texto")).toBeInTheDocument();

    act(() => useAppStore.getState().setEditingNode(text.id));
    const user = userEvent.setup();
    const textarea = await screen.findByPlaceholderText("Escreva algo…");
    await user.type(textarea, "Bom dia");

    expect(harnessFor(text.id, test.boardId)().content).toBe("Bom dia");
  });
});
