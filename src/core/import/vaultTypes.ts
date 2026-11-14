import type { CanvasNode, Connector, DrawingScene, EntityRef, ID, NodeColor, NodeType } from "@/core/domain/types";

export type VaultFileKind = "note" | "canvas" | "drawing" | "attachment";

export interface VaultEntry {
  /** Caminho relativo ao cofre, com barras normais. */
  path: string;
  name: string;
  size: number;
  mime: string;
  /** Conteúdo textual para .md, .canvas e .excalidraw. */
  text?: string;
  /** Arquivo original, usado para salvar anexos. Ausente em testes. */
  file?: File;
  /** Caminho absoluto no disco (desktop/Tauri), usado para copiar anexos sem trafegar bytes. */
  nativePath?: string;
}

export interface VaultLink {
  token: string;
  raw: string;
  target: string;
  heading?: string;
  alias?: string;
  embed: boolean;
  resolution: VaultFileKind | "unresolved";
  resolvedPath?: string;
}

export interface VaultNote {
  path: string;
  title: string;
  /** Markdown com tokens internos para links (resolvidos no plano). */
  content: string;
  tags: string[];
  aliases: string[];
  links: VaultLink[];
}

export interface VaultAttachment {
  path: string;
  name: string;
  mime: string;
  size: number;
  kind: "image" | "video" | "file";
}

export interface VaultFolder {
  path: string;
  name: string;
  parentPath: string | null;
}

export interface ObsidianCanvasNode {
  id: string;
  type: "text" | "file" | "link" | "group";
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  file?: string;
  text?: string;
  label?: string;
  url?: string;
}

export interface ObsidianCanvasEdge {
  id: string;
  fromNode: string;
  toNode: string;
  label?: string;
  color?: string;
  fromEnd?: string;
  toEnd?: string;
}

export interface VaultCanvasNode extends ObsidianCanvasNode {
  resolvedPath?: string;
  resolvedKind?: VaultFileKind;
}

export interface VaultCanvas {
  path: string;
  name: string;
  nodes: VaultCanvasNode[];
  edges: ObsidianCanvasEdge[];
}

export interface VaultDrawing {
  path: string;
  name: string;
  scene: DrawingScene;
}

export interface VaultModel {
  vaultName: string;
  notes: VaultNote[];
  canvases: VaultCanvas[];
  drawings: VaultDrawing[];
  attachments: VaultAttachment[];
  folders: VaultFolder[];
  /** Caminhos de anexos citados por notas ou canvas. */
  referencedAttachments: string[];
  skipped: string[];
  warnings: string[];
  unresolvedLinks: number;
}

export interface VaultNodePlan {
  id: ID;
  type: NodeType;
  x: number;
  y: number;
  w: number;
  h: number;
  color?: NodeColor;
  fields?: Partial<CanvasNode>;
  references?: EntityRef[];
  /** Coluna de destino (grupos de canvas). */
  parentId?: ID | null;
  order?: number;
}

export interface VaultConnectorPlan {
  id: ID;
  fromNodeId: ID;
  toNodeId: ID;
  label?: string;
  color?: NodeColor;
  dashed?: boolean;
  arrowStart?: boolean;
  arrowEnd?: boolean;
  kind?: Connector["kind"];
}

export interface VaultBoardPlan {
  id: ID;
  parentId: ID | null;
  title: string;
  color: NodeColor;
  nodes: VaultNodePlan[];
  connectors: VaultConnectorPlan[];
  childBoardIds: ID[];
}

export interface VaultImportStats {
  folders: number;
  notes: number;
  canvases: number;
  drawings: number;
  attachments: number;
  links: number;
  unresolved: number;
  skipped: number;
}

export interface VaultImportPlan {
  workspaceName: string;
  boards: VaultBoardPlan[];
  openBoardId: ID;
  stats: VaultImportStats;
  warnings: string[];
}

export interface VaultPlanOptions {
  workspaceName: string;
  rootBoardTitle: string;
  attachmentIds: Record<string, string>;
  includeUnreferencedAttachments?: boolean;
}
