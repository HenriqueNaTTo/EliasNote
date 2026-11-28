import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAppStore } from "@/core/store";
import { addNodeToPayload, makePayload } from "@/test/fixtures";
import { CanvasNodeView } from "./CanvasNodeView";

describe("duplicar pelo menu de contexto", () => {
  it("duplica a nota selecionada", async () => {
    const test = makePayload();
    const note = addNodeToPayload(test, { type: "note", x: 0, y: 0, title: "Origem", content: "x" });
    useAppStore.getState().hydrate(test.payload);
    const user = userEvent.setup();

    render(
      <CanvasNodeView
        node={useAppStore.getState().boards[test.boardId].nodes[note.id]}
        zoom={1}
        connectorMode={false}
        getWorldPoint={() => ({ x: 0, y: 0 })}
        onStartConnector={() => undefined}
      />,
    );

    fireEvent.contextMenu(screen.getByText("Origem"));
    await user.click(await screen.findByText("Duplicar"));

    const nodes = Object.values(useAppStore.getState().boards[test.boardId].nodes);
    expect(nodes).toHaveLength(2);
    expect(useAppStore.getState().selection).toHaveLength(1);
  });
});
