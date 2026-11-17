import type { LucideIcon } from "lucide-react";
import { Check, ChevronRight, Moon, ShieldCheck, Sun, X } from "lucide-react";
import type { ReactNode } from "react";

import { AppMark } from "@/components/brand/AppMark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SetupStep = "welcome" | "options" | "installation" | "done";

export interface StepDescriptor {
  id: SetupStep;
  label: string;
}

export function TopBar({
  version,
  dark,
  onToggleTheme,
  onClose,
}: {
  version: string;
  dark: boolean;
  onToggleTheme: () => void;
  onClose: () => void;
}) {
  return (
    <header
      data-tauri-drag-region
      className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-[hsl(var(--sidebar))] px-4"
    >
      <div data-tauri-drag-region className="flex items-center gap-2">
        <AppMark className="size-4 text-foreground" />
        <span className="text-[13px] font-semibold tracking-tight">EliasNote Setup</span>
        <span className="rounded-md border border-border bg-background px-1.5 py-px text-[10px] font-medium text-muted-foreground">
          v{version}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={dark ? "Usar tema claro" : "Usar tema escuro"}
          title={dark ? "Usar tema claro" : "Usar tema escuro"}
          onClick={onToggleTheme}
        >
          {dark ? <Sun /> : <Moon />}
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Fechar instalador" title="Fechar" onClick={onClose}>
          <X />
        </Button>
      </div>
    </header>
  );
}

export function Sidebar({
  steps,
  current,
  footer,
}: {
  steps: StepDescriptor[];
  current: SetupStep;
  footer: ReactNode;
}) {
  const currentIndex = steps.findIndex((step) => step.id === current);

  return (
    <aside className="flex w-[264px] shrink-0 flex-col border-r border-border bg-[hsl(var(--sidebar))] px-4 py-5">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground">
          <AppMark className="size-6" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight">EliasNote</p>
          <p className="text-xs text-muted-foreground">Instalador</p>
        </div>
      </div>

      <nav aria-label="Etapas do instalador" className="mt-7">
        <ol className="space-y-1">
          {steps.map((step, index) => {
            const isCurrent = step.id === current;
            const isDone = index < currentIndex;
            return (
              <li
                key={step.id}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm",
                  isCurrent && "bg-accent/70",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold tabular-nums",
                    isCurrent && "border-transparent bg-primary text-primary-foreground",
                    !isCurrent && isDone && "border-primary/30 bg-background text-primary",
                    !isCurrent && !isDone && "border-border bg-background text-muted-foreground",
                  )}
                >
                  {isDone ? <Check className="size-3" /> : index + 1}
                </span>
                <span className={cn("truncate", isCurrent ? "font-medium" : "text-muted-foreground")}>
                  {step.label}
                </span>
                {isCurrent ? <ChevronRight className="ml-auto size-3.5 text-muted-foreground" /> : null}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="mt-auto">{footer}</div>
    </aside>
  );
}

export function LocalNote() {
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-node">
      <p className="flex items-center gap-2 text-[13px] font-medium">
        <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
        Instalação local
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Seus quadros e anexos ficam neste computador. Nada é enviado para servidores.
      </p>
    </div>
  );
}

export function ScreenHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">{eyebrow}</p>
      <h1 className="mt-1.5 text-[22px] font-semibold leading-tight tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="flex items-center gap-2 text-[13px] font-medium">
        <Icon className="size-4 text-primary" />
        {title}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

export function NoteRow({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2.5 text-xs text-muted-foreground">
      <Icon className="mt-px size-3.5 shrink-0" />
      <span className="leading-relaxed">{children}</span>
    </div>
  );
}

export function FieldLabel({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <span className="text-[13px] font-medium">{children}</span>
      {hint ? <span className="text-[11px] text-muted-foreground">{hint}</span> : null}
    </div>
  );
}

export function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 py-2">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
      />
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent transition-colors",
          checked ? "bg-primary" : "bg-input",
        )}
      >
        <span
          className={cn(
            "block size-4 rounded-full bg-background shadow transition-transform",
            checked ? "translate-x-4" : "translate-x-0",
          )}
        />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-medium">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{description}</span>
        ) : null}
      </span>
    </label>
  );
}

export function StageList({
  stages,
  currentStage,
  done,
}: {
  stages: { id: string; label: string }[];
  currentStage: string;
  done: boolean;
}) {
  const currentIndex = stages.findIndex((stage) => stage.id === currentStage);

  return (
    <ol className="space-y-2">
      {stages.map((stage, index) => {
        const isDone = done || index < currentIndex;
        const isActive = !done && stage.id === currentStage;
        return (
          <li key={stage.id} className="flex items-center gap-2.5 text-[13px]">
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full border",
                isDone && "border-primary/30 bg-primary/10 text-primary",
                isActive && "border-primary text-primary",
                !isDone && !isActive && "border-border text-muted-foreground",
              )}
            >
              {isDone ? (
                <Check className="size-3" />
              ) : (
                <span className={cn("size-1.5 rounded-full", isActive ? "bg-primary" : "bg-muted-foreground/50")} />
              )}
            </span>
            <span className={cn(isActive || isDone ? "text-foreground" : "text-muted-foreground")}>
              {stage.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
