import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  brandGradient,
  clamp01,
  diagonalFactor,
} from "./lib/brand-mark.mjs";
import { decodePng, extractAlpha, resizeAlphaMap } from "./lib/png.mjs";

/**
 * Gera as artes do instalador NSIS (BMP 24 bits, exigidos pelo MUI2) mantendo o
 * estilo visual do app: gradiente da marca, grade de pontos do canvas e a nova
 * marca com a cabeça na cor de destaque.
 *
 * - sidebar.bmp 164x314 -> painel lateral das páginas de boas-vindas/conclusão
 * - header.bmp  150x57  -> cabeçalho das páginas internas e do desinstalador
 *
 * Uso: node scripts/generate-installer-assets.mjs [--check]
 */

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const assetsDir = resolve(root, "src-tauri/installer/assets");
const brandDir = resolve(root, "src/assets/brand");

const fullMark = extractAlpha(decodePng(readFileSync(resolve(brandDir, "logo-mask.png"))));
const headMark = extractAlpha(decodePng(readFileSync(resolve(brandDir, "logo-head-mask.png"))));

/** Cores do app (src/styles/globals.css). */
const BORDER = [227, 227, 227];
const HEADER_DOTS = [241, 241, 244];

const SIDEBAR = { width: 164, height: 314 };
const HEADER = { width: 150, height: 57 };

const clampByte = (value) => (value < 0 ? 0 : value > 255 ? 255 : Math.round(value));

/** Mistura `color` sobre o pixel em `offset` (source-over com alpha fixo). */
function blend(rgba, offset, color, alpha) {
  for (let channel = 0; channel < 3; channel += 1) {
    rgba[offset + channel] = clampByte(
      rgba[offset + channel] * (1 - alpha) + color[channel] * alpha,
    );
  }
}

/** Grade de pontos do canvas infinito do app (16px no painel, 8px no cabeçalho). */
function canvasDots({ width, height, step, radius, color, alpha }) {
  const dots = [];
  for (let y = step / 2; y < height; y += step) {
    for (let x = step / 2; x < width; x += step) dots.push([x, y]);
  }
  return { dots, radius, color, alpha };
}

function paintDots(rgba, width, height, pattern) {
  const { dots, radius, color, alpha } = pattern;
  for (const [cx, cy] of dots) {
    const fromX = Math.max(0, Math.floor(cx - radius - 1));
    const toX = Math.min(width - 1, Math.ceil(cx + radius + 1));
    const fromY = Math.max(0, Math.floor(cy - radius - 1));
    const toY = Math.min(height - 1, Math.ceil(cy + radius + 1));
    for (let y = fromY; y <= toY; y += 1) {
      for (let x = fromX; x <= toX; x += 1) {
        const distance = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
        const ink = clamp01(radius + 0.5 - distance) * alpha;
        if (ink > 0) blend(rgba, (y * width + x) * 4, color, ink);
      }
    }
  }
}

function createCanvas(width, height) {
  return new Uint8Array(width * height * 4);
}

const mix = (from, to, t) => from + (to - from) * t;

/** Marca nova: livro/herói na cor de frente e cabeça no acento. */
function paintLogoMark(rgba, width, { left, top, size, foreground, accent }) {
  const full = resizeAlphaMap(fullMark, size, size);
  const head = resizeAlphaMap(headMark, size, size);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = y * size + x;
      const alpha = full.alpha[index] / 255;
      if (alpha <= 0) continue;
      const t = Math.min(1, head.alpha[index] / 255 / alpha);
      const color = [
        mix(foreground[0], accent[0], t),
        mix(foreground[1], accent[1], t),
        mix(foreground[2], accent[2], t),
      ];
      blend(rgba, ((top + y) * width + (left + x)) * 4, color, alpha);
    }
  }
}

function renderSidebar() {
  const { width, height } = SIDEBAR;
  const rgba = createCanvas(width, height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const nx = (x + 0.5) / width;
      const ny = (y + 0.5) / height;
      const [r, g, b] = brandGradient(diagonalFactor(nx, ny));
      const offset = (y * width + x) * 4;
      rgba[offset] = r;
      rgba[offset + 1] = g;
      rgba[offset + 2] = b;
      rgba[offset + 3] = 255;
    }
  }

  paintDots(
    rgba,
    width,
    height,
    canvasDots({ width, height, step: 16, radius: 0.75, color: [255, 255, 255], alpha: 0.12 }),
  );

  const markSize = 96;
  paintLogoMark(rgba, width, {
    left: Math.round((width - markSize) / 2),
    top: Math.round((height - markSize) / 2),
    size: markSize,
    foreground: [255, 255, 255],
    accent: [186, 214, 255],
  });

  return rgba;
}

function renderHeader() {
  const { width, height } = HEADER;
  const rgba = createCanvas(width, height);

  for (let offset = 0; offset < rgba.length; offset += 4) {
    rgba[offset] = 255;
    rgba[offset + 1] = 255;
    rgba[offset + 2] = 255;
    rgba[offset + 3] = 255;
  }

  paintDots(
    rgba,
    width,
    height,
    canvasDots({ width, height, step: 8, radius: 0.5, color: HEADER_DOTS, alpha: 1 }),
  );

  const markSize = 32;
  paintLogoMark(rgba, width, {
    left: 10,
    top: Math.round((height - markSize) / 2) - 1,
    size: markSize,
    foreground: [24, 24, 27],
    accent: [47, 127, 224],
  });

  // Hairline da base, alinhada ao token --border do app.
  for (let x = 0; x < width; x += 1) {
    blend(rgba, ((height - 1) * width + x) * 4, BORDER, 1);
  }

  // Marcador vertical na cor primária, como a barra de seleção da sidebar.
  for (let y = 14; y < height - 14; y += 1) {
    for (let x = 124; x < 127; x += 1) {
      blend(rgba, (y * width + x) * 4, [36, 99, 235], 0.9);
    }
  }

  return rgba;
}

/** Codifica RGBA em BMP 24 bits (BI_RGB, bottom-up, linhas alinhadas em 4 bytes). */
function encodeBmp(rgba, width, height) {
  const rowSize = Math.ceil((width * 3) / 4) * 4;
  const pixelData = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y += 1) {
    const target = (height - 1 - y) * rowSize;
    for (let x = 0; x < width; x += 1) {
      const source = (y * width + x) * 4;
      const offset = target + x * 3;
      pixelData[offset] = rgba[source + 2];
      pixelData[offset + 1] = rgba[source + 1];
      pixelData[offset + 2] = rgba[source];
    }
  }

  const header = Buffer.alloc(54);
  header.write("BM", 0, "ascii");
  header.writeUInt32LE(54 + pixelData.length, 2);
  header.writeUInt32LE(54, 10);
  header.writeUInt32LE(40, 14);
  header.writeInt32LE(width, 18);
  header.writeInt32LE(height, 22);
  header.writeUInt16LE(1, 26);
  header.writeUInt16LE(24, 28);
  header.writeUInt32LE(0, 30);
  header.writeUInt32LE(pixelData.length, 34);
  header.writeInt32LE(2835, 38);
  header.writeInt32LE(2835, 42);

  return Buffer.concat([header, pixelData]);
}

const OUTPUTS = [
  { name: "sidebar.bmp", render: renderSidebar, ...SIDEBAR },
  { name: "header.bmp", render: renderHeader, ...HEADER },
];

/** Prévia em texto das artes (node scripts/generate-installer-assets.mjs --preview). */
if (process.argv.includes("--preview")) {
  const rgba = { sidebar: renderSidebar(), header: renderHeader() };
  for (const output of OUTPUTS) {
    const columns = output.height > 100 ? 40 : 60;
    const rows = Math.max(1, Math.round((columns * output.height) / output.width / 2));
    const ramp = " .:-=+*#%@";
    const pixels = rgba[output.name === "sidebar.bmp" ? "sidebar" : "header"];
    console.log(`${output.name} (${output.width}x${output.height})`);
    for (let row = 0; row < rows; row += 1) {
      let line = "";
      for (let col = 0; col < columns; col += 1) {
        const x = Math.min(output.width - 1, Math.floor(((col + 0.5) / columns) * output.width));
        const y = Math.min(output.height - 1, Math.floor(((row + 0.5) / rows) * output.height));
        const offset = (y * output.width + x) * 4;
        const luminance = (pixels[offset] + pixels[offset + 1] + pixels[offset + 2]) / 3 / 255;
        line += ramp[Math.min(ramp.length - 1, Math.floor(luminance * ramp.length))];
      }
      console.log(line);
    }
  }
  process.exit(0);
}

const checkMode = process.argv.includes("--check");
mkdirSync(assetsDir, { recursive: true });

let failures = 0;
for (const { name, render, width, height } of OUTPUTS) {
  const file = resolve(assetsDir, name);
  const expected = encodeBmp(render(), width, height);

  if (checkMode) {
    const current = (() => {
      try {
        return readFileSync(file);
      } catch {
        return null;
      }
    })();
    if (!current || !current.equals(expected)) {
      failures += 1;
      console.error(`[eliasnote] ${name} desatualizado — rode "npm run installer:assets"`);
    }
    continue;
  }

  writeFileSync(file, expected);
  console.log(`[eliasnote] ${name} (${width}x${height}, 24 bits) gerado em src-tauri/installer/assets`);
}

if (checkMode) {
  if (failures > 0) process.exit(1);
  console.log("[eliasnote] artes do instalador em dia");
}
