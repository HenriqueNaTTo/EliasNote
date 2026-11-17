import type { DocId, DocPageContent } from "@/landing/i18n/types";

export const zhDocsExtra: Pick<Record<DocId, DocPageContent>, "arquitetura" | "desenvolvimento" | "release"> = {
  arquitetura: {
    title: "架构",
    shortTitle: "架构",
    summary:
      "应用如何搭建：单向依赖的层次、领域模型、带历史的 store、画布渲染、持久化与 Tauri 后端。",
    sections: [
      {
        id: "visao-geral",
        title: "总览",
        blocks: [
          {
            kind: "text",
            text: "EliasNote 是一个运行在 Tauri 2 内的 React 单页应用（在开发模式下也可以直接在浏览器运行）。架构按单向依赖的层次组织：",
          },
          {
            kind: "code",
            title: "camadas",
            code: `features/     → componentes e fluxos de UI
core/         → domínio, estado, persistência, busca, exportação
lib/          → utilidades puras (geometria, markdown, atalhos)
components/ui → primitivas visuais`,
          },
          {
            kind: "text",
            text: "`core/` 中的任何代码都不导入 `features/`。Rust 后端（`src-tauri`）只暴露通用的文档、附件和备份命令——它并不知道画板模型。",
          },
        ],
      },
      {
        id: "modelo-de-dominio",
        title: "领域模型",
        hint: "core/domain",
        blocks: [
          {
            kind: "list",
            items: [
              "`Workspace` 用来分组画板。每个 `Board` 属于一个 workspace，可以有 `parentId`（子画板）和用于树结构的 `childOrder` 列表。",
              "`CanvasNode` 是带 `type` 判别字段的强类型记录，其余字段按类型可选（`content`、`items`、`attachmentId`、`scene`、`references` 等）。这种设计让更新和迁移保持简单；工厂函数负责补齐每种类型的必填字段。",
              "列并不在 DOM 树中保存子节点：子节点的 `parentId = column.id`，位置由 `layoutColumnNodes` 重新计算。画布把所有节点都渲染为同级元素，从而简化裁剪、选中和 z 顺序。",
              "`Connector` 引用元素（`nodeId`）或自由点。几何（`anchorPoint`、`connectorGeometry`）在渲染时重新计算，因此移动元素时箭头会自动跟随。",
              "引用使用 `node:<id>` / `board:<id>` 格式。反向链接通过扫描得出（不持久化索引），每次查询是线性开销。",
            ],
          },
        ],
      },
      {
        id: "estado",
        title: "状态与 slice",
        hint: "core/store · Zustand 5 + Immer",
        blocks: [
          {
            kind: "text",
            text: "store 使用 Zustand 5 + Immer 中间件，并按 slice 拆分：",
          },
          {
            kind: "table",
            columns: ["Slice", "职责"],
            rows: [
              ["`historySlice`", "`commit`、事务、撤销/重做、`beginTransaction`/`endTransaction`"],
              ["`boardSlice`", "workspace、画板、标签页、树、模板、导入"],
              ["`nodeSlice`", "节点、列、选中、连接线、引用、评论、绘图"],
              ["`uiSlice`", "视口、画布尺寸、对话框、保存状态、水合"],
              ["`settingsSlice`", "偏好设置、主题、可重新映射的快捷键"],
            ],
          },
        ],
      },
      {
        id: "historico",
        title: "撤销/重做历史",
        hint: "core/store/historySlice",
        blocks: [
          {
            kind: "list",
            items: [
              "`commit(label, recipe, options)` 在变更前后捕获 `boards/workspaces` 的不可变快照。Immer 保证结构共享，因此保存引用几乎没有成本。",
              "输入使用 `coalesceKey` 把连续修改合并成一条记录（时间窗 1.6 秒）。",
              "拖动和缩放使用事务：过程中多次静默变更，松开时只产生一条记录。",
              "最多保留 80 条记录；撤销/重做不会持久化（仅限当前会话）。",
            ],
          },
        ],
      },
      {
        id: "renderizacao",
        title: "画布渲染",
        hint: "core/domain/layout · features/canvas",
        blocks: [
          {
            kind: "list",
            items: [
              "整个画布是单个 DOM 层，通过 `translate(x, y) scale(zoom)` 变换；节点坐标使用世界单位。",
              "`renderOrder` 按 `z` 排序，并把子节点紧跟在列之后插入，避免小数 `z-index`。",
              "`visibleNodes` 按与视口 + 边距的相交做裁剪。5000 个元素时只挂载几十个（有专门的测试）。",
              "`CanvasNodeView` 做了 memo，只接收 `node`、`zoom` 和标志位；拖动/缩放使用带事务的全局监听，每帧不产生多余的重渲染。",
              "绘图节点不会挂载 Excalidraw：它使用保存在场景中的 PNG 缩略图，完整编辑器按需加载（`React.lazy`）。",
              "文件拖放按目标分流：笔记创建附件与引用；嵌套画板通过带 `boardId` 的 `addNode` 把元素放进子画板。",
              "Excalidraw 编辑器的 `Cena` 菜单使用 `mergeExcalidrawScenes`，在 `updateScene`/`addFiles` 之前重映射元素、绑定、分组和文件。",
            ],
          },
        ],
      },
      {
        id: "importacao-externa",
        title: "外部导入",
        hint: "core/import",
        blocks: [
          {
            kind: "list",
            items: [
              "`obsidianParser.ts` 读取仓库条目（`.md`、`.canvas`、`.excalidraw`、附件），忽略 `.obsidian`/`.trash`，解析 frontmatter、标签、wiki 链接和相对 Markdown 链接，并按路径、文件名或别名解析目标。",
              "`obsidianPlan.ts` 生成带稳定 ID 的计划：每个文件夹一个画板、笔记排成网格、附件放在独立区域、canvas 带分组和连线，引用已指向最终 ID。",
              "`boardSlice` 中的 `importVault(plan)` 在单个 `commit` 里落地计划，创建 workspace、打开根画板，并把整次导入保留为一条撤销记录。",
              "界面使用 Tauri 的**系统文件夹选择器**（`tauri-plugin-dialog`）和 `vault_scan` 命令在 Rust 侧读取仓库，内容不经过 webview。在浏览器中回退到 `webkitdirectory`。",
              "仓库附件通过 `attachment_import_path` 复制到本地存储，字节不经过前端。",
              "导入上限为 20,000 个文件和每个文本 8 MB。",
            ],
          },
        ],
      },
      {
        id: "persistencia",
        title: "持久化",
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
              "`repository.ts` 把状态转换成文档（`app`、`settings`、`board:<id>`），并通过迁移重建 `HydratePayload`。",
              "`persistenceService.ts` 订阅 store，按引用识别被修改的画板，安排 flush 并只写入必要部分。它还安排自动备份并提供恢复。",
              "`migrations.ts` 归一化缺失字段、字符串数字和不完整的连接线，并忽略无效节点。",
              "附件不可变，通过 `attachmentId` 引用；`attachments.ts` 解析 URL（Tauri 使用 asset protocol，浏览器使用 object URL）并维护缓存。",
            ],
          },
        ],
      },
      {
        id: "backend-tauri",
        title: "Tauri 后端",
        hint: "src-tauri",
        blocks: [
          {
            kind: "list",
            items: [
              "`db.rs`：基于 rusqlite 的连接，启用 WAL，包含 `documents`、`attachments` 和 `backups` 表；附件写入数据目录，并清理过期备份。",
              "`lib.rs`：`Mutex<Database>` 状态以及 `doc_*`、`attachment_*`、`backup_*`、`clear_all` 命令。",
              "窗口禁用 `dragDropEnabled`，让 webview 中的 HTML5 文件拖放正常工作；同时启用作用域限制在 `$APPDATA` 的 asset protocol。",
            ],
          },
        ],
      },
      {
        id: "colaboracao-futura",
        title: "为未来的协作留出空间",
        blocks: [
          {
            kind: "list",
            items: [
              "领域模型已归一化，带稳定 ID 和按实体划分的时间戳。",
              "`StorageAdapter` 隔离了持久化方式；远程实现可以替换适配器而无需改动界面。",
              "`commit` 集中了所有变更，后续可以据此发出操作（事件溯源）。",
              "引用和评论已经是本地实体，可映射到作者与远程线程。",
              "没有任何架构决策阻碍认证、同步或 CRDT：界面并不假设状态只存在于当前进程。",
            ],
          },
        ],
      },
      {
        id: "testes",
        title: "测试",
        blocks: [
          {
            kind: "list",
            items: [
              "`vitest` + `jsdom` + Testing Library。",
              "覆盖几何、布局/裁剪、markdown/净化、store/历史、模板、搜索/反向链接、导出/导入、迁移、持久化/备份，以及三个节点组件。",
              "Rust 后端通过 `cargo check` 和真实构建（`npm run tauri build`）验证；打包后的二进制已作为冒烟测试启动，创建 SQLite 并完成 seed 水合。",
            ],
          },
        ],
      },
    ],
  },
  desenvolvimento: {
    title: "开发",
    shortTitle: "开发",
    summary:
      "环境要求、常用命令、安装助手、测试环境、Rust 后端验证，以及本地开发中常见问题的排查。",
    sections: [
      {
        id: "requisitos",
        title: "环境要求",
        blocks: [
          {
            kind: "list",
            items: [
              "Node.js 20+ 与 npm。",
              "Rust 1.77.2+（推荐使用 rustup）。",
              "Tauri 2：按平台安装系统依赖（Windows：WebView2 + Microsoft C++ Build Tools；macOS：Xcode Command Line Tools；Linux：webkit2gtk）。",
              "SQLite 内嵌编译（`rusqlite` 的 `bundled` 特性），没有外部依赖。",
            ],
          },
        ],
      },
      {
        id: "comandos",
        title: "命令",
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
            note: "scripts/copy-excalidraw-assets.mjs 会把 Excalidraw 的字体和数据复制到 public/excalidraw-assets；它在 dev 和 build 之前运行，确保应用无需 CDN 即可工作。",
          },
        ],
      },
      {
        id: "assistente-de-instalacao",
        title: "安装助手",
        hint: "setup/",
        blocks: [
          {
            kind: "text",
            text: "`npm run setup:build` 会生成 `dist-setup/EliasNote_<versão>_x64-setup.exe`：一个独立的 Tauri 应用（`setup/src-tauri`，界面在 `setup.html` + `src/setup/**`），它把 `eliasnote.exe` 内嵌到 `setup/src-tauri/payload`，并以用户级安装程序。",
          },
          {
            kind: "list",
            items: [
              "图标（`setup/src-tauri/icons`）和 payload 都是脚本**生成**的；在 payload 存在之前，单独在 `setup/src-tauri` 执行 `cargo build` 会失败。",
              "两步构建都使用 Tauri CLI（应用和助手）：只有它会设置把生产前端嵌入二进制的 `TAURI_ENV_*` 变量。",
              "`npm run setup:dev` 只打开界面（另一个终端运行 `npm run dev` 提供 `:1420` 上的 Vite）。",
              "助手会把自己复制为 `uninstall.exe`；带 `--uninstall` 运行时打开卸载页面，并在进程结束时删除安装目录。",
            ],
          },
        ],
      },
      {
        id: "release",
        title: "发布",
        blocks: [
          {
            kind: "text",
            text: "仓库通过 `.github/workflows/release.yml` 中的 GitHub Actions 发布安装包：",
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
            text: "`v*` 标签会触发检查（typecheck、测试、构建），创建 release，并并行编译 Windows、Linux 和 macOS，附上 `.msi`、`.exe`、`.AppImage`、`.deb` 和 `.dmg`。手动触发和矩阵调整的细节见本网站的《发布》页面。",
          },
        ],
      },
      {
        id: "estrutura-de-dados",
        title: "数据结构",
        blocks: [
          {
            kind: "text",
            text: "**Tauri（生产）**",
          },
          {
            kind: "code",
            title: "diretório de dados",
            code: `<app_data_dir>/
  eliasnote.sqlite3
  attachments/<id>_<nome>
  eliasnote.sqlite3-wal`,
          },
          {
            kind: "text",
            text: "**浏览器（开发）**",
          },
          {
            kind: "list",
            items: [
              "IndexedDB 数据库 `eliasnote`，包含 `documents`、`attachments` 和 `backups` 三个 object store。",
              "不同浏览器配置文件之间没有持久化。",
            ],
          },
        ],
      },
      {
        id: "testes",
        title: "测试",
        blocks: [
          {
            kind: "list",
            items: [
              "`src/lib/*.test.ts` —— 几何、markdown。",
              "`src/core/domain/layout.test.ts` —— 排序、5000 个元素的裁剪、列。",
              "`src/core/domain/templates.test.ts` —— 模板以及模板往返。",
              "`src/core/store/store.test.ts` —— 创建、撤销/重做、事务、列、复制、引用。",
              "`src/core/search/search.test.ts` —— 搜索与反向链接。",
              "`src/core/export/exporter.test.ts` —— JSON/Markdown 与导入。",
              "`src/core/import/obsidian.test.ts` —— 仓库解析、frontmatter、canvas、wiki 链接与计划。",
              "`src/core/import/obsidianExample.test.ts` —— 仓库示例的有效性。",
              "`src/core/import/importVault.test.ts` —— store 中的导入、引用与撤销。",
              "`src/features/import/ObsidianImportDialog.test.tsx` —— 完整流程：文件夹、摘要、导入和 workspace。",
              "`src/features/nodes/drops.test.tsx` —— 把图片拖放到笔记和嵌套画板。",
              "`src/features/drawing/sceneMerge.test.ts` —— Excalidraw 场景重映射与合并。",
              "`src-tauri/src/vault.rs` —— 递归读取仓库的 Rust 测试（`cargo test`）。",
              "`src/core/persistence/persistence.test.ts` —— 迁移、快照、自动保存和备份。",
              "`src/features/nodes/nodes.test.tsx` —— 任务、清单和笔记的真实交互。",
              "`src/app.test.tsx` —— 完整集成：bootstrap、seed 水合与界面挂载。",
            ],
          },
          {
            kind: "text",
            text: "测试环境使用 jsdom，并补齐 `ResizeObserver`、`matchMedia`、`requestAnimationFrame` 和 `URL.createObjectURL`。",
          },
        ],
      },
      {
        id: "backend-rust",
        title: "验证 Rust 后端",
        blocks: [
          {
            kind: "text",
            text: "后端已在该环境使用 Rust 1.100（MSVC）验证：",
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
            text: "完整构建也已通过 `npm run tauri build` 执行，生成 `EliasNote_0.1.0_x64_en-US.msi`、`EliasNote_0.1.0_x64-setup.exe`（NSIS）和 `eliasnote.exe`。打包后的二进制作为冒烟测试打开，并把初始文档写入 SQLite（`app`、`settings`、两个 `board`）。",
          },
        ],
      },
      {
        id: "diretorio-de-build",
        title: "构建目录",
        blocks: [
          {
            kind: "text",
            text: "`src-tauri/.cargo/config.toml` 把 `target-dir` 重定向到 `F:/cargo-target/eliasnote`，因为该环境的 C: 盘可用空间很小。如果要换机器，请删除或调整这个文件：",
          },
          {
            kind: "code",
            title: ".cargo/config.toml",
            code: `[build]
target-dir = "F:/cargo-target/eliasnote"`,
          },
          {
            kind: "text",
            text: "没有这个重定向时，产物位于 `src-tauri/target`。查看本地数据库：",
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
        title: "问题排查",
        blocks: [
          {
            kind: "list",
            items: [
              "**桌面端文件夹选择器打不开：** 应用使用系统对话框插件；确认构建包含 `tauri-plugin-dialog` 和 `dialog:allow-open` 权限（已配置）。更新项目后请重新安装应用。",
              "**Excalidraw 字体不加载：** 确认 `public/excalidraw-assets/fonts` 存在（`npm run dev` 会重建）。",
              "**CSP 在桌面端拦截了某些内容：** 调整 `src-tauri/tauri.conf.json` 中的 `app.security.csp`；只在开发环境使用 `null`。",
              "**浏览器中不持久化：** 在开发者工具中检查 IndexedDB；应用会在侧边栏底部显示存储类型。",
              "**桌面端文件拖放不工作：** `tauri.conf.json` 中的 `dragDropEnabled` 必须保持为 `false`。",
              "**快捷键冲突：** 快捷键页面会标出重复项；列表中的第一个优先。",
              "**导出的 PNG 是空白：** 先打开画板再试一次；截图依赖已取景的视口。",
            ],
          },
        ],
      },
      {
        id: "convencoes",
        title: "约定",
        blocks: [
          {
            kind: "list",
            items: [
              "严格 TypeScript（`noUnusedLocals`/`noUnusedParameters`），别名 `@/`。",
              "可变状态只在 Zustand + Immer 的 `commit`/`set` 内修改。",
              "纯函数、可测试的工具放在 `lib/` 和 `core/domain`。",
              "`core/` 不导入 `features/` 中的组件。",
              "界面文案使用葡萄牙语；代码和标识符使用英语。",
            ],
          },
        ],
      },
    ],
  },
  release: {
    title: "发布",
    shortTitle: "发布",
    summary:
      "一次版本的完整路径：GitHub Actions 工作流、平台矩阵、Windows 定制安装程序、可视化安装助手与常见问题。",
    sections: [
      {
        id: "pre-requisitos",
        title: "前置条件（一次性）",
        blocks: [
          {
            kind: "list",
            items: [
              "GitHub 仓库已启用 Actions（默认开启）。",
              "不需要额外的 secret：工作流使用内置的 `GITHUB_TOKEN`，权限为 `contents: write`。",
              "代码签名是可选的。没有证书时，Windows 会显示 SmartScreen 警告，macOS 会在手动放行前阻止应用运行。",
            ],
          },
        ],
      },
      {
        id: "publicar",
        title: "发布一个版本",
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
            text: "推送 `v*` 标签会触发工作流：",
          },
          {
            kind: "table",
            columns: ["Job", "作用"],
            rows: [
              ["`checks`", "`npm ci`、`npm run typecheck`、`npm test` 和 `npm run build`（ubuntu-22.04）"],
              ["`release`", "通过 `generate-notes` API 生成说明，并创建该标签的 release（或复用已有的）"],
              [
                "`build`",
                "矩阵：**Windows**（`tauri-action` 生成 `.msi` WiX + 可视化助手的 `.exe`）、**Linux**（`.AppImage`、`.deb`、`.rpm`）和 **macOS**（通用 `.dmg`），把安装包上传到 release",
              ],
              ["`summary`", "在 job summary 中发布结果摘要"],
            ],
          },
          {
            kind: "text",
            text: "安装包出现在 **Releases → vX.Y.Z**。若想先作为草稿，在公开前运行 `gh release edit vX.Y.Z --draft`（或手动创建 release，仅重新运行 `build` job）。",
          },
          {
            kind: "text",
            text: "`release` job 在构建之前发布 release（即使它仍是草稿），助手上传使用 release 的 **id**，因此重复运行同一个标签只会替换资源而不会产生重名。",
          },
          {
            kind: "text",
            text: "工作流在构建前用标签运行 `scripts/set-version.mjs`，所以即使提交中的清单版本落后，产物依然带标签版本。",
          },
        ],
      },
      {
        id: "disparo-manual",
        title: "手动触发",
        blocks: [
          {
            kind: "text",
            text: "Actions → **Release** → *Run workflow* → 填入仓库中已存在的标签（例如 `v0.2.0`）。说明和与标签的关联与自动流程一致。",
          },
        ],
      },
      {
        id: "pre-releases",
        title: "预发布",
        blocks: [
          {
            kind: "text",
            text: "带后缀的标签（`v0.3.0-beta.1`、`v1.0.0-rc.1`）会作为**预发布**发布。",
          },
        ],
      },
      {
        id: "matriz",
        title: "调整平台矩阵",
        hint: ".github/workflows/release.yml",
        blocks: [
          {
            kind: "text",
            text: "编辑 `.github/workflows/release.yml` 中的 `build.strategy.matrix.include`：",
          },
          {
            kind: "list",
            items: [
              "**仅 Windows：** 只保留 `Windows (x64)` 条目。",
              "**按架构构建 macOS：** 把 `args` 改为 `aarch64-apple-darwin`（`macos-latest`）或 `x86_64-apple-darwin`（`macos-13`），并移除添加 Rust target 的步骤。",
              "**指定 bundle：** 在 `args` 中写明，例如 `--bundles msi` 或 `--bundles deb,appimage`。",
            ],
          },
        ],
      },
      {
        id: "conferir-antes-da-tag",
        title: "打标签前先验证",
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
        title: "定制安装程序（Windows）",
        hint: "src-tauri/installer",
        blocks: [
          {
            kind: "text",
            text: "NSIS 生成的 `.exe` 不使用 Tauri 默认助手：构建会应用 `src-tauri/installer/installer.nsi` 模板（官方模板的副本，安装逻辑相同）和品牌视觉。",
          },
          {
            kind: "table",
            columns: ["文件", "作用"],
            rows: [
              ["`src-tauri/installer/installer.nsi`", "NSIS 模板；只有视觉品牌相关的部分与原版不同"],
              ["`src-tauri/installer/brand.nsh`", "配色（`MUI_BGCOLOR`、`MUI_TEXTCOLOR`）和页面上的 pt-BR 文案"],
              ["`src-tauri/installer/assets/sidebar.bmp`", "欢迎页和完成页使用的 164×314 侧栏图"],
              ["`src-tauri/installer/assets/header.bmp`", "内部页面和卸载器使用的 150×57 页眉图"],
              [
                "`scripts/generate-installer-assets.mjs`",
                "根据品牌几何（`scripts/lib/brand-mark.mjs`）生成 BMP",
              ],
              ["`src-tauri/installer/…` + `tauri.conf.json`", "在 `bundle.windows.nsis` 和 `bundle.licenseFile` 中接线"],
            ],
          },
          {
            kind: "text",
            text: "这些素材会进入版本库。改动品牌后运行 `npm run installer:assets`；如果 BMP 过期，或模板丢失了打包器使用的占位符，`src/test/installerAssets.test.ts` 会失败。",
          },
          {
            kind: "text",
            text: "升级 `@tauri-apps/cli` 时，把本地模板与 Tauri 仓库对应标签的 `crates/tauri-bundler/src/bundle/windows/nsis/installer.nsi` 对比，把逻辑变更（WebView2、MultiUser、重装、`/P`、`/S`、`/UPDATE`）同步到本地文件。",
          },
          {
            kind: "code",
            title: "terminal",
            code: `npm run tauri build -- --bundles nsis
# Windows: <target>/release/bundle/nsis/EliasNote_<versão>_x64-setup.exe`,
            note: "MSI（WiX）、DMG 和 Linux 包继续使用各平台的标准安装程序。",
          },
        ],
      },
      {
        id: "instalador-visual",
        title: "可视化安装助手",
        hint: "setup/ · dist-setup/",
        blocks: [
          {
            kind: "text",
            text: "最终用户收到的是 `EliasNote_<versão>_x64-setup.exe`：一个使用 Tauri + WebView2、与应用视觉语言一致的安装助手，包含侧边步骤（欢迎、选项、安装、完成）、浅色/深色主题、目录选择、快捷方式和真实进度。",
          },
          {
            kind: "code",
            title: "terminal",
            code: `npm run setup:build     # frontend + app + assistente → dist-setup/EliasNote_<versão>_x64-setup.exe
npm run setup:dev       # só a interface, com npm run dev em outro terminal`,
          },
          {
            kind: "table",
            columns: ["部分", "位置"],
            rows: [
              ["界面（应用的 React + Tailwind）", "`setup.html`、`src/setup/**`"],
              ["助手后端（Rust/Tauri）", "`setup/src-tauri/**`（`src/install.rs`、`src/lib.rs`）"],
              ["内嵌在 `.exe` 中的应用", "`setup/src-tauri/payload/eliasnote.exe`（生成物，不入版本库）"],
              ["最终产物", "`dist-setup/EliasNote_<versão>_x64-setup.exe`"],
            ],
          },
          {
            kind: "text",
            text: "助手规则：",
          },
          {
            kind: "list",
            items: [
              "只为当前用户安装（`%LOCALAPPDATA%\\EliasNote`、`HKCU`），不需要 UAC；",
              "复制应用和助手自身为 `uninstall.exe`（`--uninstall` 模式），通过 `WScript.Shell` 创建快捷方式，并在*应用*列表中以估算大小登记；",
              "卸载默认保留 `%APPDATA%\\com.eliasnote.desktop`，并提供明确选项删除画板、附件和设置；",
              "升级就是再次运行同一个 `.exe`：已安装版本从注册表读取。",
            ],
          },
          {
            kind: "note",
            text: "NSIS 安装程序（`bundle.windows.nsis`）仍可作为静默替代方案（`/S`、`/P`）使用经典向导，但**不会**由 CI 发布：它与助手输出同名，会互相覆盖。",
          },
          {
            kind: "text",
            text: "CI 中 Windows 发布可视化助手（`.exe`）和 MSI（`.msi`），后者支持静默安装（`msiexec /i EliasNote_<versão>_x64_en-US.msi /qn`）。",
          },
        ],
      },
      {
        id: "problemas-comuns",
        title: "常见问题",
        blocks: [
          {
            kind: "list",
            items: [
              "**`cargo` 抱怨 `Cargo.lock` 中的版本：** 在 `src-tauri` 中运行任意 `cargo build`/`cargo check`（会更新 lock），或执行 `cargo update -p eliasnote`。",
              "**release 缺少部分安装包：** 查看失败平台的 `build` job 并选择 *Re-run failed jobs*；资源会上传到同一个 release。",
              "**重复运行工作流：** `release` job 复用标签对应的 release；构建只会重新上传/替换资源。",
              "**Linux 缺少 `webkit2gtk`：** job 会在 `ubuntu-22.04` 上安装依赖；更换 runner 时请调整软件包列表。",
              "**macOS 提示“app is damaged”：** 未签名的构建；用 `xattr -dr com.apple.quarantine /Applications/EliasNote.app` 放行，或使用证书签名/公证。",
              "**不想发布：** 在 fork/分支上运行工作流，或临时移除 `push.tags` 触发器。",
            ],
          },
        ],
      },
    ],
  },
};
