import { describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAppStore } from "@/core/store";
import { addNodeToPayload, makePayload } from "@/test/fixtures";
import { NodeTransferDialog } from "./NodeTransferDialog";

describe("diálogo de mover/copiar entre quadros", () => {
  it("copia a nota escolhida para o quadro de destino", async () => {
    const test = makePayload();
    const note = addNodeToPayload(test, { type: "note", x: 0, y: 0, title: "Ideia", content: "Texto" });
    useAppStore.getState().hydrate(test.payload);
    const targetId = useAppStore.getState().createBoard({ title: "Destino", open: false }) as string;
    const user = userEvent.setup();

    render(<NodeTransferDialog />);
    act(() => useAppStore.getState().openNodeTransfer([note.id], "copy"));

    expect(await screen.findByText("Copiar para outro quadro")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Destino/ }));

    const target = useAppStore.getState().boards[targetId];
    expect(Object.values(target.nodes)).toHaveLength(1);
    expect(Object.values(target.nodes)[0].title).toBe("Ideia");
    expect(useAppStore.getState().boards[test.boardId].nodes[note.id]).toBeDefined();
    expect(useAppStore.getState().nodeTransfer).toBeNull();
  });

  it("remove a nota da origem ao mover", async () => {
    const test = makePayload();
    const note = addNodeToPayload(test, { type: "note", x: 0, y: 0, title: "Mover" });
    useAppStore.getState().hydrate(test.payload);
    const targetId = useAppStore.getState().createBoard({ title: "Destino", open: false }) as string;
    const user = userEvent.setup();

    render(<NodeTransferDialog />);
    act(() => useAppStore.getState().openNodeTransfer([note.id], "move"));
    expect(await screen.findByText("Mover para outro quadro")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Destino/ }));

    expect(useAppStore.getState().boards[test.boardId].nodes[note.id]).toBeUndefined();
    expect(useAppStore.getState().boards[targetId].nodes[note.id]).toBeDefined();
  });
});
