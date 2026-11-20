import { useEffect, useSyncExternalStore } from "react";
import { isTauriRuntime } from "@/core/persistence/adapter";
import { isNewerVersion } from "./version";

export const REPOSITORY = "HenriqueNaTTo/EliasNote";
export const LATEST_RELEASE_API = `https://api.github.com/repos/${REPOSITORY}/releases/latest`;
export const RELEASES_PAGE = `https://github.com/${REPOSITORY}/releases`;
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

export interface UpdateInfo {
  /** Versão sem o prefixo `v`. */
  version: string;
  /** Tag original da release (ex.: `v0.2.0`). */
  tag: string;
  name: string;
  url: string;
  publishedAt: string | null;
}

export type UpdateStatus = "idle" | "checking" | "up-to-date" | "available" | "error";

export interface UpdateState {
  status: UpdateStatus;
  currentVersion: string | null;
  info: UpdateInfo | null;
  error: string | null;
}

interface ReleasePayload {
  tag_name?: string;
  name?: string;
  html_url?: string;
  published_at?: string;
  draft?: boolean;
  prerelease?: boolean;
}

let state: UpdateState = { status: "idle", currentVersion: null, info: null, error: null };
let inFlight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function publish(patch: Partial<UpdateState>): void {
  state = { ...state, ...patch };
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getUpdateState(): UpdateState {
  return state;
}

let cachedAppVersion: string | null = null;

/** Versão do app: `getVersion()` no desktop e o `package.json` injetado no navegador. */
export async function resolveAppVersion(): Promise<string> {
  if (cachedAppVersion) return cachedAppVersion;
  if (isTauriRuntime()) {
    try {
      const { getVersion } = await import("@tauri-apps/api/app");
      cachedAppVersion = await getVersion();
      return cachedAppVersion;
    } catch {
      /* segue para o fallback */
    }
  }
  cachedAppVersion = typeof __APP_VERSION__ === "string" ? __APP_VERSION__ : "0.0.0";
  return cachedAppVersion;
}

/** Lê a release mais recente publicada no GitHub (ignora rascunhos). */
export async function fetchLatestRelease(): Promise<UpdateInfo | null> {
  const response = await fetch(LATEST_RELEASE_API, {
    headers: { Accept: "application/vnd.github+json" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`GitHub respondeu ${response.status}`);
  const payload = (await response.json()) as ReleasePayload;
  const tag = payload.tag_name?.trim();
  if (!tag || payload.draft) return null;
  return {
    tag,
    version: tag.replace(/^v/i, ""),
    name: payload.name?.trim() || tag,
    url: payload.html_url || RELEASES_PAGE,
    publishedAt: payload.published_at ?? null,
  };
}

/** Consulta o GitHub e atualiza o estado global (uma requisição por vez). */
export async function checkForUpdates(options: { force?: boolean } = {}): Promise<void> {
  if (inFlight) return inFlight;
  if (!options.force && state.status === "checking") return;

  inFlight = (async () => {
    publish({ status: "checking", error: null });
    try {
      const currentVersion = await resolveAppVersion();
      const latest = await fetchLatestRelease();
      if (latest && isNewerVersion(latest.version, currentVersion)) {
        publish({ status: "available", currentVersion, info: latest, error: null });
      } else {
        publish({ status: "up-to-date", currentVersion, info: null, error: null });
      }
    } catch (error) {
      publish({
        status: "error",
        error: error instanceof Error ? error.message : String(error),
        info: null,
      });
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

/** Estado da verificação (compartilhado entre todos os componentes). */
export function useUpdate(): UpdateState {
  return useSyncExternalStore(subscribe, getUpdateState, getUpdateState);
}

/** Dispara a verificação ao montar e repete a cada 6 horas. */
export function useUpdateCheck(): void {
  useEffect(() => {
    if (import.meta.env.MODE === "test") return;
    void checkForUpdates();
    const timer = window.setInterval(() => void checkForUpdates(), CHECK_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);
}
