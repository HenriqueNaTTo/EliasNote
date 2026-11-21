import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAppStore } from "@/core/store";
import { addNodeToPayload, makePayload } from "@/test/fixtures";
import { TagEditor } from "./TagEditor";

function setup(initialTags: string[] = []) {
  const test = makePayload("Etiquetas");
  const node = addNodeToPayload(test, {
    type: "note",
    x: 0,
    y: 0,
    title: "Nota",
    tags: initialTags,
  });
  addNodeToPayload(test, {
    type: "task",
    x: 0,
    y: 100,
    title: "Outra tarefa",
    tags: ["arte"],
  });
  useAppStore.getState().hydrate(test.payload);

  function Harness() {
    const current = useAppStore((state) => state.boards[test.boardId].nodes[node.id]);
    return <TagEditor node={current} />;
  }

  const view = render(<Harness />);
  return { test, node, view };
}

describe("editor de etiquetas", () => {
  it("adiciona etiquetas com Enter e remove pelo chip", async () => {
    const { test, node } = setup();
    const user = userEvent.setup();
    const input = screen.getByLabelText("Adicionar etiqueta");

    await user.type(input, "combate{Enter}");
    expect(useAppStore.getState().boards[test.boardId].nodes[node.id].tags).toEqual(["combate"]);

    await user.type(input, "#Boss,boss{Enter}");
    expect(useAppStore.getState().boards[test.boardId].nodes[node.id].tags).toEqual(["combate", "Boss"]);

    await user.click(screen.getByRole("button", { name: "Remover etiqueta combate" }));
    expect(useAppStore.getState().boards[test.boardId].nodes[node.id].tags).toEqual(["Boss"]);
  });

  it("remove a última etiqueta com Backspace no campo vazio", async () => {
    const { test, node } = setup(["combate", "boss"]);
    const user = userEvent.setup();
    const input = screen.getByLabelText("Adicionar etiqueta");

    await user.click(input);
    await user.keyboard("{Backspace}");
    expect(useAppStore.getState().boards[test.boardId].nodes[node.id].tags).toEqual(["combate"]);
  });

  it("reutiliza uma etiqueta sugerida pelo quadro", async () => {
    const { test, node } = setup();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /#arte/ }));
    expect(useAppStore.getState().boards[test.boardId].nodes[node.id].tags).toEqual(["arte"]);
  });
});
