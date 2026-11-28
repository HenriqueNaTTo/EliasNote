import { describe, expect, it } from "vitest";
import { activeLineNumbers, buildLineStarts, lineOf, planLivePreview } from "./livePreview";

const SOURCE = [
  "# Título",
  "",
  "Texto **forte** e _ênfase_ e ~~riscado~~ e `código` e [site](https://x.com).",
  "",
  "- item",
  "- [x] tarefa",
  "",
  "> citação",
  "",
  "---",
].join("\n");

function hiddenText(source: string, plan: ReturnType<typeof planLivePreview>): string[] {
  return plan.hidden.map((range) => source.slice(range.from, range.to));
}

describe("plano do live preview", () => {
  it("esconde a marcação das linhas inativas e mantém a linha ativa crua", () => {
    const hidden = planLivePreview(SOURCE, [3]);
    const markers = hiddenText(SOURCE, hidden);
    expect(markers).toContain("# ");
    expect(markers).toContain("> ");
    expect(hidden.widgets.map((widget) => widget.kind)).toEqual(["bullet", "task", "hr"]);
    expect(hidden.hidden.some((range) => range.from >= SOURCE.indexOf("Texto"))).toBe(true);

    const active = planLivePreview(SOURCE, [1, 3, 5, 6, 8, 10]);
    expect(hiddenText(SOURCE, active)).not.toContain("# ");
    expect(hiddenText(SOURCE, active)).not.toContain("> ");
    expect(active.widgets.map((widget) => widget.kind)).toEqual([]);
  });

  it("reconhece títulos, listas, tarefas, citações, código e régua", () => {
    const withCode = `${SOURCE}\n\n\`\`\`js\nconst a = 1;\n\`\`\``;
    const plan = planLivePreview(withCode, []);
    const heading = plan.lines.find((line) => line.number === 1);
    expect(heading?.kind).toBe("heading");
    expect(heading?.headingLevel).toBe(1);
    expect(plan.lines.find((line) => line.number === 5)?.kind).toBe("bullet");
    expect(plan.lines.find((line) => line.number === 6)?.kind).toBe("task");
    expect(plan.lines.find((line) => line.number === 8)?.kind).toBe("quote");
    expect(plan.lines.find((line) => line.number === 10)?.kind).toBe("hr");

    const task = plan.widgets.find((widget) => widget.kind === "task");
    expect(task?.checked).toBe(true);
    expect(task?.from).toBe(withCode.indexOf("- [x]"));
    const bullet = plan.widgets.find((widget) => widget.kind === "bullet");
    expect(bullet?.from).toBe(withCode.indexOf("- item"));

    const fenceLine = plan.lines.find((line) => line.number === 12);
    expect(fenceLine?.kind).toBe("code");
    const codeLine = plan.lines.find((line) => line.number === 13);
    expect(codeLine?.kind).toBe("code");
    expect(hiddenText(withCode, plan).filter((text) => text === "```").length).toBe(2);
    expect(hiddenText(withCode, plan)).toContain("js");
  });

  it("esconde ênfase, riscado, código inline e destino de links", () => {
    const plan = planLivePreview(SOURCE, [1]);
    const markers = hiddenText(SOURCE, plan);
    expect(markers).toContain("**");
    expect(markers).toContain("_");
    expect(markers).toContain("~~");
    expect(markers).toContain("`");
    expect(markers).toContain("]");
    expect(markers).toContain("(");
    expect(markers).toContain("https://x.com");

    const marks = plan.marks.map((mark) => `${mark.kind}:${SOURCE.slice(mark.from, mark.to)}`);
    expect(marks).toContain("strong:forte");
    expect(marks).toContain("emphasis:ênfase");
    expect(marks).toContain("strike:riscado");
    expect(marks).toContain("code:código");
    expect(marks).toContain("link:site");
  });

  it("mostra a marcação quando a linha está ativa", () => {
    const plan = planLivePreview(SOURCE, [1, 3]);
    const markers = hiddenText(SOURCE, plan);
    expect(markers).not.toContain("**");
    expect(markers).not.toContain("https://x.com");
    expect(plan.marks.some((mark) => mark.kind === "strong")).toBe(true);
  });

  it("suporta <u>, <sup> e <sub>", () => {
    const source = "Texto <u>sublinhado</u> e <sup>2</sup> e <sub>2</sub>.";
    const hidden = planLivePreview(source, []);
    expect(hiddenText(source, hidden)).toEqual(
      expect.arrayContaining(["<u>", "</u>", "<sup>", "</sup>", "<sub>", "</sub>"]),
    );
    const kinds = hidden.marks.map((mark) => `${mark.kind}:${source.slice(mark.from, mark.to)}`);
    expect(kinds).toContain("underline:sublinhado");
    expect(kinds).toContain("sup:2");
    expect(kinds).toContain("sub:2");

    const activePlan = planLivePreview(source, [1]);
    expect(hiddenText(source, activePlan)).toEqual([]);
  });

  it("mantém o número de listas ordenadas visível", () => {
    const source = "1. primeiro\n2. segundo";
    const plan = planLivePreview(source, []);
    expect(plan.widgets).toEqual([]);
    expect(hiddenText(source, plan)).toEqual([]);
    expect(plan.lines.map((line) => line.kind)).toEqual(["ordered", "ordered"]);
  });

  it("limita o cálculo ao intervalo de linhas pedido", () => {
    const plan = planLivePreview(SOURCE, [], { fromLine: 5, toLine: 6 });
    expect(plan.lines.map((line) => line.number)).toEqual([5, 6]);
    expect(plan.marks).toEqual([]);
  });

  it("calcula linhas e linhas ativas da seleção", () => {
    const starts = buildLineStarts(SOURCE);
    expect(lineOf(starts, 0)).toBe(1);
    expect(lineOf(starts, SOURCE.indexOf("Texto"))).toBe(3);
    const lines = activeLineNumbers(starts, [
      { from: SOURCE.indexOf("Texto"), to: SOURCE.indexOf("- [x]") },
    ]);
    expect(Array.from(lines)).toEqual([3, 4, 5, 6]);
  });
});
