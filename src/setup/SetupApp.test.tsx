import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { SetupApi, SetupEnvironment, SetupProgress } from "@/setup/api";
import { SetupApp } from "@/setup/SetupApp";

const environment = (overrides: Partial<SetupEnvironment> = {}): SetupEnvironment => ({
  version: "0.2.0",
  mode: "install",
  installed: null,
  defaultTarget: "C:\\Users\\ana\\AppData\\Local\\EliasNote",
  dataPath: "C:\\Users\\ana\\AppData\\Roaming\\com.eliasnote.desktop",
  payloadBytes: 12 * 1024 * 1024,
  ...overrides,
});

function createApi(
  overrides: Partial<SetupApi> = {},
  env: Partial<SetupEnvironment> = {},
): SetupApi & { emit: (progress: SetupProgress) => void } {
  let handler: ((progress: SetupProgress) => void) | undefined;

  const api: SetupApi = {
    environment: vi.fn(async () => environment(env)),
    install: vi.fn(async () => {
      handler?.({ stage: "finish", percent: 100, detail: "Instalação concluída" });
    }),
    uninstall: vi.fn(async () => {
      handler?.({ stage: "finish", percent: 100, detail: "Remoção concluída" });
    }),
    launch: vi.fn(async () => undefined),
    reveal: vi.fn(async () => undefined),
    chooseDirectory: vi.fn(async () => "D:\\Apps\\EliasNote"),
    close: vi.fn(async () => undefined),
    onProgress: vi.fn(async (callback: (progress: SetupProgress) => void) => {
      handler = callback;
      return () => {
        handler = undefined;
      };
    }),
    ...overrides,
  };

  return Object.assign(api, {
    emit: (progress: SetupProgress) => handler?.(progress),
  });
}

describe("assistente de instalação", () => {
  it("instala em uma máquina limpa e conclui com a pasta escolhida", async () => {
    const api = createApi();
    const user = userEvent.setup();

    render(<SetupApp api={api} />);

    expect(await screen.findByRole("heading", { level: 1, name: "Instalar o EliasNote" })).toBeInTheDocument();
    expect(screen.getByText("Nenhuma instalação anterior encontrada neste usuário do Windows.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Continuar" }));

    const target = screen.getByLabelText("Pasta do programa");
    expect(target).toHaveValue("C:\\Users\\ana\\AppData\\Local\\EliasNote");

    await user.click(screen.getByRole("button", { name: "Instalar o EliasNote" }));

    await waitFor(() =>
      expect(api.install).toHaveBeenCalledWith({
        target: "C:\\Users\\ana\\AppData\\Local\\EliasNote",
        desktopShortcut: true,
        startMenuShortcut: true,
        launchAfter: true,
      }),
    );

    expect(await screen.findByRole("heading", { level: 1, name: "Tudo pronto" })).toBeInTheDocument();
    expect(screen.getByText(/EliasNote 0\.2\.0 instalado/)).toBeInTheDocument();
  });

  it("reconhece uma instalação anterior e oferece atualizar", async () => {
    const api = createApi({}, {
      installed: { version: "0.1.0", location: "C:\\Program Files\\EliasNote" },
      defaultTarget: "C:\\Program Files\\EliasNote",
    });

    render(<SetupApp api={api} />);

    expect(await screen.findByRole("heading", { level: 1, name: "Atualizar o EliasNote" })).toBeInTheDocument();
    expect(
      screen.getByText("Instalação atual: 0.1.0 em C:\\Program Files\\EliasNote"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Atualização").length).toBeGreaterThan(0);
  });

  it("permite trocar a pasta pelo seletor do Windows", async () => {
    const api = createApi();
    const user = userEvent.setup();

    render(<SetupApp api={api} />);
    await user.click(await screen.findByRole("button", { name: "Continuar" }));
    await user.click(screen.getByRole("button", { name: "Escolher pasta" }));

    await waitFor(() => expect(screen.getByLabelText("Pasta do programa")).toHaveValue("D:\\Apps\\EliasNote"));
    expect(api.chooseDirectory).toHaveBeenCalledWith("C:\\Users\\ana\\AppData\\Local\\EliasNote");
  });

  it("desinstala respeitando a opção de manter os dados", async () => {
    const api = createApi({}, {
      mode: "uninstall",
      installed: { version: "0.2.0", location: "C:\\Users\\ana\\AppData\\Local\\EliasNote" },
    });
    const user = userEvent.setup();

    render(<SetupApp api={api} />);

    expect(await screen.findByRole("heading", { level: 1, name: "Remover o EliasNote" })).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: /Remover também quadros, anexos e configurações/ }));
    await user.click(screen.getByRole("button", { name: "Remover o EliasNote" }));

    await waitFor(() =>
      expect(api.uninstall).toHaveBeenCalledWith({
        target: "C:\\Users\\ana\\AppData\\Local\\EliasNote",
        removeData: true,
      }),
    );

    expect(await screen.findByRole("heading", { level: 1, name: "EliasNote removido" })).toBeInTheDocument();
  });

  it("mostra a mensagem de erro do backend e permite voltar", async () => {
    const api = createApi({
      install: vi.fn(async () => {
        throw new Error("pasta sem permissão de escrita");
      }),
    });
    const user = userEvent.setup();

    render(<SetupApp api={api} />);
    await user.click(await screen.findByRole("button", { name: "Continuar" }));
    await user.click(screen.getByRole("button", { name: "Instalar o EliasNote" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Não foi possível concluir" })).toBeInTheDocument();
    expect(screen.getByText("pasta sem permissão de escrita")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Voltar" }));
    expect(await screen.findByRole("heading", { level: 1, name: "Onde instalar" })).toBeInTheDocument();
  });
});
