//! Assistente de instalação do EliasNote.
//!
//! O binário é a interface visual do instalador: ele carrega o app embutido,
//! copia os arquivos, cria atalhos e registra o produto no Windows. Executado
//! como `uninstall.exe --uninstall`, o mesmo binário faz a remoção — assim o
//! pacote não precisa de um segundo desinstalador.

mod install;

use std::path::PathBuf;

use serde::Serialize;
use tauri::Window;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct InstalledInfo {
    version: String,
    location: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Environment {
    version: String,
    mode: String,
    installed: Option<InstalledInfo>,
    default_target: String,
    data_path: String,
    payload_bytes: u64,
}

#[tauri::command]
fn setup_environment() -> Environment {
    let installed = install::detect_installed();
    let default_target = installed
        .as_ref()
        .map(|info| info.location.clone())
        .filter(|location| !location.is_empty())
        .unwrap_or_else(install::default_install_dir);

    Environment {
        version: env!("CARGO_PKG_VERSION").to_string(),
        mode: if install::is_uninstall_mode() {
            "uninstall".to_string()
        } else {
            "install".to_string()
        },
        default_target,
        data_path: install::data_dir().display().to_string(),
        payload_bytes: install::payload_len() as u64,
        installed: installed.map(|info| InstalledInfo {
            version: info.version,
            location: info.location,
        }),
    }
}

#[tauri::command]
fn setup_install(
    window: Window,
    target: String,
    desktop_shortcut: bool,
    start_menu_shortcut: bool,
    launch_after: bool,
) -> Result<(), String> {
    let directory = PathBuf::from(&target);
    install::install(&window, &directory, desktop_shortcut, start_menu_shortcut)?;
    if launch_after {
        install::launch(&directory)?;
    }
    Ok(())
}

#[tauri::command]
fn setup_uninstall(window: Window, target: String, remove_data: bool) -> Result<(), String> {
    install::uninstall(&window, &PathBuf::from(&target), remove_data)
}

#[tauri::command]
fn setup_launch(target: String) -> Result<(), String> {
    install::launch(&PathBuf::from(&target))
}

#[tauri::command]
fn setup_reveal(target: String) -> Result<(), String> {
    install::reveal(&PathBuf::from(&target))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            setup_environment,
            setup_install,
            setup_uninstall,
            setup_launch,
            setup_reveal
        ])
        .build(tauri::generate_context!())
        .expect("erro ao preparar o EliasNote Setup")
        .run(|_app, event| {
            // A remoção da pasta de instalação acontece depois do processo sair;
            // antes disso o próprio `uninstall.exe` está em uso.
            if let tauri::RunEvent::Exit = event {
                install::run_pending_removal();
            }
        });
}
