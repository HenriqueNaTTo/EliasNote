import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LandingApp } from "./LandingApp";
import { FEATURES } from "./data";

function openTab(name: string) {
  fireEvent.click(screen.getAllByRole("link", { name })[0]);
}

beforeEach(() => {
  window.history.replaceState(null, "", "/");
});

describe("landing page do EliasNote", () => {
  it("abre na aba principal e navega por todas as abas", () => {
    render(<LandingApp />);

    expect(screen.getByRole("heading", { level: 1, name: /canvas infinito/i })).toBeInTheDocument();

    openTab("Funcionalidades");
    expect(screen.getByRole("heading", { level: 1, name: /tudo que o eliasnote faz/i })).toBeInTheDocument();
    expect(screen.getByText(`${FEATURES.length} recursos nesta categoria`)).toBeInTheDocument();

    openTab("Downloads");
    expect(screen.getByRole("heading", { level: 1, name: /baixe uma vez/i })).toBeInTheDocument();
    expect(screen.getAllByText(/instaladores/i).length).toBeGreaterThan(0);

    openTab("Sobre");
    expect(screen.getByRole("heading", { level: 1, name: /uma ferramenta de pensamento/i })).toBeInTheDocument();

    openTab("Contato");
    expect(screen.getByRole("heading", { level: 1, name: /fale direto com o projeto/i })).toBeInTheDocument();
  });

  it("mostra a prévia da funcionalidade ao focar e ao passar o mouse", async () => {
    render(<LandingApp />);
    openTab("Funcionalidades");

    const heading = screen.getByRole("heading", { name: "Canvas infinito" });
    const card = heading.closest("article");
    expect(card).not.toBeNull();

    fireEvent.focus(card!);
    expect(await screen.findByText("Prévia da interface")).toBeInTheDocument();

    fireEvent.blur(card!);
    await waitFor(() => expect(screen.queryByText("Prévia da interface")).not.toBeInTheDocument());

    fireEvent.mouseEnter(card!);
    expect(await screen.findByText("Prévia da interface")).toBeInTheDocument();

    fireEvent.mouseLeave(card!);
    await waitFor(() => expect(screen.queryByText("Prévia da interface")).not.toBeInTheDocument());
  });

  it("valida os campos e gera uma issue pré-preenchida no GitHub", () => {
    render(<LandingApp />);
    openTab("Contato");

    fireEvent.click(screen.getByRole("button", { name: /abrir issue no github/i }));
    expect(screen.getAllByRole("alert")).toHaveLength(4);

    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Ana Souza" } });
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "ana@exemplo.com" } });
    fireEvent.change(screen.getByLabelText("Assunto"), { target: { value: "Testar a landing" } });
    fireEvent.change(screen.getByLabelText("Mensagem"), {
      target: { value: "Gostaria de testar o formulário da landing page do EliasNote." },
    });

    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    fireEvent.click(screen.getByRole("button", { name: /abrir issue no github/i }));

    expect(openSpy).toHaveBeenCalledTimes(1);
    const url = String(openSpy.mock.calls[0][0]);
    expect(url).toContain("https://github.com/HenriqueNaTTo/EliasNote/issues/new?");
    expect(decodeURIComponent(url)).toContain("[Sugestão de recurso] Testar a landing");
    expect(screen.getByRole("status")).toHaveTextContent(/rascunho de issue gerado/i);
  });
});
