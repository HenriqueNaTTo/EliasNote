import type { DocsContent } from "@/landing/i18n/types";
import { zhDocsExtra } from "@/landing/i18n/locales/zh/docs-extra";

export const zhDocs: DocsContent = {
  hub: {
    eyebrow: "文档",
    title: "完整文档，就在网站里。",
    description:
      "六个页面覆盖产品、快捷键、Obsidian 导入、架构、开发环境与版本发布——沿用与应用一致的视觉语言。",
    searchLabel: "筛选文档页面",
    searchPlaceholder: "按主题或技术关键词筛选",
    count: "{count} / {total} 页",
    emptyTitle: "没有页面匹配“{query}”。",
    emptyDescription: "试试更短的关键词——例如 canvas、Obsidian、快捷键或发布。",
    clear: "清除筛选",
    trailsEyebrow: "从这里开始",
    trailsTitle: "按目标挑选的短路径。",
    trailsDescription: "每条路径直达下一步真正需要的页面，不必按顺序读完所有内容。",
    fileFooterBefore: "内容与仓库中 ",
    fileFooterAfter: " 目录下的 Markdown 文件保持同步。",
    fileLink: "查看原始文件",
    cardSections: "{count} 节",
    cardMinutes: "{minutes} 分钟",
    trails: [
      {
        title: "我要使用应用",
        description: "在第一个画板之前，先了解产品、元素和快捷键组合。",
        pages: ["funcionalidades", "atalhos"],
      },
      {
        title: "我要导入 Obsidian",
        description: "看看哪些内容会被转换、目录如何变成画板，以及存在哪些限制。",
        pages: ["obsidian", "funcionalidades"],
      },
      {
        title: "我要参与开发或发布",
        description: "本地环境、测试、Rust 后端、架构，以及发布新版本的流程。",
        pages: ["desenvolvimento", "arquitetura", "release"],
      },
    ],
  },
  page: {
    breadcrumb: "文档",
    breadcrumbAria: "文档路径",
    eyebrow: "文档",
    minutes: "阅读约 {minutes} 分钟",
    sections: "{count} 节",
    editOnGithub: "在 GitHub 上编辑",
    onThisPage: "本页内容",
    mobileToc: "本页内容 · {count} 节",
    previous: "上一篇",
    next: "下一篇",
    index: "索引",
    allPages: "查看全部页面",
    navAria: "文档页面之间的导航",
    docsNav: "文档",
  },
  pages: {
    funcionalidades: {
      title: "功能",
      shortTitle: "功能",
      summary:
        "已经完成的能力清单：画布、元素、Excalidraw、组织方式、搜索、效率工具，以及公开声明的限制。",
      sections: [
        {
          id: "canvas-e-organizacao",
          title: "画布与组织",
          hint: "features/canvas",
          blocks: [
            {
              kind: "list",
              items: [
                "无限画布，支持滚轮、触控板、中键、手型工具或空格键平移。",
                "通过 `Ctrl/Cmd + 滚轮`、双指缩放、按钮、百分比菜单（25%–200%）和快捷键缩放。",
                "适应画板（`Shift+1`）、100% 缩放（`Ctrl/Cmd+0`）、可点击可拖动的迷你地图。",
                "可选网格吸附，尺寸为 8/16/24/32 px。",
                "框选、Shift+点击、`Ctrl/Cmd+A` 多选，方向键微调（Shift = 10 px），检查器中有对齐工具。",
                "复制、置顶、置底、锁定、隐藏和删除，全部支持撤销。",
                "通过右键菜单把所选内容移动或复制到其他画板：列带着子项一起走，子画板跟随卡片，内容居中放入目标画板。",
                "把所选内容拖到画布上的画板卡片或侧边栏的树节点即可移动（在画布上按住 `Alt` 复制）；目标会响应拖动并在接收时闪动。",
                "双击空白区域创建笔记；双击元素打开对应的编辑器。",
                "从系统向画布拖放文件：图片、视频、文件、Markdown（变成笔记）、`.excalidraw`（变成绘图）和 JSON（导入元素）。",
                "把图片或文件拖到**笔记**上：附件保存在本地，缩略图出现在卡片内，元素留在旁边并建立双向引用。",
                "把文件拖到**嵌套画板**：它们直接进入子画板（有提示），不会在当前画板重复。",
              ],
            },
          ],
        },
        {
          id: "elementos",
          title: "元素",
          hint: "core/domain/nodes",
          blocks: [
            {
              kind: "table",
              columns: ["元素", "能力"],
              caption: "EliasNote 的节点类型及其提供的功能",
              rows: [
                ["笔记", "Markdown，带格式工具栏、预览、字数统计、标题和颜色"],
                ["文本", "直接在画布上的自由文本，没有卡片：双击输入，随内容增长并可设颜色"],
                ["卡片", "标题、描述、标签和颜色"],
                ["任务", "完成、优先级、截止日期，回车创建下一个任务"],
                ["清单", "可编辑条目、进度、添加/删除、勾选完成"],
                ["图片 / 视频", "本地附件、说明文字、填充/适应、灯箱预览"],
                ["文件", "名称、类型、大小和下载"],
                ["链接", "标题、描述、URL，用默认浏览器打开"],
                ["画板", "真正的子画板，带统计、彩色预览，可在标签页中打开"],
                ["列", "可拖动子项、折叠、调整大小、快速创建菜单"],
                ["评论", "本地作者、解决状态、回复和检查器内的独立面板"],
                ["绘图", "完整的 Excalidraw、缩略图、元素库和导出"],
                ["笔记内绘图", "把绘图关联到笔记（笔记标题栏上的画笔按钮）；缩略图显示在卡片内并打开编辑器"],
              ],
            },
          ],
        },
        {
          id: "excalidraw",
          title: "Excalidraw",
          hint: "features/drawing",
          blocks: [
            {
              kind: "list",
              items: [
                "双击、节点按钮或快捷键 `D` 打开全屏编辑器。",
                "Excalidraw 的全部工具：选择、形状、线条、箭头、手绘、文本、图片、橡皮、画框、激光笔、元素库和链接。",
                "带防抖的自动保存（元素、可序列化的 app state 和文件）。",
                "PNG 缩略图延迟生成，让画布保持轻量。",
                "元素库保存在本地，可直接导入/导出 `.excalidrawlib`。",
                "可把绘图导出为 PNG、SVG 和 PDF。",
                "通过拖放或导入对话框导入 `.excalidraw` 文件。",
                "通过**场景**菜单**合并场景**：粘贴剪贴板内容、导入 `.excalidraw`，或合并工作区中的另一个绘图（包括从 Obsidian 导入的）。",
                "合并会生成新 ID，重映射文本/容器、箭头/绑定、分组和图片，并整体偏移以避免覆盖现有内容。",
              ],
            },
          ],
        },
        {
          id: "quadros-workspaces-abas",
          title: "画板、工作区与标签页",
          blocks: [
            {
              kind: "list",
              items: [
                "多个工作区，支持创建、重命名和删除。",
                "侧边栏树支持展开、拖动嵌套、移到根、重命名、复制和删除。",
                "每个画板独立的标签页，可通过按钮、中键或 `Ctrl/Cmd+W` 关闭。",
                "可通过工具栏、检查器、树或快捷键创建递归子画板。",
              ],
            },
          ],
        },
        {
          id: "busca-e-referencias",
          title: "搜索与引用",
          hint: "core/search",
          blocks: [
            {
              kind: "list",
              items: [
                "在所有工作区中全局搜索，按字段打分并可按类型筛选。",
                "结果显示片段、类型和画板路径；回车打开并居中该元素。",
                "任务面板（`Ctrl/Cmd+Shift+P`）汇总所有画板的任务，支持截止日期、优先级、筛选和在画布中打开。",
                "检查器中可编辑标签，支持画板建议，并可按标签筛选画布；筛选是临时视图，不改变数据。",
                "演示模式（`Ctrl/Cmd+Shift+F`）隐藏界面，适应画板，并浏览工作区的画板树，不修改任何内容。",
                "双向引用：在 `Refs` 中添加画板或元素；反向链接列出指向当前条目的位置。",
              ],
            },
          ],
        },
        {
          id: "produtividade",
          title: "效率工具",
          blocks: [
            {
              kind: "list",
              items: [
                "带智能合并的撤销/重做；`Ctrl/Cmd+Z` 和 `Ctrl/Cmd+Shift+Z`（或 `Ctrl+Y`）。",
                "内置模板：头脑风暴、项目、看板、会议记录、调研、情绪板、周计划、脚本、复盘。",
                "把当前画板保存为可复用模板（可序列化 payload，跨会话保留）。",
                "把整块画板导出为 PNG/PDF，自动取景并在结束后恢复缩放。",
                "导出 Markdown（列、任务、笔记）和 JSON（可重新导入的备份）。",
                "导入画板/工作区/片段 JSON、Markdown、`.excalidraw` 和附件。",
                "导入 Obsidian 仓库：目录层级变成画板、笔记带 frontmatter/标签、wiki 链接可点击并带引用、附件保存在本地、`.canvas`（文本、链接、文件、分组和连线）和 `.excalidraw`。",
              ],
            },
          ],
        },
        {
          id: "obsidian",
          title: "Obsidian",
          hint: "core/import",
          blocks: [
            {
              kind: "text",
              text: "**文件 → Obsidian 仓库**菜单（或**导入 → 导入 Obsidian 仓库**）会用一个仓库文件夹创建新的工作区，不修改原始仓库。桌面端使用系统文件夹选择器；全程本地运行，整次导入是一条撤销记录。",
            },
            {
              kind: "list",
              items: [
                "文件夹变成嵌套画板；笔记变成按网格排列的 Markdown 笔记。",
                "`[[Nota]]`、`[[Nota|alias]]` 和 `[[Nota#Título]]` 变成可点击的内部链接 + 双向引用。",
                "`![[imagem]]`、相对 Markdown 链接和附件保存在本地，并变成被引用的媒体节点。",
                "`.canvas` 变成带节点和连线的子画板；分组变成列。",
                "`.excalidraw` 变成可编辑绘图。",
                "限制：插件/主题/Dataview 不会执行，嵌入（transclusion）变成链接，分组会重排其中条目。",
              ],
            },
          ],
        },
        {
          id: "dados-e-configuracoes",
          title: "数据与设置",
          hint: "core/persistence",
          blocks: [
            {
              kind: "list",
              items: [
                "视觉灵感来自 Milanote：中性灰画布、白色卡片、无标题的彩色笔记、彩色画板块、透明列、带深色标签的细连接线，以及全界面的直角设计。",
                "增量自动保存，带状态指示和存储类型标识（SQLite/IndexedDB）。",
                "可按间隔自动备份，也可手动备份，支持保留策略和恢复。",
                "浅色/深色/跟随系统主题、强调色、画布纹理、密度、界面缩放、元素阴影、迷你地图和连接线标签。",
                "快捷键完全可重新映射，带冲突检测和恢复默认。",
                "本地附件，按设备存储，不上传任何内容。",
              ],
            },
          ],
        },
        {
          id: "limites-conhecidos",
          title: "已知限制",
          blocks: [
            {
              kind: "note",
              tone: "warning",
              text: "透明也是文档的一部分。如果下面某一点会阻断你的流程，请开一个 issue 说明使用场景。",
            },
            {
              kind: "list",
              items: [
                "没有认证、协作、服务器或同步（设计如此）。",
                "链接在默认浏览器中打开；应用内容始终保持离线。",
                "Excalidraw 编辑器首次打开时按需加载（压缩后约 4.6 MB）。",
                "图片导出只捕获画布已取景的区域；超大画板请使用 2x 或 3x 缩放。",
                "撤销/重做历史仅限当前会话，不会持久化。",
              ],
            },
          ],
        },
      ],
    },
    atalhos: {
      title: "快捷键",
      shortTitle: "快捷键",
      summary:
        "应用中的所有快捷键，分为导航、创建、画布和文件四类。每个组合都可以在 设置 → 快捷键 中重新映射。",
      sections: [
        {
          id: "navegacao",
          title: "导航",
          blocks: [
            {
              kind: "shortcuts",
              items: [
                { action: "全局搜索", keys: [["Mod", "K"]] },
                { action: "任务面板", keys: [["Mod", "Shift", "P"]] },
                { action: "演示模式", keys: [["Mod", "Shift", "F"]] },
                { action: "打开/进入所选画板", keys: [["Mod", "Enter"]] },
                { action: "关闭标签页", keys: [["Mod", "W"]] },
                { action: "下一个标签页", keys: [["Mod", "Tab"]] },
                { action: "切换侧边栏", keys: [["Mod", "B"]] },
                { action: "切换检查器", keys: [["Mod", "Shift", "I"]] },
                { action: "切换主题", keys: [["Mod", "Shift", "L"]] },
              ],
            },
          ],
        },
        {
          id: "criacao",
          title: "创建",
          blocks: [
            {
              kind: "shortcuts",
              items: [
                { action: "新建笔记", keys: [["N"]] },
                { action: "新建自由文本", keys: [["Shift", "T"]] },
                { action: "新建卡片", keys: [["C"]] },
                { action: "新建任务", keys: [["T"]] },
                { action: "新建清单", keys: [["L"]] },
                { action: "新建列", keys: [["Mod", "Shift", "K"]] },
                { action: "新建画板", keys: [["Mod", "Shift", "N"]] },
                { action: "新建 Excalidraw 绘图", keys: [["D"]] },
                { action: "新建评论", keys: [["M"]] },
                { action: "在树中新建子画板", keys: [["画板菜单", "新建子画板"]] },
              ],
            },
          ],
        },
        {
          id: "canvas",
          title: "画布",
          blocks: [
            {
              kind: "shortcuts",
              items: [
                { action: "选择工具", keys: [["V"]] },
                { action: "手型工具", keys: [["H"]] },
                { action: "连接线工具", keys: [["R"]] },
                { action: "移动所选（1 px）", keys: [["方向键"]] },
                { action: "移动所选（10 px）", keys: [["Shift", "方向键"]] },
                { action: "复制", keys: [["Mod", "D"]] },
                { action: "删除", keys: [["Delete"], ["Backspace"]] },
                { action: "全选", keys: [["Mod", "A"]] },
                { action: "撤销", keys: [["Mod", "Z"]] },
                { action: "重做", keys: [["Mod", "Shift", "Z"], ["Ctrl", "Y"]] },
                { action: "放大", keys: [["Mod", "="]] },
                { action: "缩小", keys: [["Mod", "−"]] },
                { action: "100% 缩放", keys: [["Mod", "0"]] },
                { action: "适应画板", keys: [["Shift", "1"]] },
                { action: "退出工具 / 关闭编辑器", keys: [["Esc"]] },
              ],
            },
          ],
        },
        {
          id: "arquivo",
          title: "文件",
          blocks: [
            {
              kind: "shortcuts",
              items: [
                { action: "立即保存", keys: [["Mod", "S"]] },
                { action: "导出画板", keys: [["Mod", "Shift", "E"]] },
                { action: "模板", keys: [["Mod", "Shift", "T"]] },
                { action: "备份", keys: [["Mod", "Shift", "B"]] },
                { action: "设置", keys: [["Mod", ","]] },
              ],
            },
          ],
        },
        {
          id: "observacoes",
          title: "说明",
          blocks: [
            {
              kind: "text",
              text: "`Mod` 表示 Windows/Linux 上的 `Ctrl`，以及 macOS 上的 `⌘`。所有快捷键都可以在 **设置 → 快捷键** 中重新映射，带冲突检测和恢复默认。",
            },
            {
              kind: "list",
              items: [
                "在文本框中输入时，单字母快捷键会被忽略。",
                "带 `Mod` 的组合仍然可用于撤销、保存和搜索。",
                "在浏览器中，部分系统快捷键（如 `Ctrl+W` 和 `Ctrl+Tab`）可能被拦截。在 Tauri 应用中它们正常工作。",
              ],
            },
          ],
        },
      ],
    },
    obsidian: {
      title: "导入 Obsidian 仓库",
      shortTitle: "Obsidian",
      summary:
        "如何把整个仓库变成一个工作区：哪些内容会被转换、组织方式如何生成、有哪些限制，以及隐私说明。",
      sections: [
        {
          id: "como-usar",
          title: "使用方法",
          blocks: [
            {
              kind: "text",
              text: "EliasNote 会把 Obsidian 仓库（vault）导入为**新的工作区**，不修改原始仓库，也不向互联网发送任何内容。全部读取都在你的机器上完成。",
            },
            {
              kind: "list",
              ordered: true,
              items: [
                "打开 **文件（⋯）→ Obsidian 仓库** 菜单，或 **导入 → 导入 Obsidian 仓库**。",
                "选择仓库的**根文件夹**。桌面端会打开系统文件夹选择器；浏览器中使用浏览器自带的文件夹选择器。",
                "查看摘要（笔记、文件夹、canvas、绘图和附件），调整工作区名称，并选择是否导入未被引用的附件。",
                "点击 **导入仓库**。EliasNote 会打开新工作区的根画板。",
              ],
            },
            {
              kind: "note",
              text: "仓库中提供了示例仓库 examples/obsidian-vault，可用于测试完整流程。",
            },
            {
              kind: "text",
              text: "导入的 `.excalidraw` 会变成绘图节点。要在另一个绘图中复用这个场景，打开目标绘图，使用 **场景 → 合并工作区绘图** 并选择导入的绘图。也可以使用 **场景 → 粘贴剪贴板场景**，或直接在编辑器中导入 `.excalidraw` 文件。",
            },
            {
              kind: "text",
              text: "导入在历史中只算一次操作：`Ctrl/Cmd + Z` 会撤销整个工作区。磁盘上的仓库不会被修改。",
            },
          ],
        },
        {
          id: "o-que-e-convertido",
          title: "转换内容",
          hint: "obsidianParser.ts · obsidianPlan.ts",
          blocks: [
            {
              kind: "table",
              columns: ["Obsidian", "EliasNote"],
              caption: "仓库元素与工作区结果之间的对应关系",
              rows: [
                ["文件夹", "嵌套画板（根文件夹变成初始画板；每个子文件夹变成子画板）"],
                ["`.md` 笔记", "带标题、内容、标签/别名 frontmatter 和任务的 Markdown 笔记"],
                ["`[[Nota]]` / `[[Nota|alias]]`", "可点击的内部链接（`eliasnote://node/...`）+ 双向引用"],
                ["`[[Nota#Título]]`", "带片段标题的内部链接，并引用到该笔记"],
                ["`![[imagem.png]]`", "本地附件 + 画布中的图片/视频/文件节点，并被笔记引用"],
                ["`[[arquivo.pdf]]`", "本地附件 + 文件节点"],
                ["`[[Quadro.canvas]]`", "指向从 canvas 导入的画板的链接"],
                ["`[[desenho.excalidraw]]`", "指向 Excalidraw 绘图节点的链接"],
                ["相对 Markdown 链接（`[Nota](Pasta/Nota.md)`、`![](img.png)`）", "当目标存在于仓库中时转换为内部链接/附件"],
                [".canvas", "独立画板，包含笔记、链接、图片、分组和连接线"],
                [".excalidraw", "可编辑的绘图节点（同一场景）"],
                ["图片、视频和文件", "本地附件；引用变成媒体节点"],
                ["Canvas `group`", "包含分组内元素的列（纵向重新排列）"],
                ["Canvas 颜色（1–6）", "EliasNote 的调色板（粉、沙、琥珀、薄荷、天蓝、淡紫）"],
                ["Canvas 连线", "带标签、颜色和箭头的连接线，依据 `fromEnd`/`toEnd`"],
              ],
            },
          ],
        },
        {
          id: "organizacao-gerada",
          title: "生成的组织结构",
          blocks: [
            {
              kind: "list",
              items: [
                "工作区命名为 `Obsidian · <cofre>`（可编辑）。",
                "工作区根是一个以仓库名命名的画板。它包含每个一级文件夹和根级 canvas 的画板卡片，以及位于根目录的笔记。",
                "每个文件夹都有自己的画板，内含子文件夹、canvas、笔记、绘图，以及右侧的附件区域。",
                "笔记排成三列网格；附件放在右侧的专用列中。",
                "Canvas 画板作为子画板打开，并显示为文件夹画板上的卡片。",
              ],
            },
          ],
        },
        {
          id: "limitacoes",
          title: "已知限制",
          blocks: [
            {
              kind: "list",
              items: [
                "**Obsidian 插件和主题不会被执行或导入**（`.obsidian` 被忽略）。Dataview、Templater、插件元数据和 CSS 片段都不会生效。",
                "**Dataview 和查询块**作为文本/代码进入，而不是结果。",
                "**嵌入（transclusion）**（`![[Nota]]`）变成指向笔记的链接，而不是嵌入内容。",
                "**标注（callouts）** 渲染为普通引用；HTML 会被净化。",
                "**Canvas 分组**变成列，条目纵向重新排列——组内原始位置不会保留。",
                "路径中带空格且用 `<...>` 包裹的 Markdown 链接可能无法解析；优先使用 `[[...]]`。",
                "不同文件夹中同名的笔记可能按最短路径解析；用 `[[Pasta/Nota]]` 消除歧义。",
                "超过 **20,000 个文件**的仓库只会部分读取；应用会提示，你可以分次导入子文件夹。",
                "超过 8 MB 的文本文件会被忽略。",
                "导入不会从仓库生成模板；需要时之后使用 **模板 → 保存当前画板**。",
              ],
            },
          ],
        },
        {
          id: "privacidade",
          title: "隐私",
          blocks: [
            {
              kind: "list",
              items: [
                "文件夹由系统本地选择器读取（`webkitdirectory`）；不会向网络发送任何内容。",
                "附件被复制到 EliasNote 的本地存储（SQLite/IndexedDB），仓库保持完整。",
                "内部链接在应用内打开；外部链接（`http`、`mailto`）在默认浏览器中打开。",
              ],
            },
          ],
        },
        {
          id: "solucao-de-problemas",
          title: "问题排查",
          blocks: [
            {
              kind: "list",
              items: [
                "**什么都没找到：** 确认选择的是包含 `.md` 的文件夹，而不是仓库上一层的目录。",
                "**缺少图片：** 确认附件在仓库内，并且链接使用 `![[...]]` 或有效的相对路径。开启“未引用附件”以导入没有链接的图片。",
                "**链接失效：** 摘要中会显示未解析链接的数量；它们会保留为文本。",
                "**Canvas 为空：** `.canvas` 必须是 JSON Canvas 格式的有效 JSON；无效文件会被标记为已忽略。",
                "**文件太多：** 选择一个子文件夹并重复导入；每次导入都会生成新的工作区。",
              ],
            },
          ],
        },
      ],
    },
    ...zhDocsExtra,
  },
};
