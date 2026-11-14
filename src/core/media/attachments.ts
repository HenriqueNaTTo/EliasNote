import { useEffect, useState } from "react";
import type { Point } from "@/lib/geometry";
import { uid } from "@/lib/utils";
import type { ID } from "@/core/domain/types";
import type { AttachmentMeta } from "../persistence/types";
import { useAppStore } from "@/core/store";
import { getAdapter } from "../persistence/adapter";

export type MediaKind = "image" | "video" | "file";

const urlCache = new Map<string, string | null>();

export function mediaKindFor(mime: string, name = ""): MediaKind {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (/\.(png|jpe?g|gif|webp|avif|svg|bmp)$/i.test(name)) return "image";
  if (/\.(mp4|webm|mov|mkv|ogv)$/i.test(name)) return "video";
  return "file";
}

export function isBrowserSupportedVideo(name = ""): boolean {
  return /\.(mp4|webm|ogv)$/i.test(name);
}

export async function saveAttachment(file: File): Promise<AttachmentMeta> {
  const adapter = await getAdapter();
  const data = await file.arrayBuffer();
  return adapter.putAttachment({
    id: uid("att"),
    name: file.name,
    mime: file.type || "application/octet-stream",
    size: file.size,
    data,
  });
}

export async function resolveAttachmentUrl(attachmentId: string): Promise<string | null> {
  if (urlCache.has(attachmentId)) return urlCache.get(attachmentId) ?? null;
  try {
    const adapter = await getAdapter();
    const url = await adapter.attachmentUrl(attachmentId);
    urlCache.set(attachmentId, url);
    return url;
  } catch {
    urlCache.set(attachmentId, null);
    return null;
  }
}

export function invalidateAttachmentCache(attachmentId?: string): void {
  if (attachmentId) urlCache.delete(attachmentId);
  else urlCache.clear();
}

/** Resolve a URL local de um anexo, revalidando quando anexos mudam. */
export function useAttachmentUrl(attachmentId: string | undefined | null): string | null {
  const version = useAppStore((state) => state.attachmentsVersion);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!attachmentId) {
      setUrl(null);
      return () => {
        active = false;
      };
    }
    void resolveAttachmentUrl(attachmentId).then((resolved) => {
      if (active) setUrl(resolved);
    });
    return () => {
      active = false;
    };
  }, [attachmentId, version]);

  return url;
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Falha ao ler arquivo"));
    reader.readAsText(file);
  });
}

async function measureImage(file: File): Promise<{ width: number; height: number } | null> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      const size = { width: bitmap.width, height: bitmap.height };
      bitmap.close();
      return size;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Salva arquivos como anexos e cria os elementos correspondentes no quadro ativo.
 * Retorna os ids dos nós criados.
 */
export async function importFiles(files: File[], position: Point): Promise<ID[]> {
  const created: ID[] = [];
  let index = 0;
  for (const file of files) {
    const meta = await saveAttachment(file);
    const kind = mediaKindFor(file.type, file.name);
    const offset = index * 28;
    let width: number | undefined;
    let height: number | undefined;
    if (kind === "image") {
      const size = await measureImage(file);
      const targetWidth = 320;
      width = targetWidth;
      height = size ? Math.max(140, Math.min(460, Math.round((targetWidth * size.height) / size.width))) : 240;
    }
    useAppStore.getState().addNode(
      kind,
      { x: position.x + offset, y: position.y + offset },
      {
        attachmentId: meta.id,
        name: file.name,
        mime: meta.mime,
        size: meta.size,
        title: file.name,
        w: width,
        h: height,
        color: kind === "file" ? "none" : "none",
      },
    );
    created.push(meta.id);
    index += 1;
  }
  useAppStore.getState().bumpAttachments();
  return created;
}

export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function downloadText(filename: string, text: string, mime = "text/plain;charset=utf-8"): void {
  downloadBlob(filename, new Blob([text], { type: mime }));
}

export function safeFilename(name: string, extension: string): string {
  const base = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
  return `${base || "eliasnote"}.${extension}`;
}
