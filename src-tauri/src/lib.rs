use base64::{engine::general_purpose::STANDARD, Engine as _};
use std::path::PathBuf;
use std::sync::{Mutex, MutexGuard};
use tauri::{Manager, State};

mod db;
mod vault;
use db::{BackupRow, Database, DocRow};

struct AppState {
    db: Mutex<Database>,
    #[allow(dead_code)]
    data_dir: PathBuf,
}

impl AppState {
    fn db(&self) -> Result<MutexGuard<'_, Database>, String> {
        self.db
            .lock()
            .map_err(|_| "banco de dados indisponível".to_string())
    }
}

#[tauri::command]
fn db_init(state: State<'_, AppState>) -> Result<(), String> {
    state.db()?.ping()
}

#[tauri::command]
fn doc_read(state: State<'_, AppState>, kind: String, id: String) -> Result<Option<String>, String> {
    state.db()?.read_doc(&kind, &id)
}

#[tauri::command]
fn doc_write(state: State<'_, AppState>, kind: String, id: String, data: String) -> Result<(), String> {
    state.db()?.write_doc(&kind, &id, &data)
}

#[tauri::command]
fn doc_delete(state: State<'_, AppState>, kind: String, id: String) -> Result<(), String> {
    state.db()?.delete_doc(&kind, &id)
}

#[tauri::command]
fn doc_list(state: State<'_, AppState>, kind: String) -> Result<Vec<DocRow>, String> {
    state.db()?.list_docs(&kind)
}

#[tauri::command]
fn attachment_save(
    state: State<'_, AppState>,
    id: String,
    name: String,
    mime: String,
    size: i64,
    data_base64: String,
) -> Result<String, String> {
    let bytes = STANDARD
        .decode(data_base64.as_bytes())
        .map_err(|error| format!("anexo inválido: {error}"))?;
    state
        .db()?
        .save_attachment(&id, &name, &mime, size, &bytes)
}

#[tauri::command]
fn attachment_path(state: State<'_, AppState>, id: String) -> Result<Option<String>, String> {
    state.db()?.attachment_path(&id)
}

#[tauri::command]
fn attachment_delete(state: State<'_, AppState>, id: String) -> Result<(), String> {
    state.db()?.delete_attachment(&id)
}

#[tauri::command]
fn attachment_import_path(
    state: State<'_, AppState>,
    id: String,
    name: String,
    mime: String,
    source_path: String,
) -> Result<(), String> {
    state
        .db()?
        .save_attachment_from_path(&id, &name, &mime, std::path::Path::new(&source_path))
}

#[tauri::command]
fn vault_scan(root: String) -> Result<vault::VaultScanResult, String> {
    vault::scan_vault(std::path::Path::new(&root))
}

#[tauri::command]
fn backup_list(state: State<'_, AppState>) -> Result<Vec<BackupRow>, String> {
    state.db()?.list_backups()
}

#[tauri::command]
fn backup_create(
    state: State<'_, AppState>,
    label: String,
    data_json: String,
    keep: usize,
) -> Result<BackupRow, String> {
    state.db()?.create_backup(&label, &data_json, keep)
}

#[tauri::command]
fn backup_read(state: State<'_, AppState>, id: String) -> Result<Option<String>, String> {
    state.db()?.read_backup(&id)
}

#[tauri::command]
fn backup_delete(state: State<'_, AppState>, id: String) -> Result<(), String> {
    state.db()?.delete_backup(&id)
}

#[tauri::command]
fn clear_all(state: State<'_, AppState>) -> Result<(), String> {
    state.db()?.clear_all()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let data_dir = app.path().app_data_dir()?;
            let database = Database::open(&data_dir)
                .map_err(|error| -> Box<dyn std::error::Error> { error.into() })?;
            app.manage(AppState {
                db: Mutex::new(database),
                data_dir,
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            db_init,
            doc_read,
            doc_write,
            doc_delete,
            doc_list,
            attachment_save,
            attachment_import_path,
            attachment_path,
            attachment_delete,
            vault_scan,
            backup_list,
            backup_create,
            backup_read,
            backup_delete,
            clear_all
        ])
        .run(tauri::generate_context!())
        .expect("erro ao iniciar o EliasNote");
}
