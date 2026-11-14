import { openDB, type IDBPDatabase } from "idb";
import type { BackupInfo } from "@/core/domain/types";
import type {
  AttachmentInput,
  AttachmentMeta,
  BackupSnapshot,
  StorageAdapter,
  StoredDoc,
} from "./types";

const DB_NAME = "eliasnote";
const DB_VERSION = 1;

interface DocumentRecord {
  key: string;
  kind: string;
  id: string;
  data: unknown;
  updatedAt: number;
}

interface AttachmentRecordRow {
  id: string;
  name: string;
  mime: string;
  size: number;
  blob: Blob;
  createdAt: number;
}

interface BackupRecordRow {
  id: string;
  label: string;
  createdAt: number;
  size: number;
  data: BackupSnapshot;
}

/** Armazenamento local usando IndexedDB: usado no navegador e em testes manuais. */
export class IndexedDbAdapter implements StorageAdapter {
  readonly kind = "indexeddb" as const;
  private dbPromise: Promise<IDBPDatabase> | null = null;
  private urlCache = new Map<string, string>();

  async init(): Promise<void> {
    await this.db();
  }

  private async db(): Promise<IDBPDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(database) {
          if (!database.objectStoreNames.contains("documents")) {
            const store = database.createObjectStore("documents", { keyPath: "key" });
            store.createIndex("by-kind", "kind");
          }
          if (!database.objectStoreNames.contains("attachments")) {
            database.createObjectStore("attachments", { keyPath: "id" });
          }
          if (!database.objectStoreNames.contains("backups")) {
            database.createObjectStore("backups", { keyPath: "id" });
          }
        },
      });
    }
    return this.dbPromise;
  }

  async readDoc<T>(kind: string, id: string): Promise<T | null> {
    const db = await this.db();
    const record = (await db.get("documents", `${kind}:${id}`)) as DocumentRecord | undefined;
    return (record?.data as T) ?? null;
  }

  async writeDoc(kind: string, id: string, data: unknown): Promise<void> {
    const db = await this.db();
    const record: DocumentRecord = { key: `${kind}:${id}`, kind, id, data, updatedAt: Date.now() };
    await db.put("documents", record);
  }

  async deleteDoc(kind: string, id: string): Promise<void> {
    const db = await this.db();
    await db.delete("documents", `${kind}:${id}`);
  }

  async listDocs<T>(kind: string): Promise<StoredDoc<T>[]> {
    const db = await this.db();
    const records = (await db.getAllFromIndex("documents", "by-kind", kind)) as DocumentRecord[];
    return records.map((record) => ({ id: record.id, data: record.data as T }));
  }

  async putAttachment(input: AttachmentInput): Promise<AttachmentMeta> {
    const db = await this.db();
    const createdAt = Date.now();
    const blob = new Blob([input.data], { type: input.mime });
    const record: AttachmentRecordRow = {
      id: input.id,
      name: input.name,
      mime: input.mime,
      size: input.size,
      blob,
      createdAt,
    };
    await db.put("attachments", record);
    return { id: input.id, name: input.name, mime: input.mime, size: input.size, createdAt };
  }

  async attachmentUrl(id: string): Promise<string | null> {
    const cached = this.urlCache.get(id);
    if (cached) return cached;
    const db = await this.db();
    const record = (await db.get("attachments", id)) as AttachmentRecordRow | undefined;
    if (!record) return null;
    const url = URL.createObjectURL(record.blob);
    this.urlCache.set(id, url);
    return url;
  }

  async deleteAttachment(id: string): Promise<void> {
    const db = await this.db();
    await db.delete("attachments", id);
    const cached = this.urlCache.get(id);
    if (cached) {
      URL.revokeObjectURL(cached);
      this.urlCache.delete(id);
    }
  }

  async listBackups(): Promise<BackupInfo[]> {
    const db = await this.db();
    const rows = (await db.getAll("backups")) as BackupRecordRow[];
    return rows
      .map((row) => ({ id: row.id, label: row.label, createdAt: row.createdAt, size: row.size }))
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  async createBackup(label: string, data: BackupSnapshot, keep: number): Promise<BackupInfo> {
    const db = await this.db();
    const row: BackupRecordRow = {
      id: `backup_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      label,
      createdAt: Date.now(),
      size: JSON.stringify(data).length,
      data,
    };
    await db.put("backups", row);
    const all = (await db.getAll("backups")) as BackupRecordRow[];
    const excess = all.sort((a, b) => b.createdAt - a.createdAt).slice(Math.max(1, keep));
    for (const old of excess) await db.delete("backups", old.id);
    return { id: row.id, label: row.label, createdAt: row.createdAt, size: row.size };
  }

  async readBackup(id: string): Promise<BackupSnapshot | null> {
    const db = await this.db();
    const row = (await db.get("backups", id)) as BackupRecordRow | undefined;
    return row?.data ?? null;
  }

  async deleteBackup(id: string): Promise<void> {
    const db = await this.db();
    await db.delete("backups", id);
  }

  async clearAll(): Promise<void> {
    const db = await this.db();
    await Promise.all([
      db.clear("documents"),
      db.clear("attachments"),
      db.clear("backups"),
    ]);
    for (const url of this.urlCache.values()) URL.revokeObjectURL(url);
    this.urlCache.clear();
  }
}
