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

export type FeatureCategoryId = "canvas" | "elementos" | "desenho" | "organizacao" | "dados";

export interface Feature {
  id: string;
  category: FeatureCategoryId;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const FEATURE_CATEGORIES: { id: "todos" | FeatureCategoryId; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "canvas", label: "Canvas" },
  { id: "elementos", label: "Elementos" },
  { id: "desenho", label: "Desenho" },
  { id: "organizacao", label: "Organização" },
  { id: "dados", label: "Dados e integrações" },
];

export const FEATURES: Feature[] = [
  {
    id: "canvas-infinito",
    category: "canvas",
    title: "Canvas infinito",
    description:
      "Pan por roda, trackpad, botão do meio ou barra de espaço. Zoom de 25% a 200%, minimapa clicável e enquadrar com Shift+1.",
    icon: Maximize2,
  },
  {
    id: "encaixe-grade",
    category: "canvas",
    title: "Encaixe e alinhadores",
    description:
      "Grade opcional de 8, 16, 24 ou 32 px, alinhadores no inspector e movimento fino com as setas do teclado.",
    icon: LayoutGrid,
  },
  {
    id: "selecao-multipla",
    category: "canvas",
    title: "Seleção múltipla",
    description:
      "Caixa de seleção, Shift+clique e Ctrl/Cmd+A com ações em lote para duplicar, bloquear, ocultar e ordenar.",
    icon: MousePointer2,
  },
  {
    id: "mover-entre-quadros",
    category: "canvas",
    title: "Mover entre quadros",
    description:
      "Arraste a seleção para um cartão de quadro ou para a árvore lateral. Segure Alt para copiar em vez de mover.",
    icon: Layers,
  },
  {
    id: "tipos-de-elementos",
    category: "elementos",
    title: "13 tipos de elementos",
    description:
      "Notas, texto, cartões, tarefas, checklists, imagens, vídeos, arquivos, links, quadros, colunas, comentários e desenhos.",
    icon: StickyNote,
  },
  {
    id: "notas-markdown",
    category: "elementos",
    title: "Notas Markdown",
    description:
      "Barra de formatação, prévia, contagem de palavras, título e cores. Solte uma imagem na nota para embutir a miniatura.",
    icon: NotebookPen,
  },
  {
    id: "tarefas-checklists",
    category: "elementos",
    title: "Tarefas e checklists",
    description:
      "Conclua itens, defina prioridade e prazo, acompanhe o progresso e crie a próxima tarefa com Enter.",
    icon: ListChecks,
  },
  {
    id: "midia-local",
    category: "elementos",
    title: "Mídia local",
    description:
      "Imagens, vídeos e arquivos com anexo no dispositivo, legenda, lightbox e nenhum upload para servidores.",
    icon: Image,
  },
  {
    id: "colunas",
    category: "elementos",
    title: "Colunas inteligentes",
    description:
      "Arraste elementos para dentro, reordene, recolha, redimensione e mova a coluna inteira com os filhos.",
    icon: Columns3,
  },
  {
    id: "comentarios",
    category: "elementos",
    title: "Comentários locais",
    description:
      "Discussões com autor, respostas e resolução, sem depender de uma conta ou de um serviço externo.",
    icon: MessageCircle,
  },
  {
    id: "conectores",
    category: "elementos",
    title: "Conectores e setas",
    description:
      "Curva, reta ou cotovelo, com rótulos, cores, tracejado e setas nas pontas para mostrar relações.",
    icon: Link2,
  },
  {
    id: "excalidraw",
    category: "desenho",
    title: "Excalidraw nativo",
    description:
      "Editor em tela cheia com todas as ferramentas, salvamento automático, biblioteca local e miniaturas no canvas.",
    icon: PenTool,
  },
  {
    id: "mesclar-cenas",
    category: "desenho",
    title: "Mesclar cenas",
    description:
      "Combine um desenho com o clipboard, um arquivo .excalidraw ou outro desenho do workspace preservando bindings e imagens.",
    icon: Blocks,
  },
  {
    id: "exportar-desenho",
    category: "desenho",
    title: "PNG, SVG e PDF",
    description:
      "Exporte qualquer desenho nos três formatos direto do editor, sem sair do app e sem perder a cena original.",
    icon: FileDown,
  },
  {
    id: "quadros-aninhados",
    category: "organizacao",
    title: "Quadros aninhados",
    description:
      "Subquadros recursivos com árvore arrastável, duplicação, ordenação e tiles coloridos no canvas.",
    icon: LayoutDashboard,
  },
  {
    id: "workspaces-abas",
    category: "organizacao",
    title: "Workspaces e abas",
    description:
      "Vários workspaces independentes e abas por quadro, fechadas pelo botão, clique do meio ou Ctrl/Cmd+W.",
    icon: FolderTree,
  },
  {
    id: "busca-global",
    category: "organizacao",
    title: "Busca global",
    description:
      "Ctrl/Cmd+K procura em títulos, notas, tarefas, checklists, links, comentários, etiquetas e quadros.",
    icon: Search,
  },
  {
    id: "referencias",
    category: "organizacao",
    title: "Referências e backlinks",
    description:
      "Aponte quadros e elementos em Refs e veja quem referencia o item atual no painel de backlinks.",
    icon: GitBranch,
  },
  {
    id: "modelos",
    category: "organizacao",
    title: "9 modelos prontos",
    description:
      "Brainstorm, projeto, kanban, ata de reunião, pesquisa, moodboard, semana, roteiro e retrospectiva.",
    icon: Wand2,
  },
  {
    id: "autosave",
    category: "dados",
    title: "Autosave em SQLite",
    description:
      "Gravação incremental por quadro no desktop (SQLite) e no navegador (IndexedDB), com debounce de 700 ms.",
    icon: HardDrive,
  },
  {
    id: "backups",
    category: "dados",
    title: "Backups e restauração",
    description:
      "Snapshots automáticos por intervalo ou manuais, com retenção configurável e restauração pelo painel.",
    icon: Archive,
  },
  {
    id: "exportar-importar",
    category: "dados",
    title: "Exportar e importar",
    description:
      "PNG e PDF do quadro inteiro, Markdown, JSON reimportável e importação por arraste de arquivos e .excalidraw.",
    icon: Download,
  },
  {
    id: "obsidian",
    category: "dados",
    title: "Cofre do Obsidian",
    description:
      "Pastas viram quadros, notas viram Markdown com wiki-links, anexos ficam locais e .canvas vira subquadro com conectores.",
    icon: NotebookPen,
  },
  {
    id: "personalizacao",
    category: "dados",
    title: "Tema e personalização",
    description:
      "Claro, escuro ou sistema, seis cores de destaque, densidade, escala de UI, textura do canvas e atalhos remapeáveis.",
    icon: Palette,
  },
  {
    id: "historico",
    category: "dados",
    title: "Histórico confiável",
    description:
      "Undo e redo com transações: um arraste é uma entrada, e a digitação é agrupada de forma inteligente.",
    icon: Undo2,
  },
];
