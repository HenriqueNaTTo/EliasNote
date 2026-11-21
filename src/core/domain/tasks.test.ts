import { describe, expect, it } from "vitest";
import { createBoard, createNode, createWorkspace } from "./factories";
import type { Board, CanvasNode, ID, Workspace } from "./types";
import {
  addDaysKey,
  collectTasks,
  localDateKey,
  taskBucket,
  taskTitle,
} from "./tasks";

const TODAY = "2026-11-16";

function addNode(board: Board, seed: Parameters<typeof createNode>[1]): CanvasNode {
  const node = createNode(board.id, seed);
  board.nodes[node.id] = node;
  return node;
}

function setup() {
  const workspace = createWorkspace("Projeto");
  const otherWorkspace = createWorkspace("Estudos");
  const root = createBoard({ workspaceId: workspace.id, title: "Jogo" });
  const child = createBoard({ workspaceId: workspace.id, parentId: root.id, title: "Sistemas" });
  const other = createBoard({ workspaceId: otherWorkspace.id, title: "Pesquisa" });
  const boards: Record<ID, Board> = { [root.id]: root, [child.id]: child, [other.id]: other };
  const workspaces: Record<ID, Workspace> = {
    [workspace.id]: workspace,
    [otherWorkspace.id]: otherWorkspace,
  };
  return { workspace, otherWorkspace, root, child, other, boards, workspaces };
}

describe("tarefas: datas e buckets", () => {
  it("usa a data local e soma dias sem depender do fuso", () => {
    expect(localDateKey(new Date(2026, 10, 16, 12))).toBe("2026-11-16");
    expect(addDaysKey("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDaysKey("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("classifica atrasada, hoje, próximos 7 dias, depois e sem prazo", () => {
    expect(taskBucket("2026-11-15", TODAY)).toBe("overdue");
    expect(taskBucket(TODAY, TODAY)).toBe("today");
    expect(taskBucket("2026-11-17", TODAY)).toBe("week");
    expect(taskBucket("2026-11-23", TODAY)).toBe("week");
    expect(taskBucket("2026-11-24", TODAY)).toBe("later");
    expect(taskBucket(undefined, TODAY)).toBe("none");
    expect(taskBucket("data-invalida", TODAY)).toBe("none");
  });

  it("não reaproveita o conteúdo quando o título está vazio", () => {
    const board = createBoard({ workspaceId: "ws", title: "Quadro" });
    const empty = addNode(board, { type: "task", x: 0, y: 0, title: "   " });
    const withContent = addNode(board, { type: "task", x: 0, y: 0, title: "", content: "Revisar o balanceamento" });
    expect(taskTitle(empty)).toBe("Tarefa sem título");
    expect(taskTitle(withContent)).toBe("Revisar o balanceamento");
  });
});

describe("tarefas: agregação global", () => {
  it("reúne tarefas de todos os quadros com caminho e workspace", () => {
    const { root, child, other, boards, workspaces } = setup();
    addNode(root, { type: "task", x: 0, y: 0, title: "Balancear dano", due: "2026-11-15" });
    addNode(child, { type: "task", x: 0, y: 0, title: "Documentar sistema", due: TODAY });
    addNode(other, { type: "task", x: 0, y: 0, title: "Ler referência", due: "2026-11-24" });

    const tasks = collectTasks(boards, workspaces, TODAY);
    expect(tasks).toHaveLength(3);
    const nested = tasks.find((task) => task.title === "Documentar sistema");
    expect(nested?.path).toEqual(["Jogo", "Sistemas"]);
    expect(nested?.workspaceName).toBe("Projeto");
    expect(tasks.find((task) => task.title === "Ler referência")?.workspaceName).toBe("Estudos");
  });

  it("ignora nós que não são tarefas, tarefas ocultas e tarefas em colunas ocultas", () => {
    const { root, boards, workspaces } = setup();
    addNode(root, { type: "note", x: 0, y: 0, title: "Nota" });
    addNode(root, { type: "task", x: 0, y: 0, title: "Visível" });
    addNode(root, { type: "task", x: 0, y: 0, title: "Oculta", hidden: true });
    const column = addNode(root, { type: "column", x: 0, y: 0, title: "Coluna", hidden: true });
    addNode(root, { type: "task", x: 0, y: 0, title: "Dentro da coluna", parentId: column.id });

    expect(collectTasks(boards, workspaces, TODAY).map((task) => task.title)).toEqual(["Visível"]);
  });

  it("ordena abertas por urgência e prioridade e deixa concluídas no fim", () => {
    const { root, boards, workspaces } = setup();
    addNode(root, { type: "task", x: 0, y: 0, title: "Sem prazo", priority: "high" });
    addNode(root, { type: "task", x: 0, y: 0, title: "Hoje baixa", due: TODAY, priority: "low" });
    addNode(root, { type: "task", x: 0, y: 0, title: "Atrasada alta", due: "2026-11-10", priority: "high" });
    addNode(root, { type: "task", x: 0, y: 0, title: "Hoje alta", due: TODAY, priority: "high" });
    addNode(root, { type: "task", x: 0, y: 0, title: "Concluída", done: true, due: "2026-11-01" });

    const tasks = collectTasks(boards, workspaces, TODAY);
    expect(tasks.map((task) => task.title)).toEqual([
      "Atrasada alta",
      "Hoje alta",
      "Hoje baixa",
      "Sem prazo",
      "Concluída",
    ]);
  });

  it("mantém tarefas concluídas ordenadas pela atualização mais recente", () => {
    const { root, boards, workspaces } = setup();
    const older = addNode(root, { type: "task", x: 0, y: 0, title: "Antiga", done: true });
    const newer = addNode(root, { type: "task", x: 0, y: 0, title: "Recente", done: true });
    older.updatedAt = 10;
    newer.updatedAt = 20;

    const done = collectTasks(boards, workspaces, TODAY).filter((task) => task.done);
    expect(done.map((task) => task.title)).toEqual(["Recente", "Antiga"]);
  });
});
