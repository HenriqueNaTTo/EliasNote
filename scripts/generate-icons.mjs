import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const iconsDir = resolve(root, "src-tauri/icons");
mkdirSync(iconsDir, { recursive: true });

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, "ascii");
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

/** Gera um PNG RGBA com marca geométrica (estrela de quatro pontas). */
function generatePng(size) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  const center = (size - 1) / 2;
  const radius = size * 0.5;
  const cornerRadius = size * 0.2;

  for (let y = 0; y < size; y += 1) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0;
    for (let x = 0; x < size; x += 1) {
      const offset = rowStart + 1 + x * 4;
      const dx = x - center;
      const dy = y - center;
      const distance = Math.hypot(dx, dy);

      // Cantos arredondados do quadrado.
      const half = size / 2;
      const cornerX = Math.abs(dx) - (half - cornerRadius);
      const cornerY = Math.abs(dy) - (half - cornerRadius);
      const outside = cornerX > 0 && cornerY > 0 && Math.hypot(cornerX, cornerY) > cornerRadius;

      const gradient = Math.min(1, Math.max(0, (x + y) / (size * 1.6)));
      const r = Math.round(124 + (66 - 124) * gradient);
      const g = Math.round(92 + (52 - 92) * gradient);
      const b = Math.round(255 + (214 - 255) * gradient);

      // Estrela de quatro pontas (superelipse).
      const nx = Math.abs(dx) / (radius * 0.62);
      const ny = Math.abs(dy) / (radius * 0.62);
      const star = Math.pow(nx, 0.55) + Math.pow(ny, 0.55);
      const inStar = star <= 1;
      const glow = inStar ? 0 : Math.max(0, 1 - star) * 0;

      raw[offset] = inStar ? 255 : r;
      raw[offset + 1] = inStar ? 255 : g;
      raw[offset + 2] = inStar ? 255 : b;
      raw[offset + 3] = outside || distance > half ? 0 : Math.round(255 * (0.94 + glow));
    }
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
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

const sizes = [32, 64, 128, 256, 512];
const pngs = new Map(sizes.map((size) => [size, generatePng(size)]));
writeFileSync(resolve(iconsDir, "icon.png"), pngs.get(512));
writeFileSync(resolve(iconsDir, "32x32.png"), pngs.get(32));
writeFileSync(resolve(iconsDir, "128x128.png"), pngs.get(128));
writeFileSync(
  resolve(iconsDir, "icon.ico"),
  buildIco([32, 64, 128, 256].map((size) => ({ size, data: pngs.get(size) }))),
);
console.log("[eliasnote] ícones gerados em src-tauri/icons");
