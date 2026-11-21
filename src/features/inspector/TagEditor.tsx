import { useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { useAppStore } from "@/core/store";
import { collectBoardTags, normalizeTag, tagKey, uniqueTags } from "@/core/domain/tags";
import type { CanvasNode } from "@/core/domain/types";

/** Editor de etiquetas com chips, sugestões do quadro e edição por teclado. */
export function TagEditor({ node }: { node: CanvasNode }) {
  const updateNode = useAppStore((state) => state.updateNode);
  const board = useAppStore((state) => state.boards[node.boardId]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setDraft("");
  }, [node.id]);

  const tags = useMemo(() => uniqueTags(node.tags ?? []), [node.tags]);
  const currentKeys = useMemo(() => new Set(tags.map((tag) => tagKey(tag))), [tags]);
  const boardTags = useMemo(() => (board ? collectBoardTags(board) : []), [board]);
  const suggestions = boardTags
    .filter((option) => !currentKeys.has(option.key))
    .slice(0, 8);

  const commit = (next: string[]) => {
    const values = uniqueTags(next);
    const current = uniqueTags(node.tags ?? []);
    if (
      values.length === current.length &&
      values.every((tag, index) => tagKey(tag) === tagKey(current[index] ?? ""))
    ) {
      return;
    }
    updateNode(
      node.id,
      { tags: values.length ? values : undefined },
      { label: "Editar etiquetas" },
    );
  };

  const add = (raw = draft) => {
    setDraft("");
    const parsed = uniqueTags(raw.split(/[,\n]/));
    if (parsed.length === 0) return;
    commit([...tags, ...parsed]);
  };

  const remove = (tag: string) => {
    commit(tags.filter((candidate) => tagKey(candidate) !== tagKey(tag)));
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-card p-1.5">
        {tags.map((tag) => (
          <span
            key={tagKey(tag)}
            className="inline-flex items-center gap-1 rounded-full border border-primary/15 bg-primary/8 px-1.5 py-0.5 text-[10.5px] font-medium text-primary"
          >
            #{tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              aria-label={`Remover etiqueta ${tag}`}
              className="grid h-3 w-3 place-items-center rounded-full text-primary/60 transition-colors hover:bg-primary/15 hover:text-primary"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => add()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              add();
              return;
            }
            if (event.key === "Backspace" && !draft && tags.length > 0) {
              event.preventDefault();
              remove(tags[tags.length - 1]);
              return;
            }
            if (event.key === "Escape") {
              setDraft("");
              event.currentTarget.blur();
            }
          }}
          placeholder={tags.length > 0 ? "Adicionar…" : "Adicionar etiqueta…"}
          aria-label="Adicionar etiqueta"
          className="h-6 min-w-[96px] flex-1 bg-transparent px-1 text-[11px] outline-none placeholder:text-muted-foreground"
        />
      </div>

      {suggestions.length > 0 ? (
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          <span className="text-[10px] text-muted-foreground">Sugestões</span>
          {suggestions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => add(option.label)}
              className="inline-flex items-center gap-0.5 rounded-full border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Plus className="h-2.5 w-2.5" />#{normalizeTag(option.label)}
            </button>
          ))}
        </div>
      ) : null}

      <p className="mt-1 text-[10px] text-muted-foreground">
        Enter ou vírgula adiciona. Backspace no campo vazio remove a última.
      </p>
    </div>
  );
}
