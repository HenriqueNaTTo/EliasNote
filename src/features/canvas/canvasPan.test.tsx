import { describe, expect, it } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAppStore } from "@/core/store";
import { addNodeToPayload, makePayload } from "@/test/fixtures";
import { Canvas } from "./Canvas";

function setup() {
  const test = makePayload();
  const node = addNodeToPayload(test, { type: "note", x: 100, y: 100, title: "Elemento" });
  useAppStore.getState().hydrate(test.payload);

  const view = render(
    <TooltipProvider>
      <Canvas />
    </TooltipProvider>,
  );

  const element = view.container.querySelector<HTMLElement>("[data-node-id]");
  if (!element) throw new Error("elemento do canvas não renderizado");
  return { test, node, element };
}

function nodePosition(boardId: string, nodeId: string) {
  const node = useAppStore.getState().boards[boardId].nodes[nodeId];
  return { x: node.x, y: node.y };
}

describe("pan do canvas sobre elementos", () => {
  it("move o quadro com espaço + arraste mesmo sobre um elemento", async () => {
    const user = userEvent.setup();
    const { test, node, element } = setup();

    fireEvent.keyDown(window, { code: "Space" });
    await user.pointer([
      { keys: "[MouseLeft>]", target: element, coords: { clientX: 50, clientY: 50 } },
      { target: document.body, coords: { clientX: 80, clientY: 90 } },
      { keys: "[/MouseLeft]", target: document.body, coords: { clientX: 80, clientY: 90 } },
    ]);
    fireEvent.keyUp(window, { code: "Space" });

    expect(useAppStore.getState().viewports[test.boardId]).toEqual({ x: 30, y: 40, zoom: 1 });
    expect(nodePosition(test.boardId, node.id)).toEqual({ x: 100, y: 100 });
  });

  it("move o quadro com o botão do meio sobre um elemento", async () => {
    const user = userEvent.setup();
    const { test, node, element } = setup();

    await user.pointer([
      { keys: "[MouseMiddle>]", target: element, coords: { clientX: 20, clientY: 20 } },
      { target: document.body, coords: { clientX: 0, clientY: 0 } },
      { keys: "[/MouseMiddle]", target: document.body, coords: { clientX: 0, clientY: 0 } },
    ]);

    expect(useAppStore.getState().viewports[test.boardId]).toEqual({ x: -20, y: -20, zoom: 1 });
    expect(nodePosition(test.boardId, node.id)).toEqual({ x: 100, y: 100 });
  });
});
