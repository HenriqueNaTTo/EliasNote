import { useState } from "react";
import { Check, LayoutTemplate, Trash2, Wand2 } from "lucide-react";
import { useAppStore } from "@/core/store";
import { useActiveBoard } from "@/core/store/selectors";
import { TEMPLATES, templateCategories } from "@/core/domain/templates";
import type { TemplateDefinition } from "@/core/domain/types";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PromptDialog } from "@/components/feedback/PromptDialog";

const ACCENT_BG: Record<string, string> = {
  none: "bg-muted",
  amber: "bg-amber-200 dark:bg-amber-900/50",
  rose: "bg-rose-200 dark:bg-rose-900/50",
  sky: "bg-sky-200 dark:bg-sky-900/50",
  mint: "bg-emerald-200 dark:bg-emerald-900/50",
  lilac: "bg-violet-200 dark:bg-violet-900/50",
  sand: "bg-orange-200 dark:bg-orange-900/50",
  slate: "bg-slate-200 dark:bg-slate-900/50",
};

export function TemplatesDialog() {
  const open = useAppStore((state) => state.dialog === "templates");
  const close = useAppStore((state) => state.closeDialog);
  const applyTemplate = useAppStore((state) => state.applyTemplate);
  const workspaceId = useAppStore((state) => state.activeWorkspaceId);
  const createBoard = useAppStore((state) => state.createBoard);
  const customTemplates = useAppStore((state) => state.customTemplates);
  const deleteCustomTemplate = useAppStore((state) => state.deleteCustomTemplate);
  const saveBoardAsTemplate = useAppStore((state) => state.saveBoardAsTemplate);
  const board = useActiveBoard();
  const [category, setCategory] = useState<string>("todos");
  const [saving, setSaving] = useState(false);

  const all: TemplateDefinition[] = [...TEMPLATES, ...customTemplates];
  const filtered =
    category === "todos" ? all : all.filter((template) => template.category === category);

  const apply = (template: TemplateDefinition, target: "current" | "new") => {
    if (target === "current") {
      applyTemplate(template.id);
    } else {
      createBoard({ workspaceId, templateId: template.id, title: template.name });
    }
    close();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(value) => (value ? undefined : close())}>
        <DialogContent className="max-w-3xl gap-0 p-0">
          <DialogHeader className="border-b border-border px-5 py-4">
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" /> Modelos
            </DialogTitle>
            <DialogDescription>
              Comece com uma estrutura pronta ou salve o quadro atual como modelo reutilizável.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap items-center gap-1 border-b border-border px-4 py-2">
            {[{ id: "todos", label: "Todos" }, ...templateCategories()].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategory(item.id)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                  category === item.id
                    ? "bg-primary/12 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-1.5">
              <Button
                variant="outline"
                size="xs"
                onClick={() => setSaving(true)}
                disabled={!board}
                title="Salvar o quadro atual como modelo"
              >
                <LayoutTemplate className="h-3 w-3" /> Salvar quadro atual
              </Button>
            </div>
          </div>

          <div className="scrollbar-thin max-h-[60vh] overflow-y-auto p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((template) => (
                <div
                  key={template.id}
                  className="group/template flex flex-col rounded-xl border border-border bg-card p-3 transition-shadow hover:shadow-node"
                >
                  <div className={cn("flex h-16 items-center justify-center rounded-lg", ACCENT_BG[template.accent] ?? "bg-muted")}>
                    <LayoutTemplate className="h-6 w-6 opacity-40" />
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <p className="min-w-0 flex-1 truncate text-[12.5px] font-semibold">{template.name}</p>
                    {template.custom ? <Badge variant="outline">Meu modelo</Badge> : null}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                    {template.description}
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    <Button
                      size="xs"
                      variant="subtle"
                      className="flex-1"
                      disabled={!board}
                      onClick={() => apply(template, "current")}
                    >
                      <Check className="h-3 w-3" /> Usar neste quadro
                    </Button>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      aria-label="Usar em novo quadro"
                      title="Criar novo quadro com este modelo"
                      onClick={() => apply(template, "new")}
                    >
                      <LayoutTemplate className="h-3.5 w-3.5" />
                    </Button>
                    {template.custom ? (
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        aria-label="Excluir modelo"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => deleteCustomTemplate(template.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[10.5px] text-muted-foreground">
            <span>{filtered.length} modelos</span>
            <span>Os modelos inserem elementos ao lado da área visível.</span>
          </div>
        </DialogContent>
      </Dialog>

      <PromptDialog
        open={saving}
        onOpenChange={setSaving}
        title="Salvar quadro como modelo"
        description="O modelo guarda notas, colunas, tarefas e desenhos (sem os quadros aninhados)."
        label="Nome do modelo"
        defaultValue={board ? `${board.title} — modelo` : ""}
        confirmLabel="Salvar modelo"
        onSubmit={(name) => saveBoardAsTemplate(name)}
      />
    </>
  );
}
