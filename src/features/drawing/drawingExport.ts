import type { DrawingScene } from "@/core/domain/types";

export type DrawingExportFormat = "png" | "svg" | "pdf";

function sceneArgs(scene: DrawingScene) {
  return {
    elements: scene.elements,
    appState: {
      ...(scene.appState as Record<string, unknown>),
      exportBackground: true,
      viewBackgroundColor: "#ffffff",
      exportWithDarkMode: false,
    },
    files: scene.files,
  } as unknown as Parameters<typeof import("@excalidraw/excalidraw").exportToBlob>[0];
}

export async function sceneToPngBlob(scene: DrawingScene): Promise<Blob> {
  const { exportToBlob } = await import("@excalidraw/excalidraw");
  return exportToBlob({ ...sceneArgs(scene), mimeType: "image/png", quality: 1, exportPadding: 24 });
}

export async function sceneToSvgString(scene: DrawingScene): Promise<string> {
  const { exportToSvg } = await import("@excalidraw/excalidraw");
  const svg = await exportToSvg({ ...sceneArgs(scene), exportPadding: 24 });
  return new XMLSerializer().serializeToString(svg);
}

export async function sceneToPdfBlob(scene: DrawingScene): Promise<Blob> {
  const png = await sceneToPngBlob(scene);
  return imageBlobToPdf(png);
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Falha ao ler imagem"));
    reader.readAsDataURL(blob);
  });
}

async function imageSize(blob: Blob): Promise<{ width: number; height: number }> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(blob);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  }
  const dataUrl = await blobToDataUrl(blob);
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("Falha ao carregar imagem"));
    image.src = dataUrl;
  });
}

/** Converte um PNG em PDF de página única com a mesma proporção. */
export async function imageBlobToPdf(blob: Blob, options: { title?: string; margin?: number } = {}): Promise<Blob> {
  const [dataUrl, size] = await Promise.all([blobToDataUrl(blob), imageSize(blob)]);
  const { jsPDF } = await import("jspdf");
  const margin = options.margin ?? 18;
  const width = size.width + margin * 2;
  const height = size.height + margin * 2;
  const pdf = new jsPDF({
    orientation: width >= height ? "landscape" : "portrait",
    unit: "px",
    format: [width, height],
    compress: true,
  });
  pdf.addImage(dataUrl, "PNG", margin, margin, size.width, size.height);
  if (options.title) pdf.setProperties({ title: options.title });
  return pdf.output("blob");
}
