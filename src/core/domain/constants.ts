import type { AppSettings, CanvasNode, NodeColor, NodeType, Priority } from "./types";

export const SCHEMA_VERSION = 3;
export const SNAPSHOT_VERSION = 1;

export const NODE_WIDTHS: Record<NodeType, { w: number; h: number; minW: number; minH: number }> = {
  note: { w: 280, h: 220, minW: 160, minH: 110 },
  card: { w: 260, h: 170, minW: 150, minH: 90 },
  task: { w: 280, h: 64, minW: 180, minH: 56 },
  checklist: { w: 280, h: 220, minW: 180, minH: 110 },
  image: { w: 320, h: 240, minW: 120, minH: 90 },
  video: { w: 360, h: 220, minW: 180, minH: 120 },
  file: { w: 280, h: 84, minW: 180, minH: 70 },
  link: { w: 300, h: 140, minW: 170, minH: 90 },
  board: { w: 300, h: 200, minW: 160, minH: 120 },
  column: { w: 320, h: 320, minW: 220, minH: 180 },
  drawing: { w: 420, h: 300, minW: 180, minH: 120 },
  comment: { w: 260, h: 160, minW: 200, minH: 110 },
};

export const NODE_LABELS: Record<NodeType, string> = {
  note: "Nota",
  card: "Cartão",
  task: "Tarefa",
  checklist: "Checklist",
  image: "Imagem",
  video: "Vídeo",
  file: "Arquivo",
  link: "Link",
  board: "Quadro",
  column: "Coluna",
  drawing: "Desenho",
  comment: "Comentário",
};

export const COLOR_OPTIONS: { value: NodeColor; label: string; hex: string }[] = [
  { value: "none", label: "Sem cor", hex: "#ffffff" },
  { value: "amber", label: "Âmbar", hex: "#fdf0b8" },
  { value: "rose", label: "Rosa", hex: "#fbdfe5" },
  { value: "sky", label: "Céu", hex: "#d9ecfb" },
  { value: "mint", label: "Menta", hex: "#d9f2e4" },
  { value: "lilac", label: "Lilás", hex: "#e8e0fb" },
  { value: "sand", label: "Areia", hex: "#f6e6d4" },
  { value: "slate", label: "Ardósia", hex: "#e3e6ec" },
];

export const COLOR_HEX: Record<NodeColor, string> = COLOR_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = option.hex;
    return acc;
  },
  {} as Record<NodeColor, string>,
);

export const CONNECTOR_COLORS: Record<NodeColor, string> = {
  none: "hsl(var(--muted-foreground))",
  amber: "#d99e1b",
  rose: "#e0648a",
  sky: "#3d8fd6",
  mint: "#2f9e74",
  lilac: "#8a63e8",
  sand: "#b98145",
  slate: "#6b7280",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  accent: "violet",
  canvasTexture: "dots",
  density: "comfortable",
  uiScale: 1,
  snapToGrid: false,
  gridSize: 16,
  animations: true,
  confirmDelete: true,
  showMinimap: true,
  showConnectorLabels: true,
  showNodeShadows: true,
  defaultNoteMode: "write",
  noteFontSize: 14,
  autosaveDelay: 700,
  backupIntervalMinutes: 20,
  backupRetention: 20,
  authorName: "Você",
  shortcuts: {},
  sidebarWidth: 272,
  inspectorOpen: true,
};

export const COLUMN_PADDING = 12;
export const COLUMN_HEADER_HEIGHT = 46;
export const COLUMN_ITEM_GAP = 10;
export const COLUMN_MIN_HEIGHT = 220;

/** Estilos visuais por tipo (usados por nós e pelo painel de propriedades). */
export const NODE_ICONS: Record<NodeType, string> = {
  note: "sticky-note",
  card: "square",
  task: "check-square",
  checklist: "list-checks",
  image: "image",
  video: "video",
  file: "file",
  link: "link",
  board: "layout-dashboard",
  column: "columns",
  drawing: "pen-tool",
  comment: "message-circle",
};

export function defaultSize(type: NodeType): { w: number; h: number } {
  const size = NODE_WIDTHS[type];
  return { w: size.w, h: size.h };
}

/** Campos de conteúdo textual usados na busca e nas exportações. */
export function nodeTexts(node: CanvasNode): string[] {
  const parts: string[] = [];
  const push = (value?: string) => {
    if (value && value.trim()) parts.push(value);
  };
  push(node.title);
  push(node.content);
  push(node.description);
  push(node.label);
  push(node.caption);
  push(node.url);
  push(node.name);
  push(node.author);
  if (node.items?.length) {
    for (const item of node.items) push(item.text);
  }
  if (node.replies?.length) {
    for (const reply of node.replies) push(reply.content);
  }
  if (node.tags?.length) parts.push(node.tags.join(" "));
  return parts;
}
