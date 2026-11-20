import { describe, expect, it } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MarkdownView } from "./MarkdownView";

describe("realce de código no markdown", () => {
  it("realça blocos cercados com linguagem conhecida", async () => {
    render(<MarkdownView source={"# Nota\n\n```gdscript\nfunc _ready():\n\tpass\n```"} />);

    await waitFor(() => {
      const block = document.querySelector("pre code.hljs");
      expect(block).not.toBeNull();
    });
    expect(document.querySelector(".hljs-keyword")).not.toBeNull();
  });

  it("mantém texto puro quando a linguagem é desconhecida", async () => {
    render(<MarkdownView source={"```linguagem-estranha\nconteudo\n```"} />);
    const block = document.querySelector("pre code");
    expect(block).not.toBeNull();
    expect(block?.className).not.toContain("hljs");
    expect(block?.textContent).toContain("conteudo");
  });
});
