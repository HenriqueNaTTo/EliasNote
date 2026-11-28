import {
  arrowHeadPath,
  elementPath,
  sketchBounds,
  sketchViewBox,
  strokeDashArray,
  textLines,
  type SketchDocument,
  type SketchElement,
} from "@/core/domain/sketch";
import { imageBlobToPdf } from "@/features/drawing/drawingExport";

export type SketchExportFormat = "png" | "svg" | "pdf";

interface SvgOptions {
  padding?: number;
  /** `null` deixa o fundo transparente. */
  background?: string | null;
  scale?: number;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function elementToSvg(element: SketchElement): string {
  const style = element.style;
  const opacity = style.opacity < 1 ? ` opacity="${style.opacity}"` : "";
  const dash = strokeDashArray(style);
  const dashAttribute = dash ? ` stroke-dasharray="${dash}"` : "";

  if (element.kind === "text") {
    const lines = textLines(element.text);
    const spans = lines
      .map((line, index) =>
        `<tspan x="${element.at.x}" dy="${index === 0 ? 0 : element.fontSize * 1.32}">${escapeXml(line || " ")}</tspan>`,
      )
      .join("");
    return `<text x="${element.at.x}" y="${element.at.y}" fill="${escapeXml(style.stroke)}"${opacity} font-size="${element.fontSize}" font-family="ui-sans-serif, system-ui, sans-serif" dominant-baseline="hanging">${spans}</text>`;
  }

  const fill = element.kind === "line" || element.kind === "arrow" ? "none" : escapeXml(style.fill);
  const path = `<path d="${elementPath(element)}" fill="${fill}" stroke="${escapeXml(style.stroke)}" stroke-width="${style.width}" stroke-linecap="round" stroke-linejoin="round"${dashAttribute}${opacity}/>`;
  if (element.kind === "arrow") {
    return `${path}<path d="${arrowHeadPath(element)}" fill="${escapeXml(style.stroke)}"${opacity}/>`;
  }
  return path;
}

/**
 * Serializa o desenho em SVG autocontido. É a base do preview, da exportação
 * PNG/PDF e de arquivos `.svg`.
 */
export function sketchToSvg(sketch: SketchDocument, options: SvgOptions = {}): string {
  const padding = options.padding ?? 24;
  const scale = options.scale ?? 2;
  const background = options.background === undefined ? "#ffffff" : options.background;
  const bounds = sketchBounds(sketch.elements);
  const viewBox = sketchViewBox(sketch.elements, padding);
  const [, , width, height] = viewBox.split(" ").map(Number);
  const pixelWidth = Math.max(1, Math.round(width * scale));
  const pixelHeight = Math.max(1, Math.round(height * scale));
  const backdrop =
    background === null
      ? ""
      : `<rect x="${Number(viewBox.split(" ")[0])}" y="${Number(viewBox.split(" ")[1])}" width="${width}" height="${height}" fill="${escapeXml(background)}"/>`;

  if (!bounds) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${pixelWidth}" height="${pixelHeight}" viewBox="${viewBox}">${backdrop}</svg>`;
  }

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${pixelWidth}" height="${pixelHeight}" viewBox="${viewBox}">`,
    backdrop,
    ...sketch.elements.map(elementToSvg),
    "</svg>",
  ].join("");
}

function svgDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Falha ao rasterizar o desenho"));
    image.src = src;
  });
}

export async function sketchToPngBlob(sketch: SketchDocument, options: SvgOptions = {}): Promise<Blob> {
  const scale = options.scale ?? 2;
  const svg = sketchToSvg(sketch, { ...options, scale });
  const image = await loadImage(svgDataUrl(svg));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, image.width || 640);
  canvas.height = Math.max(1, image.height || 400);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas indisponível para exportar o desenho");
  if (options.background !== null) {
    context.fillStyle = options.background ?? "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Falha ao gerar a imagem do desenho");
  return blob;
}

export async function sketchToPdfBlob(sketch: SketchDocument, options: SvgOptions = {}): Promise<Blob> {
  return imageBlobToPdf(await sketchToPngBlob(sketch, options));
}
