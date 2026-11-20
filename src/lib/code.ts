import DOMPurify from "dompurify";

/**
 * Realce de código do EliasNote.
 *
 * O highlight.js é carregado sob demanda (só quando existe código na tela) e as
 * gramáticas são registradas uma única vez. GDScript não vem no pacote, então a
 * gramática é declarada aqui; HLSL usa a gramática de GLSL (próxima o bastante).
 */

export const AUTO_LANGUAGE = "auto";
export const PLAINTEXT_LANGUAGE = "plaintext";
export const MAX_HIGHLIGHT_LENGTH = 40_000;

export interface CodeLanguageOption {
  id: string;
  label: string;
  aliases: string[];
  extensions: string[];
}

/** Linguagens oferecidas no seletor (fora o "Automático"). */
export const CODE_LANGUAGES: CodeLanguageOption[] = [
  {
    id: "gdscript",
    label: "GDScript (Godot)",
    aliases: ["gd", "godot", "gdscript"],
    extensions: ["gd"],
  },
  {
    id: "csharp",
    label: "C#",
    aliases: ["cs", "c#", "unity"],
    extensions: ["cs"],
  },
  {
    id: "cpp",
    label: "C / C++",
    aliases: ["c", "c++", "cc", "hpp", "h"],
    extensions: ["c", "h", "cpp", "cc", "cxx", "hpp"],
  },
  {
    id: "glsl",
    label: "Shader (GLSL/HLSL)",
    aliases: ["shader", "shaders", "hlsl", "frag", "vert", "wgsl"],
    extensions: ["glsl", "hlsl", "frag", "vert", "shader", "wgsl"],
  },
  { id: "lua", label: "Lua", aliases: ["lua"], extensions: ["lua"] },
  { id: "python", label: "Python", aliases: ["py"], extensions: ["py"] },
  {
    id: "javascript",
    label: "JavaScript",
    aliases: ["js", "jsx", "mjs", "node"],
    extensions: ["js", "jsx", "mjs"],
  },
  {
    id: "typescript",
    label: "TypeScript",
    aliases: ["ts", "tsx"],
    extensions: ["ts", "tsx"],
  },
  { id: "json", label: "JSON", aliases: ["jsonc", "json5"], extensions: ["json"] },
  { id: "yaml", label: "YAML", aliases: ["yml"], extensions: ["yaml", "yml"] },
  {
    id: "bash",
    label: "Shell",
    aliases: ["sh", "shell", "zsh", "console"],
    extensions: ["sh", "bash", "zsh"],
  },
  {
    id: "xml",
    label: "XML / HTML",
    aliases: ["html", "svg", "xhtml"],
    extensions: ["xml", "html", "svg"],
  },
  {
    id: "plaintext",
    label: "Texto puro",
    aliases: ["text", "txt", "none"],
    extensions: ["txt"],
  },
];

const ALIAS_MAP = new Map<string, string>();
const EXTENSION_MAP = new Map<string, string>();
for (const language of CODE_LANGUAGES) {
  ALIAS_MAP.set(language.id, language.id);
  for (const alias of language.aliases) ALIAS_MAP.set(alias, language.id);
  for (const extension of language.extensions) EXTENSION_MAP.set(extension, language.id);
}

/** Resolve alias/hljs-id para a linguagem canônica (desconhecida vira texto puro). */
export function normalizeLanguage(raw: string | null | undefined): string {
  const value = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/^language-/, "");
  if (!value || value === AUTO_LANGUAGE) return PLAINTEXT_LANGUAGE;
  return ALIAS_MAP.get(value) ?? PLAINTEXT_LANGUAGE;
}

/** Descobre a linguagem pela extensão do título (ex.: `player.gd`). */
export function languageFromPath(path: string | null | undefined): string | null {
  const match = /\.([A-Za-z0-9]+)\s*$/.exec(String(path ?? "").trim());
  if (!match) return null;
  return EXTENSION_MAP.get(match[1].toLowerCase()) ?? null;
}

export interface LanguageSource {
  language?: string;
  title?: string;
}

/** Linguagem efetiva do nó: explícita, ou inferida pelo nome do arquivo. */
export function resolveLanguage(node: LanguageSource): string {
  const explicit = node.language?.trim();
  if (explicit && explicit !== AUTO_LANGUAGE) return normalizeLanguage(explicit);
  return languageFromPath(node.title) ?? PLAINTEXT_LANGUAGE;
}

export function languageLabel(id: string): string {
  if (!id || id === AUTO_LANGUAGE) return "Automático";
  return CODE_LANGUAGES.find((language) => language.id === normalizeLanguage(id))?.label ?? "Texto puro";
}

export function countLines(source: string): number {
  if (!source) return 1;
  return source.split("\n").length;
}

export function escapeCode(source: string): string {
  return source
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type HighlightJs = typeof import("highlight.js/lib/core").default;

let corePromise: Promise<HighlightJs> | null = null;
const loadedGrammars = new Set<string>();

/** Gramática própria de GDScript (o highlight.js não embarca uma). */
const gdscriptGrammar: Parameters<HighlightJs["registerLanguage"]>[1] = (hljs) => ({
  name: "GDScript",
  aliases: ["gd"],
  keywords: {
    keyword:
      "and as assert await break breakpoint class class_name const continue elif else enum extends for func if in is match not or pass preload return self signal static super tool var void while yield",
    literal: "true false null",
    built_in:
      "PI TAU INF NAN bool int float String StringName NodePath Vector2 Vector2i Vector3 Vector3i Vector4 Rect2 Transform2D Transform3D Basis Quaternion Color Callable Signal Dictionary Array PackedByteArray PackedInt32Array PackedInt64Array PackedFloat32Array PackedFloat64Array PackedStringArray PackedVector2Array PackedVector3Array PackedColorArray Node Node2D Node3D Control Sprite2D AnimatedSprite2D TileMap TileMapLayer Camera2D Camera3D Area2D Area3D CharacterBody2D CharacterBody3D RigidBody2D RigidBody3D StaticBody2D StaticBody3D CollisionShape2D Label RichTextLabel",
  },
  contains: [
    hljs.HASH_COMMENT_MODE,
    hljs.NUMBER_MODE,
    { className: "string", begin: /"""/, end: /"""/, relevance: 2 },
    { className: "string", begin: /'''/, end: /'''/, relevance: 2 },
    hljs.QUOTE_STRING_MODE,
    { className: "meta", begin: /@[A-Za-z_]\w*/ },
    { className: "symbol", begin: /\$[A-Za-z0-9_/]+/ },
    { className: "title", begin: /\b[A-Za-z_]\w*(?=\s*\()/, relevance: 0 },
  ],
});

const grammarLoaders: Record<string, () => Promise<{ default: unknown }>> = {
  csharp: () => import("highlight.js/lib/languages/csharp"),
  cpp: () => import("highlight.js/lib/languages/cpp"),
  glsl: () => import("highlight.js/lib/languages/glsl"),
  lua: () => import("highlight.js/lib/languages/lua"),
  python: () => import("highlight.js/lib/languages/python"),
  javascript: () => import("highlight.js/lib/languages/javascript"),
  typescript: () => import("highlight.js/lib/languages/typescript"),
  json: () => import("highlight.js/lib/languages/json"),
  yaml: () => import("highlight.js/lib/languages/yaml"),
  bash: () => import("highlight.js/lib/languages/bash"),
  xml: () => import("highlight.js/lib/languages/xml"),
  plaintext: () => import("highlight.js/lib/languages/plaintext"),
};

async function getHighlighter(): Promise<HighlightJs> {
  if (!corePromise) {
    corePromise = import("highlight.js/lib/core").then((module) => module.default);
  }
  return corePromise;
}

async function ensureGrammar(hljs: HighlightJs, id: string): Promise<boolean> {
  if (loadedGrammars.has(id)) return true;
  if (id === "gdscript") {
    hljs.registerLanguage("gdscript", gdscriptGrammar);
    loadedGrammars.add(id);
    return true;
  }
  const loader = grammarLoaders[id];
  if (!loader) return false;
  try {
    const module = await loader();
    hljs.registerLanguage(id, module.default as Parameters<HighlightJs["registerLanguage"]>[1]);
    loadedGrammars.add(id);
    return true;
  } catch {
    return false;
  }
}

/**
 * Devolve HTML realçado (já sanitizado) para o código informado.
 * Linguagens desconhecidas, trechos vazios ou muito longos caem em texto puro.
 */
export async function highlightCode(
  source: string,
  language: string,
  limit = MAX_HIGHLIGHT_LENGTH,
): Promise<string> {
  const code = source ?? "";
  if (!code.trim()) return "";
  const id = normalizeLanguage(language);
  if (id === PLAINTEXT_LANGUAGE || code.length > limit) return escapeCode(code);
  try {
    const hljs = await getHighlighter();
    if (!(await ensureGrammar(hljs, id))) return escapeCode(code);
    const html = hljs.highlight(code, { language: id, ignoreIllegals: true }).value;
    return DOMPurify.sanitize(html, { ALLOWED_TAGS: ["span"], ALLOWED_ATTR: ["class"] });
  } catch {
    return escapeCode(code);
  }
}
