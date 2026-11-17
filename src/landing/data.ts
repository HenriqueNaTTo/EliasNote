import type { LucideIcon } from "lucide-react";
import {
  Archive,
  Blocks,
  Columns3,
  Download,
  FileDown,
  FolderTree,
  GitBranch,
  HardDrive,
  Image,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  Link2,
  ListChecks,
  Maximize2,
  MessageCircle,
  MousePointer2,
  NotebookPen,
  Palette,
  PenTool,
  Search,
  StickyNote,
  Undo2,
  Wand2,
} from "lucide-react";
import type { FeatureCategoryId, FeatureId } from "@/landing/i18n/types";

/** Catálogo de funcionalidades: id, categoria e ícone ficam aqui; o texto vem do idioma. */

export const FEATURE_CATEGORY_IDS: readonly FeatureCategoryId[] = [
  "canvas",
  "elementos",
  "desenho",
  "organizacao",
  "dados",
];

export interface FeatureMeta {
  id: FeatureId;
  category: FeatureCategoryId;
  icon: LucideIcon;
}

export const FEATURE_META: FeatureMeta[] = [
  { id: "canvas-infinito", category: "canvas", icon: Maximize2 },
  { id: "encaixe-grade", category: "canvas", icon: LayoutGrid },
  { id: "selecao-multipla", category: "canvas", icon: MousePointer2 },
  { id: "mover-entre-quadros", category: "canvas", icon: Layers },
  { id: "tipos-de-elementos", category: "elementos", icon: StickyNote },
  { id: "notas-markdown", category: "elementos", icon: NotebookPen },
  { id: "tarefas-checklists", category: "elementos", icon: ListChecks },
  { id: "midia-local", category: "elementos", icon: Image },
  { id: "colunas", category: "elementos", icon: Columns3 },
  { id: "comentarios", category: "elementos", icon: MessageCircle },
  { id: "conectores", category: "elementos", icon: Link2 },
  { id: "excalidraw", category: "desenho", icon: PenTool },
  { id: "mesclar-cenas", category: "desenho", icon: Blocks },
  { id: "exportar-desenho", category: "desenho", icon: FileDown },
  { id: "quadros-aninhados", category: "organizacao", icon: LayoutDashboard },
  { id: "workspaces-abas", category: "organizacao", icon: FolderTree },
  { id: "busca-global", category: "organizacao", icon: Search },
  { id: "referencias", category: "organizacao", icon: GitBranch },
  { id: "modelos", category: "organizacao", icon: Wand2 },
  { id: "autosave", category: "dados", icon: HardDrive },
  { id: "backups", category: "dados", icon: Archive },
  { id: "exportar-importar", category: "dados", icon: Download },
  { id: "obsidian", category: "dados", icon: NotebookPen },
  { id: "personalizacao", category: "dados", icon: Palette },
  { id: "historico", category: "dados", icon: Undo2 },
];
