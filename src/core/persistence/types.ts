import type { AppSettings, BackupInfo, Board, ID, Tab, Workspace } from "@/core/domain/types";
import type { TemplatePayload } from "@/core/domain/types";
import type { Viewport } from "@/lib/geometry";

export interface AttachmentInput {
  id: ID;
  name: string;
  mime: string;
  size: number;
  data: ArrayBuffer;
}

export interface AttachmentMeta {
  id: ID;
  name: string;
  mime: string;
  size: number;
  createdAt: number;
}

export interface SerializedTemplate {
  id: string;
  name: string;
  description: string;
  category: "planejamento" | "criativo" | "projeto" | "estudo" | "pessoal" | "jogo";
  accent: string;
  payload: TemplatePayload;
}

export interface AppDocument {
  version: number;
  workspaces: Record<ID, Workspace>;
  workspaceOrder: ID[];
  activeWorkspaceId: ID;
  tabs: Tab[];
  activeTabId: ID | null;
  viewports: Record<ID, Viewport>;
  customTemplates: SerializedTemplate[];
}

export interface BackupSnapshot {
  version: number;
  createdAt: number;
  app: AppDocument;
  settings: AppSettings;
  boards: Board[];
}

export interface StoredDoc<T> {
  id: ID;
  data: T;
}

export interface StorageAdapter {
  readonly kind: "sqlite" | "indexeddb" | "memory";
  init(): Promise<void>;
  readDoc<T>(kind: string, id: string): Promise<T | null>;
  writeDoc(kind: string, id: string, data: unknown): Promise<void>;
  deleteDoc(kind: string, id: string): Promise<void>;
  listDocs<T>(kind: string): Promise<StoredDoc<T>[]>;
  putAttachment(input: AttachmentInput): Promise<AttachmentMeta>;
  attachmentUrl(id: ID): Promise<string | null>;
  deleteAttachment(id: ID): Promise<void>;
  listBackups(): Promise<BackupInfo[]>;
  createBackup(label: string, data: BackupSnapshot, keep: number): Promise<BackupInfo>;
  readBackup(id: string): Promise<BackupSnapshot | null>;
  deleteBackup(id: string): Promise<void>;
  clearAll(): Promise<void>;
}

export const DOC_KINDS = {
  app: "app",
  settings: "settings",
  board: "board",
} as const;
