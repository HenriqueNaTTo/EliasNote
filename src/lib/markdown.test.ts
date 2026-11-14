import { describe, expect, it } from "vitest";
import { applyMarkdownAction, extractMarkdownTasks, markdownToPlainText, markdownStats, renderMarkdown } from "./markdown";

describe("markdown", () => {
  it("renderiza formatação básica", () => {
    const html = renderMarkdown("# Título\n\nTexto **forte** e `código`.");
    expect(html).toContain("<h1>Título</h1>");
    expect(html).toContain("<strong>forte</strong>");
    expect(html).toContain("<code>código</code>");
  });

  it("remove scripts e atributos perigosos", () => {
    const html = renderMarkdown('<script>alert(1)</script><img src="x" onerror="alert(1)">');
    expect(html).not.toContain("<script");
    expect(html).not.toContain("onerror");
    expect(html).toContain("<img");
  });

  it("extrai texto simples e estatísticas", () => {
    const markdown = "## Reunião\n\n- item um\n- **item dois**";
    expect(markdownToPlainText(markdown)).toContain("item dois");
    expect(markdownStats(markdown).words).toBeGreaterThan(3);
  });

  it("aplica negrito na seleção e reposiciona o cursor", () => {
    const result = applyMarkdownAction(
      { value: "texto importante", selectionStart: 0, selectionEnd: 5 },
      "bold",
    );
    expect(result.value).toBe("**texto** importante");
    expect(result.selectionStart).toBe(2);
    expect(result.selectionEnd).toBe(7);
  });

  it("prefixa listas e tarefas", () => {
    const list = applyMarkdownAction({ value: "primeiro", selectionStart: 0, selectionEnd: 0 }, "bullet");
    expect(list.value).toBe("- primeiro");
    const task = applyMarkdownAction({ value: "", selectionStart: 0, selectionEnd: 0 }, "task");
    expect(task.value).toBe("- [ ] Tarefa");
  });

  it("permite links internos do EliasNote sem perder a sanitização", () => {
    const html = renderMarkdown("[Nota](eliasnote://node/node_123) [Site](https://example.com)");
    expect(html).toContain('href="eliasnote://node/node_123"');
    expect(html).toContain('href="https://example.com"');
    expect(renderMarkdown("[x](javascript:alert(1))")).not.toContain("javascript:");
  });

  it("extrai tarefas do markdown", () => {
    expect(extractMarkdownTasks("intro\n- [x] feita\n- [ ] pendente")).toEqual([
      { text: "feita", done: true },
      { text: "pendente", done: false },
    ]);
  });
});
