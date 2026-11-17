import type { LucideIcon } from "lucide-react";
import { Apple, Monitor, Terminal } from "lucide-react";

export const REPO_URL = "https://github.com/HenriqueNaTTo/EliasNote";
export const RELEASES_URL = `${REPO_URL}/releases/latest`;
export const RELEASES_PAGE_URL = `${REPO_URL}/releases`;
export const ISSUES_URL = `${REPO_URL}/issues`;
export const ISSUES_NEW_URL = `${REPO_URL}/issues/new`;
export const ACTIONS_URL = `${REPO_URL}/actions`;
export const DOCS_URL = `${REPO_URL}/tree/main/docs`;
export const LICENSE_URL = `${REPO_URL}/blob/main/LICENSE`;
export const EXCALIDRAW_URL = "https://excalidraw.com";
export const APP_VERSION = "0.2.0";

export type TabId = "principal" | "funcionalidades" | "downloads" | "sobre" | "contato";

export const TABS: ReadonlyArray<{ id: TabId; label: string }> = [
  { id: "principal", label: "Principal" },
  { id: "funcionalidades", label: "Funcionalidades" },
  { id: "downloads", label: "Downloads" },
  { id: "sobre", label: "Sobre" },
  { id: "contato", label: "Contato" },
];

export function parseTab(hash: string): TabId {
  const id = hash.replace(/^#\/?/, "").split("?")[0];
  return TABS.some((tab) => tab.id === id) ? (id as TabId) : "principal";
}

export interface Platform {
  id: string;
  name: string;
  icon: LucideIcon;
  formats: string[];
  requirement: string;
  note: string;
}

export const PLATFORMS: Platform[] = [
  {
    id: "windows",
    name: "Windows",
    icon: Monitor,
    formats: [".msi", ".exe"],
    requirement: "Windows 10/11 · WebView2",
    note: "Assistente visual (.exe) e WiX (MSI) para instalação silenciosa.",
  },
  {
    id: "linux",
    name: "Linux",
    icon: Terminal,
    formats: [".AppImage", ".deb"],
    requirement: "Distribuições com WebKitGTK 4.1",
    note: "AppImage portátil e pacote Debian.",
  },
  {
    id: "macos",
    name: "macOS",
    icon: Apple,
    formats: [".dmg"],
    requirement: "macOS 11+ · universal (Intel e Apple Silicon)",
    note: "Um único DMG universal para as duas arquiteturas.",
  },
];

export interface StackEntry {
  layer: string;
  technology: string;
}

export const STACK: StackEntry[] = [
  { layer: "Aplicativo desktop", technology: "Tauri 2 + Rust" },
  { layer: "Interface", technology: "React 18 + TypeScript" },
  { layer: "Base visual", technology: "Tailwind CSS + Radix UI + lucide" },
  { layer: "Desenho", technology: "Excalidraw 0.18 (MIT)" },
  { layer: "Estado e histórico", technology: "Zustand + Immer" },
  { layer: "Persistência", technology: "SQLite (rusqlite) ou IndexedDB" },
  { layer: "Build e testes", technology: "Vite + Vitest" },
];

export const DATA_PATHS: { system: string; path: string }[] = [
  { system: "Windows", path: "%APPDATA%\\com.eliasnote.desktop" },
  { system: "macOS", path: "~/Library/Application Support/com.eliasnote.desktop" },
  { system: "Linux", path: "~/.local/share/com.eliasnote.desktop" },
  { system: "Navegador", path: "IndexedDB do próprio navegador" },
];

export const SHORTCUTS: { action: string; keys: string[] }[] = [
  { action: "Busca global", keys: ["Ctrl/Cmd", "K"] },
  { action: "Nova nota", keys: ["N"] },
  { action: "Nova tarefa", keys: ["T"] },
  { action: "Novo desenho Excalidraw", keys: ["D"] },
  { action: "Enquadrar quadro", keys: ["Shift", "1"] },
  { action: "Zoom 100%", keys: ["Ctrl/Cmd", "0"] },
  { action: "Alternar barra lateral", keys: ["Ctrl/Cmd", "B"] },
  { action: "Desfazer", keys: ["Ctrl/Cmd", "Z"] },
];

export const ELEMENTS: { name: string; description: string; dot: string }[] = [
  {
    name: "Nota",
    description: "Markdown com barra de formatação, prévia, contagem de palavras, título e cores.",
    dot: "bg-amber-400",
  },
  {
    name: "Texto",
    description: "Texto livre direto no canvas, sem cartão: cresce com o conteúdo e aceita cores.",
    dot: "bg-slate-400",
  },
  {
    name: "Cartão",
    description: "Título, descrição, etiqueta e cor para agrupar referências e resumos.",
    dot: "bg-sky-400",
  },
  {
    name: "Tarefa",
    description: "Concluir, prioridade e prazo; Enter cria a próxima tarefa da sequência.",
    dot: "bg-rose-400",
  },
  {
    name: "Checklist",
    description: "Itens editáveis com progresso, adicionar, remover e concluir.",
    dot: "bg-emerald-400",
  },
  {
    name: "Imagem e vídeo",
    description: "Anexo local, legenda, preenchimento ou conter e lightbox.",
    dot: "bg-violet-400",
  },
  {
    name: "Arquivo",
    description: "Nome, tipo, tamanho e download do anexo guardado no dispositivo.",
    dot: "bg-orange-300",
  },
  {
    name: "Link",
    description: "Título, descrição, URL e abertura no navegador padrão.",
    dot: "bg-sky-400",
  },
  {
    name: "Quadro",
    description: "Subquadro real com estatísticas, prévia colorida e abertura em aba.",
    dot: "bg-violet-400",
  },
  {
    name: "Coluna",
    description: "Filhos arrastáveis, recolher, redimensionar e menu de criação rápida.",
    dot: "bg-emerald-400",
  },
  {
    name: "Comentário",
    description: "Autor local, resolução, respostas e painel dedicado dentro do inspector.",
    dot: "bg-amber-400",
  },
  {
    name: "Desenho",
    description: "Excalidraw completo, miniatura no canvas, biblioteca local e exportação.",
    dot: "bg-rose-400",
  },
  {
    name: "Desenho em nota",
    description: "Vincule um desenho à nota: a miniatura aparece no cartão e abre o editor.",
    dot: "bg-violet-400",
  },
];

export const PRINCIPLES: { title: string; description: string }[] = [
  {
    title: "O arquivo é seu",
    description:
      "Quadros ficam em SQLite no desktop ou IndexedDB no navegador, com exportação para JSON e Markdown. Nada de formato fechado.",
  },
  {
    title: "Offline por padrão",
    description:
      "O app abre e funciona sem internet. Links abrem no navegador padrão; o conteúdo do workspace nunca sai do dispositivo.",
  },
  {
    title: "Sem contas e sem telemetria",
    description:
      "Não existe login, assinatura, sincronização ou servidor. A instalação não pede nenhum dado pessoal.",
  },
  {
    title: "Código aberto",
    description:
      "Código original sob licença MIT, bibliotecas com suas próprias licenças e nenhum asset proprietário do Milanote.",
  },
];

export const LIMITS: string[] = [
  "Não há autenticação, colaboração, servidor ou sincronização — por design.",
  "O histórico de desfazer/refazer é por sessão e não é persistido.",
  "O editor Excalidraw carrega sob demanda (~4,6 MB comprimido) na primeira abertura.",
  "A exportação de imagem captura a área enquadrada do canvas; para quadros grandes use escala 2x ou 3x.",
  "Os instaladores da release não são assinados, então o sistema pode exibir um aviso na primeira execução.",
];

export const TEMPLATES: string[] = [
  "Brainstorm",
  "Projeto",
  "Kanban",
  "Ata de reunião",
  "Pesquisa",
  "Moodboard",
  "Semana",
  "Roteiro",
  "Retrospectiva",
];
