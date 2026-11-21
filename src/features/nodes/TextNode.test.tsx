import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAppStore } from "@/core/store";
import { makePayload, addNodeToPayload } from "@/test/fixtures";
import { TextNode } from "./TextNode";
import { TextFormatBar } from "./TextFormatBar";

describe("texto avulso com formatação", () => {
  it("renderiza negrito, itálico, tamanho, fonte e alinhamento do nó", () => {
    const test = makePayload();
    const text = addNodeToPayload(test, { type: "text", x: 0, y: 0, content: "Boss final" });
    const stored = test.payload.boards[test.boardId].nodes[text.id];
    stored.bold = true;
    stored.italic = true;
    stored.fontSize = 24;
    stored.fontFamily = "mono";
    stored.align = "center";
    useAppStore.getState().hydrate(test.payload);

    render(
      <TextNode node={useAppStore.getState().boards[test.boardId].nodes[text.id]} editing={false} selected={false} />,
    );

    expect(screen.getByText("Boss final")).toHaveStyle({
      fontWeight: "700",
      fontStyle: "italic",
      fontSize: "24px",
      textAlign: "center",
    });
  });

  it("alterna estilos, tamanho, fonte e alinhamento pela barra", async () => {
    const test = makePayload();
    const text = addNodeToPayload(test, { type: "text", x: 0, y: 0, content: "Boss final" });
    useAppStore.getState().hydrate(test.payload);
    const user = userEvent.setup();
    const current = () => useAppStore.getState().boards[test.boardId].nodes[text.id];

    function Harness() {
      const node = useAppStore((state) => state.boards[test.boardId].nodes[text.id]);
      return <TextFormatBar node={node} variant="panel" />;
    }

    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Negrito" }));
    expect(current().bold).toBe(true);
    expect(screen.getByRole("button", { name: "Negrito" })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "Itálico" }));
    await user.click(screen.getByRole("button", { name: "Sublinhado" }));
    await user.click(screen.getByRole("button", { name: "Riscado" }));
    expect(current().italic).toBe(true);
    expect(current().underline).toBe(true);
    expect(current().strike).toBe(true);

    await user.selectOptions(screen.getByLabelText("Tamanho da fonte"), "24");
    expect(current().fontSize).toBe(24);

    await user.selectOptions(screen.getByLabelText("Fonte do texto"), "serif");
    expect(current().fontFamily).toBe("serif");

    await user.click(screen.getByRole("button", { name: "Centralizar" }));
    expect(current().align).toBe("center");

    await user.click(screen.getByRole("button", { name: "Aumentar fonte" }));
    expect(current().fontSize).toBe(26);

    await user.click(screen.getByRole("button", { name: "Limpar formatação" }));
    expect(current().bold).toBeFalsy();
    expect(current().fontSize).toBeUndefined();
    expect(current().fontFamily).toBeUndefined();
    expect(screen.queryByRole("button", { name: "Limpar formatação" })).toBeNull();
  });

  it("aplica atalhos de formatação enquanto o texto é editado", async () => {
    const test = makePayload();
    const text = addNodeToPayload(test, { type: "text", x: 0, y: 0, content: "" });
    useAppStore.getState().hydrate(test.payload);
    const user = userEvent.setup();
    const current = () => useAppStore.getState().boards[test.boardId].nodes[text.id];

    function Harness() {
      const node = useAppStore((state) => state.boards[test.boardId].nodes[text.id]);
      const editing = useAppStore((state) => state.editingNodeId === text.id);
      return <TextNode node={node} editing={editing} selected />;
    }

    useAppStore.getState().setEditingNode(text.id);
    render(<Harness />);

    const textarea = screen.getByPlaceholderText("Escreva algo…");
    await user.type(textarea, "Fase 1");
    expect(current().content).toBe("Fase 1");

    await user.keyboard("{Control>}b{/Control}");
    expect(current().bold).toBe(true);
    expect(current().content).toBe("Fase 1");

    await user.keyboard("{Control>}i{/Control}");
    await user.keyboard("{Control>}u{/Control}");
    await user.keyboard("{Control>}{Shift>}x{/Shift}{/Control}");
    expect(current().italic).toBe(true);
    expect(current().underline).toBe(true);
    expect(current().strike).toBe(true);

    await user.keyboard("{Control>}={/Control}");
    expect(current().fontSize).toBe(16);
    await user.keyboard("{Control>}-{/Control}");
    expect(current().fontSize).toBe(14);
  });
});
