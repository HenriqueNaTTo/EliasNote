import type { LucideIcon } from "lucide-react";
import { Apple, Monitor, Terminal } from "lucide-react";
import { isDocId } from "@/landing/docs/content";
import type {
  AccentId,
  DataPathId,
  DocId,
  ElementId,
  PlatformId,
  ShortcutId,
  TabId,
} from "@/landing/i18n/types";

export type { AccentId, DocId, TabId };

export const REPO_URL = "https://github.com/HenriqueNaTTo/EliasNote";
export const RELEASES_URL = `${REPO_URL}/releases/latest`;
export const RELEASES_PAGE_URL = `${REPO_URL}/releases`;
export const ISSUES_URL = `${REPO_URL}/issues`;
export const ISSUES_NEW_URL = `${REPO_URL}/issues/new`;
export const ACTIONS_URL = `${REPO_URL}/actions`;
export const DOCS_URL = `${REPO_URL}/tree/main/docs`;
export const LICENSE_URL = `${REPO_URL}/blob/main/LICENSE`;
export const EXCALIDRAW_URL = "https://excalidraw.com";
export const APP_VERSION = "0.5.0";

/** Ordem das abas no header e no rodapé. */
export const TAB_IDS: readonly TabId[] = [
  "principal",
  "funcionalidades",
  "downloads",
  "documentacao",
  "sobre",
  "contato",
];

export const ACCENTS: { id: AccentId; color: string }[] = [
  { id: "blue", color: "#2f7fe0" },
  { id: "emerald", color: "#159a6a" },
  { id: "rose", color: "#e0436e" },
  { id: "amber", color: "#d98a0b" },
  { id: "slate", color: "#5b6472" },
];

export interface SiteRoute {
  tab: TabId;
  /** Página da documentação aberta, ou `null` para o índice. */
  doc: DocId | null;
}

/** Lê `#documentacao/<página>` sem perder o fallback das abas antigas. */
export function parseRoute(hash: string): SiteRoute {
  const raw = hash.replace(/^#\/?/, "").split("?")[0];
  const [tabId, docId] = raw.split(/[/#]/);

  if (tabId === "documentacao") {
    return { tab: "documentacao", doc: isDocId(docId) ? docId : null };
  }

  const tab = TAB_IDS.find((id) => id === tabId);
  return { tab: tab ?? "principal", doc: null };
}

export function docHref(docId?: DocId | null): string {
  return docId ? `#documentacao/${docId}` : "#documentacao";
}

// ---------------------------------------------------------------------------
// Metadados independentes de idioma: o texto fica em i18n/locales/<idioma>.
// ---------------------------------------------------------------------------

export interface PlatformMeta {
  id: PlatformId;
  icon: LucideIcon;
  formats: string[];
}

export const PLATFORM_META: PlatformMeta[] = [
  { id: "windows", icon: Monitor, formats: [".msi", ".exe"] },
  { id: "linux", icon: Terminal, formats: [".AppImage", ".deb"] },
  { id: "macos", icon: Apple, formats: [".dmg"] },
];

/** Tecnologias na ordem das camadas traduzidas em `about.stack.layers`. */
export const STACK_TECHNOLOGIES: string[] = [
  "Tauri 2 + Rust",
  "React 18 + TypeScript",
  "Tailwind CSS + Radix UI + lucide",
  "Excalidraw 0.18 (MIT)",
  "Zustand + Immer",
  "SQLite (rusqlite) ou IndexedDB",
  "Vite + Vitest",
];

export interface DataPathMeta {
  id: DataPathId;
  path: string;
}

export const DATA_PATH_META: DataPathMeta[] = [
  { id: "windows", path: String.raw`%APPDATA%\com.eliasnote.desktop` },
  { id: "macos", path: "~/Library/Application Support/com.eliasnote.desktop" },
  { id: "linux", path: "~/.local/share/com.eliasnote.desktop" },
  { id: "browser", path: "IndexedDB do próprio navegador" },
];

export interface ShortcutMeta {
  id: ShortcutId;
  keys: string[];
}

export const SHORTCUT_META: ShortcutMeta[] = [
  { id: "busca", keys: ["Ctrl/Cmd", "K"] },
  { id: "tarefas", keys: ["Ctrl/Cmd", "Shift", "P"] },
  { id: "apresentar", keys: ["Ctrl/Cmd", "Shift", "F"] },
  { id: "nova-nota", keys: ["N"] },
  { id: "nova-tarefa", keys: ["T"] },
  { id: "desenho", keys: ["D"] },
  { id: "enquadrar", keys: ["Shift", "1"] },
  { id: "zoom", keys: ["Ctrl/Cmd", "0"] },
  { id: "sidebar", keys: ["Ctrl/Cmd", "B"] },
  { id: "desfazer", keys: ["Ctrl/Cmd", "Z"] },
];

export interface ElementMeta {
  id: ElementId;
  /** Cor do marcador na tabela de elementos. */
  dot: string;
}

export const ELEMENT_META: ElementMeta[] = [
  { id: "nota", dot: "bg-amber-400" },
  { id: "texto", dot: "bg-slate-400" },
  { id: "codigo", dot: "bg-sky-400" },
  { id: "cartao", dot: "bg-sky-400" },
  { id: "tarefa", dot: "bg-rose-400" },
  { id: "checklist", dot: "bg-emerald-400" },
  { id: "midia", dot: "bg-violet-400" },
  { id: "arquivo", dot: "bg-orange-300" },
  { id: "link", dot: "bg-sky-400" },
  { id: "quadro", dot: "bg-violet-400" },
  { id: "coluna", dot: "bg-emerald-400" },
  { id: "comentario", dot: "bg-amber-400" },
  { id: "desenho", dot: "bg-rose-400" },
  { id: "desenho-nota", dot: "bg-violet-400" },
];
