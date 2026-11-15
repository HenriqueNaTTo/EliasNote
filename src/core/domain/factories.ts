import type { Viewport } from "@/lib/geometry";
import { uid } from "@/lib/utils";
import { COLUMN_HEADER_HEIGHT, COLUMN_ITEM_GAP, COLUMN_MIN_HEIGHT, COLUMN_PADDING } from "./constants";
import type {
  AppSettings,
  Board,
  CanvasNode,
  ChecklistItem,
  Connector,
  ConnectorKind,
  DrawingScene,
  NodeColor,
  NodeType,
  Tab,
  Workspace,
} from "./types";

export type NodeSeed = Partial<CanvasNode> & { type: NodeType };

const now = () => Date.now();

export function createChecklistItem(text = "", done = false): ChecklistItem {
  return { id: uid("item"), text, done };
}

export function createNode(boardId: string, seed: NodeSeed): CanvasNode {
  const timestamp = now();
  const node: CanvasNode = {
    ...seed,
    id: seed.id ?? uid("node"),
    boardId,
    type: seed.type,
    x: Math.round(seed.x ?? 0),
    y: Math.round(seed.y ?? 0),
    w: Math.round(seed.w ?? 280),
    h: Math.round(seed.h ?? 200),
    z: seed.z ?? timestamp,
    color: seed.color ?? "none",
    parentId: seed.parentId ?? null,
    order: seed.order,
    createdAt: seed.createdAt ?? timestamp,
    updatedAt: timestamp,
    locked: seed.locked ?? false,
    hidden: seed.hidden ?? false,
  };

  switch (node.type) {
    case "note":
      node.content = node.content ?? "";
      node.title = node.title ?? "";
      break;
    case "text":
      node.content = node.content ?? "";
      break;
    case "card":
      node.title = node.title ?? "Novo cartão";
      node.description = node.description ?? "";
      break;
    case "task":
      node.title = node.title ?? "Nova tarefa";
      node.done = node.done ?? false;
      node.priority = node.priority ?? "medium";
      break;
    case "checklist":
      node.title = node.title ?? "Checklist";
      node.items = node.items?.length ? node.items : [createChecklistItem("Primeiro item")];
      break;
    case "image":
      node.fit = node.fit ?? "cover";
      node.caption = node.caption ?? "";
      break;
    case "video":
      node.caption = node.caption ?? "";
      break;
    case "link":
      node.url = node.url ?? "";
      node.title = node.title ?? "Novo link";
      break;
    case "board":
      node.title = node.title ?? "Subquadro";
      break;
    case "column":
      node.title = node.title ?? "Coluna";
      node.h = Math.max(node.h, COLUMN_MIN_HEIGHT);
      break;
    case "drawing":
      node.title = node.title ?? "Desenho";
      node.scene = node.scene ?? createEmptyScene();
      break;
    case "comment":
      node.content = node.content ?? "";
      node.author = node.author ?? "Você";
      node.resolved = node.resolved ?? false;
      node.replies = node.replies ?? [];
      break;
    default:
      break;
  }

  return node;
}

export function createEmptyScene(): DrawingScene {
  return {
    elements: [],
    appState: { viewBackgroundColor: "transparent" },
    files: {},
    thumbnail: null,
    updatedAt: now(),
  };
}

export function createBoard(input: {
  id?: string;
  workspaceId: string;
  title?: string;
  parentId?: string | null;
  color?: NodeColor;
  icon?: string;
}): Board {
  const timestamp = now();
  return {
    id: input.id ?? uid("board"),
    workspaceId: input.workspaceId,
    parentId: input.parentId ?? null,
    title: input.title ?? "Sem título",
    color: input.color ?? "none",
    icon: input.icon,
    nodes: {},
    connectors: {},
    childOrder: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function createWorkspace(name = "Meu espaço", color: NodeColor = "none"): Workspace {
  const timestamp = now();
  return { id: uid("ws"), name, color, createdAt: timestamp, updatedAt: timestamp };
}

export function createTab(board: Board): Tab {
  return { id: uid("tab"), boardId: board.id, workspaceId: board.workspaceId };
}

export function cloneNode(node: CanvasNode, overrides: Partial<CanvasNode> = {}): CanvasNode {
  const timestamp = now();
  return {
    ...node,
    id: uid("node"),
    x: node.x + 32,
    y: node.y + 32,
    z: timestamp,
    parentId: null,
    order: undefined,
    createdAt: timestamp,
    updatedAt: timestamp,
    items: node.items?.map((item) => ({ ...item, id: uid("item") })),
    replies: node.replies?.map((reply) => ({ ...reply, id: uid("reply") })),
    scene: node.scene ? { ...node.scene, updatedAt: timestamp } : undefined,
    ...overrides,
  };
}

export function createConnector(
  boardId: string,
  fromNodeId: string | null,
  toNodeId: string | null,
  overrides: Partial<Connector> = {},
): Connector {
  const timestamp = now();
  return {
    id: uid("conn"),
    boardId,
    from: { nodeId: fromNodeId, x: 0, y: 0 },
    to: { nodeId: toNodeId, x: 0, y: 0 },
    kind: "curve" as ConnectorKind,
    color: "slate",
    arrowEnd: true,
    arrowStart: false,
    dashed: false,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}

/** Recalcula posições dos nós pertencentes a uma coluna. */
export function layoutColumnNodes(
  nodes: Record<string, CanvasNode>,
  column: CanvasNode,
  orderedIds?: string[],
): CanvasNode[] {
  const children = Object.values(nodes)
    .filter((node) => node.parentId === column.id)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.createdAt - b.createdAt);

  let ordered = children;
  if (orderedIds && orderedIds.length > 0) {
    const byId = new Map(children.map((child) => [child.id, child]));
    const explicit = orderedIds
      .map((id) => byId.get(id))
      .filter((child): child is CanvasNode => Boolean(child));
    const rest = children.filter((child) => !orderedIds.includes(child.id));
    ordered = [...explicit, ...rest];
  }

  const width = Math.max(120, column.w - COLUMN_PADDING * 2);
  let cursorY = column.y + COLUMN_HEADER_HEIGHT + COLUMN_PADDING;
  const updated: CanvasNode[] = [];
  ordered.forEach((child, index) => {
    const patched: CanvasNode = {
      ...child,
      parentId: column.id,
      order: index,
      x: column.x + COLUMN_PADDING,
      y: cursorY,
      w: width,
      updatedAt: now(),
    };
    cursorY += patched.h + COLUMN_ITEM_GAP;
    updated.push(patched);
  });
  return updated;
}

export function columnContentHeight(nodes: Record<string, CanvasNode>, columnId: string): number {
  const children = Object.values(nodes).filter((node) => node.parentId === columnId);
  const content = children.reduce((total, node) => total + node.h + COLUMN_ITEM_GAP, 0);
  return Math.max(COLUMN_MIN_HEIGHT, COLUMN_HEADER_HEIGHT + COLUMN_PADDING * 2 + content);
}

export function childNodesOf(nodes: Record<string, CanvasNode>, columnId: string): CanvasNode[] {
  return Object.values(nodes)
    .filter((node) => node.parentId === columnId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function makeViewport(x = 80, y = 40, zoom = 1): Viewport {
  return { x, y, zoom };
}

export interface SeedResult {
  workspaces: Record<string, Workspace>;
  workspaceOrder: string[];
  activeWorkspaceId: string;
  boards: Record<string, Board>;
  tabs: Tab[];
  activeTabId: string;
  viewports: Record<string, Viewport>;
}

/** Cria o conteúdo de boas-vindas usado no primeiro lançamento. */
export function createSeedState(_settings: AppSettings): SeedResult {
  const workspace = createWorkspace("Espaço pessoal", "lilac");
  const welcome = createBoard({
    workspaceId: workspace.id,
    title: "Bem-vindo ao EliasNote",
    icon: "sparkles",
    color: "lilac",
  });
  const child = createBoard({
    workspaceId: workspace.id,
    title: "Quadro aninhado",
    parentId: welcome.id,
    color: "sky",
  });
  welcome.childOrder = [child.id];

  const note = createNode(welcome.id, {
    type: "note",
    x: 96,
    y: 120,
    w: 330,
    h: 300,
    color: "amber",
    title: "Comece por aqui",
    content: [
      "Organize ideias no **canvas infinito**, sem limites artificiais.",
      "",
      "- Arraste itens pela barra inferior",
      "- Duplo clique edita o conteúdo",
      "- `Ctrl/Cmd + Z` desfaz alterações",
      "- `Ctrl/Cmd + K` abre a busca global",
      "",
      "Crie quadros aninhados e desenhos com o Excalidraw em tela cheia.",
    ].join("\n"),
  });

  const column = createNode(welcome.id, {
    type: "column",
    x: 500,
    y: 100,
    w: 330,
    h: 400,
    color: "sky",
    title: "Meu plano",
  });

  const checklist = createNode(welcome.id, {
    type: "checklist",
    x: 512,
    y: 158,
    w: 306,
    h: 210,
    parentId: column.id,
    order: 0,
    title: "Primeiros passos",
    items: [
      createChecklistItem("Explorar o canvas", true),
      createChecklistItem("Criar um quadro aninhado"),
      createChecklistItem("Experimentar o desenho Excalidraw"),
    ],
  });

  const task = createNode(welcome.id, {
    type: "task",
    x: 512,
    y: 378,
    w: 306,
    h: 64,
    parentId: column.id,
    order: 1,
    title: "Definir meu próximo projeto",
    priority: "high",
  });

  const boardNode = createNode(welcome.id, {
    type: "board",
    x: 900,
    y: 120,
    w: 300,
    h: 200,
    title: child.title,
    childBoardId: child.id,
  });

  const shortcuts = createNode(welcome.id, {
    type: "checklist",
    x: 900,
    y: 360,
    w: 300,
    h: 200,
    title: "Atalhos essenciais",
    items: [
      createChecklistItem("Busca global — Ctrl/Cmd + K", true),
      createChecklistItem("Nova nota — N", true),
      createChecklistItem("Nova coluna — Shift + K"),
    ],
  });

  const connector = createConnector(welcome.id, note.id, boardNode.id, { color: "slate" });
  welcome.connectors[connector.id] = connector;

  const childNote = createNode(child.id, {
    type: "note",
    x: 80,
    y: 80,
    w: 300,
    h: 200,
    color: "mint",
    title: "Ideia",
    content: "Quadros dentro de quadros organizam projetos grandes sem perder contexto.",
  });

  const nodes = [note, column, checklist, task, boardNode, shortcuts, childNote];
  for (const node of nodes) {
    const target = node.boardId === child.id ? child : welcome;
    target.nodes[node.id] = node;
  }

  const tab: Tab = { id: uid("tab"), boardId: welcome.id, workspaceId: workspace.id };

  return {
    workspaces: { [workspace.id]: workspace },
    workspaceOrder: [workspace.id],
    activeWorkspaceId: workspace.id,
    boards: { [welcome.id]: welcome, [child.id]: child },
    tabs: [tab],
    activeTabId: tab.id,
    viewports: {
      [welcome.id]: makeViewport(80, 40, 1),
      [child.id]: makeViewport(60, 40, 1),
    },
  };
}
