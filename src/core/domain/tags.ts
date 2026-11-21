import type { Board, CanvasNode, ID } from "./types";

/** Limite de exibição/entrada de uma etiqueta. */
export const MAX_TAG_LENGTH = 40;

export interface BoardTag {
  /** Chave normalizada, usada para comparar e filtrar. */
  key: string;
  /** Grafia da primeira ocorrência no quadro. */
  label: string;
  count: number;
}

/** Remove `#`, espaços sobrando e limita o tamanho; preserva a grafia. */
export function normalizeTag(raw: string): string {
  return raw
    .trim()
    .replace(/^#+/, "")
    .replace(/\s+/g, " ")
    .slice(0, MAX_TAG_LENGTH)
    .trim();
}

/** Chave estável e case-insensitive para comparar etiquetas. */
export function tagKey(raw: string): string {
  return normalizeTag(raw).toLocaleLowerCase();
}

/** Remove vazias e duplicatas, preservando a primeira grafia. */
export function uniqueTags(tags: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of tags) {
    const tag = normalizeTag(raw);
    const key = tagKey(tag);
    if (!tag || seen.has(key)) continue;
    seen.add(key);
    result.push(tag);
  }
  return result;
}

export function nodeHasTag(node: CanvasNode, tag: string): boolean {
  const key = tagKey(tag);
  if (!key) return false;
  return (node.tags ?? []).some((candidate) => tagKey(candidate) === key);
}

/** Etiquetas usadas no quadro, com contagem por elemento (não por ocorrência). */
export function collectBoardTags(board: Board): BoardTag[] {
  const map = new Map<string, BoardTag>();

  for (const node of Object.values(board.nodes)) {
    if (node.hidden || !node.tags?.length) continue;
    const seenInNode = new Set<string>();
    for (const raw of node.tags) {
      const tag = normalizeTag(raw);
      const key = tagKey(tag);
      if (!tag || seenInNode.has(key)) continue;
      seenInNode.add(key);
      const current = map.get(key);
      if (current) current.count += 1;
      else map.set(key, { key, label: tag, count: 1 });
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label, "pt-BR"),
  );
}

/**
 * IDs que devem aparecer com um filtro de etiqueta:
 * os elementos marcados, os ancestrais (para manter o contexto da coluna) e,
 * quando a própria coluna é marcada, seus filhos diretos.
 */
export function visibleNodeIdsForTag(board: Board, tag: string): Set<ID> {
  const ids = new Set<ID>();
  const matching = Object.values(board.nodes).filter(
    (node) => !node.hidden && nodeHasTag(node, tag),
  );

  for (const node of matching) ids.add(node.id);

  for (const node of matching) {
    let parentId = node.parentId;
    const guard = new Set<ID>();
    while (parentId && !guard.has(parentId)) {
      guard.add(parentId);
      ids.add(parentId);
      parentId = board.nodes[parentId]?.parentId ?? null;
    }

    if (node.type === "column") {
      for (const child of Object.values(board.nodes)) {
        if (child.parentId === node.id) ids.add(child.id);
      }
    }
  }

  return ids;
}
