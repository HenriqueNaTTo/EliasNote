import type { ReleaseId, ReleaseKind } from "@/landing/i18n/types";
import { REPO_URL } from "@/landing/site";

export interface ReleaseMeta {
  id: ReleaseId;
  /** Data de publicação no formato ISO (UTC). */
  date: string;
  kind: ReleaseKind;
}

/** Ordem decrescente: a versão mais nova aparece primeiro. */
export const RELEASES: readonly ReleaseMeta[] = [
  { id: "0.5.0", date: "2026-11-21", kind: "feature" },
  { id: "0.4.0", date: "2026-11-21", kind: "feature" },
  { id: "0.3.0", date: "2026-11-21", kind: "feature" },
  { id: "0.2.6", date: "2026-11-21", kind: "fix" },
  { id: "0.2.5", date: "2026-11-20", kind: "fix" },
  { id: "0.2.4", date: "2026-11-20", kind: "feature" },
  { id: "0.2.3", date: "2026-11-20", kind: "infra" },
  { id: "0.2.2", date: "2026-11-20", kind: "feature" },
  { id: "0.2.1", date: "2026-11-20", kind: "feature" },
  { id: "0.2.0", date: "2026-11-17", kind: "initial" },
];

export function releaseUrl(id: ReleaseId): string {
  return `${REPO_URL}/releases/tag/v${id}`;
}

export function releaseDate(date: string): Date {
  return new Date(`${date}T12:00:00Z`);
}
