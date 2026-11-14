import type { Board, CanvasNode, Connector, DrawingScene } from "@/core/domain/types";
import { uid } from "@/lib/utils";
import { migrateBoard, migrateNode } from "@/core/persistence/migrations";

export interface ImportResult {
  source: "board" | "workspace" | "fragment";
  boards: Board[];
  nodes: CanvasNode[];
  connectors: Connector[];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function nodesFrom(value: unknown): Record<string, unknown> {
  if (Array.isArray(value)) {
    const record: Record<string, unknown> = {};
    for (const item of value) {
      const node = asRecord(item);
      if (node && typeof node.id === "string") record[node.id] = node;
    }
    return record;
  }
  const record = asRecord(value);
  return record ?? {};
}

function connectorsFrom(value: unknown): Record<string, unknown> {
  if (Array.isArray(value)) {
    const record: Record<string, unknown> = {};
    for (const item of value) {
      const connector = asRecord(item);
      if (connector && typeof connector.id === "string") record[connector.id] = connector;
    }
    return record;
  }
  const record = asRecord(value);
  return record ?? {};
}

function normalizeFragment(raw: Record<string, unknown>): { nodes: CanvasNode[]; connectors: Connector[] } {
  const synthetic: Board = {
    id: "import_fragment",
    workspaceId: "import",
    parentId: null,
    title: "Importado",
    color: "none",
    nodes: nodesFrom(raw.nodes ?? raw.elements) as unknown as Board["nodes"],
    connectors: connectorsFrom(raw.connectors) as unknown as Board["connectors"],
    childOrder: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const migrated = migrateBoard(synthetic);
  if (!migrated) return { nodes: [], connectors: [] };
  return { nodes: Object.values(migrated.nodes), connectors: Object.values(migrated.connectors) };
}

function boardFrom(value: unknown): Board | null {
  const raw = asRecord(value);
  if (!raw) return null;
  return migrateBoard(raw);
}

/**
 * Interpreta arquivos JSON exportados pelo EliasNote (quadro, workspace ou
 * fragmento de elementos). Lança erro quando o conteúdo é irreconhecível.
 */
export function parseImportJson(raw: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Arquivo não é um JSON válido.");
  }
  const data = asRecord(parsed);
  if (!data) throw new Error("Formato de arquivo não reconhecido.");

  if (Array.isArray(data.boards)) {
    const boards = data.boards.map(boardFrom).filter((board): board is Board => Boolean(board));
    if (boards.length === 0) throw new Error("Nenhum quadro válido encontrado no arquivo.");
    return {
      source: "workspace",
      boards,
      nodes: boards.flatMap((board) => Object.values(board.nodes)),
      connectors: boards.flatMap((board) => Object.values(board.connectors)),
    };
  }

  const single = boardFrom(data.board ?? (data.nodes ? data : null));
  if (single && Object.keys(single.nodes).length > 0) {
    return {
      source: data.kind === "eliasnote.board" ? "board" : "fragment",
      boards: [single],
      nodes: Object.values(single.nodes),
      connectors: Object.values(single.connectors),
    };
  }

  if (data.nodes || data.elements) {
    const { nodes, connectors } = normalizeFragment({ ...data, id: "import_fragment" });
    if (nodes.length === 0) throw new Error("Nenhum elemento reconhecido no arquivo.");
    return { source: "fragment", boards: [], nodes, connectors };
  }

  throw new Error("Formato de arquivo não reconhecido.");
}

export interface MarkdownImportOptions {
  filename?: string;
}

export function markdownToNoteSeed(raw: string, options: MarkdownImportOptions = {}) {
  const heading = raw.match(/^\s*#\s+(.+)$/m);
  const fallback = (options.filename ?? "Nota importada").replace(/\.(md|markdown|txt)$/i, "");
  const title = heading ? heading[1].trim() : fallback;
  const content = heading ? raw.replace(heading[0], "").trim() : raw.trim();
  return { type: "note" as const, title, content, w: 340, h: 260 };
}

/** Importa arquivos `.excalidraw` como cenas editáveis. */
export function parseExcalidrawScene(raw: string): DrawingScene | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  const data = asRecord(parsed);
  if (!data || !Array.isArray(data.elements)) return null;
  return {
    elements: data.elements,
    appState: asRecord(data.appState) ?? {},
    files: asRecord(data.files) ?? {},
    thumbnail: null,
    updatedAt: Date.now(),
  };
}

/** Normaliza um nó isolado aplicando migrações e um novo id. */
export function normalizeImportedNode(raw: unknown, boardId: string): CanvasNode | null {
  const migrated = migrateNode(raw, boardId);
  if (!migrated) return null;
  return { ...migrated, id: migrated.id || uid("node") };
}
