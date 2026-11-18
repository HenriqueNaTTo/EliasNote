import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAppStore } from "@/core/store";
import { DEFAULT_SETTINGS } from "@/core/domain/constants";
import { Inspector } from "./Inspector";

const width = () => useAppStore.getState().settings.inspectorWidth;

describe("inspector", () => {
  it("redimensiona ao arrastar a borda esquerda", async () => {
    useAppStore.getState().updateSettings({ inspectorOpen: true, inspectorWidth: DEFAULT_SETTINGS.inspectorWidth });
    render(<Inspector />);
    const handle = screen.getByLabelText("Redimensionar inspector");
    const user = userEvent.setup();

    await user.pointer([
      { keys: "[MouseLeft>]", target: handle, coords: { clientX: 1000, clientY: 200 } },
      { target: document.body, coords: { clientX: 950, clientY: 200 } },
      { keys: "[/MouseLeft]", target: document.body, coords: { clientX: 950, clientY: 200 } },
    ]);

    // arrastar para a esquerda alarga o painel
    expect(width()).toBe(DEFAULT_SETTINGS.inspectorWidth + 50);
  });

  it("respeita os limites e volta ao padrão com duplo clique", async () => {
    useAppStore.getState().updateSettings({ inspectorOpen: true, inspectorWidth: DEFAULT_SETTINGS.inspectorWidth });
    render(<Inspector />);
    const handle = screen.getByLabelText("Redimensionar inspector");
    const user = userEvent.setup();

    await user.pointer([
      { keys: "[MouseLeft>]", target: handle, coords: { clientX: 1000, clientY: 200 } },
      { target: document.body, coords: { clientX: 200, clientY: 200 } },
      { keys: "[/MouseLeft]", target: document.body, coords: { clientX: 200, clientY: 200 } },
    ]);
    expect(width()).toBe(560);

    await user.pointer([
      { keys: "[MouseLeft>]", target: handle, coords: { clientX: 1000, clientY: 200 } },
      { target: document.body, coords: { clientX: 2000, clientY: 200 } },
      { keys: "[/MouseLeft]", target: document.body, coords: { clientX: 2000, clientY: 200 } },
    ]);
    expect(width()).toBe(260);

    await user.dblClick(handle);
    expect(width()).toBe(DEFAULT_SETTINGS.inspectorWidth);
  });
});
