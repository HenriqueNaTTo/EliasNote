#!/usr/bin/env node
/**
 * Sincroniza a versão do aplicativo nos três manifestos do projeto.
 *
 * Uso: npm run version:set 0.2.0
 * Aceita tag com ou sem prefixo `v` (ex.: `v0.2.0`).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

function fail(message) {
  console.error(`[version] ${message}`);
  process.exit(1);
}

const input = process.argv[2];
if (!input) fail("informe a versão. Exemplo: npm run version:set 0.2.0");

const version = input.trim().replace(/^v/i, "");
if (!SEMVER.test(version)) {
  fail(`versão inválida "${input}". Use MAJOR.MINOR.PATCH (ex.: 0.2.0 ou 0.2.0-beta.1).`);
}

/** Reescreve apenas a chave `version`, preservando formatação e ordem do JSON. */
function updateJson(relativePath) {
  const file = join(root, relativePath);
  const source = readFileSync(file, "utf8");
  const next = source.replace(/("version"\s*:\s*")[^"]+(")/, `$1${version}$2`);
  if (next === source) return false;
  JSON.parse(next); // falha cedo se a substituição quebrar o arquivo
  writeFileSync(file, next, "utf8");
  return true;
}

/** Reescreve a primeira linha `version = "..."` do Cargo.toml (seção [package]). */
function updateCargoToml(relativePath) {
  const file = join(root, relativePath);
  const source = readFileSync(file, "utf8");
  const next = source.replace(/^(version = ")[^"]+(")/m, `$1${version}$2`);
  if (next === source) return false;
  writeFileSync(file, next, "utf8");
  return true;
}

const changed = [
  ["package.json", updateJson("package.json")],
  ["src-tauri/tauri.conf.json", updateJson("src-tauri/tauri.conf.json")],
  ["src-tauri/Cargo.toml", updateCargoToml("src-tauri/Cargo.toml")],
  ["setup/src-tauri/tauri.conf.json", updateJson("setup/src-tauri/tauri.conf.json")],
  ["setup/src-tauri/Cargo.toml", updateCargoToml("setup/src-tauri/Cargo.toml")],
]
  .filter(([, updated]) => updated)
  .map(([name]) => name);

if (changed.length === 0) {
  console.log(`[version] tudo já estava em ${version}`);
} else {
  console.log(`[version] ${version} aplicada em: ${changed.join(", ")}`);
}
console.log("[version] lembre de atualizar os Cargo.lock no próximo build do Rust.");
