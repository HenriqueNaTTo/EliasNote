import { useEffect, useMemo, useState } from "react";
import { Check, ChevronRight, ListTodo, Search, X } from "lucide-react";
import { useAppStore } from "@/core/store";
import {
  addDaysKey,
  collectTasks,
  localDateKey,
  type TaskBucket,
  type TaskEntry,
} from "@/core/domain/tasks";
import { PRIORITY_LABELS } from "@/core/domain/constants";
import type { Priority } from "@/core/domain/types";
import { focusNode } from "@/features/canvas/viewportActions";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type TaskFilter = "open" | "overdue" | "today" | "week" | "done";

const FILTERS: { id: TaskFilter; label: string }[] = [
  { id: "open", label: "Em aberto" },
  { id: "overdue", label: "Atrasadas" },
  { id: "today", label: "Hoje" },
  { id: "week", label: "Semana" },
  { id: "done", label: "Concluídas" },
];

const GROUPS: { id: TaskBucket; label: string }[] = [
  { id: "overdue", label: "Atrasadas" },
  { id: "today", label: "Hoje" },
  { id: "week", label: "Próximos 7 dias" },
  { id: "later", label: "Depois" },
  { id: "none", label: "Sem prazo" },
];

const MAX_VISIBLE = 200;
const SHORT_DATE = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });

const PRIORITY_VARIANT: Record<Priority, "danger" | "warning" | "outline"> = {
  high: "danger",
  medium: "warning",
  low: "outline",
};

function formatDue(due: string): string {
  return SHORT_DATE.format(new Date(`${due}T12:00:00`)).replace(".", "");
}

function dueLabel(due: string | undefined, today: string): { text: string; className: string } {
  if (!due || !/^\d{4}-\d{2}-\d{2}$/.test(due)) {
    return { text: "Sem prazo", className: "text-muted-foreground" };
  }
  if (due < today) return { text: `Atrasada · ${formatDue(due)}`, className: "text-destructive" };
  if (due === today) return { text: "Hoje", className: "text-amber-600 dark:text-amber-400" };
  if (due === addDaysKey(today, 1)) return { text: "Amanhã", className: "text-muted-foreground" };
  return { text: formatDue(due), className: "text-muted-foreground" };
}

function matchesFilter(task: TaskEntry, filter: TaskFilter): boolean {
  if (filter === "done") return task.done;
  if (task.done) return false;
  if (filter === "open") return true;
  if (filter === "week") return task.bucket === "today" || task.bucket === "week";
  return task.bucket === filter;
}

function TaskRow({
  task,
  today,
  onOpen,
  onToggle,
}: {
  task: TaskEntry;
  today: string;
  onOpen: (task: TaskEntry) => void;
  onToggle: (task: TaskEntry) => void;
}) {
  const due = dueLabel(task.due, today);
  return (
    <div className="group flex items-start gap-2 border-b border-border/60 px-2 py-2 last:border-0 hover:bg-accent/50">
      <button
        type="button"
        onClick={() => onToggle(task)}
        aria-label={task.done ? `Reabrir ${task.title}` : `Concluir ${task.title}`}
        aria-pressed={task.done}
        className={cn(
          "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border transition-colors",
          task.done
            ? "border-transparent bg-emerald-500 text-white hover:bg-emerald-600"
            : "border-border bg-background text-transparent hover:border-primary hover:bg-primary/10",
        )}
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </button>

      <button type="button" onClick={() => onOpen(task)} className="min-w-0 flex-1 text-left">
        <span className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "truncate text-[12.5px] font-medium",
              task.done && "text-muted-foreground line-through",
            )}
          >
            {task.title}
          </span>
          <Badge variant={PRIORITY_VARIANT[task.priority]} className="shrink-0 px-1 py-0 text-[8.5px]">
            {PRIORITY_LABELS[task.priority]}
          </Badge>
        </span>
        <span className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px]">
          <span className={due.className}>{due.text}</span>
          <span className="text-muted-foreground/40">·</span>
          <span className="truncate text-muted-foreground">
            {task.workspaceName} / {task.path.join(" / ")}
          </span>
        </span>
      </button>

      <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-foreground" />
    </div>
  );
}

export function TasksDialog() {
  const open = useAppStore((state) => state.dialog === "tasks");
  const close = useAppStore((state) => state.closeDialog);
  const boards = useAppStore((state) => state.boards);
  const workspaces = useAppStore((state) => state.workspaces);
  const openBoard = useAppStore((state) => state.openBoard);
  const toggleTask = useAppStore((state) => state.toggleTask);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<TaskFilter>("open");
  const today = localDateKey();

  const tasks = useMemo(
    () => (open ? collectTasks(boards, workspaces, today) : []),
    [open, boards, workspaces, today],
  );

  const counts = useMemo<Record<TaskFilter, number>>(() => {
    const openTasks = tasks.filter((task) => !task.done);
    return {
      open: openTasks.length,
      overdue: openTasks.filter((task) => task.bucket === "overdue").length,
      today: openTasks.filter((task) => task.bucket === "today").length,
      week: openTasks.filter((task) => task.bucket === "today" || task.bucket === "week").length,
      done: tasks.filter((task) => task.done).length,
    };
  }, [tasks]);

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    return tasks.filter((task) => {
      if (!matchesFilter(task, filter)) return false;
      if (!normalizedQuery) return true;
      return `${task.title} ${task.workspaceName} ${task.path.join(" ")}`
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [tasks, filter, normalizedQuery]);

  const visible = filtered.slice(0, MAX_VISIBLE);
  const showGroups = filter === "open";

  useEffect(() => {
    if (!open) {
      setQuery("");
      setFilter("open");
    }
  }, [open]);

  const openTask = (task: TaskEntry) => {
    openBoard(task.boardId);
    requestAnimationFrame(() => focusNode(task.id));
    close();
  };

  const sectionLabel =
    filter === "done"
      ? "Concluídas"
      : filter === "overdue"
        ? "Atrasadas"
        : filter === "today"
          ? "Hoje"
          : "Hoje e próximos 7 dias";

  return (
    <Dialog open={open} onOpenChange={(value) => (value ? undefined : close())}>
      <DialogContent className="top-[8%] max-w-2xl translate-y-0 gap-0 overflow-hidden p-0">
        <div className="flex items-start gap-3 border-b border-border px-4 py-3 pr-10">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <ListTodo className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <DialogTitle className="text-sm">Tarefas</DialogTitle>
            <DialogDescription>
              Prazos e prioridades de todos os quadros, em um só lugar.
            </DialogDescription>
          </div>
        </div>

        <div className="border-b border-border px-4 py-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filtrar por tarefa ou quadro…"
              aria-label="Filtrar tarefas"
              className="h-8 pl-8 pr-8 text-xs"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpar filtro"
                className="absolute right-2 top-1/2 grid h-4 w-4 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            ) : null}
          </div>
        </div>

        <div
          className="flex items-center gap-1 overflow-x-auto border-b border-border px-4 py-1.5 scrollbar-thin"
          role="toolbar"
          aria-label="Filtrar tarefas"
        >
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              aria-pressed={filter === item.id}
              className={cn(
                "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                filter === item.id
                  ? "bg-primary/12 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {item.label}
              <span
                className={cn(
                  "rounded-full px-1 text-[9px] tabular-nums",
                  filter === item.id ? "bg-primary/15" : "bg-muted text-muted-foreground",
                )}
              >
                {counts[item.id]}
              </span>
            </button>
          ))}
        </div>

        <div className="max-h-[52vh] min-h-[180px] overflow-y-auto p-2 scrollbar-thin">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-1.5 py-12 text-center">
              <ListTodo className="h-5 w-5 text-muted-foreground/60" />
              <p className="text-xs font-medium">
                {normalizedQuery
                  ? "Nenhuma tarefa corresponde a este filtro."
                  : filter === "done"
                    ? "Nenhuma tarefa concluída ainda."
                    : filter === "open"
                      ? "Nenhuma tarefa em aberto."
                      : "Nenhuma tarefa neste filtro."}
              </p>
              <p className="max-w-xs text-[10.5px] text-muted-foreground">
                Crie uma tarefa no canvas com <kbd className="rounded border border-border px-1">T</kbd>{" "}
                ou pelo menu flutuante.
              </p>
            </div>
          ) : showGroups ? (
            GROUPS.map((group) => {
              const items = visible.filter((task) => task.bucket === group.id);
              if (items.length === 0) return null;
              return (
                <section key={group.id} aria-label={group.label}>
                  <div className="flex items-center gap-2 px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.label}
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] tabular-nums">
                      {items.length}
                    </span>
                  </div>
                  {items.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      today={today}
                      onOpen={openTask}
                      onToggle={(item) => toggleTask(item.id)}
                    />
                  ))}
                </section>
              );
            })
          ) : (
            <section aria-label={sectionLabel}>
              <div className="flex items-center gap-2 px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {sectionLabel}
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] tabular-nums">
                  {visible.length}
                </span>
              </div>
              {visible.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  today={today}
                  onOpen={openTask}
                  onToggle={(item) => toggleTask(item.id)}
                />
              ))}
            </section>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-2 text-[10px] text-muted-foreground">
          <span>
            {filtered.length > MAX_VISIBLE
              ? `Mostrando ${MAX_VISIBLE} de ${filtered.length} tarefas`
              : `${filtered.length} ${filtered.length === 1 ? "tarefa" : "tarefas"}`}
          </span>
          <span className="hidden sm:inline">Clique para abrir no quadro · Esc fecha</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
