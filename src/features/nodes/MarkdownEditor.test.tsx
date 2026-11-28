import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MarkdownEditor } from "./MarkdownEditor";

function renderEditor(value: string, onChange = vi.fn()) {
  const result = render(
    <TooltipProvider>
      <MarkdownEditor value={value} onChange={onChange} autoFocus ariaLabel="Conteúdo da nota" />
    </TooltipProvider>,
  );
  return { ...result, onChange };
}

describe("editor de notas com live preview", () => {
  it("renderiza markdown formatado e esconde a marcação fora da linha ativa", () => {
    const { container } = renderEditor("# Título\n\nTexto **forte** e `código`");
    const editor = screen.getByRole("textbox", { name: "Conteúdo da nota" });
    expect(editor).toHaveTextContent("Título");
    expect(editor).toHaveTextContent("forte");
    expect(editor).not.toHaveTextContent("# Título");
    expect(container.querySelector(".cm-md-heading")).not.toBeNull();
    expect(container.querySelector(".cm-md-strong")).not.toBeNull();
    expect(container.querySelector(".cm-md-code")).not.toBeNull();
  });

  it("mostra a marcação da linha onde o cursor está", () => {
    const { container } = renderEditor("# Título");
    const headingLine = container.querySelector(".cm-md-heading");
    expect(headingLine?.textContent).toContain("# Título");
  });

  it("aplica formatação pela barra inferior", async () => {
    const user = userEvent.setup();
    const { onChange } = renderEditor("Texto");
    await user.click(screen.getByRole("button", { name: "Negrito" }));
    expect(onChange).toHaveBeenCalled();
    expect(String(onChange.mock.calls.at(-1)?.[0])).toContain("**negrito**");
  });

  it("conclui uma tarefa pelo checkbox do preview", async () => {
    const user = userEvent.setup();
    const { onChange, container } = renderEditor("- [ ] tarefa\n\nfim");
    const checkbox = container.querySelector<HTMLInputElement>(".cm-md-checkbox");
    expect(checkbox).not.toBeNull();
    expect(screen.getByRole("button", { name: "Tarefa" })).toBeInTheDocument();
    await user.click(checkbox as HTMLInputElement);
    expect(String(onChange.mock.calls.at(-1)?.[0])).toContain("- [x] tarefa");
  });

  it("sincroniza alterações externas do conteúdo", () => {
    const onChange = vi.fn();
    const { rerender, container } = render(
      <TooltipProvider>
        <MarkdownEditor value="Primeiro" onChange={onChange} ariaLabel="Conteúdo da nota" />
      </TooltipProvider>,
    );
    expect(container.textContent).toContain("Primeiro");
    rerender(
      <TooltipProvider>
        <MarkdownEditor value="Segundo texto" onChange={onChange} ariaLabel="Conteúdo da nota" />
      </TooltipProvider>,
    );
    expect(container.textContent).toContain("Segundo texto");
  });
});
