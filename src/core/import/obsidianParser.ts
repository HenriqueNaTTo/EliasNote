import { parseExcalidrawScene } from "@/core/export/importer";
import type {
  ObsidianCanvasEdge,
  VaultAttachment,
  VaultCanvasNode,
  VaultDrawing,
  VaultEntry,
  VaultFileKind,
  VaultFolder,
  VaultLink,
  VaultModel,
  VaultNote,
} from "./vaultTypes";

const IGNORED_SEGMENTS = new Set([".obsidian", ".trash", ".git", ".github", "node_modules"]);
const NOTE_EXTENSIONS = new Set(["md", "markdown"]);
const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp", "avif", "svg", "bmp", "ico", "tiff"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "ogv", "mov", "m4v", "mkv"]);
const KNOWN_EXTENSIONS = new Set([
  ...NOTE_EXTENSIONS,
  ...IMAGE_EXTENSIONS,
  ...VIDEO_EXTENSIONS,
  "canvas",
  "excalidraw",
  "pdf",
  "txt",
  "csv",
  "json",
  "zip",
  "mp3",
  "wav",
  "ogg",
  "m4a",
  "flac",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
]);

const MIME_BY_EXTENSION: Record<string, string> = {
  md: "text/markdown",
  markdown: "text/markdown",
  canvas: "application/json",
  excalidraw: "application/json",
  txt: "text/plain",
  csv: "text/csv",
  json: "application/json",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  svg: "image/svg+xml",
  bmp: "image/bmp",
  ico: "image/x-icon",
  tiff: "image/tiff",
  mp4: "video/mp4",
  webm: "video/webm",
  ogv: "video/ogg",
  mov: "video/quicktime",
  m4v: "video/x-m4v",
  mkv: "video/x-matroska",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  m4a: "audio/mp4",
  flac: "audio/flac",
  pdf: "application/pdf",
  zip: "application/zip",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

const KIND_PRIORITY: Record<VaultFileKind, number> = {
  note: 0,
  canvas: 1,
  drawing: 2,
  attachment: 3,
};

export function normalizeVaultPath(path: string): string {
  return path
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/\/{2,}/g, "/")
    .replace(/^\.\//, "");
}

export function vaultDirname(path: string): string {
  const normalized = normalizeVaultPath(path);
  const index = normalized.lastIndexOf("/");
  return index === -1 ? "" : normalized.slice(0, index);
}

export function vaultBasename(path: string): string {
  const normalized = normalizeVaultPath(path);
  return normalized.slice(normalized.lastIndexOf("/") + 1);
}

export function vaultExtension(path: string): string {
  const name = vaultBasename(path);
  const dot = name.lastIndexOf(".");
  return dot <= 0 ? "" : name.slice(dot + 1).toLowerCase();
}

export function vaultStem(path: string): string {
  const name = vaultBasename(path);
  const dot = name.lastIndexOf(".");
  return dot <= 0 ? name : name.slice(0, dot);
}

export function isIgnoredVaultPath(path: string): boolean {
  const normalized = normalizeVaultPath(path);
  return normalized.split("/").some((segment) => segment.length === 0 || segment.startsWith(".") || IGNORED_SEGMENTS.has(segment));
}

export function mimeForVaultPath(path: string): string {
  return MIME_BY_EXTENSION[vaultExtension(path)] ?? "application/octet-stream";
}

export function attachmentKindForPath(path: string): "image" | "video" | "file" {
  const extension = vaultExtension(path);
  if (IMAGE_EXTENSIONS.has(extension)) return "image";
  if (VIDEO_EXTENSIONS.has(extension)) return "video";
  return "file";
}

function stripKnownExtension(path: string): string {
  const dot = path.lastIndexOf(".");
  if (dot <= 0) return path;
  return KNOWN_EXTENSIONS.has(path.slice(dot + 1).toLowerCase()) ? path.slice(0, dot) : path;
}

function resolveRelativePath(baseDir: string, target: string): string {
  const parts = [...baseDir.split("/"), ...target.split("/")];
  const stack: string[] = [];
  for (const part of parts) {
    if (!part || part === ".") continue;
    if (part === "..") stack.pop();
    else stack.push(part);
  }
  return stack.join("/");
}

function number(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function unquote(value: string): string {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseFrontmatterValue(value: string): string | string[] {
  const trimmed = value.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed
      .slice(1, -1)
      .split(/[,;]/)
      .map((item) => unquote(item))
      .filter(Boolean);
  }
  return unquote(trimmed);
}

/** Lê um subconjunto de YAML usado pelo Obsidian (tags, aliases, title). */
export function parseFrontmatter(source: string): {
  data: Record<string, string | string[]>;
  body: string;
} {
  const normalized = source.replace(/^\uFEFF/, "");
  const lines = normalized.split(/\r?\n/);
  if (lines[0]?.trim() !== "---") return { data: {}, body: normalized };
  const endIndex = lines.findIndex((line, index) => index > 0 && line.trim() === "---");
  if (endIndex === -1) return { data: {}, body: normalized };

  const data: Record<string, string | string[]> = {};
  let listKey: string | null = null;
  for (const line of lines.slice(1, endIndex)) {
    if (!line.trim()) continue;
    const listItem = /^\s*-\s+(.*)$/.exec(line);
    if (listItem && listKey) {
      const previous = data[listKey];
      const list = Array.isArray(previous) ? [...previous] : [];
      list.push(unquote(listItem[1]));
      data[listKey] = list;
      continue;
    }
    const pair = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line);
    if (!pair) {
      listKey = null;
      continue;
    }
    const [, key, rawValue] = pair;
    const parsed = parseFrontmatterValue(rawValue);
    data[key] = parsed;
    listKey = rawValue.trim() === "" ? key : null;
  }

  return { data, body: lines.slice(endIndex + 1).join("\n") };
}

export function extractInlineTags(body: string): string[] {
  const withoutCode = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/~~~[\s\S]*?~~~/g, " ")
    .replace(/`[^`\n]*`/g, " ");
  const tags = new Set<string>();
  for (const match of withoutCode.matchAll(/(^|[\s(])#([\p{L}\p{N}_/-]{1,80})/gu)) {
    tags.add(match[2]);
  }
  return Array.from(tags);
}

function toStringList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const values = Array.isArray(value) ? value : [value];
  return values
    .flatMap((item) => item.split(/[,;]/))
    .map((item) => item.trim().replace(/^#/, ""))
    .filter(Boolean);
}

function transformOutsideCode(text: string, transform: (chunk: string) => string): string {
  const pattern = /(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`)/g;
  let output = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null = null;
  while ((match = pattern.exec(text))) {
    output += transform(text.slice(lastIndex, match.index));
    output += match[0];
    lastIndex = pattern.lastIndex;
  }
  output += transform(text.slice(lastIndex));
  return output;
}

function processWikiLinks(body: string): { content: string; links: VaultLink[] } {
  const links: VaultLink[] = [];
  const pushLink = (raw: string, targetRaw: string, alias: string | undefined, embed: boolean): string => {
    let target = targetRaw.trim();
    if (target.startsWith("<") && target.endsWith(">")) target = target.slice(1, -1);
    let heading: string | undefined;
    const hashIndex = target.indexOf("#");
    if (hashIndex !== -1) {
      heading = target.slice(hashIndex + 1).trim();
      target = target.slice(0, hashIndex);
    }
    target = target.trim();
    if (!target) return alias || heading || "";

    const token = `\uE000${links.length}\uE001`;
    links.push({
      token,
      raw,
      target,
      heading: heading || undefined,
      alias: alias || undefined,
      embed,
      resolution: "unresolved",
    });
    return token;
  };

  const content = transformOutsideCode(body, (chunk) => {
    const withWikiLinks = chunk.replace(/!?\[\[([^\]\n]+)\]\]/g, (raw, inner: string) => {
      const embed = raw.startsWith("!");
      const pipeIndex = inner.indexOf("|");
      const targetPart = pipeIndex === -1 ? inner : inner.slice(0, pipeIndex);
      const alias = pipeIndex === -1 ? undefined : inner.slice(pipeIndex + 1).trim();
      return pushLink(raw, targetPart, alias, embed);
    });

    // Links/imagens Markdown relativos ao cofre (ex.: [Nota](Pasta/Nota.md)).
    return withWikiLinks.replace(
      /(!?)\[([^\]\n]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g,
      (raw, bang: string, label: string, target: string) => {
        if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(target)) return raw;
        return pushLink(raw, target, label, bang === "!");
      },
    );
  });

  return { content, links };
}

function emptyCanvas(): { nodes: VaultCanvasNode[]; edges: ObsidianCanvasEdge[] } {
  return { nodes: [], edges: [] };
}

export function parseObsidianCanvas(
  text: string,
): { nodes: VaultCanvasNode[]; edges: ObsidianCanvasEdge[] } | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const root = parsed as Record<string, unknown>;
  if (!Array.isArray(root.nodes)) return null;

  const nodes: VaultCanvasNode[] = [];
  for (const item of root.nodes) {
    if (!item || typeof item !== "object") continue;
    const raw = item as Record<string, unknown>;
    const id = typeof raw.id === "string" ? raw.id : "";
    const type = raw.type;
    if (!id || (type !== "text" && type !== "file" && type !== "link" && type !== "group")) continue;
    nodes.push({
      id,
      type,
      x: number(raw.x, 0),
      y: number(raw.y, 0),
      width: Math.max(60, number(raw.width, 240)),
      height: Math.max(40, number(raw.height, 160)),
      color: typeof raw.color === "string" ? raw.color : undefined,
      file: typeof raw.file === "string" ? raw.file : undefined,
      text: typeof raw.text === "string" ? raw.text : undefined,
      label: typeof raw.label === "string" ? raw.label : undefined,
      url: typeof raw.url === "string" ? raw.url : undefined,
    });
  }

  const edges: ObsidianCanvasEdge[] = [];
  if (Array.isArray(root.edges)) {
    for (const item of root.edges) {
      if (!item || typeof item !== "object") continue;
      const raw = item as Record<string, unknown>;
      const fromNode = typeof raw.fromNode === "string" ? raw.fromNode : "";
      const toNode = typeof raw.toNode === "string" ? raw.toNode : "";
      if (!fromNode || !toNode) continue;
      edges.push({
        id: typeof raw.id === "string" ? raw.id : `${fromNode}->${toNode}`,
        fromNode,
        toNode,
        label: typeof raw.label === "string" ? raw.label : undefined,
        color: typeof raw.color === "string" ? raw.color : undefined,
        fromEnd: typeof raw.fromEnd === "string" ? raw.fromEnd : undefined,
        toEnd: typeof raw.toEnd === "string" ? raw.toEnd : undefined,
      });
    }
  }

  return nodes.length === 0 && edges.length === 0 ? emptyCanvas() : { nodes, edges };
}

interface IndexedFile {
  kind: VaultFileKind;
  path: string;
  name: string;
  stem: string;
  aliases: string[];
}

function buildFileIndex(model: Omit<VaultModel, "folders" | "referencedAttachments" | "unresolvedLinks">): IndexedFile[] {
  const files: IndexedFile[] = [];
  for (const note of model.notes) {
    files.push({
      kind: "note",
      path: note.path,
      name: vaultBasename(note.path),
      stem: vaultStem(note.path),
      aliases: note.aliases,
    });
  }
  for (const canvas of model.canvases) {
    files.push({ kind: "canvas", path: canvas.path, name: vaultBasename(canvas.path), stem: canvas.name, aliases: [] });
  }
  for (const drawing of model.drawings) {
    files.push({ kind: "drawing", path: drawing.path, name: vaultBasename(drawing.path), stem: drawing.name, aliases: [] });
  }
  for (const attachment of model.attachments) {
    files.push({
      kind: "attachment",
      path: attachment.path,
      name: vaultBasename(attachment.path),
      stem: vaultStem(attachment.path),
      aliases: [],
    });
  }
  return files;
}

function pickFile(files: IndexedFile[]): IndexedFile | null {
  return [...files].sort((a, b) => KIND_PRIORITY[a.kind] - KIND_PRIORITY[b.kind] || a.path.localeCompare(b.path))[0] ?? null;
}

function resolveTarget(files: IndexedFile[], target: string, contextDir: string): IndexedFile | null {
  let cleaned = target.trim();
  if (!cleaned) return null;
  try {
    cleaned = decodeURIComponent(cleaned);
  } catch {
    /* mantém o texto original */
  }
  if (cleaned.startsWith("./") || cleaned.startsWith("../")) {
    cleaned = resolveRelativePath(contextDir, cleaned);
  }
  const lower = normalizeVaultPath(cleaned).toLowerCase();
  const lookups = new Set([lower, stripKnownExtension(lower)]);

  const exact = files.filter((file) => {
    const path = file.path.toLowerCase();
    return lookups.has(path) || lookups.has(stripKnownExtension(path));
  });
  if (exact.length > 0) return pickFile(exact);

  const base = lower.split("/").pop() ?? lower;
  const baseStem = stripKnownExtension(base);
  const byName = files.filter(
    (file) => file.stem.toLowerCase() === baseStem || file.name.toLowerCase() === base,
  );
  if (byName.length > 0) return pickFile(byName);

  const byAlias = files.filter((file) =>
    file.aliases.some((alias) => {
      const normalized = alias.toLowerCase();
      return normalized === lower || normalized === base || normalized === baseStem;
    }),
  );
  return pickFile(byAlias);
}

function collectFolders(paths: string[]): VaultFolder[] {
  const folders = new Map<string, VaultFolder>();
  for (const path of paths) {
    let directory = vaultDirname(path);
    while (directory) {
      if (!folders.has(directory)) {
        folders.set(directory, {
          path: directory,
          name: vaultBasename(directory),
          parentPath: vaultDirname(directory) || null,
        });
      }
      directory = vaultDirname(directory);
    }
  }
  return Array.from(folders.values()).sort(
    (a, b) =>
      a.path.split("/").length - b.path.split("/").length || a.path.localeCompare(b.path, "pt-BR"),
  );
}

/**
 * Lê as entradas de um cofre Obsidian. Arquivos internos (`.obsidian`, `.trash`)
 * são ignorados; notas, canvas, desenhos e anexos são catalogados.
 */
export function parseVaultEntries(entries: VaultEntry[], vaultName: string): VaultModel {
  const model: VaultModel = {
    vaultName: vaultName.trim() || "Cofre Obsidian",
    notes: [],
    canvases: [],
    drawings: [],
    attachments: [],
    folders: [],
    referencedAttachments: [],
    skipped: [],
    warnings: [],
    unresolvedLinks: 0,
  };

  const seen = new Set<string>();
  const sorted = [...entries].sort((a, b) => a.path.localeCompare(b.path, "pt-BR"));

  for (const entry of sorted) {
    const path = normalizeVaultPath(entry.path);
    if (!path || seen.has(path) || isIgnoredVaultPath(path)) continue;
    seen.add(path);
    const extension = vaultExtension(path);

    if (NOTE_EXTENSIONS.has(extension)) {
      if (typeof entry.text !== "string") {
        model.skipped.push(path);
        model.warnings.push(`Nota sem conteúdo legível: ${path}`);
        continue;
      }
      const { data, body } = parseFrontmatter(entry.text);
      const titleFromFrontmatter = typeof data.title === "string" ? data.title.trim() : "";
      const firstHeading = /^\s*#\s+(.+?)\s*$/m.exec(body);
      const title = titleFromFrontmatter || firstHeading?.[1].trim() || vaultStem(path);
      let content = body;
      if (firstHeading && body.slice(0, firstHeading.index).trim() === "") {
        content = body.slice(firstHeading.index + firstHeading[0].length).replace(/^\s*\r?\n/, "");
      }
      const { content: linkedContent, links } = processWikiLinks(content.trim());
      const frontmatterTags = toStringList(data.tags);
      const tags = Array.from(new Set([...frontmatterTags, ...extractInlineTags(content)])).map((tag) => tag.trim());
      const aliases = toStringList(data.aliases);

      const note: VaultNote = {
        path,
        title,
        content: linkedContent,
        tags,
        aliases,
        links,
      };
      model.notes.push(note);
      continue;
    }

    if (extension === "canvas") {
      const parsed = typeof entry.text === "string" ? parseObsidianCanvas(entry.text) : null;
      if (!parsed) {
        model.skipped.push(path);
        model.warnings.push(`Canvas inválido ignorado: ${path}`);
        continue;
      }
      model.canvases.push({ path, name: vaultStem(path), nodes: parsed.nodes, edges: parsed.edges });
      continue;
    }

    if (extension === "excalidraw") {
      const scene = typeof entry.text === "string" ? parseExcalidrawScene(entry.text) : null;
      if (!scene) {
        model.skipped.push(path);
        model.warnings.push(`Desenho inválido ignorado: ${path}`);
        continue;
      }
      const drawing: VaultDrawing = { path, name: vaultStem(path), scene };
      model.drawings.push(drawing);
      continue;
    }

    const attachment: VaultAttachment = {
      path,
      name: vaultBasename(path),
      mime: entry.mime || mimeForVaultPath(path),
      size: entry.size,
      kind: attachmentKindForPath(path),
    };
    model.attachments.push(attachment);
  }

  model.folders = collectFolders([
    ...model.notes.map((note) => note.path),
    ...model.canvases.map((canvas) => canvas.path),
    ...model.drawings.map((drawing) => drawing.path),
    ...model.attachments.map((attachment) => attachment.path),
  ]);

  const index = buildFileIndex(model);
  const referenced = new Set<string>();

  for (const note of model.notes) {
    for (const link of note.links) {
      const resolved = resolveTarget(index, link.target, vaultDirname(note.path));
      if (!resolved) {
        model.unresolvedLinks += 1;
        continue;
      }
      link.resolution = resolved.kind;
      link.resolvedPath = resolved.path;
      if (resolved.kind === "attachment") referenced.add(resolved.path);
    }
  }

  for (const canvas of model.canvases) {
    for (const node of canvas.nodes) {
      if (node.type !== "file" || !node.file) continue;
      const target = node.file.split("#")[0];
      const resolved = resolveTarget(index, target, vaultDirname(canvas.path));
      if (!resolved) {
        node.resolvedKind = undefined;
        node.resolvedPath = undefined;
        model.unresolvedLinks += 1;
        model.warnings.push(`Canvas ${canvas.name}: arquivo não encontrado (${target})`);
        continue;
      }
      node.resolvedKind = resolved.kind;
      node.resolvedPath = resolved.path;
      if (resolved.kind === "attachment") referenced.add(resolved.path);
    }
  }

  model.referencedAttachments = Array.from(referenced).sort();
  return model;
}
