use rusqlite::{params, Connection, OptionalExtension};
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DocRow {
    pub id: String,
    pub data: String,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BackupRow {
    pub id: String,
    pub label: String,
    pub created_at: i64,
    pub size: i64,
}

pub struct Database {
    conn: Connection,
    attachments_dir: PathBuf,
}

fn now_millis() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis() as i64)
        .unwrap_or(0)
}

fn map_err(error: rusqlite::Error) -> String {
    format!("erro no banco de dados: {error}")
}

fn sanitize_filename(name: &str) -> String {
    let sanitized: String = name
        .chars()
        .map(|character| {
            if character.is_ascii_alphanumeric() || matches!(character, '.' | '-' | '_' | ' ') {
                character
            } else {
                '_'
            }
        })
        .collect();
    let trimmed = sanitized.trim().trim_start_matches('.');
    if trimmed.is_empty() {
        "anexo".to_string()
    } else {
        trimmed.chars().take(120).collect()
    }
}

impl Database {
    /// Abre (ou cria) o banco SQLite no diretório de dados do aplicativo.
    pub fn open(data_dir: &Path) -> Result<Self, String> {
        fs::create_dir_all(data_dir).map_err(|error| format!("falha ao criar diretório de dados: {error}"))?;
        let attachments_dir = data_dir.join("attachments");
        fs::create_dir_all(&attachments_dir)
            .map_err(|error| format!("falha ao criar diretório de anexos: {error}"))?;

        let path = data_dir.join("eliasnote.sqlite3");
        let conn = Connection::open(&path).map_err(map_err)?;
        conn.execute_batch(
            "PRAGMA journal_mode = WAL;
             PRAGMA synchronous = NORMAL;
             PRAGMA foreign_keys = ON;

             CREATE TABLE IF NOT EXISTS documents (
                 kind TEXT NOT NULL,
                 id TEXT NOT NULL,
                 data TEXT NOT NULL,
                 updated_at INTEGER NOT NULL,
                 PRIMARY KEY (kind, id)
             );

             CREATE TABLE IF NOT EXISTS attachments (
                 id TEXT PRIMARY KEY,
                 name TEXT NOT NULL,
                 mime TEXT NOT NULL,
                 size INTEGER NOT NULL,
                 path TEXT NOT NULL,
                 created_at INTEGER NOT NULL
             );

             CREATE TABLE IF NOT EXISTS backups (
                 id TEXT PRIMARY KEY,
                 label TEXT NOT NULL,
                 created_at INTEGER NOT NULL,
                 size INTEGER NOT NULL,
                 data TEXT NOT NULL
             );",
        )
        .map_err(map_err)?;

        Ok(Self { conn, attachments_dir })
    }

    pub fn ping(&self) -> Result<(), String> {
        self.conn
            .query_row("SELECT 1", [], |_row| Ok(()))
            .map_err(map_err)
    }

    pub fn read_doc(&self, kind: &str, id: &str) -> Result<Option<String>, String> {
        self.conn
            .query_row(
                "SELECT data FROM documents WHERE kind = ?1 AND id = ?2",
                params![kind, id],
                |row| row.get::<_, String>(0),
            )
            .optional()
            .map_err(map_err)
    }

    pub fn write_doc(&self, kind: &str, id: &str, data: &str) -> Result<(), String> {
        self.conn
            .execute(
                "INSERT INTO documents (kind, id, data, updated_at)
                 VALUES (?1, ?2, ?3, ?4)
                 ON CONFLICT(kind, id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at",
                params![kind, id, data, now_millis()],
            )
            .map_err(map_err)?;
        Ok(())
    }

    pub fn delete_doc(&self, kind: &str, id: &str) -> Result<(), String> {
        self.conn
            .execute("DELETE FROM documents WHERE kind = ?1 AND id = ?2", params![kind, id])
            .map_err(map_err)?;
        Ok(())
    }

    pub fn list_docs(&self, kind: &str) -> Result<Vec<DocRow>, String> {
        let mut statement = self
            .conn
            .prepare("SELECT id, data FROM documents WHERE kind = ?1 ORDER BY id")
            .map_err(map_err)?;
        let rows = statement
            .query_map(params![kind], |row| {
                Ok(DocRow {
                    id: row.get(0)?,
                    data: row.get(1)?,
                })
            })
            .map_err(map_err)?;
        let mut docs = Vec::new();
        for row in rows {
            docs.push(row.map_err(map_err)?);
        }
        Ok(docs)
    }

    pub fn save_attachment(
        &self,
        id: &str,
        name: &str,
        mime: &str,
        size: i64,
        bytes: &[u8],
    ) -> Result<String, String> {
        if let Some(previous) = self.attachment_path(id)? {
            let _ = fs::remove_file(previous);
        }
        let filename = format!("{id}_{}", sanitize_filename(name));
        let path: PathBuf = self.attachments_dir.join(filename);
        fs::write(&path, bytes).map_err(|error| format!("falha ao gravar anexo: {error}"))?;
        let path_string = path.to_string_lossy().to_string();
        self.conn
            .execute(
                "INSERT INTO attachments (id, name, mime, size, path, created_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6)
                 ON CONFLICT(id) DO UPDATE SET name = excluded.name, mime = excluded.mime,
                     size = excluded.size, path = excluded.path",
                params![id, name, mime, size, path_string, now_millis()],
            )
            .map_err(map_err)?;
        Ok(path_string)
    }

    /// Copia um anexo já existente no disco (ex.: cofre Obsidian) para o
    /// armazenamento do app, sem carregar o conteúdo no processo de interface.
    pub fn save_attachment_from_path(
        &self,
        id: &str,
        name: &str,
        mime: &str,
        source: &Path,
    ) -> Result<(), String> {
        if let Some(previous) = self.attachment_path(id)? {
            let _ = fs::remove_file(previous);
        }
        let metadata =
            fs::metadata(source).map_err(|error| format!("falha ao ler anexo: {error}"))?;
        if !metadata.is_file() {
            return Err("o caminho informado não é um arquivo".to_string());
        }
        let filename = format!("{id}_{}", sanitize_filename(name));
        let path: PathBuf = self.attachments_dir.join(filename);
        fs::copy(source, &path).map_err(|error| format!("falha ao copiar anexo: {error}"))?;
        let size = metadata.len() as i64;
        let path_string = path.to_string_lossy().to_string();
        self.conn
            .execute(
                "INSERT INTO attachments (id, name, mime, size, path, created_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6)
                 ON CONFLICT(id) DO UPDATE SET name = excluded.name, mime = excluded.mime,
                     size = excluded.size, path = excluded.path",
                params![id, name, mime, size, path_string, now_millis()],
            )
            .map_err(map_err)?;
        Ok(())
    }

    pub fn attachment_path(&self, id: &str) -> Result<Option<String>, String> {
        let path = self
            .conn
            .query_row(
                "SELECT path FROM attachments WHERE id = ?1",
                params![id],
                |row| row.get::<_, String>(0),
            )
            .optional()
            .map_err(map_err)?;
        Ok(path.filter(|candidate| Path::new(candidate).exists()))
    }

    pub fn delete_attachment(&self, id: &str) -> Result<(), String> {
        if let Some(path) = self.attachment_path(id)? {
            let _ = fs::remove_file(path);
        }
        self.conn
            .execute("DELETE FROM attachments WHERE id = ?1", params![id])
            .map_err(map_err)?;
        Ok(())
    }

    pub fn list_backups(&self) -> Result<Vec<BackupRow>, String> {
        let mut statement = self
            .conn
            .prepare("SELECT id, label, created_at, size FROM backups ORDER BY created_at DESC")
            .map_err(map_err)?;
        let rows = statement
            .query_map([], |row| {
                Ok(BackupRow {
                    id: row.get(0)?,
                    label: row.get(1)?,
                    created_at: row.get(2)?,
                    size: row.get(3)?,
                })
            })
            .map_err(map_err)?;
        let mut backups = Vec::new();
        for row in rows {
            backups.push(row.map_err(map_err)?);
        }
        Ok(backups)
    }

    pub fn create_backup(&self, label: &str, data: &str, keep: usize) -> Result<BackupRow, String> {
        let created_at = now_millis();
        let mut id = format!("backup_{created_at}");
        let mut attempt = 0;
        while self
            .conn
            .query_row("SELECT 1 FROM backups WHERE id = ?1", params![id], |_row| Ok(()))
            .optional()
            .map_err(map_err)?
            .is_some()
        {
            attempt += 1;
            id = format!("backup_{created_at}_{attempt}");
        }
        let size = data.len() as i64;
        self.conn
            .execute(
                "INSERT INTO backups (id, label, created_at, size, data) VALUES (?1, ?2, ?3, ?4, ?5)",
                params![id, label, created_at, size, data],
            )
            .map_err(map_err)?;
        self.conn
            .execute(
                "DELETE FROM backups WHERE id NOT IN (
                     SELECT id FROM backups ORDER BY created_at DESC LIMIT ?1
                 )",
                params![keep.max(1) as i64],
            )
            .map_err(map_err)?;
        Ok(BackupRow {
            id,
            label: label.to_string(),
            created_at,
            size,
        })
    }

    pub fn read_backup(&self, id: &str) -> Result<Option<String>, String> {
        self.conn
            .query_row(
                "SELECT data FROM backups WHERE id = ?1",
                params![id],
                |row| row.get::<_, String>(0),
            )
            .optional()
            .map_err(map_err)
    }

    pub fn delete_backup(&self, id: &str) -> Result<(), String> {
        self.conn
            .execute("DELETE FROM backups WHERE id = ?1", params![id])
            .map_err(map_err)?;
        Ok(())
    }

    pub fn clear_all(&self) -> Result<(), String> {
        self.conn
            .execute_batch("DELETE FROM documents; DELETE FROM attachments; DELETE FROM backups;")
            .map_err(map_err)?;
        if let Ok(entries) = fs::read_dir(&self.attachments_dir) {
            for entry in entries.flatten() {
                let _ = fs::remove_file(entry.path());
            }
        }
        Ok(())
    }
}
