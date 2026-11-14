import { afterEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import { persistenceService } from "@/core/persistence/persistenceService";
import { resetAdapterForTests } from "@/core/persistence/adapter";
import { useAppStore } from "@/core/store";

afterEach(() => {
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
});
