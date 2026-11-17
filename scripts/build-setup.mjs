#!/usr/bin/env node
/**
 * Monta o instalador visual do EliasNote (`EliasNote_<versão>_x64-setup.exe`).
 *
 * Etapas:
 *  1. build do frontend (inclui `setup.html` e o typecheck);
 *  2. build release do app via CLI do Tauri → `eliasnote.exe` com os assets embutidos;
 *  3. embute o app em `setup/src-tauri/payload` e copia os ícones;
 *  4. build release do assistente via CLI do Tauri (mesmo pipeline de assets);
 *  5. publica o `.exe` final em `dist-setup/`.
 *
 * O CLI do Tauri é obrigatório nas etapas 2 e 4: só ele define as variáveis
 * `TAURI_ENV_*` usadas para embutir o frontend de produção no binário.
 *
 * Uso: npm run setup:build
 */
import { execSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function log(message) {
  console.log(`\n[setup] ${message}`);
}

function fail(message) {
  console.error(`[setup] ${message}`);
  process.exit(1);
}

if (process.platform !== "win32") {
  fail("o assistente usa WebView2 e o registro do Windows; rode este script em uma máquina Windows.");
}

const readJson = (relative) => JSON.parse(readFileSync(resolve(root, relative), "utf8"));

function run(command, cwd) {
  log(command);
  execSync(command, { cwd, stdio: "inherit" });
}

/** Executa o CLI do Tauri e devolve o caminho do binário que ele imprimiu. */
function buildWithTauri(cwd, args) {
  const command = `npx tauri build ${args}`.trim();
  log(command);
  // O CLI escreve os logs em stderr; `2>&1` junta tudo na saída capturada.
  const output = execSync(`${command} 2>&1`, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
  process.stdout.write(output);
  const match = /Built application at:\s*(\S+)/.exec(output);
  if (!match) fail(`não foi possível ler o caminho do binário na saída do CLI:\n${output}`);
  return match[1];
}

const appVersion = readJson("src-tauri/tauri.conf.json").version;
const setupVersion = readJson("setup/src-tauri/tauri.conf.json").version;
if (setupVersion !== appVersion) {
  fail(`versão do assistente (${setupVersion}) diferente do app (${appVersion}): rode npm run version:set ${appVersion}`);
}

/* 1. Aplicativo que será instalado (o `beforeBuildCommand` também monta o dist,
      que o assistente embute na etapa seguinte) */
const appExe = buildWithTauri(root, "--no-bundle");
if (!existsSync(appExe)) fail(`não encontrei o binário do app em ${appExe}`);

/* 3. Payload e ícones do assistente */
const payloadDir = resolve(root, "setup/src-tauri/payload");
const iconsDir = resolve(root, "setup/src-tauri/icons");
mkdirSync(payloadDir, { recursive: true });
mkdirSync(iconsDir, { recursive: true });
copyFileSync(appExe, join(payloadDir, "eliasnote.exe"));
copyFileSync(resolve(root, "src-tauri/icons/icon.ico"), join(iconsDir, "icon.ico"));
copyFileSync(resolve(root, "src-tauri/icons/icon.png"), join(iconsDir, "icon.png"));
log(`payload embutido: ${(statSync(appExe).size / 1024 / 1024).toFixed(2)} MiB`);

/* 4. Assistente (bundle desativado: a saída é o .exe, não um instalador NSIS) */
const setupExe = buildWithTauri(resolve(root, "setup"), "");
if (!existsSync(setupExe)) fail(`não encontrei o assistente em ${setupExe}`);

/* 5. Saída */
const outputDir = resolve(root, "dist-setup");
mkdirSync(outputDir, { recursive: true });
const output = join(outputDir, `EliasNote_${appVersion}_x64-setup.exe`);
copyFileSync(setupExe, output);

log(`pronto: ${output} (${(statSync(output).size / 1024 / 1024).toFixed(2)} MiB)`);
