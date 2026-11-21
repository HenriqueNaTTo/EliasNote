import type { Draft } from "immer";
import type { Point, Size, Viewport } from "@/lib/geometry";
import type {
  AppSettings,
  Board,
  CanvasNode,
  ChecklistItem,
  Connector,
  ConnectorEndpoint,
  DrawingScene,
  EntityRef,
  HistoryEntry,
  ID,
  NodeTransferMode,
  NodeType,
  Tab,
  TemplateDefinition,
  ToolId,
  Workspace,
} from "@/core/domain/types";
import type { VaultImportPlan } from "@/core/import/vaultTypes";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export type DialogKind =
  | "search"
  | "tasks"
  | "settings"
  | "templates"
  | "backups"
  | "shortcuts"
  | "export"
  | "import"
  | "obsidian"
  | "drawing"
  | "about"
  | "board-settings";

export interface HistoryState {
  past: HistoryEntry[];
  future: HistoryEntry[];
  lastKey?: string;
  lastAt: number;
}

export interface TransactionState {
  label: string;
  before: HistoryDataSnapshot;
  at: number;
}

export interface HistoryDataSnapshot {
  boards: Record<ID, Board>;
  workspaces: Record<ID, Workspace>;
  workspaceOrder: ID[];
  activeWorkspaceId: ID;
}

export interface CommitOptions {
  /** Agrupa alterações consecutivas na mesma entrada de histórico. */
  coalesceKey?: string;
  /** Janela de agrupamento em ms (padrão 1600). */
  coalesceWindow?: number;
}

export interface AddNodeOptions {
  title?: string;
  content?: string;
  color?: CanvasNode["color"];
  w?: number;
  h?: number;
  parentId?: ID | null;
  /** Quadro de destino; padrão é o quadro ativo. */
  boardId?: ID;
  attachmentId?: ID;
  src?: string;
  name?: string;
  mime?: string;
  size?: number;
  url?: string;
  author?: string;
  childBoardId?: ID;
  fields?: Partial<CanvasNode>;
}

export type DraftMutator = (draft: Draft<AppState>) => void;

export interface HistorySlice {
  history: HistoryState;
  transaction: TransactionState | null;
  commit: (label: string, mutator: DraftMutator, options?: CommitOptions) => void;
  beginTransaction: (label: string) => void;
  endTransaction: () => void;
  cancelTransaction: () => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
}

export interface NodeTransferResult {
  boardId: ID;
  title: string;
  count: number;
  mode: NodeTransferMode;
}

export interface NodeSlice {
  selection: ID[];
  selectedConnectors: ID[];
  activeTool: ToolId;
  editingNodeId: ID | null;
  drawingNodeId: ID | null;
  addNode: (type: NodeType, position: Point, options?: AddNodeOptions) => ID | null;
  addBoardNode: (boardId: ID, position: Point, title?: string) => ID | null;
  updateNode: (nodeId: ID, patch: Partial<CanvasNode>, options?: CommitOptions & { label?: string }) => void;
  updateNodes: (ids: ID[], patch: Partial<CanvasNode>, options?: CommitOptions & { label?: string }) => void;
  updateNodeSilent: (nodeId: ID, patch: Partial<CanvasNode>) => void;
  removeNodes: (ids: ID[]) => void;
  duplicateNodes: (ids: ID[]) => void;
  /** Move ou copia elementos (com colunas, subquadros e conectores) para outro quadro. */
  transferNodes: (ids: ID[], targetBoardId: ID, mode: NodeTransferMode) => NodeTransferResult | null;
  moveNodes: (ids: ID[], delta: Point) => void;
  resizeNode: (nodeId: ID, rect: { x: number; y: number; w: number; h: number }) => void;
  select: (ids: ID[]) => void;
  toggleSelect: (id: ID) => void;
  selectAll: () => void;
  clearSelection: () => void;
  selectConnector: (id: ID | null) => void;
  setTool: (tool: ToolId) => void;
  setEditingNode: (id: ID | null) => void;
  openDrawing: (nodeId: ID | null) => void;
  updateDrawingScene: (nodeId: ID, scene: DrawingScene, thumbnail?: string | null) => void;
  bringToFront: (ids: ID[]) => void;
  sendToBack: (ids: ID[]) => void;
  toggleTask: (id: ID) => void;
  addChecklistItem: (nodeId: ID, text?: string) => void;
  updateChecklistItem: (nodeId: ID, itemId: ID, patch: Partial<ChecklistItem>) => void;
  removeChecklistItem: (nodeId: ID, itemId: ID) => void;
  reorderChecklist: (nodeId: ID, from: number, to: number) => void;
  addConnector: (from: ConnectorEndpoint, to: ConnectorEndpoint) => ID | null;
  updateConnector: (id: ID, patch: Partial<Connector>) => void;
  removeConnector: (id: ID) => void;
  addReference: (nodeId: ID, ref: EntityRef) => void;
  removeReference: (nodeId: ID, ref: EntityRef) => void;
  addCommentReply: (nodeId: ID, content: string) => void;
  toggleCommentResolved: (nodeId: ID) => void;
}

export interface BoardSlice {
  workspaces: Record<ID, Workspace>;
  workspaceOrder: ID[];
  activeWorkspaceId: ID;
  boards: Record<ID, Board>;
  tabs: Tab[];
  activeTabId: ID | null;
  expandedBoards: Record<string, boolean>;
  customTemplates: TemplateDefinition[];
  createWorkspace: (name?: string) => ID;
  renameWorkspace: (id: ID, name: string) => void;
  deleteWorkspace: (id: ID) => void;
  setActiveWorkspace: (id: ID) => void;
  createBoard: (options?: {
    parentId?: ID | null;
    workspaceId?: ID;
    title?: string;
    templateId?: string;
    open?: boolean;
  }) => ID | null;
  renameBoard: (id: ID, title: string) => void;
  updateBoard: (id: ID, patch: Partial<Pick<Board, "color" | "icon" | "description" | "title">>) => void;
  deleteBoard: (id: ID) => void;
  moveBoard: (id: ID, parentId: ID | null, index?: number) => void;
  duplicateBoard: (id: ID) => ID | null;
  openBoard: (boardId: ID) => void;
  closeTab: (tabId: ID) => void;
  setActiveTab: (tabId: ID) => void;
  cycleTab: (direction: 1 | -1) => void;
  toggleBoardExpanded: (id: ID) => void;
  setBoardExpanded: (id: ID, expanded: boolean) => void;
  applyTemplate: (templateId: string, anchor?: Point) => void;
  saveBoardAsTemplate: (name: string) => void;
  deleteCustomTemplate: (id: ID) => void;
  importNodes: (nodes: CanvasNode[], connectors?: Connector[], targetBoardId?: ID) => void;
  /** Importa um cofre Obsidian completo em um novo workspace, em uma única entrada de histórico. */
  importVault: (plan: VaultImportPlan) => ID | null;
}

export interface UiSlice {
  viewports: Record<ID, Viewport>;
  canvasSize: Size;
  sidebarCollapsed: boolean;
  dialog: DialogKind | null;
  /** Filtro de etiqueta ativo por quadro (chave normalizada, efêmero). */
  tagFilters: Record<ID, string | null>;
  /** Elementos escolhidos para mover/copiar entre quadros (diálogo aberto). */
  nodeTransfer: { nodeIds: ID[]; mode: NodeTransferMode } | null;
  openNodeTransfer: (nodeIds: ID[], mode: NodeTransferMode) => void;
  closeNodeTransfer: () => void;
  /** Arraste de elementos sobre um quadro de destino (destaque e confirmação). */
  nodeDrag: { nodeIds: ID[]; overBoardId: ID | null; mode: NodeTransferMode } | null;
  startNodeDrag: (nodeIds: ID[]) => void;
  hoverNodeDragTarget: (boardId: ID | null, mode: NodeTransferMode) => void;
  endNodeDrag: () => void;
  /** Quadro que acabou de receber elementos — dispara a animação de confirmação. */
  dropFlash: { boardId: ID; at: number } | null;
  flashDropTarget: (boardId: ID) => void;
  settingsSection: "geral" | "aparencia" | "canvas" | "atalhos" | "dados" | "sobre";
  inspectorTab: "props" | "references" | "comments";
  status: SaveStatus;
  lastSavedAt: number | null;
  lastError: string | null;
  hydrated: boolean;
  attachmentsVersion: number;
  storageKind: "sqlite" | "indexeddb" | "memory";
  setViewport: (boardId: ID, viewport: Viewport) => void;
  panViewport: (boardId: ID, dx: number, dy: number) => void;
  zoomViewport: (boardId: ID, zoom: number, anchorClient?: Point) => void;
  resetViewport: (boardId: ID) => void;
  setCanvasSize: (size: Size) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  openDialog: (dialog: DialogKind) => void;
  closeDialog: () => void;
  setTagFilter: (boardId: ID, tag: string | null) => void;
  setSettingsSection: (section: UiSlice["settingsSection"]) => void;
  setInspectorTab: (tab: UiSlice["inspectorTab"]) => void;
  setStatus: (status: SaveStatus, error?: string | null) => void;
  markSaved: (at?: number) => void;
  setHydrated: (hydrated: boolean) => void;
  bumpAttachments: () => void;
  setStorageKind: (kind: UiSlice["storageKind"]) => void;
  hydrate: (payload: HydratePayload) => void;
}

export interface SettingsSlice {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  setShortcut: (actionId: string, combo: string | null) => void;
  resetShortcuts: () => void;
  toggleTheme: () => void;
}

export interface AppState extends HistorySlice, NodeSlice, BoardSlice, UiSlice, SettingsSlice {}

export interface HydratePayload {
  workspaces: Record<ID, Workspace>;
  workspaceOrder: ID[];
  activeWorkspaceId: ID;
  boards: Record<ID, Board>;
  tabs: Tab[];
  activeTabId: ID | null;
  settings?: Partial<AppSettings>;
  customTemplates?: TemplateDefinition[];
  viewports?: Record<ID, Viewport>;
  storageKind?: UiSlice["storageKind"];
}
