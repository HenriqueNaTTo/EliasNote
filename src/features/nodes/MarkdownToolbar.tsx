import type { LucideIcon } from "lucide-react";
import {
  Bold,
  Code2,
  Heading2,
  Italic,
  Link2,
  List,
  ListTodo,
  Quote,
  Strikethrough,
  Subscript,
  Superscript,
  Underline,
} from "lucide-react";
import type { EditorView } from "@codemirror/view";
import { applyMarkdownAction, type MarkdownAction } from "@/lib/markdown";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Tool {
  action: MarkdownAction;
  icon: LucideIcon;
  label: string;
  compact?: boolean;
}

const TOOLS: Tool[] = [
  { action: "bold", icon: Bold, label: "Negrito" },
  { action: "italic", icon: Italic, label: "Itálico" },
  { action: "strike", icon: Strikethrough, label: "Riscado" },
  { action: "underline", icon: Underline, label: "Sublinhado" },
  { action: "sup", icon: Superscript, label: "Sobrescrito" },
  { action: "sub", icon: Subscript, label: "Subscrito" },
  { action: "code", icon: Code2, label: "Código" },
  { action: "task", icon: ListTodo, label: "Tarefa" },
  { action: "quote", icon: Quote, label: "Citação" },
  { action: "heading", icon: Heading2, label: "Título", compact: true },
  { action: "bullet", icon: List, label: "Lista", compact: true },
  { action: "link", icon: Link2, label: "Link", compact: true },
];

/** Aplica uma ação de formatação na seleção atual do editor. */
export function applyMarkdownToView(view: EditorView, action: MarkdownAction): void {
  const state = view.state;
  const selection = state.selection.main;
  const result = applyMarkdownAction(
    {
      value: state.doc.toString(),
      selectionStart: selection.from,
      selectionEnd: selection.to,
    },
    action,
  );
  view.dispatch({
    changes: { from: 0, to: state.doc.length, insert: result.value },
    selection: { anchor: result.selectionStart, head: result.selectionEnd },
    scrollIntoView: true,
    userEvent: "input.format",
  });
  view.focus();
}

interface MarkdownToolbarProps {
  view: EditorView | null;
  compact?: boolean;
  className?: string;
}

/**
 * Barra compacta de formatação do editor de notas (negrito, itálico,
 * sublinhado, sobrescrito, subscrito, código, tarefa e citação).
 */
export function MarkdownToolbar({ view, compact = false, className }: MarkdownToolbarProps) {
  const tools = compact ? TOOLS.filter((tool) => !tool.compact) : TOOLS;

  return (
    <div
      role="toolbar"
      aria-label="Formatação da nota"
      data-no-drag
      onPointerDown={(event) => event.preventDefault()}
      onDoubleClick={(event) => event.stopPropagation()}
      className={cn(
        "flex items-center gap-0.5 rounded-md border border-border bg-popover/95 px-1 py-0.5 shadow-sm backdrop-blur",
        className,
      )}
    >
      {tools.map((tool) => (
        <Tooltip key={tool.action}>
          <TooltipTrigger asChild>
            <button
              type="button"
              data-no-drag
              aria-label={tool.label}
              title={tool.label}
              disabled={!view}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                if (!view) return;
                applyMarkdownToView(view, tool.action);
              }}
              className={cn(
                "grid place-items-center rounded text-foreground/65 transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40",
                compact ? "h-5 w-5" : "h-7 w-7",
              )}
            >
              <tool.icon className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
            </button>
          </TooltipTrigger>
          <TooltipContent>{tool.label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
