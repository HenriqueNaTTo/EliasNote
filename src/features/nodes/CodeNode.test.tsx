import { describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAppStore } from "@/core/store";
import { addNodeToPayload, makePayload } from "@/test/fixtures";
import { CodeNode } from "./CodeNode";

describe("nó de código", () => {
  it("realça, troca a linguagem, copia e edita o conteúdo", async () => {
    const test = makePayload();
    const node = addNodeToPayload(test, {
      type: "code",
      x: 0,
      y: 0,
      title: "player.gd",
      content: "func _ready(): pass",
      language: "gdscript",
    });
    useAppStore.getState().hydrate(test.payload);

    const writeText = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    function Harness() {
      const current = useAppStore((state) => state.boards[test.boardId].nodes[node.id]);
      const editing = useAppStore((state) => state.editingNodeId === node.id);
      return <CodeNode node={current} editing={editing} selected />;
    }

    render(<Harness />);

    await waitFor(() => expect(document.querySelector(".hljs-keyword")).not.toBeNull());

    await user.selectOptions(screen.getByLabelText("Linguagem do código"), "json");
    expect(useAppStore.getState().boards[test.boardId].nodes[node.id].language).toBe("json");

    await user.click(screen.getByLabelText("Copiar código"));
    expect(writeText).toHaveBeenCalledWith("func _ready(): pass");

    act(() => useAppStore.getState().setEditingNode(node.id));
    const editor = await screen.findByPlaceholderText("Cole ou escreva o código…");
    await user.type(editor, "var speed := 10");
    expect(useAppStore.getState().boards[test.boardId].nodes[node.id].content).toContain("var speed");
  });
});
