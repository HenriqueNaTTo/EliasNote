//! Instalação e desinstalação do EliasNote a partir do assistente.
//!
//! Tudo é feito no escopo do usuário atual (`%LOCALAPPDATA%`, `HKCU`), sem
//! elevação — a mesma política do app, que guarda os quadros em `%APPDATA%`.

use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::Mutex;

use serde::Serialize;
use tauri::{Emitter, Window};

/// Pasta de instalação a apagar quando o desinstalador terminar de sair.
static PENDING_REMOVAL: Mutex<Option<PathBuf>> = Mutex::new(None);

/// Aplicativo embutido no assistente em tempo de compilação.
///
/// O arquivo é produzido por `scripts/build-setup.mjs` antes do build deste
/// crate (`cargo build` falha com mensagem clara quando ele não existe).
static PAYLOAD: &[u8] = include_bytes!("../payload/eliasnote.exe");

const APP_EXE: &str = "EliasNote.exe";
const UNINSTALLER: &str = "uninstall.exe";
const UNINSTALL_FLAG: &str = "--uninstall";
const PRODUCT: &str = "EliasNote";
const PUBLISHER: &str = "EliasNote";
const HOMEPAGE: &str = "https://github.com/HenriqueNaTTo/EliasNote";

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Progress {
    stage: &'static str,
    percent: u8,
    detail: String,
}

pub struct Installed {
    pub version: String,
    pub location: String,
}

pub fn payload_len() -> usize {
    PAYLOAD.len()
}

pub fn is_uninstall_mode() -> bool {
    std::env::args().any(|argument| argument == UNINSTALL_FLAG)
}

fn env_dir(name: &str) -> PathBuf {
    std::env::var_os(name)
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("C:\\"))
}

/// Dados do app (SQLite, anexos e cache do WebView).
pub fn data_dir() -> PathBuf {
    env_dir("APPDATA").join("com.eliasnote.desktop")
}

pub fn local_data_dir() -> PathBuf {
    env_dir("LOCALAPPDATA").join("com.eliasnote.desktop")
}

/// Mesmo destino do instalador NSIS no modo `currentUser`.
pub fn default_install_dir() -> String {
    env_dir("LOCALAPPDATA").join(PRODUCT).display().to_string()
}

fn start_menu_lnk() -> PathBuf {
    env_dir("APPDATA")
        .join("Microsoft\\Windows\\Start Menu\\Programs")
        .join(format!("{PRODUCT}.lnk"))
}

fn desktop_lnk() -> PathBuf {
    env_dir("USERPROFILE").join("Desktop").join(format!("{PRODUCT}.lnk"))
}

fn emit(window: &Window, stage: &'static str, percent: u8, detail: impl Into<String>) {
    let _ = window.emit(
        "setup:progress",
        Progress {
            stage,
            percent,
            detail: detail.into(),
        },
    );
}

/* ------------------------------------------------------------------ *
 * Instalação
 * ------------------------------------------------------------------ */

pub fn install(
    window: &Window,
    target: &Path,
    desktop_shortcut: bool,
    start_menu_shortcut: bool,
) -> Result<(), String> {
    emit(window, "prepare", 4, "Conferindo a pasta de destino");
    fs::create_dir_all(target)
        .map_err(|error| format!("não foi possível criar {}: {error}", target.display()))?;
    if target.join(APP_EXE).exists() {
        ensure_app_closed(target, "Feche o EliasNote antes de atualizar.")?;
    }

    let executable = target.join(APP_EXE);
    emit(window, "files", 12, "Copiando o aplicativo");
    write_payload(window, &executable, 12, 62)?;

    emit(window, "files", 64, "Preparando o desinstalador");
    let uninstaller = target.join(UNINSTALLER);
    // O desinstalador é o próprio assistente: rodando como `uninstall.exe
    // --uninstall` ele abre a interface de remoção.
    let current = std::env::current_exe()
        .map_err(|error| format!("não foi possível localizar o assistente: {error}"))?;
    fs::copy(&current, &uninstaller)
        .map_err(|error| format!("não foi possível gravar o desinstalador: {error}"))?;
    emit(window, "files", 72, "Desinstalador pronto");

    emit(window, "shortcuts", 78, "Criando atalhos");
    if start_menu_shortcut {
        create_shortcut(&start_menu_lnk(), &executable)?;
    } else {
        remove_file_if_exists(&start_menu_lnk());
    }
    if desktop_shortcut {
        create_shortcut(&desktop_lnk(), &executable)?;
    } else {
        remove_file_if_exists(&desktop_lnk());
    }

    emit(window, "registry", 90, "Registrando no Windows");
    write_registry(target, &executable, &uninstaller)?;

    emit(window, "finish", 100, "Instalação concluída");
    Ok(())
}

/// Grava o payload em blocos, emitindo progresso entre `from` e `to` por cento.
fn write_payload(window: &Window, destination: &Path, from: u8, to: u8) -> Result<(), String> {
    let mut file = fs::File::create(destination)
        .map_err(|error| format!("não foi possível gravar {}: {error}", destination.display()))?;

    use std::io::Write;
    const CHUNK: usize = 1 << 20;
    let total = PAYLOAD.len().max(1);
    let mut written = 0usize;
    while written < PAYLOAD.len() {
        let end = (written + CHUNK).min(PAYLOAD.len());
        file.write_all(&PAYLOAD[written..end])
            .map_err(|error| format!("falha ao gravar {}: {error}", destination.display()))?;
        written = end;
        let ratio = written as f32 / total as f32;
        let percent = from + ((to - from) as f32 * ratio).round() as u8;
        if written < PAYLOAD.len() {
            emit(window, "files", percent.min(to), "Copiando o aplicativo");
        }
    }
    file.flush()
        .map_err(|error| format!("falha ao concluir {}: {error}", destination.display()))?;
    Ok(())
}

pub fn launch(target: &Path) -> Result<(), String> {
    let executable = target.join(APP_EXE);
    Command::new(&executable)
        .current_dir(target)
        .spawn()
        .map(|_| ())
        .map_err(|error| format!("não foi possível abrir {}: {error}", executable.display()))
}

pub fn reveal(target: &Path) -> Result<(), String> {
    Command::new("explorer")
        .arg(target)
        .spawn()
        .map(|_| ())
        .map_err(|error| format!("não foi possível abrir a pasta: {error}"))
}

/* ------------------------------------------------------------------ *
 * Desinstalação
 * ------------------------------------------------------------------ */

pub fn uninstall(window: &Window, target: &Path, remove_data: bool) -> Result<(), String> {
    ensure_app_closed(target, "Feche o EliasNote antes de remover o programa.")?;

    emit(window, "shortcuts", 15, "Removendo atalhos");
    remove_file_if_exists(&start_menu_lnk());
    remove_file_if_exists(&desktop_lnk());

    emit(window, "registry", 35, "Limpando o registro do Windows");
    delete_registry();

    emit(window, "files", 60, "Removendo os arquivos do programa");
    remove_program_files(target);

    if remove_data {
        emit(window, "data", 85, "Apagando quadros e anexos");
        let _ = fs::remove_dir_all(data_dir());
        let _ = fs::remove_dir_all(local_data_dir());
    }

    emit(window, "finish", 100, "EliasNote removido");
    mark_pending_removal(target);
    Ok(())
}

/// Remover o conteúdo da pasta falha silenciosamente quando o app está aberto,
/// então o assistente avisa antes de começar.
fn ensure_app_closed(target: &Path, message: &str) -> Result<(), String> {
    let executable = target.join(APP_EXE);
    if !executable.exists() {
        return Ok(());
    }
    match fs::OpenOptions::new().write(true).open(&executable) {
        Ok(_) => Ok(()),
        Err(_) => Err(message.to_string()),
    }
}

/// Remove o conteúdo da pasta de instalação, preservando o próprio desinstalador
/// (que só pode ser apagado depois que este processo terminar).
fn remove_program_files(target: &Path) {
    let running = std::env::current_exe()
        .ok()
        .and_then(|path| path.file_name().map(|name| name.to_string_lossy().to_string()));

    let Ok(entries) = fs::read_dir(target) else {
        return;
    };
    for entry in entries.flatten() {
        let path = entry.path();
        if let Some(name) = path.file_name() {
            if Some(name.to_string_lossy().to_string()) == running {
                continue;
            }
        }
        if path.is_dir() {
            let _ = fs::remove_dir_all(&path);
        } else {
            let _ = fs::remove_file(&path);
        }
    }
}

/// Agenda a remoção da pasta para quando o assistente terminar de fechar.
///
/// O `uninstall.exe` é o próprio processo em execução: apagar a pasta antes de
/// sair falha com "em uso". A remoção é feita no evento de saída do app.
fn mark_pending_removal(target: &Path) {
    if let Ok(mut slot) = PENDING_REMOVAL.lock() {
        *slot = Some(target.to_path_buf());
    }
}

/// Executado em `RunEvent::Exit`: dispara o `rmdir` depois que o processo morre.
pub fn run_pending_removal() {
    let target = PENDING_REMOVAL.lock().ok().and_then(|mut slot| slot.take());
    let Some(target) = target else {
        return;
    };

    // Um `.cmd` em %TEMP% evita o inferno de aspas do `cmd /C` com `&` e caminhos
    // entre aspas; o próprio script se apaga no final.
    let script = std::env::temp_dir().join("eliasnote-uninstall.cmd");
    let contents = format!(
        "@echo off\r\nping -n 3 127.0.0.1 >nul\r\nrmdir /s /q \"{}\"\r\ndel \"%~f0\"\r\n",
        target.display()
    );
    if fs::write(&script, contents).is_err() {
        return;
    }
    let _ = Command::new("cmd")
        .args(["/C", script.to_string_lossy().as_ref()])
        .spawn();
}

/* ------------------------------------------------------------------ *
 * Atalhos (.lnk via WScript.Shell, sem dependências nativas)
 * ------------------------------------------------------------------ */

fn create_shortcut(link: &Path, executable: &Path) -> Result<(), String> {
    if let Some(parent) = link.parent() {
        fs::create_dir_all(parent)
            .map_err(|error| format!("não foi possível criar {}: {error}", parent.display()))?;
    }

    let working_directory = executable.parent().unwrap_or(Path::new(""));
    let script = concat!(
        "$shell = New-Object -ComObject WScript.Shell;",
        "$shortcut = $shell.CreateShortcut($env:ELIASNOTE_LINK);",
        "$shortcut.TargetPath = $env:ELIASNOTE_EXE;",
        "$shortcut.WorkingDirectory = $env:ELIASNOTE_DIR;",
        "$shortcut.IconLocation = ($env:ELIASNOTE_EXE + ',0');",
        "$shortcut.Description = 'EliasNote';",
        "$shortcut.Save()"
    );

    let status = Command::new("powershell")
        .args([
            "-NoProfile",
            "-NonInteractive",
            "-WindowStyle",
            "Hidden",
            "-Command",
            script,
        ])
        .env("ELIASNOTE_LINK", link)
        .env("ELIASNOTE_EXE", executable)
        .env("ELIASNOTE_DIR", working_directory)
        .status()
        .map_err(|error| format!("não foi possível criar o atalho: {error}"))?;

    if status.success() {
        Ok(())
    } else {
        Err(format!("o Windows recusou criar o atalho {}", link.display()))
    }
}

fn remove_file_if_exists(path: &Path) {
    if path.exists() {
        let _ = fs::remove_file(path);
    }
}

/* ------------------------------------------------------------------ *
 * Registro (somente Windows)
 * ------------------------------------------------------------------ */

#[cfg(windows)]
mod registry {
    use super::{Installed, HOMEPAGE, PRODUCT, PUBLISHER, UNINSTALL_FLAG};
    use std::path::Path;
    use winreg::enums::HKEY_CURRENT_USER;
    use winreg::RegKey;

    const UNINSTALL_KEY: &str = r"Software\Microsoft\Windows\CurrentVersion\Uninstall\EliasNote";
    const PRODUCT_KEY: &str = r"Software\EliasNote\EliasNote";

    fn uninstall_key() -> std::io::Result<RegKey> {
        RegKey::predef(HKEY_CURRENT_USER).create_subkey(UNINSTALL_KEY).map(|(key, _)| key)
    }

    pub fn write(target: &Path, executable: &Path, uninstaller: &Path) -> Result<(), String> {
        let key = uninstall_key().map_err(|error| format!("falha no registro: {error}"))?;
        let location = target.display().to_string();
        let exe = executable.display().to_string();
        let uninstall_command = format!("\"{}\" {}", uninstaller.display(), UNINSTALL_FLAG);
        let estimated_size = (super::payload_len() * 2 / 1024) as u32;

        let write = |name: &str, value: &str| -> Result<(), String> {
            key.set_value(name, &value.to_string())
                .map_err(|error| format!("falha ao gravar {name}: {error}"))
        };

        write("DisplayName", PRODUCT)?;
        write("DisplayVersion", env!("CARGO_PKG_VERSION"))?;
        write("Publisher", PUBLISHER)?;
        write("DisplayIcon", &exe)?;
        write("InstallLocation", &location)?;
        write("UninstallString", &uninstall_command)?;
        write("QuietUninstallString", &uninstall_command)?;
        write("URLInfoAbout", HOMEPAGE)?;
        key.set_value("NoModify", &1u32)
            .map_err(|error| format!("falha ao gravar NoModify: {error}"))?;
        key.set_value("NoRepair", &1u32)
            .map_err(|error| format!("falha ao gravar NoRepair: {error}"))?;
        key.set_value("EstimatedSize", &estimated_size)
            .map_err(|error| format!("falha ao gravar EstimatedSize: {error}"))?;

        let (product_key, _) = RegKey::predef(HKEY_CURRENT_USER)
            .create_subkey(PRODUCT_KEY)
            .map_err(|error| format!("falha no registro: {error}"))?;
        product_key
            .set_value("", &location)
            .map_err(|error| format!("falha no registro: {error}"))?;

        Ok(())
    }

    pub fn delete() {
        let _ = RegKey::predef(HKEY_CURRENT_USER).delete_subkey_all(UNINSTALL_KEY);
        let _ = RegKey::predef(HKEY_CURRENT_USER).delete_subkey_all(PRODUCT_KEY);
        let _ = RegKey::predef(HKEY_CURRENT_USER).delete_subkey_all(r"Software\EliasNote");
    }

    pub fn detect() -> Option<Installed> {
        let key = RegKey::predef(HKEY_CURRENT_USER)
            .open_subkey(UNINSTALL_KEY)
            .ok()?;
        let version: String = key.get_value("DisplayVersion").ok()?;
        let location: String = key.get_value("InstallLocation").unwrap_or_default();
        Some(Installed { version, location })
    }
}

#[cfg(not(windows))]
mod registry {
    use super::Installed;
    use std::path::Path;

    pub fn write(_target: &Path, _executable: &Path, _uninstaller: &Path) -> Result<(), String> {
        Err("o assistente de instalação é exclusivo do Windows".to_string())
    }

    pub fn delete() {}

    pub fn detect() -> Option<Installed> {
        None
    }
}

pub fn write_registry(
    target: &Path,
    executable: &Path,
    uninstaller: &Path,
) -> Result<(), String> {
    registry::write(target, executable, uninstaller)
}

pub fn delete_registry() {
    registry::delete()
}

pub fn detect_installed() -> Option<Installed> {
    registry::detect()
}
