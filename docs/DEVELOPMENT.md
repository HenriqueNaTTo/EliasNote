# Desenvolvimento

## Requisitos

- Node.js 20+ e npm.
- Rust 1.77.2+ (recomendado: rustup).
- Tauri 2: dependências de sistema conforme a plataforma (Windows: WebView2 + Microsoft C++ Build Tools; macOS: Xcode Command Line Tools; Linux: webkit2gtk).
- SQLite é compilado embutido (`rusqlite` com feature `bundled`), sem dependência externa.

## Comandos

```bash
npm install
npm run dev              # Vite em http://localhost:1420
npm run typecheck        # tsc --noEmit
npm test                 # vitest run
npm run build            # assets + typecheck + build de produção
npm run tauri dev        # desktop com SQLite
npm run tauri build -- --bundles nsis
npm run icons            # regenera src-tauri/icons
```

O script `scripts/copy-excalidraw-assets.mjs` copia as fontes/dados do Excalidraw para `public/excalidraw-assets` para garantir funcionamento sem CDN. Ele roda antes de `dev` e `build`.

## Estrutura de dados

**Tauri (produção)**

```
<app_data_dir>/
  eliasnote.sqlite3
  attachments/<id>_<nome>
  eliasnote.sqlite3-wal
```

**Navegador (desenvolvimento)**

- Banco IndexedDB `eliasnote` com object stores `documents`, `attachments` e `backups`.
- Sem persistência entre perfis diferentes do navegador.

## Testes

- `src/lib/*.test.ts` — geometria, markdown.
- `src/core/domain/layout.test.ts` — ordenação, culling com 5.000 elementos, colunas.
- `src/core/domain/templates.test.ts` — modelos e round-trip de template.
- `src/core/store/store.test.ts` — criação, undo/redo, transações, colunas, duplicação, referências.
- `src/core/search/search.test.ts` — busca e backlinks.
- `src/core/export/exporter.test.ts` — JSON/Markdown e importação.
- `src/core/import/obsidian.test.ts` — parser do cofre, frontmatter, canvas, wiki-links e plano.
- `src/core/import/obsidianExample.test.ts` — validade do cofre de exemplo do repositório.
- `src/core/import/importVault.test.ts` — importação no store, referências e undo.
- `src/features/import/ObsidianImportDialog.test.tsx` — fluxo completo: pasta, resumo, importação e workspace.
- `src-tauri/src/vault.rs` — teste Rust de leitura recursiva do cofre (`cargo test`).
- `src/core/persistence/persistence.test.ts` — migrações, snapshot, autosave e backups.
- `src/features/nodes/nodes.test.tsx` — interação real com tarefa, checklist e nota.
- `src/app.test.tsx` — integração completa: bootstrap, hidratação do seed e montagem da interface.

O ambiente de testes usa jsdom com polyfills de `ResizeObserver`, `matchMedia`, `requestAnimationFrame` e `URL.createObjectURL`.

## Verificação do backend Rust

O backend foi verificado neste ambiente com Rust 1.100 (MSVC):

```bash
cd src-tauri
cargo check        # Finished dev profile
cargo test         # leitura recursiva de cofre (vault.rs)
cargo build --release
```

A build completa também foi executada com `npm run tauri build`, gerando:

- `EliasNote_0.1.0_x64_en-US.msi`
- `EliasNote_0.1.0_x64-setup.exe` (NSIS)

e o executável `eliasnote.exe`. O binário empacotado foi aberto como smoke test e gravou os documentos iniciais em SQLite (`app`, `settings`, dois `board`).

### Diretório de build

`src-tauri/.cargo/config.toml` redireciona o `target-dir` para `F:/cargo-target/eliasnote` porque o disco C: deste ambiente tem pouco espaço livre. Se mover o projeto de máquina, remova/ajuste esse arquivo:

```toml
[build]
target-dir = "F:/cargo-target/eliasnote"
```

Sem esse redirecionamento, os artefatos ficam em `src-tauri/target`. Para inspecionar o banco local:

```bash
node scripts/inspect-db.mjs "%APPDATA%\com.eliasnote.desktop\eliasnote.sqlite3"
```

## Troubleshooting

- **Seletor de pastas não abre no desktop:** o app usa o plugin nativo de diálogo; confirme que a build inclui `tauri-plugin-dialog` e a permissão `dialog:allow-open` (já configuradas). Reinstale o app após atualizar o projeto.
- **Fontes do Excalidraw não carregam:** confirme que `public/excalidraw-assets/fonts` existe (`npm run dev` recria).
- **CSP bloqueia algo no desktop:** ajuste `app.security.csp` em `src-tauri/tauri.conf.json`; use `null` apenas em desenvolvimento.
- **Navegador não persiste:** verifique IndexedDB nas ferramentas de desenvolvedor; o app mostra o tipo de armazenamento no rodapé da sidebar.
- **Drag-and-drop de arquivos não funciona no desktop:** `dragDropEnabled` deve permanecer `false` em `tauri.conf.json`.
- **Atalhos conflitantes:** a tela de atalhos sinaliza duplicados; o primeiro da lista tem prioridade.
- **Exportação PNG em branco:** abra o quadro e tente novamente; a captura depende do viewport enquadrado.

## Convenções

- TypeScript estrito (`noUnusedLocals`/`noUnusedParameters`), alias `@/`.
- Estado mutável somente dentro de `commit`/`set` do Zustand com Immer.
- Utilitários puros e testáveis em `lib/` e `core/domain`.
- Nenhum componente de `features/` é importado por `core/`.
- Textos de interface em português; código e identificadores em inglês.
