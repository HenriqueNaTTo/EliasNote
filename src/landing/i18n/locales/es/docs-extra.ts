import type { DocId, DocPageContent } from "@/landing/i18n/types";

export const esDocsExtra: Pick<Record<DocId, DocPageContent>, "arquitetura" | "desenvolvimento" | "release"> = {
  arquitetura: {
    title: "Arquitectura",
    shortTitle: "Arquitectura",
    summary:
      "Cómo está montada la app: capas con dependencia unidireccional, modelo de dominio, store con historial, renderizado del canvas, persistencia y backend Tauri.",
    sections: [
      {
        id: "visao-geral",
        title: "Visión general",
        blocks: [
          {
            kind: "text",
            text: "EliasNote es una SPA de React que se ejecuta dentro de Tauri 2 (o en un navegador, en modo de desarrollo). La arquitectura está organizada en capas con dependencia unidireccional:",
          },
          {
            kind: "code",
            title: "capas",
            code: `features/     → componentes e fluxos de UI
core/         → domínio, estado, persistência, busca, exportação
lib/          → utilidades puras (geometria, markdown, atalhos)
components/ui → primitivas visuais`,
          },
          {
            kind: "text",
            text: "Nada en `core/` importa de `features/`. El backend de Rust (`src-tauri`) solo expone comandos genéricos de documentos, adjuntos y copias de seguridad — no conoce el modelo de tableros.",
          },
        ],
      },
      {
        id: "modelo-de-dominio",
        title: "Modelo de dominio",
        hint: "core/domain",
        blocks: [
          {
            kind: "list",
            items: [
              "`Workspace` agrupa tableros. Cada `Board` pertenece a un workspace y puede tener un `parentId` (subtablero) y una lista `childOrder` para el árbol.",
              "`CanvasNode` es un registro tipado con un discriminante `type` y campos opcionales específicos (`content`, `items`, `attachmentId`, `scene`, `references`, etc.). Esta elección mantiene simples las actualizaciones y las migraciones; las factorías garantizan los campos obligatorios de cada tipo.",
              "Las columnas no contienen hijos en un árbol DOM: los hijos tienen `parentId = column.id` y posiciones recalculadas por `layoutColumnNodes`. El canvas renderiza todos los nodos como elementos hermanos, lo que simplifica el culling, la selección y el z-order.",
              "`Connector` referencia elementos (`nodeId`) o puntos libres. La geometría (`anchorPoint`, `connectorGeometry`) se recalcula en el render, así que mover un elemento reposiciona la flecha automáticamente.",
              "Las referencias usan el formato `node:<id>` / `board:<id>`. Los backlinks se derivan por barrido (sin índice persistido), con coste lineal por consulta.",
            ],
          },
        ],
      },
      {
        id: "estado",
        title: "Estado y slices",
        hint: "core/store · Zustand 5 + Immer",
        blocks: [
          {
            kind: "text",
            text: "El store usa Zustand 5 + middleware Immer y está dividido en slices:",
          },
          {
            kind: "table",
            columns: ["Slice", "Responsabilidad"],
            rows: [
              ["`historySlice`", "`commit`, transacciones, undo/redo, `beginTransaction`/`endTransaction`"],
              ["`boardSlice`", "workspaces, tableros, pestañas, árbol, plantillas, importación"],
              ["`nodeSlice`", "nodos, columnas, selección, conectores, referencias, comentarios, dibujo"],
              ["`uiSlice`", "viewports, canvas size, diálogos, estado de guardado, hidratación"],
              ["`settingsSlice`", "preferencias, temas, atajos reasignables"],
            ],
          },
        ],
      },
      {
        id: "historico",
        title: "Historial de undo/redo",
        hint: "core/store/historySlice",
        blocks: [
          {
            kind: "list",
            items: [
              "`commit(label, recipe, options)` captura los snapshots inmutables de `boards/workspaces` antes y después de la mutación. Immer garantiza el compartido estructural, así que guardar referencias es barato.",
              "La escritura usa `coalesceKey` para fusionar cambios consecutivos en una única entrada (ventana de 1,6 s).",
              "El arrastre y el redimensionado usan transacción: varias mutaciones silenciosas y una única entrada al soltar.",
              "Límite de 80 entradas; undo/redo no se persisten (historial por sesión).",
            ],
          },
        ],
      },
      {
        id: "renderizacao",
        title: "Renderizado del canvas",
        hint: "core/domain/layout · features/canvas",
        blocks: [
          {
            kind: "list",
            items: [
              "Una única capa DOM se transforma con `translate(x, y) scale(zoom)`; las coordenadas de los nodos quedan en unidades del mundo.",
              "`renderOrder` ordena por `z` e inserta los hijos justo después de la columna, evitando `z-index` fraccionario.",
              "`visibleNodes` hace culling por intersección con el viewport + margen. Con 5.000 elementos solo se montan unas decenas (prueba dedicada).",
              "`CanvasNodeView` está memoizado y solo recibe `node`, `zoom` y flags; arrastre y resize usan listeners globales con transacción, sin re-render extra por frame más allá de lo necesario.",
              "Los nodos de dibujo no montan Excalidraw: usan la miniatura PNG guardada en la escena; el editor completo se carga bajo demanda (`React.lazy`).",
              "Los drops de archivos se enrutan por destino: las notas crean adjuntos y referencias; los tableros anidados usan `addNode` con `boardId` y reciben los elementos en el tablero hijo.",
              "El editor Excalidraw expone el menú `Escena`, que usa `mergeExcalidrawScenes` para remapear elementos, bindings, grupos y archivos antes de `updateScene`/`addFiles`.",
            ],
          },
        ],
      },
      {
        id: "importacao-externa",
        title: "Importación externa",
        hint: "core/import",
        blocks: [
          {
            kind: "list",
            items: [
              "`obsidianParser.ts` lee las entradas del cofre (`.md`, `.canvas`, `.excalidraw`, adjuntos), descarta `.obsidian`/`.trash`, interpreta frontmatter, tags, wiki-links y enlaces Markdown relativos, y resuelve los destinos por ruta, nombre o alias.",
              "`obsidianPlan.ts` genera un plan con IDs estables: tableros por carpeta, notas en rejilla, adjuntos en un área propia, canvas con grupos y aristas, y referencias que ya apuntan a los IDs finales.",
              "`importVault(plan)` en `boardSlice` materializa el plan en un único `commit`, crea el workspace, abre el tablero raíz y conserva undo/redo como una única entrada.",
              "La UI usa el **selector nativo de carpetas** de Tauri (`tauri-plugin-dialog`) y el comando `vault_scan` para leer el cofre en Rust, sin transportar el contenido por el webview. En el navegador hay un fallback con `webkitdirectory`.",
              "Los adjuntos del cofre se copian al almacenamiento local con `attachment_import_path`, sin pasar bytes por la interfaz.",
              "La importación tiene límites de 20.000 archivos y 8 MB por texto.",
            ],
          },
        ],
      },
      {
        id: "persistencia",
        title: "Persistencia",
        hint: "core/persistence",
        blocks: [
          {
            kind: "code",
            title: "adaptadores",
            code: `StorageAdapter (interface)
├── TauriSqliteAdapter   → invoke() → comandos Rust → SQLite
├── IndexedDbAdapter     → idb → object stores
└── MemoryAdapter        → testes`,
          },
          {
            kind: "list",
            items: [
              "`repository.ts` traduce el estado a documentos (`app`, `settings`, `board:<id>`) y reconstruye `HydratePayload` con migraciones.",
              "`persistenceService.ts` se suscribe al store, detecta los tableros alterados por identidad, programa el flush y escribe solo lo necesario. También programa copias de seguridad automáticas y expone la restauración.",
              "`migrations.ts` normaliza campos ausentes, números en string y conectores incompletos, e ignora los nodos inválidos.",
              "Los adjuntos son inmutables y se referencian por `attachmentId`; `attachments.ts` resuelve las URLs (asset protocol en Tauri, object URL en el navegador) y mantiene caché.",
            ],
          },
        ],
      },
      {
        id: "backend-tauri",
        title: "Backend Tauri",
        hint: "src-tauri",
        blocks: [
          {
            kind: "list",
            items: [
              "`db.rs`: conexión rusqlite con WAL, tablas `documents`, `attachments` y `backups`; escritura de los adjuntos en el directorio de datos y limpieza de las copias antiguas.",
              "`lib.rs`: estado `Mutex<Database>` y comandos `doc_*`, `attachment_*`, `backup_*`, `clear_all`.",
              "La ventana desactiva `dragDropEnabled` para que el arrastrar y soltar HTML5 de archivos funcione en el webview, y habilita el asset protocol con ámbito restringido a `$APPDATA`.",
            ],
          },
        ],
      },
      {
        id: "colaboracao-futura",
        title: "Preparación para una colaboración futura",
        blocks: [
          {
            kind: "list",
            items: [
              "Dominio normalizado con IDs estables y timestamps por entidad.",
              "`StorageAdapter` aísla el medio de persistencia; una implementación remota puede sustituir el adaptador sin tocar la UI.",
              "`commit` centraliza las mutaciones, lo que permite emitir operaciones (event sourcing) más adelante.",
              "Las referencias y los comentarios ya son entidades locales, mapeables a autoría e hilos remotos.",
              "Ninguna decisión arquitectónica impide autenticación, sync o CRDT: la UI no asume que el estado sea exclusivo del proceso.",
            ],
          },
        ],
      },
      {
        id: "testes",
        title: "Pruebas",
        blocks: [
          {
            kind: "list",
            items: [
              "`vitest` + `jsdom` + Testing Library.",
              "Cobertura de geometría, layout/culling, markdown/sanitización, store/historial, plantillas, búsqueda/backlinks, exportación/importación, migraciones, persistencia/copias y tres componentes de nodo.",
              "El backend de Rust se verifica con `cargo check` y con la build real (`npm run tauri build`); el binario empaquetado se inició como smoke test, creando el SQLite e hidratando el seed.",
            ],
          },
        ],
      },
    ],
  },
  desenvolvimento: {
    title: "Desarrollo",
    shortTitle: "Desarrollo",
    summary:
      "Requisitos, comandos, asistente de instalación, entorno de pruebas, verificación del backend de Rust y solución de problemas del entorno local.",
    sections: [
      {
        id: "requisitos",
        title: "Requisitos",
        blocks: [
          {
            kind: "list",
            items: [
              "Node.js 20+ y npm.",
              "Rust 1.77.2+ (recomendado: rustup).",
              "Tauri 2: dependencias de sistema según la plataforma (Windows: WebView2 + Microsoft C++ Build Tools; macOS: Xcode Command Line Tools; Linux: webkit2gtk).",
              "SQLite se compila embebido (`rusqlite` con la feature `bundled`), sin dependencia externa.",
            ],
          },
        ],
      },
      {
        id: "comandos",
        title: "Comandos",
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
            note: "scripts/copy-excalidraw-assets.mjs copia las fuentes y los datos de Excalidraw en public/excalidraw-assets; se ejecuta antes de dev y de build para que la app funcione sin CDN.",
          },
        ],
      },
      {
        id: "assistente-de-instalacao",
        title: "Asistente de instalación",
        hint: "setup/",
        blocks: [
          {
            kind: "text",
            text: "`npm run setup:build` monta `dist-setup/EliasNote_<versión>_x64-setup.exe`: una app Tauri propia (`setup/src-tauri`, interfaz en `setup.html` + `src/setup/**`) que embebe el `eliasnote.exe` en `setup/src-tauri/payload` e instala el programa en el ámbito del usuario.",
          },
          {
            kind: "list",
            items: [
              "Los iconos (`setup/src-tauri/icons`) y el payload los **genera** el script; un `cargo build` aislado en `setup/src-tauri` falla hasta que exista el payload.",
              "La build usa el CLI de Tauri en las dos etapas (app y asistente): solo él define las variables `TAURI_ENV_*` que embeben el frontend de producción en el binario.",
              "`npm run setup:dev` abre solo la interfaz (ejecuta `npm run dev` para el Vite en `:1420`).",
              "El asistente se copia a sí mismo como `uninstall.exe`; abre la pantalla de desinstalación con `--uninstall` y borra la carpeta de instalación cuando termina el proceso.",
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
            text: "El repositorio publica los instaladores mediante GitHub Actions en `.github/workflows/release.yml`:",
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
            text: "La etiqueta `v*` dispara los checks (typecheck, pruebas, build), crea la release y compila Windows, Linux y macOS en paralelo, adjuntando `.msi`, `.exe`, `.AppImage`, `.deb` y `.dmg`. Los detalles, el disparo manual y los ajustes de la matriz están en la página Release de esta documentación.",
          },
        ],
      },
      {
        id: "estrutura-de-dados",
        title: "Estructura de datos",
        blocks: [
          {
            kind: "text",
            text: "**Tauri (producción)**",
          },
          {
            kind: "code",
            title: "directorio de datos",
            code: `<app_data_dir>/
  eliasnote.sqlite3
  attachments/<id>_<nome>
  eliasnote.sqlite3-wal`,
          },
          {
            kind: "text",
            text: "**Navegador (desarrollo)**",
          },
          {
            kind: "list",
            items: [
              "Base de datos IndexedDB `eliasnote` con object stores `documents`, `attachments` y `backups`.",
              "Sin persistencia entre perfiles distintos del navegador.",
            ],
          },
        ],
      },
      {
        id: "testes",
        title: "Pruebas",
        blocks: [
          {
            kind: "list",
            items: [
              "`src/lib/*.test.ts` — geometría, markdown.",
              "`src/core/domain/layout.test.ts` — ordenación, culling con 5.000 elementos, columnas.",
              "`src/core/domain/templates.test.ts` — modelos y round-trip de plantilla.",
              "`src/core/store/store.test.ts` — creación, undo/redo, transacciones, columnas, duplicación, referencias.",
              "`src/core/search/search.test.ts` — búsqueda y backlinks.",
              "`src/core/export/exporter.test.ts` — JSON/Markdown e importación.",
              "`src/core/import/obsidian.test.ts` — parser del cofre, frontmatter, canvas, wiki-links y plan.",
              "`src/core/import/obsidianExample.test.ts` — validez del cofre de ejemplo del repositorio.",
              "`src/core/import/importVault.test.ts` — importación en el store, referencias y undo.",
              "`src/features/import/ObsidianImportDialog.test.tsx` — flujo completo: carpeta, resumen, importación y workspace.",
              "`src/features/nodes/drops.test.tsx` — drop de imágenes en notas y tableros anidados.",
              "`src/features/drawing/sceneMerge.test.ts` — remapeo y fusión de escenas Excalidraw.",
              "`src-tauri/src/vault.rs` — prueba de Rust de lectura recursiva del cofre (`cargo test`).",
              "`src/core/persistence/persistence.test.ts` — migraciones, snapshot, autosave y copias de seguridad.",
              "`src/features/nodes/nodes.test.tsx` — interacción real con tarea, checklist y nota.",
              "`src/app.test.tsx` — integración completa: bootstrap, hidratación del seed y montaje de la interfaz.",
            ],
          },
          {
            kind: "text",
            text: "El entorno de pruebas usa jsdom con polyfills de `ResizeObserver`, `matchMedia`, `requestAnimationFrame` y `URL.createObjectURL`.",
          },
        ],
      },
      {
        id: "backend-rust",
        title: "Verificación del backend Rust",
        blocks: [
          {
            kind: "text",
            text: "El backend se verificó en este entorno con Rust 1.100 (MSVC):",
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
            text: "La build completa también se ejecutó con `npm run tauri build`, generando `EliasNote_0.1.0_x64_en-US.msi`, `EliasNote_0.1.0_x64-setup.exe` (NSIS) y el ejecutable `eliasnote.exe`. El binario empaquetado se abrió como smoke test y guardó los documentos iniciales en SQLite (`app`, `settings`, dos `board`).",
          },
        ],
      },
      {
        id: "diretorio-de-build",
        title: "Directorio de build",
        blocks: [
          {
            kind: "text",
            text: "`src-tauri/.cargo/config.toml` redirige el `target-dir` a `F:/cargo-target/eliasnote` porque el disco C: de este entorno tiene poco espacio libre. Si mueves el proyecto de máquina, elimina o ajusta ese archivo:",
          },
          {
            kind: "code",
            title: ".cargo/config.toml",
            code: `[build]
target-dir = "F:/cargo-target/eliasnote"`,
          },
          {
            kind: "text",
            text: "Sin esta redirección, los artefactos quedan en `src-tauri/target`. Para inspeccionar la base de datos local:",
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
        title: "Solución de problemas",
        blocks: [
          {
            kind: "list",
            items: [
              "**El selector de carpetas no se abre en el escritorio:** la app usa el plugin nativo de diálogo; confirma que la build incluye `tauri-plugin-dialog` y el permiso `dialog:allow-open` (ya configurados). Reinstala la app después de actualizar el proyecto.",
              "**Las fuentes de Excalidraw no cargan:** confirma que existe `public/excalidraw-assets/fonts` (`npm run dev` lo recrea).",
              "**La CSP bloquea algo en el escritorio:** ajusta `app.security.csp` en `src-tauri/tauri.conf.json`; usa `null` solo en desarrollo.",
              "**El navegador no persiste:** revisa IndexedDB en las herramientas de desarrollador; la app muestra el tipo de almacenamiento en el pie de la barra lateral.",
              "**El arrastrar y soltar archivos no funciona en el escritorio:** `dragDropEnabled` debe seguir en `false` en `tauri.conf.json`.",
              "**Atajos en conflicto:** la pantalla de atajos señala los duplicados; el primero de la lista tiene prioridad.",
              "**Exportación PNG en blanco:** abre el tablero e inténtalo de nuevo; la captura depende del viewport encuadrado.",
            ],
          },
        ],
      },
      {
        id: "convencoes",
        title: "Convenciones",
        blocks: [
          {
            kind: "list",
            items: [
              "TypeScript estricto (`noUnusedLocals`/`noUnusedParameters`), alias `@/`.",
              "Estado mutable solo dentro de `commit`/`set` de Zustand con Immer.",
              "Utilidades puras y testeables en `lib/` y `core/domain`.",
              "Ningún componente de `features/` es importado por `core/`.",
              "Textos de interfaz en portugués; código e identificadores en inglés.",
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
      "El camino de una versión: workflow de GitHub Actions, matriz de plataformas, instalador personalizado de Windows, asistente visual y problemas habituales.",
    sections: [
      {
        id: "pre-requisitos",
        title: "Requisitos previos (una sola vez)",
        blocks: [
          {
            kind: "list",
            items: [
              "Repositorio en GitHub con Actions habilitado (por defecto).",
              "Ningún secret adicional: el workflow usa el `GITHUB_TOKEN` embebido con el permiso `contents: write`.",
              "La firma de código es opcional. Sin certificados, Windows muestra el aviso de SmartScreen y macOS bloquea la app hasta la autorización manual.",
            ],
          },
        ],
      },
      {
        id: "publicar",
        title: "Publicar una versión",
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
            text: "El push de la etiqueta `v*` dispara el workflow:",
          },
          {
            kind: "table",
            columns: ["Job", "Qué hace"],
            rows: [
              ["`checks`", "`npm ci`, `npm run typecheck`, `npm test` y `npm run build` (ubuntu-22.04)"],
              ["`release`", "Genera las notas con la API de `generate-notes` y crea la release de la etiqueta (o reutiliza la existente)"],
              [
                "`build`",
                "Matriz **Windows** (`.msi` WiX con `tauri-action` + `.exe` del asistente visual), **Linux** (`.AppImage`, `.deb`, `.rpm`) y **macOS** (`.dmg` universal), subiendo los instaladores a la release",
              ],
              ["`summary`", "Publica un resumen del resultado en el job summary"],
            ],
          },
          {
            kind: "text",
            text: "Los instaladores aparecen en **Releases → vX.Y.Z**. Para publicar como borrador, ejecuta `gh release edit vX.Y.Z --draft` antes de divulgar (o crea la release manualmente y vuelve a ejecutar solo el job `build`).",
          },
          {
            kind: "text",
            text: "El job `release` publica la release antes de las builds (incluso si está como borrador) y la subida del asistente usa el **id** de la release, así que volver a ejecutar la misma etiqueta sustituye los assets sin duplicar nombres.",
          },
          {
            kind: "text",
            text: "El workflow ejecuta `scripts/set-version.mjs` con la etiqueta antes de la build, así que los artefactos salen con la versión de la etiqueta aunque los manifiestos estén desactualizados en el commit.",
          },
        ],
      },
      {
        id: "disparo-manual",
        title: "Disparo manual",
        blocks: [
          {
            kind: "text",
            text: "Actions → **Release** → *Run workflow* → indica una etiqueta que ya exista en el repositorio (p. ej. `v0.2.0`). Las notas y el vínculo con la etiqueta son los mismos del flujo automático.",
          },
        ],
      },
      {
        id: "pre-releases",
        title: "Pre-releases",
        blocks: [
          {
            kind: "text",
            text: "Las etiquetas con sufijo (`v0.3.0-beta.1`, `v1.0.0-rc.1`) se publican como **pre-release**.",
          },
        ],
      },
      {
        id: "matriz",
        title: "Ajustar la matriz de plataformas",
        hint: ".github/workflows/release.yml",
        blocks: [
          {
            kind: "text",
            text: "Edita `build.strategy.matrix.include` en `.github/workflows/release.yml`:",
          },
          {
            kind: "list",
            items: [
              "**Solo Windows:** mantén únicamente la entrada `Windows (x64)`.",
              "**macOS por arquitectura:** cambia `args` a `aarch64-apple-darwin` (`macos-latest`) o `x86_64-apple-darwin` (`macos-13`) y elimina el paso que añade los targets de Rust.",
              "**Bundles específicos:** indícalos en `args`, p. ej. `--bundles msi` o `--bundles deb,appimage`.",
            ],
          },
        ],
      },
      {
        id: "conferir-antes-da-tag",
        title: "Comprobar antes de crear la etiqueta",
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
        title: "Instalador personalizado (Windows)",
        hint: "src-tauri/installer",
        blocks: [
          {
            kind: "text",
            text: "El `.exe` del NSIS no usa el asistente estándar de Tauri: la build aplica la plantilla `src-tauri/installer/installer.nsi` (copia de la plantilla oficial, con la misma lógica de instalación) y la identidad visual de la marca.",
          },
          {
            kind: "table",
            columns: ["Archivo", "Función"],
            rows: [
              [
                "`src-tauri/installer/installer.nsi`",
                "Plantilla del NSIS; solo difieren del original las secciones de marcado visual",
              ],
              ["`src-tauri/installer/brand.nsh`", "Paleta (`MUI_BGCOLOR`, `MUI_TEXTCOLOR`) y textos en portugués (pt-BR) de las páginas"],
              ["`src-tauri/installer/assets/sidebar.bmp`", "Panel de 164×314 de las páginas de bienvenida y finalización"],
              ["`src-tauri/installer/assets/header.bmp`", "Cabecera de 150×57 de las páginas internas y del desinstalador"],
              [
                "`scripts/generate-installer-assets.mjs`",
                "Genera los BMP a partir de la geometría de la marca (`scripts/lib/brand-mark.mjs`)",
              ],
              ["`src-tauri/installer/…` + `tauri.conf.json`", "Cableado en `bundle.windows.nsis` y `bundle.licenseFile`"],
            ],
          },
          {
            kind: "text",
            text: "Las artes están versionadas en el repositorio. Después de tocar la marca, ejecuta `npm run installer:assets`; la prueba `src/test/installerAssets.test.ts` falla si los BMP quedan desactualizados o si la plantilla pierde un placeholder que use el bundler.",
          },
          {
            kind: "text",
            text: "Al actualizar el `@tauri-apps/cli`, compara la plantilla local con `crates/tauri-bundler/src/bundle/windows/nsis/installer.nsi` de la etiqueta correspondiente en el repositorio de Tauri y trae los cambios de lógica (WebView2, MultiUser, reinstalación, `/P`, `/S`, `/UPDATE`) al archivo local.",
          },
          {
            kind: "code",
            title: "terminal",
            code: `npm run tauri build -- --bundles nsis
# Windows: <target>/release/bundle/nsis/EliasNote_<versão>_x64-setup.exe`,
            note: "El MSI (WiX), el DMG y los paquetes de Linux siguen usando el instalador estándar de la plataforma.",
          },
        ],
      },
      {
        id: "instalador-visual",
        title: "Instalador visual (asistente propio)",
        hint: "setup/ · dist-setup/",
        blocks: [
          {
            kind: "text",
            text: "El usuario final recibe `EliasNote_<versión>_x64-setup.exe`, un asistente en Tauri + WebView2 con el mismo lenguaje visual de la app: pasos laterales (Bienvenida, Opciones, Instalación, Finalizado), tema claro/oscuro, elección de carpeta, accesos directos y progreso real.",
          },
          {
            kind: "code",
            title: "terminal",
            code: `npm run setup:build     # frontend + app + assistente → dist-setup/EliasNote_<versão>_x64-setup.exe
npm run setup:dev       # só a interface, com npm run dev em outro terminal`,
          },
          {
            kind: "table",
            columns: ["Pieza", "Dónde"],
            rows: [
              ["Interfaz (React + Tailwind de la app)", "`setup.html`, `src/setup/**`"],
              ["Backend del asistente (Rust/Tauri)", "`setup/src-tauri/**` (`src/install.rs`, `src/lib.rs`)"],
              [
                "App embebida en el `.exe`",
                "`setup/src-tauri/payload/eliasnote.exe` (generado, no versionado)",
              ],
              ["Salida final", "`dist-setup/EliasNote_<versión>_x64-setup.exe`"],
            ],
          },
          {
            kind: "text",
            text: "Reglas del asistente:",
          },
          {
            kind: "list",
            items: [
              "instala solo para el usuario actual (`%LOCALAPPDATA%\\EliasNote`, `HKCU`), sin UAC;",
              "copia la app y el propio asistente como `uninstall.exe` (modo `--uninstall`), crea accesos directos con `WScript.Shell` y lo registra en *Aplicaciones* con el tamaño estimado;",
              "la desinstalación conserva `%APPDATA%\\com.eliasnote.desktop` por defecto, con una opción explícita para borrar tableros, adjuntos y ajustes;",
              "la actualización es el mismo `.exe` ejecutado otra vez: la versión instalada se detecta en el registro.",
            ],
          },
          {
            kind: "note",
            text: "El instalador NSIS (`bundle.windows.nsis`) sigue disponible como alternativa silenciosa (`/S`, `/P`) con el asistente clásico, pero el CI no lo publica: sale con el mismo nombre que el asistente y uno sobrescribiría al otro.",
          },
          {
            kind: "text",
            text: "En el CI, Windows publica el asistente visual (`.exe`) y el MSI (`.msi`), que cubre la instalación silenciosa (`msiexec /i EliasNote_<versión>_x64_en-US.msi /qn`).",
          },
        ],
      },
      {
        id: "problemas-comuns",
        title: "Problemas habituales",
        blocks: [
          {
            kind: "list",
            items: [
              "**`cargo` se queja de la versión en `Cargo.lock`:** ejecuta cualquier `cargo build`/`cargo check` en `src-tauri` (el lock se actualiza) o `cargo update -p eliasnote`.",
              "**Release sin todos los instaladores:** revisa el job `build` de la plataforma que falló y usa *Re-run failed jobs*; los assets se suben a la misma release.",
              "**Workflow ejecutado de nuevo:** el job `release` reutiliza la release de la etiqueta; la build solo reenvía o sustituye los assets.",
              "**Linux sin `webkit2gtk`:** el job instala las dependencias en `ubuntu-22.04`; al cambiar de runner, ajusta la lista de paquetes.",
              "**macOS “app is damaged”:** build sin firma; libérala con `xattr -dr com.apple.quarantine /Applications/EliasNote.app` o fírmala y notarízala con un certificado.",
              "**No quieres publicar:** ejecuta el workflow en un fork o una rama, o elimina temporalmente el disparador `push.tags`.",
            ],
          },
        ],
      },
    ],
  },
};
