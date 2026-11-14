import type { Point } from "@/lib/geometry";
import {
  columnContentHeight,
  createChecklistItem,
  createConnector,
  createNode,
  layoutColumnNodes,
} from "./factories";
import type {
  Board,
  CanvasNode,
  Connector,
  NodeColor,
  NodeType,
  TemplateDefinition,
  TemplateItem,
  TemplatePayload,
} from "./types";

interface ItemOptions {
  w?: number;
  h?: number;
  color?: NodeColor;
  fields?: Partial<CanvasNode>;
  children?: TemplateItem[];
}

function item(key: string, type: NodeType, x: number, y: number, options: ItemOptions = {}): TemplateItem {
  const defaults: Record<NodeType, { w: number; h: number }> = {
    note: { w: 300, h: 240 },
    card: { w: 260, h: 160 },
    task: { w: 280, h: 64 },
    checklist: { w: 290, h: 210 },
    image: { w: 300, h: 220 },
    video: { w: 340, h: 220 },
    file: { w: 280, h: 84 },
    link: { w: 290, h: 140 },
    board: { w: 300, h: 190 },
    column: { w: 320, h: 320 },
    drawing: { w: 420, h: 300 },
    comment: { w: 260, h: 160 },
  };
  const size = defaults[type];
  return {
    key,
    type,
    x,
    y,
    w: options.w ?? size.w,
    h: options.h ?? size.h,
    fields: { color: options.color ?? "none", ...options.fields },
    children: options.children,
  };
}

const note = (key: string, x: number, y: number, title: string, content: string, color: NodeColor = "amber", h = 240) =>
  item(key, "note", x, y, { color, h, fields: { title, content } });

const card = (key: string, x: number, y: number, title: string, description = "", color: NodeColor = "none") =>
  item(key, "card", x, y, { color, fields: { title, description } });

const task = (key: string, x: number, y: number, title: string, priority: "low" | "medium" | "high" = "medium") =>
  item(key, "task", x, y, { fields: { title, priority } });

const checklist = (
  key: string,
  x: number,
  y: number,
  title: string,
  items: string[],
  color: NodeColor = "none",
) =>
  item(key, "checklist", x, y, {
    color,
    fields: { title, items: items.map((text) => createChecklistItem(text)) },
  });

const column = (key: string, x: number, y: number, title: string, color: NodeColor, children: TemplateItem[]) =>
  item(key, "column", x, y, { color, h: 340, children, fields: { title } });

const drawing = (key: string, x: number, y: number, title: string) =>
  item(key, "drawing", x, y, { fields: { title } });

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: "blank",
    name: "Quadro em branco",
    description: "Um canvas limpo com uma nota de orientação para começar.",
    category: "criativo",
    accent: "none",
    build: () => ({
      title: "Novo quadro",
      items: [note("start", 120, 120, "Nota inicial", "Escreva aqui suas primeiras ideias.")],
    }),
  },
  {
    id: "brainstorm",
    name: "Brainstorm visual",
    description: "Mural de ideias soltas com coluna de priorização.",
    category: "criativo",
    accent: "amber",
    build: () => ({
      title: "Brainstorm",
      items: [
        note(
          "brief",
          100,
          100,
          "Pergunta central",
          "Qual problema estamos resolvendo e para quem?",
          "sand",
          220,
        ),
        card("idea-1", 100, 360, "Ideia 1", "Descreva em uma frase", "amber"),
        card("idea-2", 400, 360, "Ideia 2", "Descreva em uma frase", "rose"),
        card("idea-3", 700, 360, "Ideia 3", "Descreva em uma frase", "sky"),
        column("pick", 100, 600, "Prioridades", "mint", [
          task("p1", 0, 0, "Validar a ideia mais promissora", "high"),
          task("p2", 0, 0, "Conversar com 3 pessoas do público"),
          task("p3", 0, 0, "Esboçar um protótipo rápido", "low"),
        ]),
      ],
    }),
  },
  {
    id: "project",
    name: "Planejamento de projeto",
    description: "Colunas de backlog, execução e concluído com tarefas e checklist de entrega.",
    category: "planejamento",
    accent: "sky",
    build: () => ({
      title: "Plano de projeto",
      items: [
        note(
          "goal",
          100,
          100,
          "Objetivo do projeto",
          "**Resultado esperado:**\n\n**Prazo:**\n\n**Responsável:**",
          "sky",
          220,
        ),
        column("backlog", 100, 360, "A fazer", "slate", [
          task("b1", 0, 0, "Levantar requisitos"),
          task("b2", 0, 0, "Definir escopo mínimo"),
        ]),
        column("doing", 460, 360, "Em andamento", "amber", [task("d1", 0, 0, "Construir primeira versão", "high")]),
        column("done", 820, 360, "Concluído", "mint", [task("c1", 0, 0, "Alinhar com o time")]),
        checklist("delivery", 1180, 100, "Antes de entregar", [
          "Revisar conteúdo",
          "Validar com o responsável",
          "Exportar e arquivar",
        ]),
      ],
    }),
  },
  {
    id: "kanban",
    name: "Kanban",
    description: "Fluxo contínuo com três colunas e tarefas de exemplo.",
    category: "planejamento",
    accent: "mint",
    build: () => ({
      title: "Kanban",
      items: [
        column("todo", 100, 100, "A fazer", "slate", [
          task("t1", 0, 0, "Refinar ideias"),
          task("t2", 0, 0, "Estimar esforço"),
        ]),
        column("doing", 460, 100, "Fazendo", "amber", [task("t3", 0, 0, "Implementar fluxo principal", "high")]),
        column("review", 820, 100, "Revisão", "sky", [task("t4", 0, 0, "Revisar com o time")]),
        column("done", 1180, 100, "Feito", "mint", [task("t5", 0, 0, "Configurar ambiente")]),
      ],
    }),
  },
  {
    id: "meeting",
    name: "Ata de reunião",
    description: "Pauta, decisões, tarefas e um desenho para explicar ideias.",
    category: "projeto",
    accent: "lilac",
    build: () => ({
      title: "Ata de reunião",
      items: [
        note(
          "agenda",
          100,
          100,
          "Pauta",
          "1. Contexto\n2. Decisões necessárias\n3. Próximos passos",
          "lilac",
          240,
        ),
        note("decisions", 440, 100, "Decisões", "- ", "mint", 240),
        checklist("actions", 780, 100, "Ações", ["Responsável — ação — prazo"], "sky"),
        drawing("sketch", 100, 380, "Rascunho da solução"),
      ],
    }),
  },
  {
    id: "research",
    name: "Pesquisa e estudo",
    description: "Fontes, perguntas e insights em colunas com espaço para anotações.",
    category: "estudo",
    accent: "rose",
    build: () => ({
      title: "Pesquisa",
      items: [
        note("question", 100, 100, "Pergunta de pesquisa", "O que quero descobrir?", "rose", 200),
        column("sources", 100, 340, "Fontes", "sky", [
          card("s1", 0, 0, "Fonte 1", "Autor, ano e link"),
          card("s2", 0, 0, "Fonte 2", "Autor, ano e link"),
        ]),
        column("insights", 460, 340, "Insights", "mint", [
          note("i1", 0, 0, "Insight", "Escreva a descoberta principal", "mint", 160),
        ]),
        column("open", 820, 340, "Perguntas abertas", "amber", [
          note("q1", 0, 0, "Pergunta", "O que ainda não sei?", "amber", 160),
        ]),
      ],
    }),
  },
  {
    id: "moodboard",
    name: "Moodboard",
    description: "Referências visuais em cartões coloridos com direção criativa.",
    category: "criativo",
    accent: "sand",
    build: () => ({
      title: "Moodboard",
      items: [
        note("direction", 100, 100, "Direção criativa", "Tom, textura, paleta, referências.", "sand", 200),
        card("ref-1", 100, 340, "Referência 1", "Adicione uma imagem com duplo clique", "rose"),
        card("ref-2", 400, 340, "Referência 2", "Adicione uma imagem com duplo clique", "sky"),
        card("ref-3", 700, 340, "Referência 3", "Adicione uma imagem com duplo clique", "mint"),
        card("ref-4", 100, 540, "Referência 4", "Adicione uma imagem com duplo clique", "amber"),
        drawing("palette", 700, 540, "Paleta e esboços"),
      ],
    }),
  },
  {
    id: "weekly",
    name: "Planejamento semanal",
    description: "Foco da semana, prioridades e revisão de sexta.",
    category: "pessoal",
    accent: "amber",
    build: () => ({
      title: "Minha semana",
      items: [
        note("focus", 100, 100, "Foco da semana", "Uma frase que resume o essencial.", "amber", 200),
        checklist("priorities", 440, 100, "Prioridades", ["Prioridade 1", "Prioridade 2", "Prioridade 3"], "none"),
        column("mon-wed", 100, 340, "Início da semana", "sky", [task("m1", 0, 0, "Planejar entregas"), task("m2", 0, 0, "Reunião de alinhamento")]),
        column("thu-fri", 460, 340, "Fim da semana", "mint", [task("f1", 0, 0, "Revisar progresso"), task("f2", 0, 0, "Preparar próxima semana")]),
        drawing("notes", 820, 340, "Anotações livres"),
      ],
    }),
  },
  {
    id: "writing",
    name: "Roteiro de escrita",
    description: "Estrutura de texto com cenas, referências e checklist de revisão.",
    category: "criativo",
    accent: "slate",
    build: () => ({
      title: "Roteiro",
      items: [
        note("premise", 100, 100, "Premissa", "Sobre o que é este texto?", "slate", 220),
        column("scenes", 440, 100, "Blocos", "lilac", [
          note("scene-1", 0, 0, "Abertura", "Gancho inicial", "lilac", 150),
          note("scene-2", 0, 0, "Desenvolvimento", "Conflito e virada", "lilac", 150),
          note("scene-3", 0, 0, "Fechamento", "Resolução", "lilac", 150),
        ]),
        checklist("review", 780, 100, "Revisão", ["Ler em voz alta", "Cortar excessos", "Verificar ritmo"], "mint"),
        drawing("arc", 100, 380, "Arco narrativo"),
      ],
    }),
  },
  {
    id: "retro",
    name: "Retrospectiva",
    description: "O que funcionou, o que não funcionou e ações de melhoria.",
    category: "projeto",
    accent: "rose",
    build: () => ({
      title: "Retrospectiva",
      items: [
        column("good", 100, 100, "Funcionou bem", "mint", [note("g1", 0, 0, "Ponto positivo", "Descreva", "mint", 150)]),
        column("bad", 460, 100, "Precisa melhorar", "rose", [note("b1", 0, 0, "Ponto de atenção", "Descreva", "rose", 150)]),
        column("actions", 820, 100, "Ações", "sky", [task("a1", 0, 0, "Definir uma ação concreta", "high")]),
      ],
    }),
  },
];

export function getTemplate(id: string): TemplateDefinition | undefined {
  return TEMPLATES.find((template) => template.id === id);
}

export function templateCategories(): { id: TemplateDefinition["category"]; label: string }[] {
  return [
    { id: "planejamento", label: "Planejamento" },
    { id: "criativo", label: "Criativo" },
    { id: "projeto", label: "Projeto" },
    { id: "estudo", label: "Estudo" },
    { id: "pessoal", label: "Pessoal" },
  ];
}

/**
 * Materializa um template dentro de um quadro, preservando o vínculo das colunas
 * com seus itens e conectores declarativos.
 */
export function instantiateTemplate(
  board: Board,
  payload: TemplatePayload,
  origin: Point,
): { nodes: CanvasNode[]; connectors: Connector[] } {
  const created: CanvasNode[] = [];
  const byKey = new Map<string, CanvasNode>();

  const materialize = (templateItem: TemplateItem, parentId: string | null, order?: number): CanvasNode => {
    const node = createNode(board.id, {
      type: templateItem.type,
      x: origin.x + templateItem.x,
      y: origin.y + templateItem.y,
      w: templateItem.w,
      h: templateItem.h,
      parentId,
      order,
      ...templateItem.fields,
    });
    created.push(node);
    byKey.set(templateItem.key, node);
    return node;
  };

  for (const templateItem of payload.items) {
    const node = materialize(templateItem, null);
    templateItem.children?.forEach((child, index) => {
      materialize(child, node.id, index);
    });
  }

  // Layout das colunas depois que todos os filhos existem.
  const record: Record<string, CanvasNode> = {};
  for (const node of created) record[node.id] = node;
  for (const node of created) {
    if (node.type !== "column") continue;
    const laidOut = layoutColumnNodes(record, node);
    for (const child of laidOut) {
      record[child.id] = child;
      const index = created.findIndex((candidate) => candidate.id === child.id);
      if (index >= 0) created[index] = child;
    }
    node.h = Math.max(node.h, columnContentHeight(record, node.id));
  }

  const connectors: Connector[] = [];
  for (const spec of payload.connectors ?? []) {
    const from = byKey.get(spec.fromKey);
    const to = byKey.get(spec.toKey);
    if (!from || !to) continue;
    connectors.push(
      createConnector(board.id, from.id, to.id, {
        kind: spec.kind ?? "curve",
        label: spec.label,
        color: "lilac",
      }),
    );
  }

  return { nodes: created, connectors };
}

/** Extrai um modelo reutilizável a partir de um quadro existente. */
export function boardToTemplatePayload(board: Board, name?: string): TemplatePayload {
  const nodes = Object.values(board.nodes).filter((node) => node.type !== "board" && !node.hidden);
  const roots = nodes.filter((node) => !node.parentId || !board.nodes[node.parentId]);
  const included = new Set<string>();
  const minX = Math.min(...roots.map((node) => node.x), 0);
  const minY = Math.min(...roots.map((node) => node.y), 0);

  const fieldsOf = (node: CanvasNode): Partial<CanvasNode> => {
    const fields: Partial<CanvasNode> = { color: node.color };
    if (node.title) fields.title = node.title;
    if (node.content) fields.content = node.content;
    if (node.description) fields.description = node.description;
    if (node.label) fields.label = node.label;
    if (node.done !== undefined) fields.done = node.done;
    if (node.due) fields.due = node.due;
    if (node.priority) fields.priority = node.priority;
    if (node.items?.length) fields.items = node.items.map((item) => ({ ...item }));
    if (node.caption) fields.caption = node.caption;
    if (node.fit) fields.fit = node.fit;
    if (node.url) fields.url = node.url;
    if (node.name) fields.name = node.name;
    if (node.mime) fields.mime = node.mime;
    if (node.author) fields.author = node.author;
    if (node.resolved !== undefined) fields.resolved = node.resolved;
    if (node.replies?.length) fields.replies = node.replies.map((reply) => ({ ...reply }));
    if (node.tags?.length) fields.tags = [...node.tags];
    if (node.scene) {
      fields.scene = {
        ...node.scene,
        elements: node.scene.elements.map((element) => ({ ...(element as Record<string, unknown>) })),
        appState: { ...node.scene.appState },
        files: { ...node.scene.files },
      };
    }
    return fields;
  };

  const items: TemplateItem[] = roots.map((node) => {
    included.add(node.id);
    const children =
      node.type === "column"
        ? nodes
            .filter((child) => child.parentId === node.id)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((child) => {
              included.add(child.id);
              return {
                key: child.id,
                type: child.type,
                x: 0,
                y: 0,
                w: child.w,
                h: child.h,
                fields: fieldsOf(child),
              };
            })
        : undefined;
    return {
      key: node.id,
      type: node.type,
      x: node.x - minX,
      y: node.y - minY,
      w: node.w,
      h: node.h,
      fields: fieldsOf(node),
      children,
    };
  });

  const connectors = Object.values(board.connectors)
    .filter(
      (connector) =>
        connector.from.nodeId &&
        connector.to.nodeId &&
        included.has(connector.from.nodeId) &&
        included.has(connector.to.nodeId),
    )
    .map((connector) => ({
      fromKey: connector.from.nodeId as string,
      toKey: connector.to.nodeId as string,
      label: connector.label,
      kind: connector.kind,
    }));

  return {
    title: name ?? board.title,
    description: board.description,
    items,
    connectors,
  };
}
