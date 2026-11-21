import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAppStore } from "@/core/store";
import { addNodeToPayload, makePayload } from "@/test/fixtures";
import { Canvas } from "./Canvas";

function setup() {
  const test = makePayload("Filtro no canvas");
  const combat = addNodeToPayload(test, {
    type: "note",
    x: 40,
    y: 40,
    title: "Sistema de combate",
    content: "Dano, vida e cadência",
    tags: ["combate"],
  });
  const art = addNodeToPayload(test, {
    type: "note",
    x: 360,
    y: 40,
    title: "Direção de arte",
    content: "Paleta e referências",
    tags: ["arte"],
  });
  useAppStore.getState().hydrate(test.payload);
  const view = render(
    <TooltipProvider>
      <Canvas />
    </TooltipProvider>,
  );
  return { test, combat, art, view };
}

describe("filtro por etiqueta no canvas", () => {
  it("mostra apenas elementos que correspondem à etiqueta", async () => {
    const user = userEvent.setup();
    const { combat, art, view } = setup();

    expect(view.container.querySelectorAll("[data-node-id]")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Filtrar por etiqueta" }));
    await user.click(screen.getByRole("button", { name: /#combate/ }));

    await waitFor(() => {
      expect(view.container.querySelector(`[data-node-id="${combat.id}"]`)).toBeInTheDocument();
      expect(view.container.querySelector(`[data-node-id="${art.id}"]`)).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Limpar filtro de etiqueta combate/ }));
    await waitFor(() => {
      expect(view.container.querySelectorAll("[data-node-id]")).toHaveLength(2);
    });
  });
});
