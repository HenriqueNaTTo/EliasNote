import { useEffect, useRef, type CSSProperties, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { useRenderedMarkdown } from "@/lib/markdown";
import { PLAINTEXT_LANGUAGE, highlightCode, normalizeLanguage } from "@/lib/code";
import { openExternal } from "@/lib/platform";
import { useAppStore } from "@/core/store";
import { locateNode } from "@/core/store/helpers";
import { focusNode } from "@/features/canvas/viewportActions";

interface MarkdownViewProps {
  source: string;
  className?: string;
  style?: CSSProperties;
  emptyPlaceholder?: string;
}

const INTERNAL_LINK = /^eliasnote:\/\/(node|board)\/([^?#"'\s]+)/i;

/** Abre links internos (notas/quadros) ou externos no navegador padrão. */
function handleInternalLink(href: string): boolean {
  const match = INTERNAL_LINK.exec(href);
  if (!match) return false;
  let id = match[2];
  try {
    id = decodeURIComponent(id);
  } catch {
    /* mantém o id original */
  }
  const state = useAppStore.getState();
  if (match[1].toLowerCase() === "board") {
    state.openBoard(id);
    return true;
  }
  const located = locateNode(state, id);
  if (!located) return true;
  state.openBoard(located.board.id);
  requestAnimationFrame(() => {
    const latest = useAppStore.getState();
    latest.select([id]);
    focusNode(id);
  });
  return true;
}

export function MarkdownView({ source, className, style, emptyPlaceholder }: MarkdownViewProps) {
  const html = useRenderedMarkdown(source);
  const containerRef = useRef<HTMLDivElement>(null);

  // Realce progressivo dos blocos ```linguagem``` — o texto puro aparece primeiro.
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const blocks = Array.from(root.querySelectorAll<HTMLElement>("pre code"));
    if (blocks.length === 0) return;

    let cancelled = false;
    for (const block of blocks) {
      if (block.dataset.highlighted === "true") continue;
      const match = /language-([\w+#-]+)/.exec(block.className);
      const language = normalizeLanguage(match?.[1] ?? "");
      if (language === PLAINTEXT_LANGUAGE) continue;
      const code = block.textContent ?? "";
      void highlightCode(code, language).then((highlighted) => {
        if (cancelled || !highlighted) return;
        block.innerHTML = highlighted;
        block.dataset.highlighted = "true";
        block.classList.add("hljs");
      });
    }
    return () => {
      cancelled = true;
    };
  }, [html]);

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const anchor = target.closest("a");
    if (!anchor) return;
    event.preventDefault();
    const href = anchor.getAttribute("href") ?? "";
    if (handleInternalLink(href)) return;
    if (href.startsWith("#")) return;
    void openExternal(href);
  };

  if (!html) {
    return emptyPlaceholder ? (
      <p className={cn("text-xs italic opacity-45", className)}>{emptyPlaceholder}</p>
    ) : null;
  }

  return (
    <div
      ref={containerRef}
      className={cn("markdown", className)}
      style={style}
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
