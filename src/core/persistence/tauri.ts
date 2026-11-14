import { invoke } from "@tauri-apps/api/core";
import { convertFileSrc } from "@tauri-apps/api/core";
import type { BackupInfo } from "@/core/domain/types";
import type {
  AttachmentInput,
  AttachmentMeta,
  BackupSnapshot,
  StorageAdapter,
  StoredDoc,
} from "./types";

interface DocRow {
  id: string;
  data: string;
}

interface BackupRow {
  id: string;
  label: string;
  createdAt: number;
  size: number;
}

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

function parseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Adaptador SQLite (backend Tauri). Os documentos são serializados em JSON e
 * gravados por comando no processo Rust, mantendo o frontend desacoplado.
 */
export class TauriSqliteAdapter implements StorageAdapter {
  readonly kind = "sqlite" as const;

  async init(): Promise<void> {
    await invoke("db_init");
  }

  async readDoc<T>(kind: string, id: string): Promise<T | null> {
    const raw = await invoke<string | null>("doc_read", { kind, id });
    return parseJson<T>(raw);
  }

  async writeDoc(kind: string, id: string, data: unknown): Promise<void> {
    await invoke("doc_write", { kind, id, data: JSON.stringify(data) });
  }

  async deleteDoc(kind: string, id: string): Promise<void> {
    await invoke("doc_delete", { kind, id });
  }

  async listDocs<T>(kind: string): Promise<StoredDoc<T>[]> {
    const rows = await invoke<DocRow[]>("doc_list", { kind });
    return rows
      .map((row) => ({ id: row.id, data: parseJson<T>(row.data) }))
      .filter((row): row is StoredDoc<T> => row.data !== null);
  }

  async putAttachment(input: AttachmentInput): Promise<AttachmentMeta> {
    const createdAt = Date.now();
    await invoke("attachment_save", {
      id: input.id,
      name: input.name,
      mime: input.mime,
      size: input.size,
      dataBase64: toBase64(input.data),
    });
    return { id: input.id, name: input.name, mime: input.mime, size: input.size, createdAt };
  }

  async attachmentUrl(id: string): Promise<string | null> {
    const path = await invoke<string | null>("attachment_path", { id });
    return path ? convertFileSrc(path) : null;
  }

  async deleteAttachment(id: string): Promise<void> {
    await invoke("attachment_delete", { id });
  }

  async listBackups(): Promise<BackupInfo[]> {
    const rows = await invoke<BackupRow[]>("backup_list");
    return rows.map((row) => ({ id: row.id, label: row.label, createdAt: row.createdAt, size: row.size }));
  }

  async createBackup(label: string, data: BackupSnapshot, keep: number): Promise<BackupInfo> {
    const row = await invoke<BackupRow>("backup_create", {
      label,
      dataJson: JSON.stringify(data),
      keep,
    });
    return { id: row.id, label: row.label, createdAt: row.createdAt, size: row.size };
  }

  async readBackup(id: string): Promise<BackupSnapshot | null> {
    const raw = await invoke<string | null>("backup_read", { id });
    return parseJson<BackupSnapshot>(raw);
  }

  async deleteBackup(id: string): Promise<void> {
    await invoke("backup_delete", { id });
  }

  async clearAll(): Promise<void> {
    await invoke("clear_all");
  }
}
