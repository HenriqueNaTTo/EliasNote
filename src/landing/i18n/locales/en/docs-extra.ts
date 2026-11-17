import type { DocId, DocPageContent } from "@/landing/i18n/types";

export const enDocsExtra: Pick<Record<DocId, DocPageContent>, "arquitetura" | "desenvolvimento" | "release"> = {
  arquitetura: {
    title: "Architecture",
    shortTitle: "Architecture",
    summary:
      "How the app is put together: layers with one-way dependencies, the domain model, the store with history, canvas rendering, persistence and the Tauri backend.",
    sections: [
      {
        id: "visao-geral",
        title: "Overview",
        blocks: [
          {
            kind: "text",
            text: "EliasNote is a React SPA running inside Tauri 2 (or in a browser, in development mode). The architecture is organized in layers with one-way dependencies:",
          },
          {
            kind: "code",
            title: "layers",
            code: `features/     → componentes e fluxos de UI
core/         → domínio, estado, persistência, busca, exportação
lib/          → utilidades puras (geometria, markdown, atalhos)
components/ui → primitivas visuais`,
          },
          {
            kind: "text",
            text: "Nothing in `core/` imports from `features/`. The Rust backend (`src-tauri`) only exposes generic document, attachment and backup commands — it knows nothing about the board model.",
          },
        ],
      },
      {
        id: "modelo-de-dominio",
        title: "Domain model",
        hint: "core/domain",
        blocks: [
          {
            kind: "list",
            items: [
              "`Workspace` groups boards. Each `Board` belongs to a workspace and can have a `parentId` (subboard) and a `childOrder` list for the tree.",
              "`CanvasNode` is a typed record with a `type` discriminant and type-specific optional fields (`content`, `items`, `attachmentId`, `scene`, `references`, etc.). This choice keeps updates and migrations simple; the factories guarantee the required fields per type.",
              "Columns do not hold children in a DOM tree: children have `parentId = column.id` and positions recalculated by `layoutColumnNodes`. The canvas renders every node as a sibling element, which simplifies culling, selection and z-order.",
              "`Connector` references elements (`nodeId`) or free points. The geometry (`anchorPoint`, `connectorGeometry`) is recalculated at render time, so moving an element repositions the arrow automatically.",
              "References use the `node:<id>` / `board:<id>` format. Backlinks are derived by scanning (no persisted index), with linear cost per query.",
            ],
          },
        ],
      },
      {
        id: "estado",
        title: "State and slices",
        hint: "core/store · Zustand 5 + Immer",
        blocks: [
          {
            kind: "text",
            text: "The store uses Zustand 5 + the Immer middleware and is split into slices:",
          },
          {
            kind: "table",
            columns: ["Slice", "Responsibility"],
            rows: [
              ["`historySlice`", "`commit`, transactions, undo/redo, `beginTransaction`/`endTransaction`"],
              ["`boardSlice`", "workspaces, boards, tabs, tree, templates, import"],
              ["`nodeSlice`", "nodes, columns, selection, connectors, references, comments, drawing"],
              ["`uiSlice`", "viewports, canvas size, dialogs, save status, hydration"],
              ["`settingsSlice`", "preferences, themes, remappable shortcuts"],
            ],
          },
        ],
      },
      {
        id: "historico",
        title: "Undo/redo history",
        hint: "core/store/historySlice",
        blocks: [
          {
            kind: "list",
            items: [
              "`commit(label, recipe, options)` captures the immutable `boards/workspaces` snapshots before and after the mutation. Immer guarantees structural sharing, so keeping references is cheap.",
              "Typing uses `coalesceKey` to merge consecutive changes into a single entry (1.6 s window).",
              "Dragging and resizing use a transaction: several silent mutations and a single entry when you release.",
              "Limit of 80 entries; undo/redo is not persisted (history per session).",
            ],
          },
        ],
      },
      {
        id: "renderizacao",
        title: "Canvas rendering",
        hint: "core/domain/layout · features/canvas",
        blocks: [
          {
            kind: "list",
            items: [
              "A single DOM layer is transformed with `translate(x, y) scale(zoom)`; node coordinates stay in world units.",
              "`renderOrder` sorts by `z` and inserts children right after the column, avoiding fractional `z-index`.",
              "`visibleNodes` culls by intersection with the viewport plus a margin. With 5,000 elements, only a few dozen are mounted (dedicated test).",
              "`CanvasNodeView` is memoized and only receives `node`, `zoom` and flags; drag/resize use global listeners with a transaction, with no extra re-render per frame beyond what is needed.",
              "Drawing nodes do not mount Excalidraw: they use the PNG thumbnail stored in the scene; the full editor is loaded on demand (`React.lazy`).",
              "File drops are routed by target: notes create attachments and references; nested boards use `addNode` with `boardId` and receive the elements in the child board.",
              "The Excalidraw editor exposes the `Scene` menu, which uses `mergeExcalidrawScenes` to remap elements, bindings, groups and files before `updateScene`/`addFiles`.",
            ],
          },
        ],
      },
      {
        id: "importacao-externa",
        title: "External import",
        hint: "core/import",
        blocks: [
          {
            kind: "list",
            items: [
              "`obsidianParser.ts` reads vault entries (`.md`, `.canvas`, `.excalidraw`, attachments), skips `.obsidian`/`.trash`, parses frontmatter, tags, wiki-links, relative Markdown links and resolves targets by path, name or alias.",
              "`obsidianPlan.ts` builds a plan with stable IDs: boards per folder, notes on a grid, attachments in their own area, canvases with groups/edges and references already pointing at the final IDs.",
              "`importVault(plan)` in `boardSlice` materializes the plan in a single `commit`, creates the workspace, opens the root board and keeps undo/redo as a single entry.",
              "The UI uses Tauri's **native folder picker** (`tauri-plugin-dialog`) and the `vault_scan` command to read the vault in Rust, without moving the content through the webview. In the browser there is a fallback with `webkitdirectory`.",
              "Vault attachments are copied into local storage by `attachment_import_path`, without passing bytes through the interface.",
              "The import has limits of 20,000 files and 8 MB per text.",
            ],
          },
        ],
      },
      {
        id: "persistencia",
        title: "Persistence",
        hint: "core/persistence",
        blocks: [
          {
            kind: "code",
            title: "adapters",
            code: `StorageAdapter (interface)
├── TauriSqliteAdapter   → invoke() → comandos Rust → SQLite
├── IndexedDbAdapter     → idb → object stores
└── MemoryAdapter        → testes`,
          },
          {
            kind: "list",
            items: [
              "`repository.ts` translates the state into documents (`app`, `settings`, `board:<id>`) and rebuilds `HydratePayload` with migrations.",
              "`persistenceService.ts` subscribes to the store, detects changed boards by identity, schedules a flush and writes only what is needed. It also schedules automatic backups and exposes restoration.",
              "`migrations.ts` normalizes missing fields, numbers stored as strings and incomplete connectors, and ignores invalid nodes.",
              "Attachments are immutable and referenced by `attachmentId`; `attachments.ts` resolves URLs (asset protocol on Tauri, object URL in the browser) and keeps a cache.",
            ],
          },
        ],
      },
      {
        id: "backend-tauri",
        title: "Tauri backend",
        hint: "src-tauri",
        blocks: [
          {
            kind: "list",
            items: [
              "`db.rs`: rusqlite connection with WAL, `documents`, `attachments` and `backups` tables; attachments written to the data directory and cleanup of old backups.",
              "`lib.rs`: `Mutex<Database>` state and the `doc_*`, `attachment_*`, `backup_*` and `clear_all` commands.",
              "The window disables `dragDropEnabled` so that HTML5 file drag-and-drop works in the webview, and enables the asset protocol scoped to `$APPDATA`.",
            ],
          },
        ],
      },
      {
        id: "colaboracao-futura",
        title: "Readiness for future collaboration",
        blocks: [
          {
            kind: "list",
            items: [
              "Normalized domain with stable IDs and per-entity timestamps.",
              "`StorageAdapter` isolates the persistence medium; a remote implementation can replace the adapter without touching the UI.",
              "`commit` centralizes mutations, which allows emitting operations (event sourcing) later on.",
              "References and comments are already local entities, mappable to remote authorship and threads.",
              "No architectural decision prevents authentication, sync or CRDT: the UI does not assume that the state belongs exclusively to the process.",
            ],
          },
        ],
      },
      {
        id: "testes",
        title: "Tests",
        blocks: [
          {
            kind: "list",
            items: [
              "`vitest` + `jsdom` + Testing Library.",
              "Coverage for geometry, layout/culling, markdown/sanitization, store/history, templates, search/backlinks, export/import, migrations, persistence/backups and three node components.",
              "The Rust backend is verified by `cargo check` and by the real build (`npm run tauri build`); the packaged binary was launched as a smoke test, creating the SQLite database and hydrating the seed.",
            ],
          },
        ],
      },
    ],
  },
  desenvolvimento: {
    title: "Development",
    shortTitle: "Development",
    summary:
      "Requirements, commands, the install wizard, the test environment, Rust backend verification and troubleshooting of the local environment.",
    sections: [
      {
        id: "requisitos",
        title: "Requirements",
        blocks: [
          {
            kind: "list",
            items: [
              "Node.js 20+ and npm.",
              "Rust 1.77.2+ (rustup recommended).",
              "Tauri 2: system dependencies according to the platform (Windows: WebView2 + Microsoft C++ Build Tools; macOS: Xcode Command Line Tools; Linux: webkit2gtk).",
              "SQLite is compiled in (`rusqlite` with the `bundled` feature), with no external dependency.",
            ],
          },
        ],
      },
      {
        id: "comandos",
        title: "Commands",
        blocks: [
          {
            kind: "code",
            title: "terminal",
            code: `npm install
npm run dev              # Vite em http://localhost:1420
npm run typecheck        # tsc --noEmit
npm test                 # vitest run
npm run build            # assets + typecheck + build de produção
npm run tauri dev        # desktop com SQLite
npm run tauri build -- --bundles nsis
npm run icons            # regenera src-tauri/icons
npm run installer:assets # regenera as artes do instalador
npm run setup:dev        # assistente de instalação em modo dev
npm run setup:build      # instalador visual (.exe) em dist-setup/
npm run version:set 0.2.0  # sincroniza a versão nos manifestos`,
            note: "scripts/copy-excalidraw-assets.mjs copies the Excalidraw fonts and data into public/excalidraw-assets; it runs before dev and build so the app works without a CDN.",
          },
        ],
      },
      {
        id: "assistente-de-instalacao",
        title: "Install wizard",
        hint: "setup/",
        blocks: [
          {
            kind: "text",
            text: "`npm run setup:build` assembles `dist-setup/EliasNote_<version>_x64-setup.exe`: a dedicated Tauri app (`setup/src-tauri`, interface in `setup.html` + `src/setup/**`) that embeds `eliasnote.exe` in `setup/src-tauri/payload` and installs the program in the user scope.",
          },
          {
            kind: "list",
            items: [
              "The icons (`setup/src-tauri/icons`) and the payload are **generated** by the script; an isolated `cargo build` in `setup/src-tauri` fails until the payload exists.",
              "The build uses the Tauri CLI in both steps (app and wizard): only it defines the `TAURI_ENV_*` variables that embed the production frontend in the binary.",
              "`npm run setup:dev` opens only the interface (run `npm run dev` for Vite on `:1420`).",
              "The wizard copies itself as `uninstall.exe`; it opens the removal screen with `--uninstall` and deletes the installation folder when the process ends.",
            ],
          },
        ],
      },
      {
        id: "release",
        title: "Release",
        blocks: [
          {
            kind: "text",
            text: "The repository publishes the installers through GitHub Actions in `.github/workflows/release.yml`:",
          },
          {
            kind: "code",
            title: "terminal",
            code: `npm run version:set 0.2.0
git commit -am "chore: release v0.2.0"
git tag v0.2.0
git push origin main --follow-tags`,
          },
          {
            kind: "text",
            text: "A `v*` tag triggers the checks (typecheck, tests, build), creates the release and builds Windows, Linux and macOS in parallel, attaching `.msi`, `.exe`, `.AppImage`, `.deb` and `.dmg`. Details, manual runs and matrix adjustments are on the Release page of this documentation.",
          },
        ],
      },
      {
        id: "estrutura-de-dados",
        title: "Data layout",
        blocks: [
          {
            kind: "text",
            text: "**Tauri (production)**",
          },
          {
            kind: "code",
            title: "data directory",
            code: `<app_data_dir>/
  eliasnote.sqlite3
  attachments/<id>_<nome>
  eliasnote.sqlite3-wal`,
          },
          {
            kind: "text",
            text: "**Browser (development)**",
          },
          {
            kind: "list",
            items: [
              "IndexedDB database `eliasnote` with the `documents`, `attachments` and `backups` object stores.",
              "No persistence across different browser profiles.",
            ],
          },
        ],
      },
      {
        id: "testes",
        title: "Tests",
        blocks: [
          {
            kind: "list",
            items: [
              "`src/lib/*.test.ts` — geometry, markdown.",
              "`src/core/domain/layout.test.ts` — ordering, culling with 5,000 elements, columns.",
              "`src/core/domain/templates.test.ts` — templates and template round-trip.",
              "`src/core/store/store.test.ts` — creation, undo/redo, transactions, columns, duplication, references.",
              "`src/core/search/search.test.ts` — search and backlinks.",
              "`src/core/export/exporter.test.ts` — JSON/Markdown and import.",
              "`src/core/import/obsidian.test.ts` — vault parser, frontmatter, canvas, wiki-links and plan.",
              "`src/core/import/obsidianExample.test.ts` — validity of the example vault in the repository.",
              "`src/core/import/importVault.test.ts` — import into the store, references and undo.",
              "`src/features/import/ObsidianImportDialog.test.tsx` — the whole flow: folder, summary, import and workspace.",
              "`src/features/nodes/drops.test.tsx` — dropping images onto notes and nested boards.",
              "`src/features/drawing/sceneMerge.test.ts` — remapping and merging Excalidraw scenes.",
              "`src-tauri/src/vault.rs` — Rust test for recursive vault reading (`cargo test`).",
              "`src/core/persistence/persistence.test.ts` — migrations, snapshot, autosave and backups.",
              "`src/features/nodes/nodes.test.tsx` — real interaction with task, checklist and note.",
              "`src/app.test.tsx` — full integration: bootstrap, seed hydration and interface mount.",
            ],
          },
          {
            kind: "text",
            text: "The test environment uses jsdom with polyfills for `ResizeObserver`, `matchMedia`, `requestAnimationFrame` and `URL.createObjectURL`.",
          },
        ],
      },
      {
        id: "backend-rust",
        title: "Rust backend verification",
        blocks: [
          {
            kind: "text",
            text: "The backend was verified in this environment with Rust 1.100 (MSVC):",
          },
          {
            kind: "code",
            title: "src-tauri",
            code: `cd src-tauri
cargo check        # Finished dev profile
cargo test         # leitura recursiva de cofre (vault.rs)
cargo build --release`,
          },
          {
            kind: "text",
            text: "The full build was also run with `npm run tauri build`, producing `EliasNote_0.1.0_x64_en-US.msi`, `EliasNote_0.1.0_x64-setup.exe` (NSIS) and the `eliasnote.exe` executable. The packaged binary was opened as a smoke test and wrote the initial documents to SQLite (`app`, `settings`, two `board` entries).",
          },
        ],
      },
      {
        id: "diretorio-de-build",
        title: "Build directory",
        blocks: [
          {
            kind: "text",
            text: "`src-tauri/.cargo/config.toml` redirects `target-dir` to `F:/cargo-target/eliasnote` because the C: drive in this environment has little free space. If you move the project to another machine, remove or adjust this file:",
          },
          {
            kind: "code",
            title: ".cargo/config.toml",
            code: `[build]
target-dir = "F:/cargo-target/eliasnote"`,
          },
          {
            kind: "text",
            text: "Without that redirection, the artifacts land in `src-tauri/target`. To inspect the local database:",
          },
          {
            kind: "code",
            title: "terminal",
            code: `node scripts/inspect-db.mjs "%APPDATA%\\com.eliasnote.desktop\\eliasnote.sqlite3"`,
          },
        ],
      },
      {
        id: "troubleshooting",
        title: "Troubleshooting",
        blocks: [
          {
            kind: "list",
            items: [
              "**The folder picker does not open on desktop:** the app uses the native dialog plugin; make sure the build includes `tauri-plugin-dialog` and the `dialog:allow-open` permission (both already configured). Reinstall the app after updating the project.",
              "**Excalidraw fonts do not load:** make sure `public/excalidraw-assets/fonts` exists (`npm run dev` recreates it).",
              "**The CSP blocks something on desktop:** adjust `app.security.csp` in `src-tauri/tauri.conf.json`; use `null` only in development.",
              "**The browser does not persist anything:** check IndexedDB in the developer tools; the app shows the storage type in the sidebar footer.",
              "**File drag-and-drop does not work on desktop:** `dragDropEnabled` must stay `false` in `tauri.conf.json`.",
              "**Conflicting shortcuts:** the shortcuts screen flags duplicates; the first one in the list takes priority.",
              "**Blank PNG export:** open the board and try again; the capture depends on the framed viewport.",
            ],
          },
        ],
      },
      {
        id: "convencoes",
        title: "Conventions",
        blocks: [
          {
            kind: "list",
            items: [
              "Strict TypeScript (`noUnusedLocals`/`noUnusedParameters`), the `@/` alias.",
              "Mutable state only inside Zustand's `commit`/`set` with Immer.",
              "Pure, testable utilities in `lib/` and `core/domain`.",
              "No component from `features/` is imported by `core/`.",
              "Interface texts in Portuguese; code and identifiers in English.",
            ],
          },
        ],
      },
    ],
  },
  release: {
    title: "Release",
    shortTitle: "Release",
    summary:
      "The path of a version: the GitHub Actions workflow, the platform matrix, the customized Windows installer, the visual wizard and common problems.",
    sections: [
      {
        id: "pre-requisitos",
        title: "Prerequisites (one-time)",
        blocks: [
          {
            kind: "list",
            items: [
              "The repository on GitHub with Actions enabled (the default).",
              "No extra secrets: the workflow uses the built-in `GITHUB_TOKEN` with the `contents: write` permission.",
              "Code signing is optional. Without certificates, Windows shows the SmartScreen warning and macOS blocks the app until you allow it manually.",
            ],
          },
        ],
      },
      {
        id: "publicar",
        title: "Publishing a version",
        blocks: [
          {
            kind: "code",
            title: "terminal",
            code: `npm run version:set 0.2.0          # sincroniza package.json, tauri.conf.json e Cargo.toml
git commit -am "chore: release v0.2.0"
git tag v0.2.0
git push origin main --follow-tags`,
          },
          {
            kind: "text",
            text: "Pushing the `v*` tag triggers the workflow:",
          },
          {
            kind: "table",
            columns: ["Job", "What it does"],
            rows: [
              ["`checks`", "`npm ci`, `npm run typecheck`, `npm test` and `npm run build` (ubuntu-22.04)"],
              ["`release`", "Generates the notes through the `generate-notes` API, creates the release for the tag (or reuses the existing one)"],
              [
                "`build`",
                "**Windows** matrix (WiX `.msi` through `tauri-action` + the `.exe` of the visual wizard), **Linux** (`.AppImage`, `.deb`, `.rpm`) and **macOS** (universal `.dmg`), uploading the installers to the release",
              ],
              ["`summary`", "Publishes a summary of the result in the job summary"],
            ],
          },
          {
            kind: "text",
            text: "The installers appear under **Releases → vX.Y.Z**. To publish as a draft, run `gh release edit vX.Y.Z --draft` before announcing it (or create the release manually and re-run only the `build` job).",
          },
          {
            kind: "text",
            text: "The `release` job publishes the release before the builds (including when it is a draft) and the wizard upload uses the release **id**, so running the same tag again replaces the assets without duplicating names.",
          },
          {
            kind: "text",
            text: "The workflow runs `scripts/set-version.mjs` with the tag before the build, so the artifacts come out with the tag version even if the manifests are outdated in the commit.",
          },
        ],
      },
      {
        id: "disparo-manual",
        title: "Manual run",
        blocks: [
          {
            kind: "text",
            text: "Actions → **Release** → *Run workflow* → provide a tag that already exists in the repository (e.g. `v0.2.0`). The notes and the link to the tag are the same as in the automatic flow.",
          },
        ],
      },
      {
        id: "pre-releases",
        title: "Pre-releases",
        blocks: [
          {
            kind: "text",
            text: "Tags with a suffix (`v0.3.0-beta.1`, `v1.0.0-rc.1`) are published as a **pre-release**.",
          },
        ],
      },
      {
        id: "matriz",
        title: "Adjusting the platform matrix",
        hint: ".github/workflows/release.yml",
        blocks: [
          {
            kind: "text",
            text: "Edit `build.strategy.matrix.include` in `.github/workflows/release.yml`:",
          },
          {
            kind: "list",
            items: [
              "**Windows only:** keep only the `Windows (x64)` entry.",
              "**macOS per architecture:** change `args` to `aarch64-apple-darwin` (`macos-latest`) or `x86_64-apple-darwin` (`macos-13`) and remove the step that adds the Rust targets.",
              "**Specific bundles:** set them in `args`, e.g. `--bundles msi` or `--bundles deb,appimage`.",
            ],
          },
        ],
      },
      {
        id: "conferir-antes-da-tag",
        title: "Checking before creating the tag",
        blocks: [
          {
            kind: "code",
            title: "terminal",
            code: `npm ci
npm run typecheck && npm test && npm run build
npm run tauri build -- --bundles nsis      # build local (Windows)`,
          },
        ],
      },
      {
        id: "instalador-nsis",
        title: "Customized installer (Windows)",
        hint: "src-tauri/installer",
        blocks: [
          {
            kind: "text",
            text: "The NSIS `.exe` does not use Tauri's default wizard: the build applies the `src-tauri/installer/installer.nsi` template (a copy of the official template, with the same installation logic) plus the visual identity of the brand.",
          },
          {
            kind: "table",
            columns: ["File", "Role"],
            rows: [
              [
                "`src-tauri/installer/installer.nsi`",
                "NSIS template; only the visual branding sections differ from the original",
              ],
              ["`src-tauri/installer/brand.nsh`", "Palette (`MUI_BGCOLOR`, `MUI_TEXTCOLOR`) and the pt-BR texts of the pages"],
              ["`src-tauri/installer/assets/sidebar.bmp`", "164×314 panel for the welcome and finish pages"],
              ["`src-tauri/installer/assets/header.bmp`", "150×57 header for the inner pages and the uninstaller"],
              [
                "`scripts/generate-installer-assets.mjs`",
                "Generates the BMPs from the brand geometry (`scripts/lib/brand-mark.mjs`)",
              ],
              ["`src-tauri/installer/…` + `tauri.conf.json`", "Wiring in `bundle.windows.nsis` and `bundle.licenseFile`"],
            ],
          },
          {
            kind: "text",
            text: "The artwork is committed. After changing the brand, run `npm run installer:assets`; the `src/test/installerAssets.test.ts` test fails if the BMPs are out of date or if the template loses a placeholder used by the bundler.",
          },
          {
            kind: "text",
            text: "When you upgrade `@tauri-apps/cli`, compare the local template with `crates/tauri-bundler/src/bundle/windows/nsis/installer.nsi` from the matching tag in the Tauri repository and bring the logic changes (WebView2, MultiUser, reinstall, `/P`, `/S`, `/UPDATE`) into the local file.",
          },
          {
            kind: "code",
            title: "terminal",
            code: `npm run tauri build -- --bundles nsis
# Windows: <target>/release/bundle/nsis/EliasNote_<versão>_x64-setup.exe`,
            note: "The MSI (WiX), the DMG and the Linux packages keep the platform's default installer.",
          },
        ],
      },
      {
        id: "instalador-visual",
        title: "Visual installer (dedicated wizard)",
        hint: "setup/ · dist-setup/",
        blocks: [
          {
            kind: "text",
            text: "The end user receives `EliasNote_<version>_x64-setup.exe`, a wizard built with Tauri + WebView2 and the same visual language as the app: side steps (Welcome, Options, Installation, Finish), light/dark theme, folder selection, shortcuts and real progress.",
          },
          {
            kind: "code",
            title: "terminal",
            code: `npm run setup:build     # frontend + app + assistente → dist-setup/EliasNote_<versão>_x64-setup.exe
npm run setup:dev       # só a interface, com npm run dev em outro terminal`,
          },
          {
            kind: "table",
            columns: ["Piece", "Where"],
            rows: [
              ["Interface (React + Tailwind from the app)", "`setup.html`, `src/setup/**`"],
              ["Wizard backend (Rust/Tauri)", "`setup/src-tauri/**` (`src/install.rs`, `src/lib.rs`)"],
              [
                "App embedded in the `.exe`",
                "`setup/src-tauri/payload/eliasnote.exe` (generated, not versioned)",
              ],
              ["Final output", "`dist-setup/EliasNote_<version>_x64-setup.exe`"],
            ],
          },
          {
            kind: "text",
            text: "Wizard rules:",
          },
          {
            kind: "list",
            items: [
              "it installs only for the current user (`%LOCALAPPDATA%\\EliasNote`, `HKCU`), without UAC;",
              "it copies the app and the wizard itself as `uninstall.exe` (`--uninstall` mode), creates shortcuts through `WScript.Shell` and registers in *Apps* with an estimated size;",
              "removal keeps `%APPDATA%\\com.eliasnote.desktop` by default, with an explicit option to delete boards, attachments and settings;",
              "an update is the same `.exe` run again: the installed version is detected from the registry.",
            ],
          },
          {
            kind: "note",
            text: "The NSIS installer (`bundle.windows.nsis`) remains available as a silent alternative (`/S`, `/P`) with the classic wizard, but it is not published by CI: it comes out with the same name as the wizard and one would overwrite the other.",
          },
          {
            kind: "text",
            text: "In CI, Windows publishes the visual wizard (`.exe`) and the MSI (`.msi`), which covers silent installation (`msiexec /i EliasNote_<version>_x64_en-US.msi /qn`).",
          },
        ],
      },
      {
        id: "problemas-comuns",
        title: "Common problems",
        blocks: [
          {
            kind: "list",
            items: [
              "**`cargo` complains about the version in `Cargo.lock`:** run any `cargo build`/`cargo check` in `src-tauri` (the lock is updated) or `cargo update -p eliasnote`.",
              "**Release without all the installers:** check the `build` job of the platform that failed and use *Re-run failed jobs*; the assets are uploaded to the same release.",
              "**Workflow run again:** the `release` job reuses the release for the tag; the build only re-uploads/replaces the assets.",
              "**Linux without `webkit2gtk`:** the job installs the dependencies on `ubuntu-22.04`; when switching runners, adjust the package list.",
              "**macOS “app is damaged”:** unsigned build; allow it with `xattr -dr com.apple.quarantine /Applications/EliasNote.app` or sign/notarize with a certificate.",
              "**You do not want to publish:** run the workflow on a fork/branch or temporarily remove the `push.tags` trigger.",
            ],
          },
        ],
      },
    ],
  },
};
