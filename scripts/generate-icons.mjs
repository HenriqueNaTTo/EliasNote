import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  alphaBounds,
  alphaToRgba,
  decodePng,
  encodePng,
  extractAlpha,
  resizeAlphaMap,
} from "./lib/png.mjs";

/**
 * Gera as máscaras da marca (cabeça + arte completa), o favicon e os ícones do
 * app a partir de `public/logoNova.png`.
 *
 * A arte original é branca com fundo transparente. As máscaras mantêm apenas o
 * alfa, então o mesmo arquivo serve para qualquer cor de destaque:
 * - logo-mask.png: arte inteira (livro/herói na cor do texto)
 * - logo-head-mask.png: somente a cabeça, com transição suave para o livro
 *
 * Uso: node scripts/generate-icons.mjs
 */

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = resolve(root, "public/logoNova.png");
const brandDir = resolve(root, "src/assets/brand");
const iconsDir = resolve(root, "src-tauri/icons");
const publicDir = resolve(root, "public");

const MASK_SIZE = 768;
const FADE_START = 0.56;
const FADE_END = 0.69;

/** Cor de destaque padrão do tema escuro (hsl(213 94% 68%)). */
const DEFAULT_ACCENT = [110, 174, 247];
const ICON_BACKGROUND = [23, 23, 23];
const ICON_FOREGROUND = [244, 244, 245];

const clamp01 = (value) => (value < 0 ? 0 : value > 1 ? 1 : value);
const smoothstep = (value) => value * value * (3 - 2 * value);
const mix = (from, to, t) => from + (to - from) * t;

function buildMasks() {
  const source = decodePng(readFileSync(sourcePath));
  const alpha = extractAlpha(source);
  const bounds = alphaBounds(source, 48);

  const square = Math.ceil(Math.max(bounds.width, bounds.height) * 1.06);
  const originX = bounds.x + bounds.width / 2 - square / 2;
  const originY = bounds.y + bounds.height / 2 - square / 2;

  const sample = (x, y) => {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = x - x0;
    const fy = y - y0;
    const at = (sx, sy) => {
      if (sx < 0 || sy < 0 || sx >= source.width || sy >= source.height) return 0;
      return alpha.alpha[sy * source.width + sx];
    };
    const top = at(x0, y0) * (1 - fx) + at(x0 + 1, y0) * fx;
    const bottom = at(x0, y0 + 1) * (1 - fx) + at(x0 + 1, y0 + 1) * fx;
    return top * (1 - fy) + bottom * fy;
  };

  const full = { width: MASK_SIZE, height: MASK_SIZE, alpha: new Uint8Array(MASK_SIZE * MASK_SIZE) };
  const head = { width: MASK_SIZE, height: MASK_SIZE, alpha: new Uint8Array(MASK_SIZE * MASK_SIZE) };

  for (let y = 0; y < MASK_SIZE; y += 1) {
    const ny = (y + 0.5) / MASK_SIZE;
    const fade = smoothstep(clamp01((FADE_END - ny) / (FADE_END - FADE_START)));
    const sourceY = originY + ny * square;

    for (let x = 0; x < MASK_SIZE; x += 1) {
      const nx = (x + 0.5) / MASK_SIZE;
      const sourceX = originX + nx * square;
      const value = Math.round(sample(sourceX, sourceY));
      const index = y * MASK_SIZE + x;
      full.alpha[index] = value;
      head.alpha[index] = Math.round(value * fade);
    }
  }

  return { full, head, bounds };
}

function roundedCoverage(px, py, size) {
  const half = size / 2;
  const radius = size * 0.22;
  const qx = Math.abs(px - half) - (half - radius);
  const qy = Math.abs(py - half) - (half - radius);
  const distance = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - radius;
  return clamp01(0.5 - distance);
}

function composeIcon(full, head, size) {
  const padding = Math.round(size * 0.1);
  const artSize = size - padding * 2;
  const fullArt = resizeAlphaMap(full, artSize, artSize);
  const headArt = resizeAlphaMap(head, artSize, artSize);
  const rgba = new Uint8Array(size * size * 4);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const coverage = roundedCoverage(x + 0.5, y + 0.5, size);
      if (coverage <= 0) continue;

      const color = [...ICON_BACKGROUND];
      const artX = x - padding;
      const artY = y - padding;

      if (artX >= 0 && artY >= 0 && artX < artSize && artY < artSize) {
        const index = artY * artSize + artX;
        const artAlpha = fullArt.alpha[index] / 255;
        if (artAlpha > 0) {
          const headAlpha = headArt.alpha[index] / 255;
          const accent = Math.min(1, headAlpha / artAlpha);
          for (let channel = 0; channel < 3; channel += 1) {
            const ink = mix(ICON_FOREGROUND[channel], DEFAULT_ACCENT[channel], accent);
            color[channel] = mix(ICON_BACKGROUND[channel], ink, artAlpha);
          }
        }
      }

      const target = (y * size + x) * 4;
      rgba[target] = Math.round(color[0]);
      rgba[target + 1] = Math.round(color[1]);
      rgba[target + 2] = Math.round(color[2]);
      rgba[target + 3] = Math.round(coverage * 255);
    }
  }

  return encodePng(size, size, rgba);
}

function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);
  const directory = Buffer.alloc(16 * entries.length);
  let offset = 6 + directory.length;

  entries.forEach((entry, index) => {
    const position = index * 16;
    directory[position] = entry.size >= 256 ? 0 : entry.size;
    directory[position + 1] = entry.size >= 256 ? 0 : entry.size;
    directory[position + 2] = 0;
    directory[position + 3] = 0;
    directory.writeUInt16LE(1, position + 4);
    directory.writeUInt16LE(32, position + 6);
    directory.writeUInt32LE(entry.data.length, position + 8);
    directory.writeUInt32LE(offset, position + 12);
    offset += entry.data.length;
  });

  return Buffer.concat([header, directory, ...entries.map((entry) => entry.data)]);
}

mkdirSync(brandDir, { recursive: true });
mkdirSync(iconsDir, { recursive: true });
mkdirSync(publicDir, { recursive: true });

const { full, head, bounds } = buildMasks();
writeFileSync(resolve(brandDir, "logo-mask.png"), encodePng(MASK_SIZE, MASK_SIZE, alphaToRgba(full)));
writeFileSync(resolve(brandDir, "logo-head-mask.png"), encodePng(MASK_SIZE, MASK_SIZE, alphaToRgba(head)));

const accentPixels = Array.from(full.alpha).reduce((count, value, index) => {
  if (value > 32 && head.alpha[index] >= value * 0.5) return count + 1;
  return count;
}, 0);
const inkPixels = Array.from(full.alpha).filter((value) => value > 32).length;

const icon512 = composeIcon(full, head, 512);
const icon256 = composeIcon(full, head, 256);
const icon128 = composeIcon(full, head, 128);
const icon64 = composeIcon(full, head, 64);
const icon32 = composeIcon(full, head, 32);

writeFileSync(resolve(publicDir, "favicon.png"), icon256);
writeFileSync(resolve(iconsDir, "icon.png"), icon512);
writeFileSync(resolve(iconsDir, "32x32.png"), icon32);
writeFileSync(resolve(iconsDir, "128x128.png"), icon128);
writeFileSync(
  resolve(iconsDir, "icon.ico"),
  buildIco([
    { size: 32, data: icon32 },
    { size: 64, data: icon64 },
    { size: 128, data: icon128 },
    { size: 256, data: icon256 },
  ]),
);

console.log(
  `[eliasnote] marca ${bounds.width}x${bounds.height} → máscaras ${MASK_SIZE}px · ` +
    `${Math.round((accentPixels / Math.max(1, inkPixels)) * 100)}% dos traços na cabeça`,
);
console.log("[eliasnote] favicon.png + ícones do app atualizados");
