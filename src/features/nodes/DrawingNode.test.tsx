import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAppStore } from "@/core/store";
import { DEFAULT_SKETCH_STYLE } from "@/core/domain/sketch";
import { addNodeToPayload, makePayload } from "@/test/fixtures";
import { DrawingNode } from "./DrawingNode";

describe("cartão de desenho nativo", () => {
  it("renderiza a prévia vetorial e abre o editor nativo", async () => {
    const test = makePayload();
    const drawing = addNodeToPayload(test, { type: "drawing", x: 0, y: 0, title: "Esboço" });
    test.payload.boards[test.boardId].nodes[drawing.id].sketch = {
      version: 1,
      updatedAt: 1,
      elements: [
        {
          id: "rect-1",
          kind: "rect",
          style: { ...DEFAULT_SKETCH_STYLE, fill: "#c7e3f7" },
          rect: { x: 10, y: 10, w: 120, h: 80 },
        },
      ],
    };
    useAppStore.getState().hydrate(test.payload);

    function Harness() {
      const node = useAppStore((state) => state.boards[test.boardId].nodes[drawing.id]);
      return <DrawingNode node={node} editing={false} selected={false} />;
    }

    const { container } = render(<Harness />);
    expect(container.querySelector("svg")).not.toBeNull();
    expect(screen.getByText("Esboço")).toBeInTheDocument();
    expect(screen.getByText("Nativo")).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Editar" }));

    const state = useAppStore.getState();
    expect(state.dialog).toBe("sketch");
    expect(state.sketchNodeId).toBe(drawing.id);
    expect(state.boards[test.boardId].nodes[drawing.id].drawingEngine).toBe("native");
  });

  it("mantém cenas Excalidraw antigas no editor original", async () => {
    const test = makePayload();
    const drawing = addNodeToPayload(test, {
      type: "drawing",
      x: 0,
      y: 0,
      title: "Cena antiga",
      scene: { elements: [{ id: "r1" }], appState: {}, files: {}, updatedAt: 1 },
      drawingEngine: "excalidraw",
    });
    useAppStore.getState().hydrate(test.payload);

    function Harness() {
      const node = useAppStore((state) => state.boards[test.boardId].nodes[drawing.id]);
      return <DrawingNode node={node} editing={false} selected={false} />;
    }

    render(<Harness />);
    expect(screen.getByText("Excalidraw")).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Editar" }));
    expect(useAppStore.getState().dialog).toBe("drawing");
  });
});
