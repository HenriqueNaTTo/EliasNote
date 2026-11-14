import { isTauriRuntime } from "@/core/persistence/adapter";

export function normalizeUrl(input: string): string {
  const value = input.trim();
  if (!value) return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return value;
  return `https://${value}`;
}

export function isSafeExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" || parsed.protocol === "mailto:";
  } catch {
    return false;
  }
}

export function hostnameOf(url: string): string {
  try {
    return new URL(normalizeUrl(url)).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Abre links externos no navegador padrão (plugin opener no Tauri). */
export async function openExternal(url: string): Promise<void> {
  const normalized = normalizeUrl(url);
  if (!isSafeExternalUrl(normalized)) return;
  if (isTauriRuntime()) {
    try {
      const { openUrl } = await import("@tauri-apps/plugin-opener");
      await openUrl(normalized);
      return;
    } catch {
      /* fallback abaixo */
    }
  }
  window.open(normalized, "_blank", "noopener,noreferrer");
}

export function platformLabel(): string {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) return "Windows";
  if (/Mac/i.test(ua)) return "macOS";
  if (/Linux/i.test(ua)) return "Linux";
  return "desktop";
}
