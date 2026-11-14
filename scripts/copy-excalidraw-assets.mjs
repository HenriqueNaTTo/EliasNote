import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "node_modules/@excalidraw/excalidraw/dist/prod");
const target = resolve(root, "public/excalidraw-assets");

/**
 * Copia as fontes e dados do Excalidraw para `public/`, garantindo carregamento
 * offline (sem CDN). Executado antes de `dev` e `build`.
 */
function copyDirectory(name) {
  const from = resolve(source, name);
  const to = resolve(target, name);
  if (!existsSync(from)) return;
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
  console.log(`[eliasnote] assets copiados: ${name}`);
}

mkdirSync(target, { recursive: true });
for (const directory of ["fonts", "data", "locales"]) copyDirectory(directory);
