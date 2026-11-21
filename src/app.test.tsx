import { afterEach, describe, expect, it } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import { persistenceService } from "@/core/persistence/persistenceService";
import { resetAdapterForTests } from "@/core/persistence/adapter";
import { useAppStore } from "@/core/store";

afterEach(() => {
  useAppStore.getState().stopPresentation();
  persistenceService.stop();
  resetAdapterForTests();
});

describe("aplicativo completo", () => {
  it("inicializa, hidrata o quadro de boas-vindas e monta a interface", async () => {
    render(<App />);

    await waitFor(
      () => {
        expect(useAppStore.getState().hydrated).toBe(true);
      },
      { timeout: 6000 },
    );

    expect(useAppStore.getState().activeTabId).toBeTruthy();
    expect(useAppStore.getState().storageKind).toBe("memory");

    await waitFor(() => {
      expect(screen.getAllByText("Bem-vindo ao EliasNote").length).toBeGreaterThan(0);
    });

    expect(screen.getByDisplayValue("Primeiros passos")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Meu plano")).toBeInTheDocument();
    expect(screen.getByLabelText("Busca global")).toBeInTheDocument();
    expect(screen.getAllByText(/elementos/).length).toBeGreaterThan(0);
  });

  it("esconde o chrome no modo apresentação e o restaura ao sair", async () => {
    render(<App />);

    await waitFor(() => expect(useAppStore.getState().hydrated).toBe(true), { timeout: 6000 });
    act(() => useAppStore.getState().startPresentation());

    expect(screen.getByRole("region", { name: "Modo apresentação" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Busca global")).not.toBeInTheDocument();

    act(() => useAppStore.getState().stopPresentation());
    await waitFor(() => expect(screen.getByLabelText("Busca global")).toBeInTheDocument());
  });
});
