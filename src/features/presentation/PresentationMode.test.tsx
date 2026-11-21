import { afterEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAppStore } from "@/core/store";
import { createBoard } from "@/core/domain/factories";
import { makePayload } from "@/test/fixtures";
import { PresentationMode } from "./PresentationMode";

afterEach(() => {
  useAppStore.getState().stopPresentation();
});

function setup() {
  const test = makePayload("Apresentação");
  const second = createBoard({ workspaceId: test.workspaceId, title: "Segundo quadro" });
  test.payload.boards[second.id] = second;
  useAppStore.getState().hydrate(test.payload);
  useAppStore.getState().startPresentation();
  const view = render(<PresentationMode />);
  return { test, second, view };
}

describe("modo apresentação", () => {
  it("mostra título, contador e navega entre quadros", async () => {
    const user = userEvent.setup();
    const { second } = setup();

    expect(screen.getByRole("region", { name: "Modo apresentação" })).toBeInTheDocument();
    expect(screen.getByText("Projeto")).toBeInTheDocument();
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Quadro anterior" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Próximo quadro" }));
    expect(screen.getByText("Segundo quadro")).toBeInTheDocument();
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
    expect(useAppStore.getState().tabs.find((tab) => tab.id === useAppStore.getState().activeTabId)?.boardId).toBe(second.id);
    expect(screen.getByRole("button", { name: "Próximo quadro" })).toBeDisabled();
  });

  it("sai pelo botão e restaura a aba original", async () => {
    const user = userEvent.setup();
    const { test } = setup();
    const originalTabId = test.payload.activeTabId;

    await user.click(screen.getByRole("button", { name: "Sair do modo apresentação" }));
    expect(useAppStore.getState().presentation).toBeNull();
    expect(useAppStore.getState().activeTabId).toBe(originalTabId);
  });

  it("navega com as setas do teclado", () => {
    setup();

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
    expect(screen.getByText("Segundo quadro")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    expect(screen.getByText("Projeto")).toBeInTheDocument();
  });

  it("sai com Escape", () => {
    setup();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(useAppStore.getState().presentation).toBeNull();
  });
});
