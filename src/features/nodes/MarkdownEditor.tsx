import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { EditorState, Transaction } from "@codemirror/state";
import { EditorView, drawSelection, keymap, placeholder as cmPlaceholder } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { tags } from "@lezer/highlight";
import { cn } from "@/lib/utils";
import { livePreview } from "./livePreview";
import { MarkdownToolbar, applyMarkdownToView } from "./MarkdownToolbar";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  compact?: boolean;
  ariaLabel?: string;
  /** Tamanho base do texto da nota, em px. */
  fontSize?: number;
}

const HIGHLIGHT = HighlightStyle.define([
  { tag: tags.strong, fontWeight: "700" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strikethrough, textDecoration: "line-through" },
  { tag: tags.monospace, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" },
  { tag: tags.link, color: "hsl(var(--primary))" },
  { tag: tags.url, color: "hsl(var(--muted-foreground))" },
  { tag: tags.processingInstruction, color: "hsl(var(--muted-foreground))" },
  { tag: tags.heading, fontWeight: "700" },
]);

const EDITOR_THEME = EditorView.theme({
  "&": { height: "100%", backgroundColor: "transparent", color: "inherit" },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": {
    overflow: "auto",
    fontFamily: "inherit",
    paddingBottom: "3.4rem",
  },
  ".cm-content": { padding: "0", minHeight: "100%", caretColor: "currentColor" },
  ".cm-line": { padding: "0 2px" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "currentColor" },
  ".cm-selectionBackground, ::selection": { backgroundColor: "hsl(var(--primary) / 0.22)" },
  ".cm-placeholder": { color: "currentColor", opacity: "0.45", fontStyle: "italic" },
});

/**
 * Editor de notas com “live preview”: o markdown é exibido formatado e a
 * marcação só aparece na linha em que o cursor está — como no Obsidian.
 * O conteúdo continua sendo markdown puro e é persistido pelo chamador.
 */
export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Escreva em Markdown…",
  autoFocus = false,
  className,
  compact = false,
  ariaLabel = "Conteúdo da nota",
  fontSize = 13.5,
}: MarkdownEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const [view, setView] = useState<EditorView | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let created: EditorView | null = null;
    try {
      const state = EditorState.create({
        doc: value,
        extensions: [
          history(),
          drawSelection(),
          EditorView.lineWrapping,
          keymap.of([
            ...defaultKeymap,
            ...historyKeymap,
            {
              key: "Mod-b",
              run: (target) => {
                applyMarkdownToView(target, "bold");
                return true;
              },
            },
            {
              key: "Mod-i",
              run: (target) => {
                applyMarkdownToView(target, "italic");
                return true;
              },
            },
            {
              key: "Mod-u",
              run: (target) => {
                applyMarkdownToView(target, "underline");
                return true;
              },
            },
            {
              key: "Mod-Shift-x",
              run: (target) => {
                applyMarkdownToView(target, "strike");
                return true;
              },
            },
          ]),
          markdown({ base: markdownLanguage }),
          syntaxHighlighting(HIGHLIGHT),
          livePreview(),
          cmPlaceholder(placeholder),
          EditorView.contentAttributes.of({
            "aria-label": ariaLabel,
            role: "textbox",
            "aria-multiline": "true",
            spellcheck: "true",
            autocapitalize: "sentences",
          }),
          EDITOR_THEME,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) onChangeRef.current(update.state.doc.toString());
          }),
        ],
      });
      created = new EditorView({ state, parent: host });
      viewRef.current = created;
      setView(created);
      setFailed(false);
      if (autoFocus) {
        created.focus();
        created.dispatch({
          selection: { anchor: created.state.doc.length },
          scrollIntoView: true,
        });
      }
    } catch (error) {
      console.error("Editor de notas indisponível; usando textarea.", error);
      setFailed(true);
    }

    return () => {
      viewRef.current = null;
      created?.destroy();
    };
    // A view é criada uma única vez; o valor externo é sincronizado abaixo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const editor = viewRef.current;
    if (!editor) return;
    if (value === editor.state.doc.toString()) return;
    editor.dispatch({
      changes: { from: 0, to: editor.state.doc.length, insert: value },
      selection: { anchor: Math.min(editor.state.selection.main.anchor, value.length) },
      annotations: Transaction.addToHistory.of(false),
    });
  }, [value]);

  return (
    <div
      data-no-drag
      data-wheel-scroll
      onPointerDown={(event) => event.stopPropagation()}
      style={{ "--note-editor-size": `${fontSize}px` } as CSSProperties}
      className={cn(
        "note-live-editor group/note-editor relative flex h-full min-h-0 flex-col",
        className,
      )}
    >
      {failed ? (
        <textarea
          data-no-drag
          autoFocus={autoFocus}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
          spellCheck
          className="node-input scrollbar-thin min-h-0 flex-1 resize-none bg-transparent p-1 text-[13px] leading-relaxed placeholder:opacity-45 focus:outline-none"
        />
      ) : (
        <div ref={hostRef} className="min-h-0 flex-1 overflow-hidden" />
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-1.5 z-10 flex justify-center px-2">
        <div className="pointer-events-auto">
          <MarkdownToolbar view={view} compact={compact} />
        </div>
      </div>
    </div>
  );
}
