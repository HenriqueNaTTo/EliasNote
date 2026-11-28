import { afterEach, describe, expect, it } from "vitest";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import App from "@/App";
import { persistenceService } from "@/core/persistence/persistenceService";
import { resetAdapterForTests } from "@/core/persistence/adapter";
import { useAppStore } from "@/core/store";

afterEach(() => {
  useAppStore.getState().stopPresentation();
  persistenceService.stop();
  resetAdapterForTests();
});

describe("atalho de duplicar", () => {
  it("duplica a seleção com Mod+D", async () => {
    render(<App />);
    await waitFor(() => expect(useAppStore.getState().hydrated).toBe(true), { timeout: 6000 });

    const state = useAppStore.getState();
    const boardId = state.tabs.find((tab) => tab.id === state.activeTabId)?.boardId;
    const board = boardId ? state.boards[boardId] : undefined;
    expect(board).toBeTruthy();
    const node = Object.values(board?.nodes ?? {}).find((candidate) => candidate.type === "note");
    expect(node).toBeTruthy();
    if (!node || !board) return;
    const before = Object.keys(board.nodes).length;

    act(() => useAppStore.getState().select([node.id]));
    const beforeRendered = document.querySelectorAll("[data-node-id]").length;
    fireEvent.keyDown(window, { key: "d", ctrlKey: true });

    const after = useAppStore.getState().boards[board.id];
    expect(Object.keys(after.nodes).length).toBe(before + 1);
    expect(useAppStore.getState().selection).toHaveLength(1);
    await waitFor(() => {
      expect(document.querySelectorAll("[data-node-id]").length).toBe(beforeRendered + 1);
    });
  });
});
