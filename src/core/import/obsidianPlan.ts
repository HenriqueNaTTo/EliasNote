import { uid } from "@/lib/utils";
import type { EntityRef, NodeColor } from "@/core/domain/types";
import { refForBoard, refForNode } from "@/core/domain/refs";
import type {
  VaultBoardPlan,
  VaultCanvasNode,
  VaultImportPlan,
  VaultLink,
  VaultModel,
  VaultNodePlan,
  VaultPlanOptions,
} from "./vaultTypes";
import { vaultDirname, vaultStem } from "./obsidianParser";

const NOTE_WIDTH = 340;
const NOTE_HEIGHT = 280;
const NOTE_STEP_X = 400;
const NOTE_STEP_Y = 340;
const NOTE_COLUMNS = 3;
const NOTE_START_Y = 300;
const CHILD_WIDTH = 260;
const CHILD_HEIGHT = 170;
const CHILD_STEP = 300;
const MEDIA_X = 1340;
const MEDIA_WIDTH = 280;
const MEDIA_START_Y = 300;
const DRAWING_WIDTH = 380;
const DRAWING_HEIGHT = 300;

const FOLDER_COLORS: NodeColor[] = ["none", "sky", "mint", "sand", "lilac", "rose", "amber", "slate"];

function canvasColor(raw?: string): NodeColor {
  switch (raw) {
    case "1":
    case "red":
      return "rose";
    case "2":
    case "orange":
      return "sand";
    case "3":
    case "yellow":
      return "amber";
    case "4":
    case "green":
      return "mint";
    case "5":
    case "cyan":
      return "sky";
    case "6":
    case "purple":
      return "lilac";
    default:
      return "none";
  }
}

function linkLabel(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/[[\]]/g, "\\$&").replace(/\s+/g, " ").trim() || "link";
}

function markdownLink(label: string, href: string, title?: string): string {
  const safeTitle = title ? ` "${title.replace(/"/g, "").replace(/\s+/g, " ").trim()}"` : "";
  return `[${linkLabel(label)}](${href}${safeTitle})`;
}

function replaceTokens(content: string, resolve: (index: number) => string): string {
  return content.replace(/\uE000(\d+)\uE001/g, (_match, index: string) => resolve(Number(index)));
}

function splitCanvasText(text: string): { title: string; body: string } {
  const trimmed = text.trim();
  if (!trimmed) return { title: "Nota do canvas", body: "" };
  const lines = trimmed.split(/\r?\n/);
  const title = lines[0].replace(/^#{1,6}\s*/, "").trim().slice(0, 90);
  const body = lines.slice(1).join("\n").trim();
  return { title: title || "Nota do canvas", body };
}

interface RenderedNote {
  title: string;
  content: string;
  refs: EntityRef[];
  tags: string[];
}

/**
 * Converte o modelo do cofre em um plano completo de importação. Os IDs são
 * gerados aqui para que wiki-links, referências e conectores já apontem para os
 * elementos finais antes de qualquer mutação no store.
 */
export function createVaultPlan(model: VaultModel, options: VaultPlanOptions): VaultImportPlan {
  const warnings = [...model.warnings];
  const warningSet = new Set(warnings);
  const addWarning = (message: string) => {
    if (warningSet.has(message)) return;
    warningSet.add(message);
    warnings.push(message);
  };

  const rootBoardId = uid("board");
  const boards = new Map<string, VaultBoardPlan>();
  const folderBoardIds = new Map<string, string>([["", rootBoardId]]);
  const canvasBoardIds = new Map<string, string>();
  const noteNodeIds = new Map<string, string>();
  const drawingNodeIds = new Map<string, string>();
  const noteByPath = new Map(model.notes.map((note) => [note.path, note]));
  const drawingByPath = new Map(model.drawings.map((drawing) => [drawing.path, drawing]));
  const canvasByPath = new Map(model.canvases.map((canvas) => [canvas.path, canvas]));
  const attachmentByPath = new Map(model.attachments.map((attachment) => [attachment.path, attachment]));
  const renderedNotes = new Map<string, RenderedNote>();
  const mediaNodes = new Map<string, string>();
  const noteCursor = new Map<string, number>();
  const mediaCursor = new Map<string, number>();
  const childCursor = new Map<string, number>();

  const addBoard = (id: string, parentId: string | null, title: string, color: NodeColor): VaultBoardPlan => {
    const plan: VaultBoardPlan = {
      id,
      parentId,
      title: title.trim() || "Sem título",
      color,
      nodes: [],
      connectors: [],
      childBoardIds: [],
    };
    boards.set(id, plan);
    return plan;
  };

  addBoard(rootBoardId, null, options.rootBoardTitle || model.vaultName, "lilac");

  for (const folder of model.folders) {
    const boardId = uid("board");
    folderBoardIds.set(folder.path, boardId);
    const depth = folder.path.split("/").length;
    addBoard(boardId, folderBoardIds.get(folder.parentPath ?? "") ?? rootBoardId, folder.name, FOLDER_COLORS[depth % FOLDER_COLORS.length]);
  }

  for (const canvas of model.canvases) {
    const boardId = uid("board");
    canvasBoardIds.set(canvas.path, boardId);
    addBoard(boardId, folderBoardIds.get(vaultDirname(canvas.path)) ?? rootBoardId, canvas.name, "sky");
  }

  for (const note of model.notes) noteNodeIds.set(note.path, uid("node"));
  for (const drawing of model.drawings) drawingNodeIds.set(drawing.path, uid("node"));

  const childPosition = (boardId: string) => {
    const index = childCursor.get(boardId) ?? 0;
    childCursor.set(boardId, index + 1);
    return { x: 60 + index * CHILD_STEP, y: 60 };
  };

  const addChildBoardNode = (parentId: string, childId: string, title: string, color: NodeColor) => {
    const parent = boards.get(parentId);
    const child = boards.get(childId);
    if (!parent || !child) return;
    const position = childPosition(parentId);
    parent.nodes.push({
      id: uid("node"),
      type: "board",
      x: position.x,
      y: position.y,
      w: CHILD_WIDTH,
      h: CHILD_HEIGHT,
      color,
      fields: { title, childBoardId: childId },
    });
    if (!parent.childBoardIds.includes(childId)) parent.childBoardIds.push(childId);
  };

  const foldersByParent = new Map<string, string[]>();
  for (const folder of model.folders) {
    const parent = folder.parentPath ?? "";
    const list = foldersByParent.get(parent) ?? [];
    list.push(folder.path);
    foldersByParent.set(parent, list);
  }
  const canvasesByParent = new Map<string, string[]>();
  for (const canvas of model.canvases) {
    const parent = vaultDirname(canvas.path);
    const list = canvasesByParent.get(parent) ?? [];
    list.push(canvas.path);
    canvasesByParent.set(parent, list);
  }

  const boardScopes = ["", ...model.folders.map((folder) => folder.path)];
  for (const scope of boardScopes) {
    const parentBoardId = folderBoardIds.get(scope);
    if (!parentBoardId) continue;
    const childFolders = [...(foldersByParent.get(scope) ?? [])].sort((a, b) => a.localeCompare(b, "pt-BR"));
    const childCanvases = [...(canvasesByParent.get(scope) ?? [])].sort((a, b) => a.localeCompare(b, "pt-BR"));
    for (const folderPath of childFolders) {
      const childId = folderBoardIds.get(folderPath);
      const folder = model.folders.find((item) => item.path === folderPath);
      if (childId && folder) addChildBoardNode(parentBoardId, childId, folder.name, "none");
    }
    for (const canvasPath of childCanvases) {
      const childId = canvasBoardIds.get(canvasPath);
      const canvas = canvasByPath.get(canvasPath);
      if (childId && canvas) addChildBoardNode(parentBoardId, childId, canvas.name, "sky");
    }
  }

  const boardIdForNote = (path: string): string =>
    folderBoardIds.get(vaultDirname(path)) ?? rootBoardId;

  const createAttachmentNode = (
    attachmentPath: string,
    position: { x: number; y: number; w?: number; h?: number },
  ): VaultNodePlan | null => {
    const attachment = attachmentByPath.get(attachmentPath);
    if (!attachment) return null;
    const attachmentId = options.attachmentIds[attachmentPath];
    if (!attachmentId) {
      addWarning(`Anexo sem arquivo importado: ${attachment.name}`);
      return null;
    }
    const type = attachment.kind === "image" ? "image" : attachment.kind === "video" ? "video" : "file";
    const width = Math.max(160, Math.round(position.w ?? MEDIA_WIDTH));
    const height =
      type === "file" ? 84 : Math.max(110, Math.round(position.h ?? (type === "image" ? 200 : 180)));
    const node: VaultNodePlan = {
      id: uid("node"),
      type,
      x: Math.round(position.x),
      y: Math.round(position.y),
      w: width,
      h: height,
      color: "none",
      fields: {
        attachmentId,
        name: attachment.name,
        mime: attachment.mime,
        size: attachment.size,
        title: attachment.name,
        caption: attachment.name,
        fit: "cover",
      },
    };
    return node;
  };

  const ensureBoardMedia = (boardId: string, attachmentPath: string): string | null => {
    const key = `${boardId}::${attachmentPath}`;
    const existing = mediaNodes.get(key);
    if (existing) return existing;
    const attachment = attachmentByPath.get(attachmentPath);
    if (!attachment) return null;
    const y = mediaCursor.get(boardId) ?? MEDIA_START_Y;
    const node = createAttachmentNode(attachmentPath, {
      x: MEDIA_X,
      y,
      w: MEDIA_WIDTH,
      h: attachment.kind === "file" ? 84 : 200,
    });
    if (!node) return null;
    boards.get(boardId)?.nodes.push(node);
    mediaCursor.set(boardId, y + node.h + 30);
    mediaNodes.set(key, node.id);
    return node.id;
  };

  const attachmentsByBoard = new Map<string, Set<string>>();
  const addAttachmentToBoard = (boardId: string, path: string) => {
    const set = attachmentsByBoard.get(boardId) ?? new Set<string>();
    set.add(path);
    attachmentsByBoard.set(boardId, set);
  };

  for (const note of model.notes) {
    const boardId = boardIdForNote(note.path);
    for (const link of note.links) {
      if (link.resolution === "attachment" && link.resolvedPath) {
        addAttachmentToBoard(boardId, link.resolvedPath);
      }
    }
  }

  if (options.includeUnreferencedAttachments) {
    const referenced = new Set(model.referencedAttachments);
    for (const attachment of model.attachments) {
      if (referenced.has(attachment.path)) continue;
      addAttachmentToBoard(boardIdForNote(attachment.path), attachment.path);
    }
  }

  for (const [boardId, paths] of attachmentsByBoard) {
    for (const path of [...paths].sort()) ensureBoardMedia(boardId, path);
  }

  let resolvedLinks = 0;
  const renderLink = (note: VaultModel["notes"][number], link: VaultLink, boardId: string, refs: Set<EntityRef>): string => {
    const label =
      link.alias ||
      (link.heading ? `${vaultStem(link.target)} › ${link.heading}` : vaultStem(link.target)) ||
      "link";
    if (link.resolution === "unresolved" || !link.resolvedPath) {
      return label;
    }

    if (link.resolution === "note") {
      const targetId = noteNodeIds.get(link.resolvedPath);
      if (targetId) {
        resolvedLinks += 1;
        if (targetId !== noteNodeIds.get(note.path)) refs.add(refForNode(targetId));
        return markdownLink(label, `eliasnote://node/${targetId}`, link.resolvedPath);
      }
    }

    if (link.resolution === "canvas") {
      const targetId = canvasBoardIds.get(link.resolvedPath);
      if (targetId) {
        resolvedLinks += 1;
        refs.add(refForBoard(targetId));
        return markdownLink(label, `eliasnote://board/${targetId}`, link.resolvedPath);
      }
    }

    if (link.resolution === "drawing") {
      const targetId = drawingNodeIds.get(link.resolvedPath);
      if (targetId) {
        resolvedLinks += 1;
        refs.add(refForNode(targetId));
        return markdownLink(label, `eliasnote://node/${targetId}`, link.resolvedPath);
      }
    }

    if (link.resolution === "attachment") {
      const attachment = attachmentByPath.get(link.resolvedPath);
      const mediaId = ensureBoardMedia(boardId, link.resolvedPath);
      if (mediaId && attachment) {
        resolvedLinks += 1;
        refs.add(refForNode(mediaId));
        return markdownLink(link.alias || attachment.name, `eliasnote://node/${mediaId}`, link.resolvedPath);
      }
    }

    addWarning(`Referência não importada: ${link.target}`);
    return label;
  };

  const notePosition = (boardId: string): { x: number; y: number } => {
    const index = noteCursor.get(boardId) ?? 0;
    noteCursor.set(boardId, index + 1);
    const column = index % NOTE_COLUMNS;
    const row = Math.floor(index / NOTE_COLUMNS);
    return { x: 60 + column * NOTE_STEP_X, y: NOTE_START_Y + row * NOTE_STEP_Y };
  };

  const sortedNotes = [...model.notes].sort((a, b) => a.path.localeCompare(b.path, "pt-BR"));
  for (const note of sortedNotes) {
    const boardId = boardIdForNote(note.path);
    const board = boards.get(boardId);
    const nodeId = noteNodeIds.get(note.path);
    if (!board || !nodeId) continue;
    const refs = new Set<EntityRef>();
    const content = replaceTokens(note.content, (index) => {
      const link = note.links[index];
      return link ? renderLink(note, link, boardId, refs) : "";
    });
    renderedNotes.set(note.path, {
      title: note.title,
      content,
      refs: Array.from(refs),
      tags: note.tags,
    });
    const position = notePosition(boardId);
    board.nodes.push({
      id: nodeId,
      type: "note",
      x: position.x,
      y: position.y,
      w: NOTE_WIDTH,
      h: NOTE_HEIGHT,
      color: "none",
      fields: {
        title: note.title,
        content,
        tags: note.tags.length > 0 ? note.tags : undefined,
      },
      references: Array.from(refs),
    });
  }

  const drawingPosition = (boardId: string): { x: number; y: number } => {
    const index = noteCursor.get(boardId) ?? 0;
    noteCursor.set(boardId, index + 1);
    const column = index % NOTE_COLUMNS;
    const row = Math.floor(index / NOTE_COLUMNS);
    return { x: 60 + column * NOTE_STEP_X, y: NOTE_START_Y + row * NOTE_STEP_Y };
  };

  for (const drawing of [...model.drawings].sort((a, b) => a.path.localeCompare(b.path, "pt-BR"))) {
    const boardId = boardIdForNote(drawing.path);
    const board = boards.get(boardId);
    const nodeId = drawingNodeIds.get(drawing.path);
    if (!board || !nodeId) continue;
    const position = drawingPosition(boardId);
    board.nodes.push({
      id: nodeId,
      type: "drawing",
      x: position.x,
      y: position.y,
      w: DRAWING_WIDTH,
      h: DRAWING_HEIGHT,
      color: "none",
      fields: { title: drawing.name, scene: drawing.scene },
    });
  }

  for (const canvas of model.canvases) {
    const boardId = canvasBoardIds.get(canvas.path);
    const board = boardId ? boards.get(boardId) : undefined;
    if (!board || !boardId) continue;
    if (canvas.nodes.length === 0) continue;

    const offsetX = 80 - canvas.nodes.reduce((min, node) => Math.min(min, node.x), Number.POSITIVE_INFINITY);
    const offsetY = 80 - canvas.nodes.reduce((min, node) => Math.min(min, node.y), Number.POSITIVE_INFINITY);
    const planIds = new Map<string, string>();
    const groupPlans = new Map<string, VaultNodePlan>();
    const groups = canvas.nodes.filter((node) => node.type === "group");
    const others = canvas.nodes.filter((node) => node.type !== "group");

    const canvasPosition = (node: VaultCanvasNode) => ({
      x: Math.round(node.x + offsetX),
      y: Math.round(node.y + offsetY),
      w: Math.max(120, Math.round(node.width)),
      h: Math.max(60, Math.round(node.height)),
    });

    const missingFileCard = (node: VaultCanvasNode): VaultNodePlan => ({
      id: uid("node"),
      type: "card",
      ...canvasPosition(node),
      color: "rose",
      fields: {
        title: "Arquivo não encontrado",
        description: node.file ?? node.label ?? "Referência ausente no cofre.",
      },
    });

    const fileNode = (node: VaultCanvasNode): VaultNodePlan => {
      if (!node.resolvedKind || !node.resolvedPath) return missingFileCard(node);
      const position = canvasPosition(node);

      if (node.resolvedKind === "note") {
        const note = noteByPath.get(node.resolvedPath);
        const rendered = renderedNotes.get(node.resolvedPath);
        const originalId = noteNodeIds.get(node.resolvedPath);
        if (!note || !rendered) return missingFileCard(node);
        return {
          id: uid("node"),
          type: "note",
          ...position,
          color: canvasColor(node.color),
          fields: { title: note.title, content: rendered.content, tags: rendered.tags.length ? rendered.tags : undefined },
          references: originalId ? [refForNode(originalId)] : [],
        };
      }

      if (node.resolvedKind === "canvas") {
        const childBoardId = canvasBoardIds.get(node.resolvedPath);
        if (!childBoardId) return missingFileCard(node);
        return {
          id: uid("node"),
          type: "board",
          ...position,
          color: canvasColor(node.color),
          fields: { title: canvasByPath.get(node.resolvedPath)?.name ?? "Quadro", childBoardId },
          references: [refForBoard(childBoardId)],
        };
      }

      if (node.resolvedKind === "drawing") {
        const drawing = drawingByPath.get(node.resolvedPath);
        if (!drawing) return missingFileCard(node);
        return {
          id: uid("node"),
          type: "drawing",
          ...position,
          color: canvasColor(node.color),
          fields: { title: drawing.name, scene: drawing.scene },
        };
      }

      const attachment = attachmentByPath.get(node.resolvedPath);
      if (!attachment) return missingFileCard(node);
      const media = createAttachmentNode(node.resolvedPath, position);
      return (
        media ?? {
          id: uid("node"),
          type: "card",
          ...position,
          color: "sand",
          fields: { title: attachment.name, description: "Anexo sem arquivo importado." },
        }
      );
    };

    for (const raw of others) {
      let plan: VaultNodePlan;
      if (raw.type === "text") {
        const { title, body } = splitCanvasText(raw.text ?? "");
        plan = {
          id: uid("node"),
          type: "note",
          ...canvasPosition(raw),
          color: canvasColor(raw.color),
          fields: { title, content: body },
        };
      } else if (raw.type === "link") {
        plan = {
          id: uid("node"),
          type: "link",
          ...canvasPosition(raw),
          color: canvasColor(raw.color),
          fields: {
            title: raw.label || raw.url || "Link",
            url: raw.url ?? "",
            description: raw.label,
          },
        };
      } else {
        plan = fileNode(raw);
      }
      board.nodes.push(plan);
      planIds.set(raw.id, plan.id);
    }

    for (const raw of groups) {
      const plan: VaultNodePlan = {
        id: uid("node"),
        type: "column",
        ...canvasPosition(raw),
        color: canvasColor(raw.color),
        fields: { title: raw.label || "Grupo", collapsed: false },
      };
      board.nodes.push(plan);
      groupPlans.set(raw.id, plan);
      planIds.set(raw.id, plan.id);
    }

    for (const raw of others) {
      const planId = planIds.get(raw.id);
      if (!planId) continue;
      const plan = board.nodes.find((node) => node.id === planId);
      if (!plan) continue;
      const container = groups
        .filter(
          (group) =>
            raw.x >= group.x &&
            raw.y >= group.y &&
            raw.x + raw.width <= group.x + group.width &&
            raw.y + raw.height <= group.y + group.height,
        )
        .sort((a, b) => a.width * a.height - b.width * b.height)[0];
      if (!container) continue;
      const groupPlan = groupPlans.get(container.id);
      if (!groupPlan) continue;
      plan.parentId = groupPlan.id;
      plan.order = board.nodes.filter((node) => node.parentId === groupPlan.id).length;
    }

    for (const edge of canvas.edges) {
      const from = planIds.get(edge.fromNode);
      const to = planIds.get(edge.toNode);
      if (!from || !to || from === to) {
        addWarning(`Conexão ignorada no canvas ${canvas.name}`);
        continue;
      }
      board.connectors.push({
        id: uid("conn"),
        fromNodeId: from,
        toNodeId: to,
        label: edge.label,
        color: canvasColor(edge.color),
        arrowStart: edge.fromEnd === "arrow",
        arrowEnd: edge.toEnd !== "none",
        kind: "curve",
      });
    }
  }

  const plan: VaultImportPlan = {
    workspaceName: options.workspaceName.trim() || `Obsidian · ${model.vaultName}`,
    boards: Array.from(boards.values()),
    openBoardId: rootBoardId,
    stats: {
      folders: model.folders.length,
      notes: model.notes.length,
      canvases: model.canvases.length,
      drawings: model.drawings.length,
      attachments: Object.keys(options.attachmentIds).length,
      links: resolvedLinks,
      unresolved: model.unresolvedLinks,
      skipped: model.skipped.length,
    },
    warnings,
  };

  return plan;
}
