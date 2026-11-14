import { DatabaseSync } from "node:sqlite";
import { existsSync } from "node:fs";

/**
 * Utilitário de diagnóstico: mostra tabelas e documentos do banco SQLite local.
 * Uso: node scripts/inspect-db.mjs "%APPDATA%\com.eliasnote.desktop\eliasnote.sqlite3"
 */
const path = process.argv[2];
if (!path || !existsSync(path)) {
  console.error("Banco não encontrado:", path ?? "(informe o caminho)");
  process.exit(1);
}

const db = new DatabaseSync(path, { readOnly: true });
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").all();
console.log("Tabelas:", tables.map((row) => row.name).join(", ") || "(nenhuma)");

const documents = db.prepare("SELECT kind, id, length(data) AS bytes FROM documents ORDER BY kind, id").all();
console.log("Documentos:", documents.length);
for (const document of documents) {
  console.log(`  ${document.kind}/${document.id} — ${document.bytes} bytes`);
}

const app = db.prepare("SELECT data FROM documents WHERE kind = 'app' AND id = 'main'").get();
if (app) {
  const parsed = JSON.parse(app.data);
  console.log("Workspaces:", parsed.workspaceOrder?.length ?? 0, "| abas:", parsed.tabs?.length ?? 0);
  console.log("Templates customizados:", parsed.customTemplates?.length ?? 0);
}

const board = db.prepare("SELECT id, data FROM documents WHERE kind = 'board' LIMIT 1").get();
if (board) {
  const parsed = JSON.parse(board.data);
  console.log(`Quadro "${parsed.title}":`, Object.keys(parsed.nodes ?? {}).length, "elementos");
}

const attachments = db.prepare("SELECT count(*) AS total FROM attachments").get();
console.log("Anexos:", attachments.total);
db.close();
