use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};

const IGNORED_DIRECTORIES: &[&str] = &[".obsidian", ".trash", ".git", ".github", "node_modules"];
const TEXT_EXTENSIONS: &[&str] = &["md", "markdown", "canvas", "excalidraw"];
const MAX_FILES: usize = 20_000;
const MAX_TEXT_BYTES: u64 = 8 * 1024 * 1024;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VaultFileRow {
    pub path: String,
    pub name: String,
    pub size: i64,
    pub text: Option<String>,
    pub source_path: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VaultScanResult {
    pub files: Vec<VaultFileRow>,
    pub truncated: bool,
}

/// Lê recursivamente um cofre Obsidian. Pastas internas e arquivos ocultos são
/// ignorados; apenas arquivos Markdown/Canvas/Excalidraw têm o texto carregado.
pub fn scan_vault(root: &Path) -> Result<VaultScanResult, String> {
    let metadata = fs::metadata(root).map_err(|error| format!("pasta inválida: {error}"))?;
    if !metadata.is_dir() {
        return Err("selecione uma pasta de cofre, não um arquivo".to_string());
    }

    let mut files = Vec::new();
    let mut truncated = false;
    walk(root, root, &mut files, &mut truncated);
    files.sort_by(|a, b| a.path.cmp(&b.path));

    Ok(VaultScanResult { files, truncated })
}

fn walk(root: &Path, directory: &Path, files: &mut Vec<VaultFileRow>, truncated: &mut bool) {
    if files.len() >= MAX_FILES {
        *truncated = true;
        return;
    }

    let Ok(entries) = fs::read_dir(directory) else {
        return;
    };

    for entry in entries.flatten() {
        if files.len() >= MAX_FILES {
            *truncated = true;
            return;
        }

        let Ok(file_type) = entry.file_type() else {
            continue;
        };
        if file_type.is_symlink() {
            continue;
        }

        let name = entry.file_name().to_string_lossy().to_string();
        if name.starts_with('.') {
            continue;
        }

        let path: PathBuf = entry.path();
        if file_type.is_dir() {
            if IGNORED_DIRECTORIES.contains(&name.as_str()) {
                continue;
            }
            walk(root, &path, files, truncated);
            continue;
        }
        if !file_type.is_file() {
            continue;
        }

        let Ok(metadata) = entry.metadata() else {
            continue;
        };
        let extension = path
            .extension()
            .and_then(|value| value.to_str())
            .unwrap_or_default()
            .to_lowercase();
        let is_text = TEXT_EXTENSIONS.contains(&extension.as_str());
        let text = if is_text && metadata.len() <= MAX_TEXT_BYTES {
            fs::read_to_string(&path).ok()
        } else {
            None
        };

        let relative = path
            .strip_prefix(root)
            .unwrap_or(&path)
            .to_string_lossy()
            .replace('\\', "/");

        files.push(VaultFileRow {
            path: relative,
            name,
            size: metadata.len() as i64,
            text,
            source_path: path.to_string_lossy().to_string(),
        });
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};

    fn temporary_directory() -> PathBuf {
        let nanos = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|duration| duration.as_nanos())
            .unwrap_or(0);
        std::env::temp_dir().join(format!("eliasnote-vault-{nanos}"))
    }

    #[test]
    fn reads_notes_and_skips_internal_folders() {
        let root = temporary_directory();
        fs::create_dir_all(root.join("Projeto/imagens")).unwrap();
        fs::create_dir_all(root.join(".obsidian")).unwrap();
        fs::write(root.join("Projeto/Nota.md"), "# Nota\n\nConteúdo").unwrap();
        fs::write(root.join("Projeto/foto.png"), [0u8, 1, 2, 3]).unwrap();
        fs::write(root.join(".obsidian/app.json"), "{}").unwrap();
        fs::write(root.join("Projeto/.oculto.md"), "segredo").unwrap();

        let result = scan_vault(&root).unwrap();
        assert!(!result.truncated);
        assert_eq!(result.files.len(), 2);

        let note = result
            .files
            .iter()
            .find(|file| file.path == "Projeto/Nota.md")
            .expect("nota encontrada");
        assert_eq!(note.text.as_deref(), Some("# Nota\n\nConteúdo"));
        assert!(note.source_path.replace('\\', "/").ends_with("Projeto/Nota.md"));

        let image = result
            .files
            .iter()
            .find(|file| file.path == "Projeto/foto.png")
            .expect("anexo encontrado");
        assert!(image.text.is_none());
        assert!(result
            .files
            .iter()
            .all(|file| !file.path.contains(".obsidian") && !file.path.contains(".oculto")));

        let _ = fs::remove_dir_all(root);
    }
}
