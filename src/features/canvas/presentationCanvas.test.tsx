import { describe, expect, it } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAppStore } from "@/core/store";
import { addNodeToPayload, makePayload } from "@/test/fixtures";
import { Canvas } from "./Canvas";

function setup() {
  const test = makePayload("Apresentação");
  const note = addNodeToPayload(test, {
    type: "note",
    x: 40,
    y: 40,
    title: "Conteúdo apresentado",
    content: "Texto",
  });
  useAppStore.getState().hydrate(test.payload);
  const view = render(
    <TooltipProvider>
      <Canvas presentation />
    </TooltipProvider>,
  );
  return { test, note, view };
}

describe("canvas no modo apresentação", () => {
  it("remove o chrome e mantém o nó somente leitura", () => {
    const { note, view } = setup();
    const node = view.container.querySelector<HTMLElement>(`[data-node-id="${note.id}"]`);
    expect(node).toBeTruthy();
    expect(node).toHaveClass("presentation-readonly");
    expect(view.container.querySelector('button[aria-label="Filtrar por etiqueta"]')).toBeNull();
    expect(view.container.querySelector('input[aria-label="Título do quadro"]')).toBeNull();
    expect(view.container.querySelector('button[aria-label="Selecionar"]')).toBeNull();
  });

  it("não abre edição com duplo clique", () => {
    const { view } = setup();
    const node = view.container.querySelector<HTMLElement>("[data-node-id]");
    if (!node) throw new Error("nó não renderizado");
    fireEvent.doubleClick(node);
    expect(useAppStore.getState().editingNodeId).toBeNull();
  });

  it("ignora o filtro de etiqueta durante a apresentação", () => {
    const test = makePayload("Apresentação");
    const note = addNodeToPayload(test, {
      type: "note",
      x: 0,
      y: 0,
      title: "Sem a etiqueta",
      tags: ["arte"],
    });
    useAppStore.getState().hydrate(test.payload);
    useAppStore.getState().setTagFilter(test.boardId, "combate");
    const view = render(
      <TooltipProvider>
        <Canvas presentation />
      </TooltipProvider>,
    );
    expect(view.container.querySelector(`[data-node-id="${note.id}"]`)).toBeInTheDocument();
  });
});
