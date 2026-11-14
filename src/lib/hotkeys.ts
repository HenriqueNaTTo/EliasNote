export interface ShortcutDefinition {
  id: string;
  label: string;
  group: "arquivo" | "edição" | "canvas" | "navegação" | "visualização";
  combo: string;
}

/**
 * Combos usam `Mod` para representar Ctrl no Windows/Linux e Cmd no macOS.
 * A ordem canônica é: Mod, Alt, Shift, tecla.
 */
export const SHORTCUTS: ShortcutDefinition[] = [
  { id: "search", label: "Busca global", group: "navegação", combo: "Mod+K" },
  { id: "new-note", label: "Nova nota", group: "edição", combo: "N" },
  { id: "new-card", label: "Novo cartão", group: "edição", combo: "C" },
  { id: "new-task", label: "Nova tarefa", group: "edição", combo: "T" },
  { id: "new-checklist", label: "Novo checklist", group: "edição", combo: "L" },
  { id: "new-column", label: "Nova coluna", group: "edição", combo: "Mod+Shift+K" },
  { id: "new-board", label: "Novo quadro", group: "arquivo", combo: "Mod+Shift+N" },
  { id: "new-drawing", label: "Novo desenho", group: "edição", combo: "D" },
  { id: "new-comment", label: "Novo comentário", group: "edição", combo: "M" },
  { id: "connector-tool", label: "Ferramenta conector", group: "canvas", combo: "R" },
  { id: "select-tool", label: "Ferramenta seleção", group: "canvas", combo: "V" },
  { id: "pan-tool", label: "Ferramenta mão", group: "canvas", combo: "H" },
  { id: "undo", label: "Desfazer", group: "edição", combo: "Mod+Z" },
  { id: "redo", label: "Refazer", group: "edição", combo: "Mod+Shift+Z" },
  { id: "duplicate", label: "Duplicar seleção", group: "edição", combo: "Mod+D" },
  { id: "delete", label: "Excluir seleção", group: "edição", combo: "Delete" },
  { id: "select-all", label: "Selecionar tudo", group: "edição", combo: "Mod+A" },
  { id: "add-child-board", label: "Abrir/entrar no quadro", group: "navegação", combo: "Mod+Enter" },
  { id: "close-tab", label: "Fechar aba", group: "navegação", combo: "Mod+W" },
  { id: "next-tab", label: "Próxima aba", group: "navegação", combo: "Mod+Tab" },
  { id: "zoom-in", label: "Aumentar zoom", group: "visualização", combo: "Mod+=" },
  { id: "zoom-out", label: "Diminuir zoom", group: "visualização", combo: "Mod+-" },
  { id: "zoom-reset", label: "Zoom 100%", group: "visualização", combo: "Mod+0" },
  { id: "zoom-fit", label: "Enquadrar quadro", group: "visualização", combo: "Shift+1" },
  { id: "toggle-sidebar", label: "Alternar barra lateral", group: "visualização", combo: "Mod+B" },
  { id: "toggle-inspector", label: "Alternar inspector", group: "visualização", combo: "Mod+Shift+I" },
  { id: "save-now", label: "Salvar agora", group: "arquivo", combo: "Mod+S" },
  { id: "export", label: "Exportar quadro", group: "arquivo", combo: "Mod+Shift+E" },
  { id: "settings", label: "Configurações", group: "arquivo", combo: "Mod+," },
  { id: "backups", label: "Backups", group: "arquivo", combo: "Mod+Shift+B" },
  { id: "templates", label: "Templates", group: "arquivo", combo: "Mod+Shift+T" },
  { id: "toggle-theme", label: "Alternar tema", group: "visualização", combo: "Mod+Shift+L" },
];

export const SHORTCUT_MAP: Record<string, ShortcutDefinition> = SHORTCUTS.reduce(
  (acc, shortcut) => {
    acc[shortcut.id] = shortcut;
    return acc;
  },
  {} as Record<string, ShortcutDefinition>,
);

const IS_MAC =
  typeof navigator !== "undefined" && /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent);

function normalizeKey(key: string): string {
  if (key === " ") return "Space";
  if (key === "Escape") return "Esc";
  const map: Record<string, string> = {
    ArrowUp: "ArrowUp",
    ArrowDown: "ArrowDown",
    ArrowLeft: "ArrowLeft",
    ArrowRight: "ArrowRight",
    "+": "=",
    _: "-",
  };
  if (map[key]) return map[key];
  if (key.length === 1) return key.toUpperCase();
  return key;
}

/** Converte um evento de teclado no formato canônico de atalho. */
export function comboFromEvent(event: KeyboardEvent | React.KeyboardEvent): string {
  const parts: string[] = [];
  if (event.metaKey || event.ctrlKey) parts.push("Mod");
  if (event.altKey) parts.push("Alt");
  if (event.shiftKey) parts.push("Shift");
  const key = normalizeKey(event.key);
  if (key === "Control" || key === "Meta" || key === "Shift" || key === "Alt") return parts.join("+");
  parts.push(key);
  return parts.join("+");
}

export function eventMatches(event: KeyboardEvent, combo: string): boolean {
  const parts = combo.split("+");
  const key = parts[parts.length - 1];
  const needsMod = parts.includes("Mod");
  const needsShift = parts.includes("Shift");
  const needsAlt = parts.includes("Alt");
  if (needsMod !== (event.metaKey || event.ctrlKey)) return false;
  if (needsShift !== event.shiftKey) return false;
  if (needsAlt !== event.altKey) return false;
  return normalizeKey(event.key) === key;
}

export function resolveCombo(id: string, overrides: Record<string, string>): string | undefined {
  return overrides[id] ?? SHORTCUT_MAP[id]?.combo;
}

export function formatCombo(combo: string): string {
  const labels: Record<string, string> = {
    Mod: IS_MAC ? "⌘" : "Ctrl",
    Shift: IS_MAC ? "⇧" : "Shift",
    Alt: IS_MAC ? "⌥" : "Alt",
    Enter: "↵",
    Esc: "Esc",
    Delete: IS_MAC ? "⌫" : "Del",
    Backspace: "⌫",
    ArrowUp: "↑",
    ArrowDown: "↓",
    ArrowLeft: "←",
    ArrowRight: "→",
  };
  return combo
    .split("+")
    .map((part) => labels[part] ?? part)
    .join(IS_MAC ? "" : "+");
}

export function isMacPlatform(): boolean {
  return IS_MAC;
}

export function findShortcutConflicts(overrides: Record<string, string>): Record<string, string[]> {
  const byCombo = new Map<string, string[]>();
  for (const shortcut of SHORTCUTS) {
    const combo = overrides[shortcut.id] ?? shortcut.combo;
    const list = byCombo.get(combo) ?? [];
    list.push(shortcut.id);
    byCombo.set(combo, list);
  }
  const conflicts: Record<string, string[]> = {};
  for (const [combo, ids] of byCombo) {
    if (ids.length > 1) conflicts[combo] = ids;
  }
  return conflicts;
}
