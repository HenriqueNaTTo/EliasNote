import type { EntityRef, ID } from "@/core/domain/types";

export type EntityKind = "node" | "board";

export function refForNode(id: ID): EntityRef {
  return `node:${id}`;
}

export function refForBoard(id: ID): EntityRef {
  return `board:${id}`;
}

export function parseRef(ref: EntityRef): { kind: EntityKind; id: ID } | null {
  const separator = ref.indexOf(":");
  if (separator <= 0) return null;
  const kind = ref.slice(0, separator);
  const id = ref.slice(separator + 1);
  if ((kind !== "node" && kind !== "board") || !id) return null;
  return { kind, id };
}

export function isRefToNode(ref: EntityRef, nodeId: ID): boolean {
  const parsed = parseRef(ref);
  return parsed?.kind === "node" && parsed.id === nodeId;
}

export function isRefToBoard(ref: EntityRef, boardId: ID): boolean {
  const parsed = parseRef(ref);
  return parsed?.kind === "board" && parsed.id === boardId;
}
