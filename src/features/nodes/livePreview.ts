import type { Extension, Range } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";
import {
  Decoration,
  EditorView,
  ViewPlugin,
  WidgetType,
  type DecorationSet,
  type ViewUpdate,
} from "@codemirror/view";
import {
  activeLineNumbers,
  buildLineStarts,
  planLivePreview,
  type LivePreviewMarkKind,
} from "@/lib/livePreview";

const MARK_CLASS: Record<LivePreviewMarkKind, string> = {
  strong: "cm-md-strong",
  emphasis: "cm-md-emphasis",
  strike: "cm-md-strike",
  code: "cm-md-code",
  link: "cm-md-link",
  underline: "cm-md-underline",
  sup: "cm-md-sup",
  sub: "cm-md-sub",
};

class BulletWidget extends WidgetType {
  eq(): boolean {
    return true;
  }
  toDOM(): HTMLElement {
    const bullet = document.createElement("span");
    bullet.className = "cm-md-bullet";
    bullet.textContent = "•";
    bullet.setAttribute("aria-hidden", "true");
    return bullet;
  }
}

class TaskWidget extends WidgetType {
  constructor(
    readonly checked: boolean,
    readonly from: number,
    readonly to: number,
  ) {
    super();
  }
  eq(other: TaskWidget): boolean {
    return other.checked === this.checked && other.from === this.from && other.to === this.to;
  }
  toDOM(view: EditorView): HTMLElement {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "cm-md-checkbox";
    checkbox.checked = this.checked;
    checkbox.setAttribute("aria-label", this.checked ? "Marcar tarefa como pendente" : "Concluir tarefa");
    checkbox.addEventListener("mousedown", (event) => event.preventDefault());
    checkbox.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const text = view.state.doc.sliceString(this.from, this.to);
      const next = /\[[xX]\]/.test(text) ? text.replace(/\[[xX]\]/, "[ ]") : text.replace("[ ]", "[x]");
      view.dispatch({
        changes: { from: this.from, to: this.to, insert: next },
        userEvent: "input.toggleTask",
      });
    });
    return checkbox;
  }
}

class HorizontalRuleWidget extends WidgetType {
  eq(): boolean {
    return true;
  }
  toDOM(): HTMLElement {
    const rule = document.createElement("span");
    rule.className = "cm-md-hr-widget";
    rule.setAttribute("aria-hidden", "true");
    return rule;
  }
}

function buildDecorations(view: EditorView): DecorationSet {
  const state = view.state;
  const source = state.doc.toString();
  if (!source) return Decoration.none;

  const starts = buildLineStarts(source);
  const active = activeLineNumbers(
    starts,
    state.selection.ranges.map((range) => ({ from: range.from, to: range.to })),
  );
  const visible = view.visibleRanges;
  const fromLine = visible.length > 0 ? state.doc.lineAt(visible[0].from).number : 1;
  const toLine =
    visible.length > 0 ? state.doc.lineAt(visible[visible.length - 1].to).number : state.doc.lines;
  const plan = planLivePreview(source, active, {
    fromLine,
    toLine,
    tree: syntaxTree(state),
  });

  const ranges: Range<Decoration>[] = [];

  for (const line of plan.lines) {
    if (line.number > state.doc.lines) continue;
    const docLine = state.doc.line(line.number);
    const classes = ["cm-md-line", `cm-md-${line.kind}`];
    if (line.headingLevel) classes.push(`cm-md-h${line.headingLevel}`);
    ranges.push(Decoration.line({ class: classes.join(" ") }).range(docLine.from));
  }

  for (const hidden of plan.hidden) {
    if (hidden.to <= hidden.from) continue;
    ranges.push(Decoration.replace({}).range(hidden.from, hidden.to));
  }

  for (const widget of plan.widgets) {
    if (widget.to <= widget.from) continue;
    const element =
      widget.kind === "bullet"
        ? new BulletWidget()
        : widget.kind === "task"
          ? new TaskWidget(Boolean(widget.checked), widget.from, widget.to)
          : new HorizontalRuleWidget();
    ranges.push(
      Decoration.replace({ widget: element, inclusive: false }).range(widget.from, widget.to),
    );
  }

  for (const mark of plan.marks) {
    if (mark.to <= mark.from) continue;
    ranges.push(Decoration.mark({ class: MARK_CLASS[mark.kind] }).range(mark.from, mark.to));
  }

  return Decoration.set(ranges, true);
}

class LivePreviewPlugin {
  decorations: DecorationSet;
  constructor(view: EditorView) {
    this.decorations = buildDecorations(view);
  }
  update(update: ViewUpdate) {
    if (update.docChanged || update.selectionSet || update.viewportChanged) {
      this.decorations = buildDecorations(update.view);
    }
  }
}

/** Extensão que esconde a marcação fora da linha ativa (estilo Obsidian). */
export function livePreview(): Extension {
  return ViewPlugin.fromClass(LivePreviewPlugin, {
    decorations: (plugin) => plugin.decorations,
  });
}
