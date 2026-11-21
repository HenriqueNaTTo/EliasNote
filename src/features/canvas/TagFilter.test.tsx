import { useState } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAppStore } from "@/core/store";
import { addNodeToPayload, makePayload } from "@/test/fixtures";
import { TagFilter } from "./TagFilter";

function setup() {
  const test = makePayload("Filtro");
  addNodeToPayload(test, { type: "note", x: 0, y: 0, title: "Combate", tags: ["Combate"] });
  addNodeToPayload(test, { type: "note", x: 0, y: 100, title: "Arte", tags: ["arte"] });
  useAppStore.getState().hydrate(test.payload);

  function Harness() {
    const board = useAppStore((state) => state.boards[test.boardId]);
    const [value, setValue] = useState<string | null>(null);
    return <TagFilter board={board} value={value} onChange={setValue} />;
  }

  render(<Harness />);
  return test;
}

describe("filtro por etiqueta", () => {
  it("lista as etiquetas do quadro e ativa o filtro", async () => {
    const user = userEvent.setup();
    setup();

    await user.click(screen.getByRole("button", { name: "Filtrar por etiqueta" }));
    expect(screen.getByText("#Combate")).toBeInTheDocument();
    expect(screen.getByText("#arte")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /#Combate/ }));
    expect(screen.getByText("1 de 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Limpar filtro de etiqueta Combate/ })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Limpar filtro de etiqueta Combate/ }));
    expect(screen.queryByText("1 de 2")).not.toBeInTheDocument();
  });

  it("mostra estado vazio quando não há etiquetas", async () => {
    const test = makePayload("Vazio");
    useAppStore.getState().hydrate(test.payload);
    function EmptyHarness() {
      const board = useAppStore((state) => state.boards[test.boardId]);
      return <TagFilter board={board} value={null} onChange={() => undefined} />;
    }
    render(<EmptyHarness />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Filtrar por etiqueta" }));
    expect(screen.getByText("Nenhuma etiqueta neste quadro.")).toBeInTheDocument();
  });
});
