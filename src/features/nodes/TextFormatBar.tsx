import type { LucideIcon } from "lucide-react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  Italic,
  Strikethrough,
  Underline,
} from "lucide-react";
import { useAppStore } from "@/core/store";
import type { CanvasNode, TextAlign } from "@/core/domain/types";
import {
  TEXT_ALIGNMENTS,
  TEXT_ALIGN_LABELS,
  TEXT_FONT_FAMILIES,
  TEXT_FONT_SIZES,
  hasTextFormatting,
  stepFontSize,
  textFormatOf,
} from "@/lib/textStyle";
import { cn } from "@/lib/utils";
import { stopDrag } from "./nodeUi";

const ALIGN_ICONS: Record<TextAlign, LucideIcon> = {
  left: AlignLeft,
  center: AlignCenter,
  right: AlignRight,
};

interface TextFormatBarProps {
  node: CanvasNode;
  /** `floating` flutua sobre o canvas; `panel` ocupa a linha do inspector. */
  variant?: "floating" | "panel";
  className?: string;
}

/**
 * Controles de formatação do texto avulso: negrito, itálico, sublinhado,
 * riscado, tamanho, família tipográfica e alinhamento.
 */
export function TextFormatBar({ node, variant = "floating", className }: TextFormatBarProps) {
  const updateNode = useAppStore((state) => state.updateNode);
  const format = textFormatOf(node);
  const panel = variant === "panel";

  const apply = (patch: Partial<CanvasNode>) =>
    updateNode(node.id, patch, { label: "Formatar texto" });

  const sizes = TEXT_FONT_SIZES.includes(format.fontSize)
    ? TEXT_FONT_SIZES
    : [...TEXT_FONT_SIZES, format.fontSize].sort((a, b) => a - b);

  const toggles: Array<{ id: "bold" | "italic" | "underline" | "strike"; icon: LucideIcon; label: string; combo: string; active: boolean }> = [
    { id: "bold", icon: Bold, label: "Negrito", combo: "Mod+B", active: format.bold },
    { id: "italic", icon: Italic, label: "Itálico", combo: "Mod+I", active: format.italic },
    { id: "underline", icon: Underline, label: "Sublinhado", combo: "Mod+U", active: format.underline },
    { id: "strike", icon: Strikethrough, label: "Riscado", combo: "Mod+Shift+X", active: format.strike },
  ];

  const toggleClass = (active: boolean) =>
    cn(
      "grid shrink-0 place-items-center rounded transition-colors",
      panel ? "h-6 w-6" : "h-5 w-5",
      active
        ? "bg-primary/15 text-primary"
        : "opacity-65 hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10",
    );

  return (
    <div
      role="toolbar"
      aria-label="Formatação do texto"
      data-no-drag
      data-text-format-bar
      onPointerDown={stopDrag}
      onDoubleClick={(event) => event.stopPropagation()}
      className={cn(
        "flex items-center gap-0.5",
        panel
          ? "flex-wrap rounded-lg border border-border bg-muted/40 p-1"
          : "h-8 rounded-lg border border-border bg-popover px-1 shadow-lg",
        className,
      )}
    >
      {toggles.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            data-no-drag
            aria-label={item.label}
            aria-pressed={item.active}
            title={`${item.label} (${item.combo.replace("Mod", "Ctrl")})`}
            onClick={() => apply({ [item.id]: !item.active } as Partial<CanvasNode>)}
            className={toggleClass(item.active)}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        );
      })}

      <span className="mx-0.5 h-4 w-px shrink-0 bg-border" />

      <select
        value={format.fontSize}
        onChange={(event) => apply({ fontSize: Number(event.target.value) })}
        aria-label="Tamanho da fonte"
        title="Tamanho da fonte"
        className="h-5 shrink-0 cursor-pointer rounded bg-transparent px-0.5 text-[10.5px] tabular-nums outline-none hover:bg-black/5 dark:hover:bg-white/10"
      >
        {sizes.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>

      <div className="flex shrink-0 items-center">
        <button
          type="button"
          data-no-drag
          aria-label="Diminuir fonte"
          title="Diminuir fonte (Ctrl+-)"
          onClick={() => apply({ fontSize: stepFontSize(format.fontSize, -2) })}
          className={cn(toggleClass(false), "text-[11px] font-semibold")}
        >
          A-
        </button>
        <button
          type="button"
          data-no-drag
          aria-label="Aumentar fonte"
          title="Aumentar fonte (Ctrl+=)"
          onClick={() => apply({ fontSize: stepFontSize(format.fontSize, 2) })}
          className={cn(toggleClass(false), "text-[11px] font-semibold")}
        >
          A+
        </button>
      </div>

      <select
        value={format.fontFamily}
        onChange={(event) =>
          apply({ fontFamily: event.target.value as CanvasNode["fontFamily"] })
        }
        aria-label="Fonte do texto"
        title="Fonte do texto"
        className="h-5 shrink-0 cursor-pointer rounded bg-transparent px-0.5 text-[10.5px] outline-none hover:bg-black/5 dark:hover:bg-white/10"
      >
        {TEXT_FONT_FAMILIES.map((family) => (
          <option key={family.id} value={family.id}>
            {family.label}
          </option>
        ))}
      </select>

      <span className="mx-0.5 h-4 w-px shrink-0 bg-border" />

      <div className="flex shrink-0 items-center">
        {TEXT_ALIGNMENTS.map((align) => {
          const Icon = ALIGN_ICONS[align];
          return (
            <button
              key={align}
              type="button"
              data-no-drag
              aria-label={TEXT_ALIGN_LABELS[align]}
              aria-pressed={format.align === align}
              title={TEXT_ALIGN_LABELS[align]}
              onClick={() => apply({ align })}
              className={toggleClass(format.align === align)}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          );
        })}
      </div>

      {hasTextFormatting(node) ? (
        <button
          type="button"
          data-no-drag
          aria-label="Limpar formatação"
          title="Limpar formatação"
          onClick={() =>
            apply({
              fontSize: undefined,
              bold: undefined,
              italic: undefined,
              underline: undefined,
              strike: undefined,
              fontFamily: undefined,
              align: undefined,
            })
          }
          className={toggleClass(false)}
        >
          <Eraser className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
