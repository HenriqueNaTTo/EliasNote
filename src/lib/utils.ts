import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

let counter = 0;

/** Identificador estável e curto, independente de serviços externos. */
export function uid(prefix = "id"): string {
  const globalCrypto = typeof crypto !== "undefined" ? crypto : undefined;
  if (globalCrypto && typeof globalCrypto.randomUUID === "function") {
    return `${prefix}_${globalCrypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  }
  counter = (counter + 1) % 1_000_000;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function round(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function debounce<Args extends unknown[]>(fn: (...args: Args) => void, wait: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const debounced = (...args: Args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      fn(...args);
    }, wait);
  };
  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
  };
  debounced.flush = (...args: Args) => {
    if (timer) clearTimeout(timer);
    timer = undefined;
    fn(...args);
  };
  return debounced;
}

export function throttleRaf<Args extends unknown[]>(fn: (...args: Args) => void) {
  let frame: number | null = null;
  let lastArgs: Args | null = null;
  return (...args: Args) => {
    lastArgs = args;
    if (frame !== null) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      if (lastArgs) fn(...lastArgs);
    });
  };
}

export function formatBytes(bytes: number | undefined | null): string {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** index;
  const decimals = index === 0 ? 0 : value >= 10 ? 0 : 1;
  return `${value.toFixed(decimals)} ${units[index]}`;
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(timestamp: number): string {
  return dateFormatter.format(new Date(timestamp));
}

export function formatDateTime(timestamp: number): string {
  return dateTimeFormatter.format(new Date(timestamp));
}

export function timeAgo(timestamp: number, now = Date.now()): string {
  const diff = Math.max(0, now - timestamp);
  const seconds = Math.floor(diff / 1000);
  if (seconds < 45) return "agora";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} d atrás`;
  return formatDate(timestamp);
}

export function truncate(text: string, max = 80): string {
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable ||
    target.closest("[contenteditable='true']") !== null
  );
}

export function safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function plural(count: number, singular: string, pluralForm: string): string {
  return count === 1 ? singular : pluralForm;
}

export function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

export function sortBy<T>(items: T[], key: (item: T) => number | string): T[] {
  return [...items].sort((a, b) => {
    const ka = key(a);
    const kb = key(b);
    if (ka === kb) return 0;
    return ka < kb ? -1 : 1;
  });
}

/** Extrai texto simples de um HTML já sanitizado (usado em buscas e exportações). */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || from >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  const index = clamp(to, 0, next.length);
  next.splice(index, 0, item);
  return next;
}
