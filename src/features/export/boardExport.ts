import { DEFAULT_VIEWPORT } from "@/lib/geometry";
import { useAppStore } from "@/core/store";
import { activeBoard, activeBoardId } from "@/core/store/helpers";
import { fitBoardToView } from "@/features/canvas/viewportActions";
import { imageBlobToPdf } from "@/features/drawing/drawingExport";

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

async function waitFrames(count = 2): Promise<void> {
  for (let index = 0; index < count; index += 1) await nextFrame();
}

async function captureCanvasSurface(scale: number, backgroundColor?: string): Promise<Blob> {
  const element = document.getElementById("canvas-export-surface");
  if (!element) throw new Error("Canvas não encontrado para exportação.");
  const { toPng } = await import("html-to-image");
  const dataUrl = await toPng(element, {
    pixelRatio: scale,
    cacheBust: true,
    backgroundColor,
    width: element.clientWidth,
    height: element.clientHeight,
  });
  const response = await fetch(dataUrl);
  return response.blob();
}

/**
 * Enquadra o quadro, captura a imagem e restaura o viewport anterior — assim o
 * usuário não perde a posição de trabalho após exportar.
 */
export async function exportActiveBoardPng(options: { scale?: number; background?: boolean } = {}): Promise<Blob> {
  const state = useAppStore.getState();
  const board = activeBoard(state);
  const boardId = activeBoardId(state);
  if (!board || !boardId) throw new Error("Nenhum quadro ativo para exportar.");
  const previous = state.viewports[boardId] ?? DEFAULT_VIEWPORT;
  const background = options.background
    ? getComputedStyle(document.documentElement).getPropertyValue("--canvas").trim()
    : undefined;
  fitBoardToView(boardId);
  await waitFrames(2);
  try {
    return await captureCanvasSurface(options.scale ?? 2, background ? `hsl(${background})` : undefined);
  } finally {
    useAppStore.getState().setViewport(boardId, previous);
  }
}

export async function exportActiveBoardPdf(options: { scale?: number } = {}): Promise<Blob> {
  const state = useAppStore.getState();
  const board = activeBoard(state);
  const png = await exportActiveBoardPng({ scale: options.scale ?? 2, background: true });
  return imageBlobToPdf(png, { title: board?.title ?? "EliasNote" });
}

export function suggestedFilename(title: string, extension: string): string {
  const base = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
  return `${base || "eliasnote"}.${extension}`;
}
