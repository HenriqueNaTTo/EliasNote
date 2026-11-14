import { useMemo, useRef, useState } from "react";
import {
  Bold,
  Code,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  Quote,
  Strikethrough,
} from "lucide-react";
import { applyMarkdownAction, markdownStats, type MarkdownAction } from "@/lib/markdown";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MarkdownView } from "./MarkdownView";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  autoFocus?: boolean;
  className?: string;
  compact?: boolean;
}

const TOOLS: { action: MarkdownAction; icon: typeof Bold; label: string }[] = [
  { action: "bold", icon: Bold, label: "Negrito" },
  { action: "italic", icon: Italic, label: "Itálico" },
  { action: "strike", icon: Strikethrough, label: "Riscado" },
  { action: "heading", icon: Heading2, label: "Título" },
  { action: "bullet", icon: List, label: "Lista" },
  { action: "numbered", icon: ListOrdered, label: "Lista numerada" },
  { action: "task", icon: ListTodo, label: "Tarefa" },
  { action: "quote", icon: Quote, label: "Citação" },
  { action: "code", icon: Code, label: "Código" },
  { action: "link", icon: Link2, label: "Link" },
  { action: "divider", icon: Minus, label: "Separador" },
];

/**
 * Editor Markdown com barra de formatação. A digitação é persistida pelo
 * chamador com coalescência de histórico.
 */
export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Escreva em Markdown…",
  autoFocus = false,
  className,
  compact = false,
}: MarkdownEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);
  const stats = useMemo(() => markdownStats(value), [value]);

  const apply = (action: MarkdownAction) => {
    const element = ref.current;
    if (!element) return;
    const result = applyMarkdownAction(
      { value, selectionStart: element.selectionStart, selectionEnd: element.selectionEnd },
      action,
    );
    onChange(result.value);
    requestAnimationFrame(() => {
      element.focus();
      element.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  };

  return (
    <div className={cn("flex h-full min-h-0 flex-col gap-1.5", className)}>
      <div className="flex flex-wrap items-center gap-0.5 rounded-md bg-black/[0.04] p-0.5 dark:bg-white/[0.06]">
        {TOOLS.map((tool) => (
          <Tooltip key={tool.action}>
            <TooltipTrigger asChild>
              <button
                type="button"
                data-no-drag
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => apply(tool.action)}
                className={cn(
                  "grid h-6 w-6 place-items-center rounded text-current/70 hover:bg-background/70 hover:text-foreground",
                  compact && "h-5 w-5",
                )}
                aria-label={tool.label}
              >
                <tool.icon className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{tool.label}</TooltipContent>
          </Tooltip>
        ))}
        <span className="mx-1 h-4 w-px bg-current/15" />
        <button
          type="button"
          data-no-drag
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => setPreview((current) => !current)}
          className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-current/70 hover:bg-background/70 hover:text-foreground"
        >
          {preview ? "Editar" : "Prévia"}
        </button>
      </div>

      {preview ? (
        <div className="scrollbar-thin min-h-0 flex-1 overflow-auto rounded-md bg-background/50 p-2">
          {value.trim() ? (
            <MarkdownView source={value} className="text-[13px]" />
          ) : (
            <p className="text-xs italic opacity-50">{placeholder}</p>
          )}
        </div>
      ) : (
        <textarea
          ref={ref}
          data-no-drag
          autoFocus={autoFocus}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onPointerDown={(event) => event.stopPropagation()}
          placeholder={placeholder}
          spellCheck
          className="node-input scrollbar-thin min-h-0 flex-1 resize-none rounded-md bg-transparent p-1 font-sans text-[13px] leading-relaxed placeholder:opacity-45 focus:outline-none"
        />
      )}

      {!compact && (
        <div className="flex items-center justify-between px-1 text-[10px] opacity-50">
          <span>
            {stats.words} {stats.words === 1 ? "palavra" : "palavras"}
          </span>
          <span>Markdown</span>
        </div>
      )}
    </div>
  );
}
