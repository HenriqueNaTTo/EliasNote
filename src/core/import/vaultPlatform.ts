import { invoke } from "@tauri-apps/api/core";
import { isTauriRuntime } from "@/core/persistence/adapter";
import { mimeForVaultPath } from "./obsidianParser";
import type { VaultEntry } from "./vaultTypes";

interface NativeVaultFile {
  path: string;
  name: string;
  size: number;
  text: string | null;
  sourcePath: string;
}

interface NativeVaultScan {
  files: NativeVaultFile[];
  truncated: boolean;
}

export function vaultNameFromPath(path: string): string {
  const normalized = path.replace(/\\/g, "/").replace(/\/+$/, "");
  return normalized.split("/").filter(Boolean).pop() || "Cofre Obsidian";
}

/** Abre o seletor nativo de pastas no desktop. Retorna null no navegador. */
export async function pickVaultFolder(): Promise<string | null> {
  if (!isTauriRuntime()) return null;
  const { open } = await import("@tauri-apps/plugin-dialog");
  const selected = await open({
    directory: true,
    multiple: false,
    title: "Selecione a pasta raiz do cofre Obsidian",
  });
  if (Array.isArray(selected)) return selected[0] ?? null;
  return selected ?? null;
}

/** Lê o cofre via backend Rust (sem carregar o cofre no processo da UI). */
export async function scanVaultFolder(
  root: string,
): Promise<{ entries: VaultEntry[]; truncated: boolean }> {
  const result = await invoke<NativeVaultScan>("vault_scan", { root });
  return {
    truncated: Boolean(result.truncated),
    entries: result.files.map((file) => ({
      path: file.path,
      name: file.name,
      size: file.size,
      mime: mimeForVaultPath(file.path),
      text: file.text ?? undefined,
      nativePath: file.sourcePath,
    })),
  };
}

/** Copia um anexo do cofre diretamente para o armazenamento local do app. */
export async function importAttachmentFromNativePath(input: {
  id: string;
  name: string;
  mime: string;
  sourcePath: string;
}): Promise<void> {
  await invoke("attachment_import_path", {
    id: input.id,
    name: input.name,
    mime: input.mime,
    sourcePath: input.sourcePath,
  });
}
