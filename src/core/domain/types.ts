import type { Viewport } from "@/lib/geometry";

export type ID = string;

export type NodeType =
  | "note"
  | "text"
  | "card"
  | "task"
  | "checklist"
  | "image"
  | "video"
  | "file"
  | "link"
  | "board"
  | "column"
  | "drawing"
  | "comment";

export type NodeColor = "none" | "amber" | "rose" | "sky" | "mint" | "lilac" | "sand" | "slate";

/** Transporte de elementos entre quadros: mover remove da origem, copiar mantém. */
export type NodeTransferMode = "move" | "copy";

export type Priority = "low" | "medium" | "high";

export interface ChecklistItem {
  id: ID;
  text: string;
  done: boolean;
}

export interface CommentReply {
  id: ID;
  author: string;
  content: string;
  createdAt: number;
}

export interface DrawingScene {
  /** Elementos serializados do Excalidraw (mantidos como dados opacos para desacoplar versões). */
  elements: unknown[];
  /** Subconjunto serializável do appState do Excalidraw. */
  appState: Record<string, unknown>;
  /** Arquivos binários embutidos (imagens coladas no desenho), em base64. */
  files: Record<string, unknown>;
  /** Miniatura PNG em data URL, usada para renderização rápida no canvas. */
  thumbnail?: string | null;
  updatedAt: number;
}

/** Referência entre documentos: `node:<id>` ou `board:<id>`. */
export type EntityRef = string;

export interface CanvasNode {
  id: ID;
  boardId: ID;
  type: NodeType;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Ordem de empilhamento; maior = na frente. */
  z: number;
  color: NodeColor;
  locked?: boolean;
  hidden?: boolean;
  /** Quando presente, o nó pertence a uma coluna. */
  parentId?: ID | null;
  /** Ordem dentro da coluna. */
  order?: number;
  createdAt: number;
  updatedAt: number;

  // Texto / cartões / notas
  title?: string;
  content?: string;
  description?: string;
  label?: string;

  // Tarefas
  done?: boolean;
  due?: string;
  priority?: Priority;

  // Checklists
  items?: ChecklistItem[];

  // Mídia e arquivos
  attachmentId?: ID;
  src?: string;
  name?: string;
  mime?: string;
  size?: number;
  caption?: string;
  fit?: "cover" | "contain";

  // Links
  url?: string;

  // Quadros aninhados
  childBoardId?: ID;

  // Colunas
  collapsed?: boolean;

  // Desenho Excalidraw
  scene?: DrawingScene;

  // Comentários locais
  author?: string;
  resolved?: boolean;
  replies?: CommentReply[];

  // Referências cruzadas (links bidirecionais)
  references?: EntityRef[];
  tags?: string[];
}

export type ConnectorKind = "curve" | "straight" | "elbow";

export interface ConnectorEndpoint {
  nodeId?: ID | null;
  x: number;
  y: number;
}

export interface Connector {
  id: ID;
  boardId: ID;
  from: ConnectorEndpoint;
  to: ConnectorEndpoint;
  kind: ConnectorKind;
  label?: string;
  color: NodeColor;
  dashed?: boolean;
  arrowStart?: boolean;
  arrowEnd?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Board {
  id: ID;
  workspaceId: ID;
  parentId: ID | null;
  title: string;
  description?: string;
  color: NodeColor;
  icon?: string;
  nodes: Record<ID, CanvasNode>;
  connectors: Record<ID, Connector>;
  /** Ordem dos quadros filhos na árvore lateral. */
  childOrder: ID[];
  createdAt: number;
  updatedAt: number;
}

export interface Workspace {
  id: ID;
  name: string;
  color: NodeColor;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Tab {
  id: ID;
  boardId: ID;
  workspaceId: ID;
}

export type ThemeMode = "light" | "dark" | "system";
export type AccentColor = "violet" | "blue" | "emerald" | "rose" | "amber" | "slate";
export type CanvasTexture = "dots" | "grid" | "plain";
export type Density = "comfortable" | "compact";

export interface AppSettings {
  theme: ThemeMode;
  accent: AccentColor;
  canvasTexture: CanvasTexture;
  density: Density;
  uiScale: number;
  snapToGrid: boolean;
  gridSize: number;
  animations: boolean;
  confirmDelete: boolean;
  showMinimap: boolean;
  showConnectorLabels: boolean;
  showNodeShadows: boolean;
  defaultNoteMode: "write" | "preview";
  noteFontSize: number;
  autosaveDelay: number;
  backupIntervalMinutes: number;
  backupRetention: number;
  authorName: string;
  shortcuts: Record<string, string>;
  sidebarWidth: number;
  inspectorOpen: boolean;
  /** Último backup automático, em epoch ms. */
  lastBackupAt?: number;
  /** Versão do conjunto visual aplicado (migração de aparência). */
  visualVersion: number;
}

export type ToolId =
  | "select"
  | "pan"
  | "note"
  | "text"
  | "card"
  | "task"
  | "checklist"
  | "column"
  | "drawing"
  | "comment"
  | "connector";

export interface HistoryEntry {
  id: string;
  label: string;
  at: number;
  before: HistoryData;
  after: HistoryData;
}

export interface HistoryData {
  boards: Record<ID, Board>;
  workspaces: Record<ID, Workspace>;
  workspaceOrder: ID[];
  activeWorkspaceId: ID;
}

export interface ViewportState extends Viewport {
  boardId: ID;
}

export interface TemplateItem {
  key: string;
  type: NodeType;
  x: number;
  y: number;
  w: number;
  h: number;
  fields?: Partial<CanvasNode>;
  children?: TemplateItem[];
}

export interface TemplateConnector {
  fromKey: string;
  toKey: string;
  label?: string;
  kind?: ConnectorKind;
}

export interface TemplatePayload {
  title?: string;
  description?: string;
  items: TemplateItem[];
  connectors?: TemplateConnector[];
}

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  category: "planejamento" | "criativo" | "projeto" | "estudo" | "pessoal";
  accent: NodeColor;
  /** Modelos salvos pelo usuário carregam o payload serializável. */
  payload?: TemplatePayload;
  custom?: boolean;
  build: () => TemplatePayload;
}

export interface SearchResult {
  kind: "node" | "board";
  id: ID;
  boardId: ID;
  boardTitle: string;
  type: NodeType | "board";
  title: string;
  snippet: string;
  score: number;
}

export interface BackupInfo {
  id: string;
  label: string;
  createdAt: number;
  size: number;
}

export interface AttachmentRecord {
  id: ID;
  name: string;
  mime: string;
  size: number;
  /** Caminho absoluto (Tauri) ou chave interna (navegador). */
  path?: string;
  createdAt: number;
}
