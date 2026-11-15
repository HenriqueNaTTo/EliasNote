/**
 * Converte e valida documentos lidos do disco. Dados antigos ou parcialmente
 * corrompidos são normalizados em vez de descartados.
 */
import type { AppSettings, Board, CanvasNode, ChecklistItem, CommentReply, Tab, Workspace } from "@/core/domain/types";
import { DEFAULT_SETTINGS } from "@/core/domain/constants";
import { uid } from "@/lib/utils";
import type { SerializedTemplate } from "./types";

export const CURRENT_DATA_VERSION = 3;

function number(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function string(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function migrateChecklistItems(items: unknown): ChecklistItem[] {
  if (!Array.isArray(items)) return [];
  return items.map((raw) => {
    const item = (raw ?? {}) as Record<string, unknown>;
    return {
      id: string(item.id) || uid("item"),
      text: string(item.text),
      done: Boolean(item.done),
    };
  });
}

export function migrateReplies(replies: unknown): CommentReply[] {
  if (!Array.isArray(replies)) return [];
  return replies.map((raw) => {
    const reply = (raw ?? {}) as Record<string, unknown>;
    return {
      id: string(reply.id) || uid("reply"),
      author: string(reply.author, "Você"),
      content: string(reply.content),
      createdAt: number(reply.createdAt, Date.now()),
    };
  });
}

export function migrateNode(raw: unknown, boardId: string): CanvasNode | null {
  if (!raw || typeof raw !== "object") return null;
  const node = raw as Record<string, unknown>;
  if (typeof node.id !== "string" || typeof node.type !== "string") return null;
  const timestamp = number(node.createdAt, Date.now());
  return {
    ...(node as Partial<CanvasNode>),
    id: node.id,
    boardId,
    type: node.type as CanvasNode["type"],
    x: number(node.x, 0),
    y: number(node.y, 0),
    w: Math.max(60, number(node.w, 240)),
    h: Math.max(40, number(node.h, 160)),
    z: number(node.z, timestamp),
    color: (node.color as CanvasNode["color"]) ?? "none",
    parentId: typeof node.parentId === "string" ? node.parentId : null,
    createdAt: timestamp,
    updatedAt: number(node.updatedAt, timestamp),
    hidden: Boolean(node.hidden),
    locked: Boolean(node.locked),
    items: node.items ? migrateChecklistItems(node.items) : undefined,
    replies: node.replies ? migrateReplies(node.replies) : undefined,
    references: Array.isArray(node.references)
      ? node.references.filter((ref): ref is string => typeof ref === "string")
      : undefined,
    tags: Array.isArray(node.tags) ? node.tags.filter((tag): tag is string => typeof tag === "string") : undefined,
  };
}

export function migrateBoard(raw: unknown): Board | null {
  if (!raw || typeof raw !== "object") return null;
  const board = raw as Record<string, unknown>;
  if (typeof board.id !== "string" || typeof board.workspaceId !== "string") return null;

  const nodesRaw = (board.nodes ?? {}) as Record<string, unknown>;
  const nodes: Record<string, CanvasNode> = {};
  for (const [id, value] of Object.entries(nodesRaw)) {
    const node = migrateNode(value, board.id);
    if (node) nodes[node.id ?? id] = node;
  }
  const connectorsRaw = (board.connectors ?? {}) as Record<string, Record<string, unknown>>;
  const connectors: Board["connectors"] = {};
  for (const [id, value] of Object.entries(connectorsRaw)) {
    if (!value || typeof value !== "object") continue;
    const fromRaw = (value.from ?? {}) as Record<string, unknown>;
    const toRaw = (value.to ?? {}) as Record<string, unknown>;
    connectors[id] = {
      id,
      boardId: board.id,
      from: {
        nodeId: typeof fromRaw.nodeId === "string" ? fromRaw.nodeId : null,
        x: number(fromRaw.x, 0),
        y: number(fromRaw.y, 0),
      },
      to: {
        nodeId: typeof toRaw.nodeId === "string" ? toRaw.nodeId : null,
        x: number(toRaw.x, 0),
        y: number(toRaw.y, 0),
      },
      kind: value.kind === "straight" || value.kind === "elbow" ? value.kind : "curve",
      label: typeof value.label === "string" ? value.label : undefined,
      color: (value.color as Board["connectors"][string]["color"]) ?? "none",
      dashed: Boolean(value.dashed),
      arrowStart: Boolean(value.arrowStart),
      arrowEnd: value.arrowEnd === undefined ? true : Boolean(value.arrowEnd),
      createdAt: number(value.createdAt, Date.now()),
      updatedAt: number(value.updatedAt, Date.now()),
    };
  }

  const timestamp = number(board.createdAt, Date.now());
  return {
    id: board.id,
    workspaceId: board.workspaceId,
    parentId: typeof board.parentId === "string" ? board.parentId : null,
    title: string(board.title, "Sem título"),
    description: typeof board.description === "string" ? board.description : undefined,
    color: (board.color as Board["color"]) ?? "none",
    icon: typeof board.icon === "string" ? board.icon : undefined,
    nodes,
    connectors,
    childOrder: Array.isArray(board.childOrder)
      ? board.childOrder.filter((id): id is string => typeof id === "string")
      : [],
    createdAt: timestamp,
    updatedAt: number(board.updatedAt, timestamp),
  };
}

export function migrateWorkspace(raw: unknown): Workspace | null {
  if (!raw || typeof raw !== "object") return null;
  const workspace = raw as Record<string, unknown>;
  if (typeof workspace.id !== "string") return null;
  return {
    id: workspace.id,
    name: string(workspace.name, "Espaço"),
    color: (workspace.color as Workspace["color"]) ?? "none",
    description: typeof workspace.description === "string" ? workspace.description : undefined,
    createdAt: number(workspace.createdAt, Date.now()),
    updatedAt: number(workspace.updatedAt, Date.now()),
  };
}

export function migrateSettings(raw: unknown): AppSettings {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_SETTINGS };
  const settings = raw as Record<string, unknown>;
  const merged: AppSettings = {
    ...DEFAULT_SETTINGS,
    ...(settings as Partial<AppSettings>),
    shortcuts:
      settings.shortcuts && typeof settings.shortcuts === "object"
        ? Object.fromEntries(
            Object.entries(settings.shortcuts as Record<string, unknown>).filter(
              (entry): entry is [string, string] => typeof entry[1] === "string",
            ),
          )
        : {},
  };
  // Migração de aparência para o visual Milanote (acento azul, canvas liso).
  if (number(settings.visualVersion, 0) < 2) {
    merged.accent = "blue";
    merged.canvasTexture = "plain";
    merged.showNodeShadows = true;
  }
  merged.visualVersion = 2;
  return merged;
}

export function migrateTemplates(raw: unknown): SerializedTemplate[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const template = item as Record<string, unknown>;
      if (typeof template.id !== "string" || typeof template.name !== "string") return null;
      const payload = template.payload as SerializedTemplate["payload"];
      if (!payload || !Array.isArray(payload.items)) return null;
      return {
        id: template.id,
        name: template.name,
        description: string(template.description),
        category: (template.category as SerializedTemplate["category"]) ?? "projeto",
        accent: string(template.accent, "none"),
        payload,
      };
    })
    .filter((value): value is SerializedTemplate => value !== null);
}

export function migrateTabs(raw: unknown): Tab[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const tab = item as Record<string, unknown>;
      if (typeof tab.boardId !== "string" || typeof tab.workspaceId !== "string") return null;
      return { id: string(tab.id) || uid("tab"), boardId: tab.boardId, workspaceId: tab.workspaceId };
    })
    .filter((value): value is Tab => value !== null);
}
