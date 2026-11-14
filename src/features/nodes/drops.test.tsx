import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NoteNode } from "./NoteNode";
import { BoardNode } from "./StructureNodes";
import { useAppStore } from "@/core/store";
import { makePayload, addNodeToPayload } from "@/test/fixtures";
import { createBoard, createNode } from "@/core/domain/factories";
import { refForNode } from "@/core/domain/refs";
import { TooltipProvider } from "@/components/ui/tooltip";

function imageFile(name = "foto.png"): File {
  const bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const file = new File([bytes], name, { type: "image/png" });
  if (typeof file.arrayBuffer !== "function") {
    Object.defineProperty(file, "arrayBuffer", { value: async () => bytes.buffer });
  }
  return file;
}

function fileTransfer(files: File[]) {
  return { types: ["Files"], files, dropEffect: "copy" };
}

describe("arrastar imagens para elementos", () => {
  it("anexa a imagem à nota, cria referência e mostra a miniatura", async () => {
    const test = makePayload();
    const note = addNodeToPayload(test, {
      type: "note",
      x: 0,
      y: 0,
      title: "Nota alvo",
      content: "Conteúdo da nota",
    });
    useAppStore.getState().hydrate(test.payload);

    function NoteHarness() {
      const node = useAppStore((state) => state.boards[test.boardId].nodes[note.id]);
      return (
        <TooltipProvider>
          <NoteNode node={node} editing={false} selected />
        </TooltipProvider>
      );
    }

    render(<NoteHarness />);
    const surface = screen.getByText("Nota alvo").closest('[data-drop-target="note"]');
    expect(surface).toBeTruthy();

    const file = imageFile();
    fireEvent.dragOver(surface as HTMLElement, { dataTransfer: fileTransfer([file]) });
    fireEvent.drop(surface as HTMLElement, { dataTransfer: fileTransfer([file]) });

    await waitFor(() => {
      const board = useAppStore.getState().boards[test.boardId];
      const images = Object.values(board.nodes).filter((node) => node.type === "image");
      expect(images).toHaveLength(1);
      expect(board.nodes[note.id].references).toContain(refForNode(images[0].id));
      expect(useAppStore.getState().selection).toEqual([note.id]);
      expect(useAppStore.getState().history.past).toHaveLength(1);
    });
  });

  it("envia a imagem para o quadro aninhado, não para o quadro atual", async () => {
    const test = makePayload();
    const child = createBoard({
      workspaceId: test.workspaceId,
      parentId: test.boardId,
      title: "Filho",
    });
    test.payload.boards[child.id] = child;
    test.payload.boards[test.boardId].childOrder = [child.id];
    const boardNode = createNode(test.boardId, {
      type: "board",
      x: 0,
      y: 0,
      w: 300,
      h: 200,
      title: "Filho",
      childBoardId: child.id,
    });
    test.payload.boards[test.boardId].nodes[boardNode.id] = boardNode;
    useAppStore.getState().hydrate(test.payload);

    function BoardHarness() {
      const node = useAppStore((state) => state.boards[test.boardId].nodes[boardNode.id]);
      return <BoardNode node={node} editing={false} selected={false} />;
    }

    render(<BoardHarness />);
    const surface = document.querySelector('[data-drop-target="board"]');
    expect(surface).toBeTruthy();

    const file = imageFile("no-quadro.png");
    fireEvent.dragOver(surface as HTMLElement, { dataTransfer: fileTransfer([file]) });
    fireEvent.drop(surface as HTMLElement, { dataTransfer: fileTransfer([file]) });

    await waitFor(() => {
      const childBoard = useAppStore.getState().boards[child.id];
      const images = Object.values(childBoard.nodes).filter((node) => node.type === "image");
      expect(images).toHaveLength(1);
      expect(images[0].boardId).toBe(child.id);
    });

    const parentBoard = useAppStore.getState().boards[test.boardId];
    expect(Object.values(parentBoard.nodes)).toHaveLength(1);
    expect(useAppStore.getState().selection).toEqual([]);
    expect(useAppStore.getState().history.past).toHaveLength(1);
  });
});
