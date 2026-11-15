import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAppStore } from "@/core/store";
import { addNodeToPayload, makePayload } from "@/test/fixtures";
import { CanvasNodeView } from "./CanvasNodeView";
import { NodeTransferDialog } from "./NodeTransferDialog";

describe("fluxo real: menu de contexto -> mover para outro quadro", () => {
  it("abre o diálogo a partir do menu de contexto do elemento", async () => {
    const test = makePayload();
    const note = addNodeToPayload(test, { type: "note", x: 0, y: 0, title: "Origem", content: "x" });
    useAppStore.getState().hydrate(test.payload);
    const targetId = useAppStore.getState().createBoard({ title: "Destino", open: false }) as string;
    const user = userEvent.setup();

    render(
      <>
        <CanvasNodeView
          node={useAppStore.getState().boards[test.boardId].nodes[note.id]}
          zoom={1}
          connectorMode={false}
          getWorldPoint={() => ({ x: 0, y: 0 })}
          onStartConnector={() => undefined}
        />
        <NodeTransferDialog />
      </>,
    );

    fireEvent.contextMenu(screen.getByText("Origem"));
    expect(await screen.findByText("Mover para outro quadro…")).toBeInTheDocument();

    await user.click(screen.getByText("Mover para outro quadro…"));

    await waitFor(() => expect(useAppStore.getState().nodeTransfer).not.toBeNull());
    expect(await screen.findByText("Mover para outro quadro")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Destino/ }));

    expect(useAppStore.getState().boards[test.boardId].nodes[note.id]).toBeUndefined();
    expect(useAppStore.getState().boards[targetId].nodes[note.id]).toBeDefined();
  });
});
