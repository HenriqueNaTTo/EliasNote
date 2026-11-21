import { afterEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAppStore } from "@/core/store";
import { addDaysKey, localDateKey } from "@/core/domain/tasks";
import { addNodeToPayload, makePayload } from "@/test/fixtures";
import { TasksDialog } from "./TasksDialog";

function setup() {
  const test = makePayload("Projeto");
  const today = localDateKey();
  const overdue = addNodeToPayload(test, {
    type: "task",
    x: 0,
    y: 0,
    title: "Corrigir dano",
    due: addDaysKey(today, -1),
    priority: "high",
  });
  const current = addNodeToPayload(test, {
    type: "task",
    x: 0,
    y: 0,
    title: "Revisar GDD",
    due: today,
    priority: "medium",
  });
  const done = addNodeToPayload(test, {
    type: "task",
    x: 0,
    y: 0,
    title: "Publicar build",
    done: true,
  });

  useAppStore.getState().hydrate(test.payload);
  useAppStore.getState().openDialog("tasks");
  const view = render(<TasksDialog />);
  return { test, today, overdue, current, done, view };
}

afterEach(() => {
  useAppStore.getState().closeDialog();
});

describe("painel de tarefas", () => {
  it("lista tarefas de todos os quadros, agrupa por prazo e permite filtrar", async () => {
    const { test } = setup();

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Corrigir dano")).toBeInTheDocument();
    expect(screen.getByText("Revisar GDD")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Atrasadas/ }));
    expect(screen.getByText("Corrigir dano")).toBeInTheDocument();
    expect(screen.queryByText("Revisar GDD")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Concluídas/ }));
    expect(screen.getByText("Publicar build")).toBeInTheDocument();
    expect(screen.queryByText("Corrigir dano")).not.toBeInTheDocument();

    expect(screen.getAllByText(/Projeto \/ Projeto/).length).toBeGreaterThan(0);
    expect(test.boardId).toBeTruthy();
  });

  it("filtra pela busca textual", async () => {
    setup();
    const user = userEvent.setup();
    const input = await screen.findByRole("textbox", { name: "Filtrar tarefas" });
    await user.type(input, "Revisar");
    expect(screen.getByText("Revisar GDD")).toBeInTheDocument();
    expect(screen.queryByText("Corrigir dano")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Limpar filtro" }));
    expect(screen.getByText("Corrigir dano")).toBeInTheDocument();
  });

  it("conclui a tarefa pela lista sem abrir o quadro", async () => {
    const { test, overdue } = setup();
    const checkbox = await screen.findByRole("button", { name: "Concluir Corrigir dano" });
    await userEvent.click(checkbox);

    expect(useAppStore.getState().boards[test.boardId].nodes[overdue.id].done).toBe(true);
    await waitFor(() => expect(screen.queryByText("Corrigir dano")).not.toBeInTheDocument());
    expect(useAppStore.getState().activeTabId).toBe(test.payload.activeTabId);
  });

  it("abre o quadro e seleciona a tarefa ao clicar na linha", async () => {
    const { test, current } = setup();
    fireEvent.click(await screen.findByText("Revisar GDD"));

    await waitFor(() => {
      expect(useAppStore.getState().selection).toEqual([current.id]);
    });
    expect(useAppStore.getState().activeWorkspaceId).toBe(test.workspaceId);
    expect(useAppStore.getState().dialog).toBeNull();
  });

  it("mostra estado vazio quando não há tarefas", async () => {
    const test = makePayload("Vazio");
    useAppStore.getState().hydrate(test.payload);
    useAppStore.getState().openDialog("tasks");
    render(<TasksDialog />);

    expect(await screen.findByText("Nenhuma tarefa em aberto.")).toBeInTheDocument();
  });
});
