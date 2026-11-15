import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAppStore } from "@/core/store";
import { addNodeToPayload, makePayload } from "@/test/fixtures";
import { CanvasNodeView } from "./CanvasNodeView";

describe("arrastar elemento para um quadro de destino", () => {
  it("move a nota ao soltar sobre o cartão de quadro", async () => {
    const test = makePayload();
    const note = addNodeToPayload(test, { type: "note", x: 100, y: 100, title: "Solto aqui" });
    useAppStore.getState().hydrate(test.payload);
    const targetBoardId = useAppStore.getState().createBoard({ title: "Destino", open: false }) as string;
    const tileId = useAppStore
      .getState()
      .addBoardNode(test.boardId, { x: 500, y: 100 }, "Destino") as string;
    // garante que o cartão aponta para o quadro criado acima
    useAppStore.getState().updateNode(tileId, { childBoardId: targetBoardId });
    const user = userEvent.setup();

    const noteView = () => useAppStore.getState().boards[test.boardId].nodes[note.id];

    render(
      <CanvasNodeView
        node={noteView()}
        zoom={1}
        connectorMode={false}
        getWorldPoint={(x, y) => ({ x, y })}
        onStartConnector={() => undefined}
      />,
    );

    const element = screen.getByText("Solto aqui");
    await user.pointer([
      { keys: "[MouseLeft>]", target: element, coords: { clientX: 0, clientY: 0 } },
      { target: document.body, coords: { clientX: 520, clientY: 150 } },
      { keys: "[/MouseLeft]", target: document.body, coords: { clientX: 520, clientY: 150 } },
    ]);

    expect(useAppStore.getState().nodeDrag).toBeNull();
    expect(useAppStore.getState().boards[test.boardId].nodes[note.id]).toBeUndefined();
    expect(useAppStore.getState().boards[targetBoardId].nodes[note.id]).toBeDefined();
  });
});
