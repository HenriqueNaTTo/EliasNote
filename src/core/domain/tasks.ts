import type { Board, CanvasNode, ID, Priority, Workspace } from "./types";
import { boardPath } from "./tree";
import { truncate } from "@/lib/utils";

export type TaskBucket = "overdue" | "today" | "week" | "later" | "none";

/** Tarefa já resolvida com o contexto necessário para a visão global. */
export interface TaskEntry {
  id: ID;
  boardId: ID;
  workspaceId: ID;
  title: string;
  /** Títulos do quadro raiz até o quadro da tarefa. */
  path: string[];
  workspaceName: string;
  priority: Priority;
  due?: string;
  done: boolean;
  bucket: TaskBucket;
  updatedAt: number;
}

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
const BUCKET_RANK: Record<TaskBucket, number> = { overdue: 0, today: 1, week: 2, later: 3, none: 4 };

/** Data local no formato usado pelo input `date` (YYYY-MM-DD). */
export function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Soma dias em uma chave YYYY-MM-DD sem depender do fuso do navegador. */
export function addDaysKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return dateKey;
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Classifica o prazo em relação ao dia local informado. */
export function taskBucket(due: string | undefined, today: string): TaskBucket {
  if (!due || !DATE_KEY.test(due)) return "none";
  if (due < today) return "overdue";
  if (due === today) return "today";
  if (due <= addDaysKey(today, 7)) return "week";
  return "later";
}

/** Título de exibição de uma tarefa, mesmo quando o usuário deixou o cartão vazio. */
export function taskTitle(node: CanvasNode): string {
  const title = node.title?.trim();
  if (title) return title;
  const content = node.content?.trim();
  if (content) return truncate(content, 80);
  return "Tarefa sem título";
}

/**
 * Percorre todos os quadros (inclusive subquadros) e devolve as tarefas abertas
 * e concluídas em ordem estável. O painel filtra e agrupa o resultado.
 */
export function collectTasks(
  boards: Record<ID, Board>,
  workspaces: Record<ID, Workspace>,
  today = localDateKey(),
): TaskEntry[] {
  const entries: TaskEntry[] = [];

  for (const board of Object.values(boards)) {
    const path = boardPath(boards, board.id).map((item) => item.title);
    const workspaceName = workspaces[board.workspaceId]?.name ?? "Espaço";
    const hiddenColumns = new Set(
      Object.values(board.nodes)
        .filter((node) => node.type === "column" && node.hidden)
        .map((node) => node.id),
    );

    for (const node of Object.values(board.nodes)) {
      if (node.type !== "task" || node.hidden) continue;
      if (node.parentId && hiddenColumns.has(node.parentId)) continue;
      const due = node.due?.trim() || undefined;
      entries.push({
        id: node.id,
        boardId: board.id,
        workspaceId: board.workspaceId,
        title: taskTitle(node),
        path,
        workspaceName,
        priority: node.priority ?? "medium",
        due,
        done: Boolean(node.done),
        bucket: taskBucket(due, today),
        updatedAt: node.updatedAt,
      });
    }
  }

  return entries.sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (a.done) return b.updatedAt - a.updatedAt;

    const bucket = BUCKET_RANK[a.bucket] - BUCKET_RANK[b.bucket];
    if (bucket !== 0) return bucket;

    const priority = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (priority !== 0) return priority;

    if (a.due !== b.due) {
      if (!a.due) return 1;
      if (!b.due) return -1;
      return a.due.localeCompare(b.due);
    }

    return a.title.localeCompare(b.title);
  });
}
