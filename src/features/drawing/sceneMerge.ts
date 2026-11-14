import type { DrawingScene } from "@/core/domain/types";
import { parseExcalidrawScene } from "@/core/export/importer";
import { uid } from "@/lib/utils";

export interface SceneElements {
  elements: readonly Record<string, unknown>[];
  files: Record<string, unknown>;
}

export interface MergeResult {
  elements: Record<string, unknown>[];
  files: Record<string, unknown>;
  addedFiles: Record<string, unknown>;
  addedCount: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function randomInt(): number {
  return Math.floor(Math.random() * 2_147_483_647);
}

function number(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

interface SceneBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

function sceneBounds(elements: readonly Record<string, unknown>[]): SceneBounds | null {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const element of elements) {
    if (element.isDeleted === true) continue;
    if (
      typeof element.x !== "number" ||
      typeof element.y !== "number" ||
      typeof element.width !== "number" ||
      typeof element.height !== "number"
    ) {
      continue;
    }
    minX = Math.min(minX, element.x);
    minY = Math.min(minY, element.y);
    maxX = Math.max(maxX, element.x + element.width);
    maxY = Math.max(maxY, element.y + element.height);
  }

  return Number.isFinite(minX) && Number.isFinite(minY) && Number.isFinite(maxX) && Number.isFinite(maxY)
    ? { minX, minY, maxX, maxY }
    : null;
}

function remapBoundElements(
  value: unknown,
  ids: Map<string, string>,
): Record<string, unknown>[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const mapped: Record<string, unknown>[] = [];
  for (const item of value) {
    if (!isRecord(item) || typeof item.id !== "string") continue;
    const id = ids.get(item.id);
    if (!id) continue;
    mapped.push({ ...item, id });
  }
  return mapped;
}

function remapBinding(value: unknown, ids: Map<string, string>): Record<string, unknown> | null {
  if (!isRecord(value) || typeof value.elementId !== "string") return null;
  const id = ids.get(value.elementId);
  return id ? { ...value, elementId: id } : null;
}

/**
 * Interpreta o JSON de uma cena Excalidraw. Aceita o arquivo completo
 * (`.excalidraw`), um objeto com `elements` ou um array de elementos.
 */
export function parseExcalidrawSceneData(raw: string): DrawingScene | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const full = parseExcalidrawScene(trimmed);
  if (full) return full;

  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return {
        elements: parsed,
        appState: {},
        files: {},
        thumbnail: null,
        updatedAt: Date.now(),
      };
    }
    if (isRecord(parsed) && Array.isArray(parsed.elements)) {
      return {
        elements: parsed.elements,
        appState: isRecord(parsed.appState) ? parsed.appState : {},
        files: isRecord(parsed.files) ? parsed.files : {},
        thumbnail: null,
        updatedAt: Date.now(),
      };
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Mescla a cena recebida na cena atual:
 * - gera novos IDs para elementos, grupos e arquivos;
 * - remapeia `containerId`, `frameId`, `boundElements`, `startBinding` e `endBinding`;
 * - desloca a cena para a direita do conteúdo existente;
 * - mantém a ordem atual e anexa os novos elementos.
 */
export function mergeExcalidrawScenes(current: SceneElements, incoming: DrawingScene): MergeResult {
  const currentElements = current.elements.filter(isRecord);
  const incomingElements = incoming.elements
    .filter(isRecord)
    .filter((element) => element.isDeleted !== true && typeof element.id === "string");

  if (incomingElements.length === 0) {
    return {
      elements: [...currentElements],
      files: { ...current.files },
      addedFiles: {},
      addedCount: 0,
    };
  }

  const currentBounds = sceneBounds(currentElements);
  const incomingBounds = sceneBounds(incomingElements);
  const offsetX = currentBounds
    ? currentBounds.maxX + 80 - (incomingBounds?.minX ?? 0)
    : 80 - (incomingBounds?.minX ?? 0);
  const offsetY = currentBounds
    ? currentBounds.minY - (incomingBounds?.minY ?? 0)
    : 80 - (incomingBounds?.minY ?? 0);

  const elementIds = new Map<string, string>();
  for (const element of incomingElements) {
    elementIds.set(element.id as string, uid("el"));
  }

  const groupIds = new Map<string, string>();
  for (const element of incomingElements) {
    if (!Array.isArray(element.groupIds)) continue;
    for (const groupId of element.groupIds) {
      if (typeof groupId === "string" && !groupIds.has(groupId)) groupIds.set(groupId, uid("grp"));
    }
  }

  const fileIds = new Map<string, string>();
  for (const fileId of Object.keys(incoming.files)) {
    fileIds.set(fileId, uid("file"));
  }

  const files: Record<string, unknown> = { ...current.files };
  const addedFiles: Record<string, unknown> = {};
  for (const [oldId, newId] of fileIds) {
    const data = incoming.files[oldId];
    if (data === undefined) continue;
    const remapped = isRecord(data) ? { ...data, id: newId } : data;
    files[newId] = remapped;
    addedFiles[newId] = remapped;
  }

  const merged: Record<string, unknown>[] = incomingElements.map((element) => {
    const clone: Record<string, unknown> = { ...element };
    clone.id = elementIds.get(element.id as string) ?? uid("el");
    clone.x = number(element.x) + offsetX;
    clone.y = number(element.y) + offsetY;

    if (typeof element.containerId === "string") {
      clone.containerId = elementIds.get(element.containerId) ?? null;
    }
    if (typeof element.frameId === "string") {
      clone.frameId = elementIds.get(element.frameId) ?? null;
    }
    if (typeof element.fileId === "string") {
      clone.fileId = fileIds.get(element.fileId) ?? element.fileId;
    }
    if (Array.isArray(element.groupIds)) {
      clone.groupIds = element.groupIds.map((groupId) =>
        typeof groupId === "string" ? groupIds.get(groupId) ?? groupId : groupId,
      );
    }
    const boundElements = remapBoundElements(element.boundElements, elementIds);
    if (boundElements) clone.boundElements = boundElements;

    for (const key of ["startBinding", "endBinding"]) {
      if (element[key] !== undefined) {
        clone[key] = remapBinding(element[key], elementIds);
      }
    }

    clone.version = 1;
    clone.versionNonce = randomInt();
    clone.updated = Date.now();
    if (typeof element.seed === "number") clone.seed = randomInt();
    return clone;
  });

  return {
    elements: [...currentElements, ...merged],
    files,
    addedFiles,
    addedCount: merged.length,
  };
}
