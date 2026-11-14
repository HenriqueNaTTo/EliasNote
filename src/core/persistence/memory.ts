import type { BackupInfo } from "@/core/domain/types";
import type {
  AttachmentInput,
  AttachmentMeta,
  BackupSnapshot,
  StorageAdapter,
  StoredDoc,
} from "./types";

/** Adaptador em memória, usado apenas em testes automatizados. */
export class MemoryAdapter implements StorageAdapter {
  readonly kind = "memory" as const;
  private docs = new Map<string, unknown>();
  private attachments = new Map<string, { meta: AttachmentMeta; input: AttachmentInput }>();
  private backups = new Map<string, { info: BackupInfo; data: BackupSnapshot }>();

  async init(): Promise<void> {
    /* noop */
  }

  async readDoc<T>(kind: string, id: string): Promise<T | null> {
    return (this.docs.get(`${kind}:${id}`) as T) ?? null;
  }

  async writeDoc(kind: string, id: string, data: unknown): Promise<void> {
    this.docs.set(`${kind}:${id}`, data);
  }

  async deleteDoc(kind: string, id: string): Promise<void> {
    this.docs.delete(`${kind}:${id}`);
  }

  async listDocs<T>(kind: string): Promise<StoredDoc<T>[]> {
    const prefix = `${kind}:`;
    return Array.from(this.docs.entries())
      .filter(([key]) => key.startsWith(prefix))
      .map(([key, data]) => ({ id: key.slice(prefix.length), data: data as T }));
  }

  async putAttachment(input: AttachmentInput): Promise<AttachmentMeta> {
    const meta: AttachmentMeta = {
      id: input.id,
      name: input.name,
      mime: input.mime,
      size: input.size,
      createdAt: Date.now(),
    };
    this.attachments.set(input.id, { meta, input });
    return meta;
  }

  async attachmentUrl(id: string): Promise<string | null> {
    return this.attachments.has(id) ? `memory://${id}` : null;
  }

  async deleteAttachment(id: string): Promise<void> {
    this.attachments.delete(id);
  }

  async listBackups(): Promise<BackupInfo[]> {
    return Array.from(this.backups.values())
      .map((row) => row.info)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  async createBackup(label: string, data: BackupSnapshot, keep: number): Promise<BackupInfo> {
    const info: BackupInfo = {
      id: `backup_${Date.now()}_${this.backups.size}`,
      label,
      createdAt: Date.now(),
      size: JSON.stringify(data).length,
    };
    this.backups.set(info.id, { info, data });
    const sorted = Array.from(this.backups.values()).sort((a, b) => b.info.createdAt - a.info.createdAt);
    for (const row of sorted.slice(Math.max(1, keep))) this.backups.delete(row.info.id);
    return info;
  }

  async readBackup(id: string): Promise<BackupSnapshot | null> {
    return this.backups.get(id)?.data ?? null;
  }

  async deleteBackup(id: string): Promise<void> {
    this.backups.delete(id);
  }

  async clearAll(): Promise<void> {
    this.docs.clear();
    this.attachments.clear();
    this.backups.clear();
  }

  get attachmentCount(): number {
    return this.attachments.size;
  }
}
