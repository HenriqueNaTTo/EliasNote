import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LandingApp } from "./LandingApp";
import { LocaleProvider } from "./i18n/LocaleContext";
import { LOCALE_STORAGE_KEY } from "./i18n/locale";
import { SITE_CONTENT } from "./i18n";
import { FEATURE_META } from "./data";

function metaContent(attribute: "name" | "property", key: string): string | null {
  return document.head.querySelector(`meta[${attribute}="${key}"]`)?.getAttribute("content") ?? null;
}

/** jsdom deste projeto não expõe localStorage; o site usa a API de verdade. */
function installLocalStorage() {
  const store = new Map<string, string>();
  const mock = {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
  } as Storage;
  Object.defineProperty(window, "localStorage", { configurable: true, value: mock });
}

installLocalStorage();

function renderSite() {
  return render(
    <LocaleProvider>
      <LandingApp />
    </LocaleProvider>,
  );
}

function openTab(name: string) {
  fireEvent.click(screen.getAllByRole("link", { name })[0]);
}

beforeEach(() => {
  window.history.replaceState(null, "", "/");
  localStorage.clear();
  // jsdom anuncia en-US; fixa o português para os testes de conteúdo.
  localStorage.setItem(LOCALE_STORAGE_KEY, "pt");
});

describe("landing page do EliasNote", () => {
  it("abre na aba principal e navega por todas as abas", () => {
    renderSite();

    expect(screen.getByRole("heading", { level: 1, name: /canvas infinito/i })).toBeInTheDocument();

    openTab("Funcionalidades");
    expect(screen.getByRole("heading", { level: 1, name: /tudo que o eliasnote faz/i })).toBeInTheDocument();
    expect(screen.getByText(`${FEATURE_META.length} recursos nesta categoria`)).toBeInTheDocument();

    openTab("Downloads");
    expect(screen.getByRole("heading", { level: 1, name: /baixe uma vez/i })).toBeInTheDocument();
    expect(screen.getAllByText(/instaladores/i).length).toBeGreaterThan(0);

    openTab("Sobre");
    expect(screen.getByRole("heading", { level: 1, name: /uma ferramenta de pensamento/i })).toBeInTheDocument();

    openTab("Contato");
    expect(screen.getByRole("heading", { level: 1, name: /fale direto com o projeto/i })).toBeInTheDocument();
  });

  it("mostra a prévia da funcionalidade ao focar e ao passar o mouse", async () => {
    renderSite();
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

  it("publica a documentação como páginas do site", () => {
    renderSite();

    openTab("Documentação");
    expect(screen.getByRole("heading", { level: 1, name: /documentação inteira/i })).toBeInTheDocument();
    expect(screen.getByText("6 de 6 páginas")).toBeInTheDocument();

    const card = screen.getByText("docs/ARCHITECTURE.md").closest("button");
    expect(card).not.toBeNull();
    fireEvent.click(card!);

    expect(screen.getByRole("heading", { level: 1, name: "Arquitetura" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Modelo de domínio" })).toBeInTheDocument();
    expect(window.location.hash).toBe("#documentacao/arquitetura");
    expect(document.title).toBe("Arquitetura · Documentação · EliasNote");
    expect(metaContent("name", "description")).toBe(SITE_CONTENT.pt.docs.pages.arquitetura.summary);
  });

  it("abre uma página da documentação direto pela URL", () => {
    window.history.replaceState(null, "", "#documentacao/atalhos");
    renderSite();

    expect(screen.getByRole("heading", { level: 1, name: "Atalhos" })).toBeInTheDocument();
    expect(screen.getByText("Busca global")).toBeInTheDocument();
  });

  it("valida os campos e gera uma issue pré-preenchida no GitHub", () => {
    renderSite();
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

  it("troca o idioma do site e mantém a escolha", () => {
    renderSite();

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "en" } });

    expect(screen.getByRole("heading", { level: 1, name: /infinite canvas/i })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("en");
    expect(localStorage.getItem("eliasnote-landing-locale")).toBe("en");
    expect(metaContent("name", "description")).toBe(SITE_CONTENT.en.meta.description);
    expect(metaContent("property", "og:locale")).toBe("en_US");

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "zh" } });
    expect(document.documentElement.lang).toBe("zh-CN");
    expect(metaContent("name", "description")).toBe(SITE_CONTENT.zh.meta.description);
  });
});
