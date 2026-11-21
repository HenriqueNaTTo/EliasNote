import type { SiteContent } from "@/landing/i18n/types";
import { zhDocs } from "@/landing/i18n/locales/zh/docs";

export const zhSite: SiteContent = {
  beta: {
    badge: "Beta",
    message: "EliasNote 仍在开发中（beta）：功能、快捷键和数据格式可能随版本变化。",
    link: "关注版本发布",
    downloads: {
      title: "开发中的版本",
      description:
        "这是公开测试版：应用已可用于日常使用，但界面、快捷键和数据格式仍会随版本变化。",
      items: [
        "更新前请先备份：备份 → 创建快照。",
        "功能可能在不另行通知的情况下调整或重新组织。",
        "遇到问题？请附上复现步骤开一个 issue。",
      ],
    },
  },
  meta: {
    titles: {
      principal: "EliasNote —— 无限画布，100% 离线",
      funcionalidades: "功能 · EliasNote",
      downloads: "下载 · EliasNote",
      documentacao: "文档 · EliasNote",
      sobre: "关于 · EliasNote",
      contato: "联系 · EliasNote",
    },
    docTitle: "{page} · 文档 · EliasNote",
    description:
      "EliasNote 是一款本地优先的可视化整理桌面应用：无限画布、嵌套画板、笔记、任务和原生 Excalidraw。没有账户、没有云、没有同步。",
  },
  nav: {
    brand: "EliasNote",
    brandSubtitle: "本地优先画布",
    homeAria: "EliasNote —— 主页",
    sectionsAria: "站点栏目",
    download: "下载",
    downloadAria: "下载 EliasNote 安装包",
    tabs: {
      principal: "首页",
      funcionalidades: "功能",
      downloads: "下载",
      documentacao: "文档",
      sobre: "关于",
      contato: "联系",
    },
    accentGroup: "强调色",
    accentPrefix: "颜色",
    accentNames: { blue: "蓝色", emerald: "翠绿", rose: "玫红", amber: "琥珀", slate: "石板灰" },
    themeToLight: "切换到浅色主题",
    themeToDark: "切换到深色主题",
    language: "语言",
    languageAria: "选择网站语言",
    backToTop: "返回顶部",
  },
  footer: {
    summary: "本地优先的可视化整理工具，带无限画布和原生 Excalidraw。100% 离线，没有账户，也没有同步。",
    offline: "专为离线运行而设计",
    navigate: "浏览",
    resources: "资源",
    links: {
      repo: "代码仓库",
      releases: "版本发布",
      issues: "问题反馈",
      docs: "文档源文件",
      license: "MIT 许可证",
    },
    copyright: "© {year} EliasNote · 以 MIT 许可证开源",
    tech: "Tauri 2 · React · Excalidraw · 无跟踪 Cookie",
  },
  home: {
    hero: {
      badge: "本地优先 · 100% 离线",
      titleBefore: "你的下一个项目，从一个",
      titleHighlight: "无限画布",
      titleAfter: "开始。",
      description:
        "笔记、任务、图片、画板和 Excalidraw 绘图都在同一个视觉空间里。全部保存在你自己的电脑上——没有账户、没有云、没有同步。",
      primaryCta: "下载 EliasNote",
      secondaryCta: "查看功能",
      footnote: "Windows、Linux 和 macOS · 安装包附在官方 release 中 · MIT 许可证",
    },
    statsLabel: "EliasNote 数据一览",
    stats: ["的数据保存在你的设备上", "种元素类型", "个现成模板", "个账户、云服务或订阅"],
    pillars: {
      eyebrow: "为什么选择本地优先",
      title: "没有云，没有账户，没有意外。",
      description:
        "EliasNote 为那些希望可视化思考、又不愿把材料交给第三方服务的人而设计。",
      items: [
        {
          title: "数据在你自己的磁盘上",
          description:
            "每个画板在桌面端写入 SQLite，在浏览器中写入 IndexedDB，带增量自动保存和可恢复的轮转备份。",
          proof: "每 700 毫秒自动保存",
        },
        {
          title: "没有网络也能工作",
          description: "在任何地方打开、书写和绘图。应用不依赖服务器、账户或同步即可运行。",
          proof: "零数据请求",
        },
        {
          title: "没有账户，没有跟踪",
          description:
            "没有登录、遥测或订阅。链接在默认浏览器中打开，工作区内容始终留在你手里。",
          proof: "以 MIT 许可证开源",
        },
      ],
    },
    flow: {
      eyebrow: "工作方式",
      title: "从草稿到交付，都在同一个画板。",
      description: "每一步都在复用你已经创建的内容。不需要导出到其他工具，也不用重新建立上下文。",
      templatesLabel: "从模板开始",
      steps: [
        {
          title: "不排版，先记录",
          description:
            "用快捷键创建笔记、任务和清单。把文件直接拖到画布上：图片变成卡片，Markdown 变成笔记。",
        },
        {
          title: "把想法连起来",
          description: "列、嵌套画板和连接线在不丢失上下文的前提下整理混乱。Ctrl/Cmd+K 可以找到一切。",
        },
        {
          title: "绘图并交付",
          description: "打开 Excalidraw 画示意图，合并场景，并导出为 PNG、SVG、PDF、Markdown 或可重新导入的 JSON。",
        },
      ],
    },
    toolkit: {
      eyebrow: "工具箱",
      title: "所有东西都在一处——包括绘图。",
      description: "可视化整理和示意图在同一个工作区里。不用在想法中途切换应用。",
      items: [
        "十三种元素类型，从 Markdown 笔记到可编辑绘图",
        "在标题、笔记、任务、链接、评论和标签中全局搜索",
        "嵌套画板、独立工作区和按画板的标签页",
        "原生 Excalidraw，带本地元素库、自动保存和场景合并",
        "九个现成模板：头脑风暴、看板、会议记录、调研、周计划等",
        "带事务的撤销/重做：一次拖动就是一条历史记录",
      ],
      cta: "查看全部功能",
    },
    obsidian: {
      eyebrow: "集成",
      title: "已经有 Obsidian 仓库？",
      description:
        "把整个文件夹导入为新的工作区，不修改原仓库，也不向互联网发送任何内容。整次导入只是一条历史记录。",
      items: [
        "文件夹变成嵌套画板，笔记变成 Markdown",
        "Wiki 链接、标签和 frontmatter 变成可点击的引用",
        "图片和附件保存在本地",
        ".canvas 和 .excalidraw 文件可直接编辑",
      ],
      link: "阅读导入文档",
    },
    cta: {
      eyebrow: "一分钟开始",
      title: "你的下一个画板从空白开始。就像所有有趣的项目。",
      description: "安装应用，选择模板，开始整理。需要画图时，Excalidraw 就在那里。",
      primary: "立即下载",
      secondary: "在 GitHub 查看",
    },
    templates: ["头脑风暴", "项目", "看板", "会议记录", "调研", "情绪板", "周计划", "脚本", "复盘", "GDD", "关卡设计", "系统与机制", "游戏冲刺"],
  },
  features: {
    header: {
      eyebrow: "功能",
      title: "EliasNote 能做什么",
      description: "一个应用完成记录、整理、绘图和交付。下面是当前版本已完成的完整清单。",
    },
    filterAria: "按分类筛选功能",
    allCategories: "全部",
    categories: {
      canvas: "画布",
      elementos: "元素",
      desenho: "绘图",
      organizacao: "组织",
      dados: "数据与集成",
    },
    countOne: "此分类下有 {count} 个功能",
    countMany: "此分类下有 {count} 个功能",
    meta: "快捷键可重新映射 · 界面为葡萄牙语",
    items: {
      "canvas-infinito": {
        title: "无限画布",
        description: "通过滚轮、触控板、中键或空格键平移。25% 到 200% 缩放、可点击的迷你地图，Shift+1 适应画板。",
      },
      "encaixe-grade": {
        title: "吸附与对齐",
        description: "可选 8、16、24 或 32 px 网格，检查器中的对齐工具，用方向键做精细移动。",
      },
      "selecao-multipla": {
        title: "多选",
        description: "框选、Shift+点击和 Ctrl/Cmd+A，支持批量复制、锁定、隐藏和排序。",
      },
      "mover-entre-quadros": {
        title: "在画板之间移动",
        description: "把所选内容拖到画板卡片或侧边栏树。按住 Alt 是复制而不是移动。",
      },
      "tipos-de-elementos": {
        title: "13 种元素类型",
        description: "笔记、文本、卡片、任务、清单、图片、视频、文件、链接、画板、列、评论和绘图。",
      },
      "notas-markdown": {
        title: "Markdown 笔记",
        description: "格式工具栏、预览、字数统计、标题和颜色。把图片拖到笔记上即可嵌入缩略图。",
      },
      "tarefas-checklists": {
        title: "任务与清单",
        description: "勾选完成、设置优先级和截止日期、跟踪进度，按回车创建下一个任务。",
      },
      "midia-local": {
        title: "本地媒体",
        description: "图片、视频和文件作为设备上的附件，带说明文字和灯箱预览，不上传到任何服务器。",
      },
      colunas: {
        title: "智能列",
        description: "把元素拖入、重新排序、折叠、调整大小，并连同子项一起移动整列。",
      },
      comentarios: {
        title: "本地评论",
        description: "带作者、回复和解决状态的讨论，不依赖账户或外部服务。",
      },
      conectores: {
        title: "连接线与箭头",
        description: "曲线、直线或折线，带标签、颜色、虚线样式和端点箭头，用来表达关系。",
      },
      excalidraw: {
        title: "原生 Excalidraw",
        description: "全屏编辑器，包含所有工具、自动保存、本地元素库和画布缩略图。",
      },
      "mesclar-cenas": {
        title: "合并场景",
        description: "把绘图与剪贴板、`.excalidraw` 文件或工作区中的另一个绘图合并，保留绑定和图片。",
      },
      "exportar-desenho": {
        title: "PNG、SVG 和 PDF",
        description: "直接在编辑器中把任意绘图导出为这三种格式，不离开应用，也不丢失原始场景。",
      },
      "quadros-aninhados": {
        title: "嵌套画板",
        description: "递归子画板，带可拖动的树、复制、排序和画布上的彩色磁贴。",
      },
      "workspaces-abas": {
        title: "工作区与标签页",
        description: "多个独立工作区和按画板的标签页，可通过按钮、中键或 Ctrl/Cmd+W 关闭。",
      },
      "busca-global": {
        title: "全局搜索",
        description: "Ctrl/Cmd+K 在标题、笔记、任务、清单、链接、评论、标签和画板中搜索。",
      },
      "painel-tarefas": {
        title: "任务面板",
        description: "把所有画板的截止日期、优先级和任务集中在一个列表中：一键完成或打开画布上的元素。",
      },
      etiquetas: {
        title: "标签与筛选",
        description: "在检查器中添加标签，复用画板中的建议，并按标签筛选画布，不改变数据。",
      },
      apresentacao: {
        title: "演示模式",
        description: "隐藏侧边栏、顶栏、检查器和控件，适应画板，并用方向键或按钮浏览工作区的画板树。",
      },
      referencias: {
        title: "引用与反向链接",
        description: "在 Refs 中指向画板和元素，并在反向链接面板中查看谁引用了当前条目。",
      },
      modelos: {
        title: "9 个现成模板",
        description: "头脑风暴、项目、看板、会议记录、调研、情绪板、周计划、脚本和复盘。",
      },
      autosave: {
        title: "SQLite 自动保存",
        description: "按画板增量写入，桌面端用 SQLite，浏览器用 IndexedDB，带 700 毫秒防抖。",
      },
      backups: {
        title: "备份与恢复",
        description: "按间隔自动或手动生成快照，支持配置保留策略并通过面板恢复。",
      },
      "exportar-importar": {
        title: "导出与导入",
        description: "整块画板的 PNG 和 PDF、Markdown、可重新导入的 JSON，以及拖放文件和 `.excalidraw` 导入。",
      },
      obsidian: {
        title: "Obsidian 仓库",
        description: "文件夹变成画板，笔记变成带 wiki 链接的 Markdown，附件留在本地，`.canvas` 变成带连接线的子画板。",
      },
      personalizacao: {
        title: "主题与个性化",
        description: "浅色、深色或跟随系统，六种强调色，密度、界面缩放、画布纹理和可重新映射的快捷键。",
      },
      historico: {
        title: "可靠的历史记录",
        description: "带事务的撤销与重做：一次拖动是一条记录，输入内容会智能合并。",
      },
      "codigo-snippets": {
        title: "语法高亮代码",
        description:
          "画布上的代码块，支持 GDScript、C#、着色器、JSON 和 YAML 高亮，根据标题扩展名自动识别语言，一键复制。",
      },
      "texto-formatado": {
        title: "可排版文本",
        description:
          "粗体、斜体、下划线、删除线，10 到 96 像素的字号，无衬线、衬线或等宽字体，以及对齐方式——浮动工具条、检查器或 Ctrl+B、Ctrl+I、Ctrl+U 都能设置。",
      },
      "modelos-jogo": {
        title: "游戏开发模板",
        description: "GDD、关卡设计、系统与机制、游戏冲刺，已内置 GDScript、JSON 和着色器片段。",
      },
    },
    elements: {
      eyebrow: "元素",
      title: "每种内容都有合适的形式。",
      description:
        "从系统拖到画布上：图片变成媒体，Markdown 变成笔记，`.excalidraw` 变成绘图，JSON 导入元素。",
      columnName: "元素",
      columnDescription: "功能",
      caption: "EliasNote 的元素类型及其作用",
      footnote: "所有元素都支持颜色、调整大小、锁定、隐藏和双向引用。",
      items: {
        nota: {
          name: "笔记",
          description: "Markdown，带格式工具栏、预览、字数统计、标题和颜色。",
        },
        texto: {
          name: "文本",
          description: "直接在画布上的自由文本，没有卡片：随内容增长，可设颜色，并支持粗体、斜体、字号、字体和对齐。",
        },
        cartao: { name: "卡片", description: "标题、描述、标签和颜色，用于归组参考与摘要。" },
        tarefa: {
          name: "任务",
          description: "完成、优先级和截止日期；回车创建序列中的下一个任务。",
        },
        checklist: { name: "清单", description: "可编辑条目，带进度、添加、删除和勾选完成。" },
        midia: { name: "图片与视频", description: "本地附件、说明文字、填充或适应，以及灯箱预览。" },
        arquivo: { name: "文件", description: "设备上保存的附件，显示名称、类型、大小和下载。" },
        link: { name: "链接", description: "标题、描述、URL，用默认浏览器打开。" },
        quadro: { name: "画板", description: "真正的子画板，带统计、彩色预览，可在标签页中打开。" },
        coluna: { name: "列", description: "可拖动子项、折叠、调整大小，以及快速创建菜单。" },
        comentario: { name: "评论", description: "本地作者、解决状态、回复和检查器内的独立面板。" },
        desenho: { name: "绘图", description: "完整的 Excalidraw、画布缩略图、本地元素库和导出。" },
        "desenho-nota": {
          name: "笔记内绘图",
          description: "把绘图关联到笔记：缩略图显示在卡片里，点击即可打开编辑器。",
        },
        codigo: {
          name: "代码",
          description: "等宽代码块，支持语法高亮（GDScript、C#、着色器、JSON、YAML）、快速复制，并按扩展名识别语言。",
        },
      },
    },
    shortcuts: {
      title: "常用快捷键",
      subtitle: "全部可在 设置 → 快捷键 中重新映射。",
      note: "Ctrl/Cmd 在 macOS 上表示 ⌘。输入文本时单字母快捷键会被忽略。",
      actions: {
        busca: "全局搜索",
        tarefas: "任务面板",
        apresentar: "演示模式",
        "nova-nota": "新建笔记",
        "nova-tarefa": "新建任务",
        desenho: "新建 Excalidraw 绘图",
        enquadrar: "适应画板",
        zoom: "100% 缩放",
        sidebar: "切换侧边栏",
        desfazer: "撤销",
      },
    },
    drawing: {
      title: "不切换应用就能绘图",
      description:
        "Excalidraw 编辑器以全屏打开，场景保存在画板本身，并在画布上显示缩略图。元素库保存在本地，可以导入或导出 `.excalidrawlib`。",
      items: [
        "合并场景时重映射绑定和图片",
        "把绘图导出为 PNG、SVG 和 PDF",
        "通过拖放导入 `.excalidraw` 文件",
      ],
      link: "了解 Excalidraw",
    },
    obsidian: {
      title: "一键导入 Obsidian 仓库",
      description:
        "导入会创建新的工作区，包含文件夹层级、笔记、附件、canvas 和绘图。原始仓库不会被修改。",
      link: "查看转换内容",
    },
    footnote: {
      start: "技术细节和已知限制在 ",
      featuresLink: "功能页面",
      middle: "，完整的组合列表在 ",
      shortcutsLink: "快捷键",
      end: "。",
    },
  },
  downloads: {
    header: {
      eyebrow: "下载",
      title: "下载一次，永久使用。",
      description: "官方安装包发布在 GitHub。无需注册，也没有需要激活的许可证：下载、安装，开始整理。",
    },
    version: "版本 {version}",
    free: "免费 · 开源",
    allReleases: "全部版本",
    downloadButton: "下载安装包",
    unsigned: {
      title: "安装包未签名",
      description:
        "安装包由 release 工作流生成，没有代码签名，因此系统可能在首次运行时显示警告。",
      windowsLabel: "Windows：",
      windows: "在 SmartScreen 中点击“更多信息” → “仍要运行”。",
      macosLabel: "macOS：",
      macos: "如果系统阻止打开，请移除应用的隔离标记。",
      codeTitle: "macOS · 终端",
      codeNote: "只有在 macOS 阻止首次打开时才需要执行。",
    },
    requirements: {
      title: "系统要求",
      windowsLabel: "Windows 10/11",
      windows: "，需要更新的 WebView2。",
      linuxLabel: "Linux",
      linux: "，需要 WebKitGTK 4.1；AppImage 为便携版，.deb 会自动解决依赖。",
      macosLabel: "macOS 11+",
      macos: "，Intel 或 Apple Silicon，使用同一个通用 DMG。",
      buildLabel: "从源码构建：",
      build: "需要 Node 20+ 和 Rust 1.77.2+，以及 Tauri 2 的系统依赖。",
      footnote: "应用运行不需要网络权限：工作区保存在设备上。",
    },
    platforms: {
      windows: {
        name: "Windows",
        requirement: "Windows 10/11 · WebView2",
        note: "可视化安装助手（.exe）和 WiX（MSI），支持静默安装。",
      },
      linux: {
        name: "Linux",
        requirement: "带 WebKitGTK 4.1 的发行版",
        note: "便携版 AppImage 和 Debian 包。",
      },
      macos: {
        name: "macOS",
        requirement: "macOS 11+ · 通用（Intel 与 Apple Silicon）",
        note: "一个通用 DMG 同时支持两种架构。",
      },
    },
    source: {
      title: "从源码编译",
      description:
        "克隆仓库并以开发模式运行应用。浏览器中使用 IndexedDB 持久化，桌面端使用 SQLite。",
      codeNote: "在 Linux 和 macOS 上，使用 npm run tauri build 生成该平台的原生安装包。",
      repository: "GitHub 上的代码",
      guide: "开发指南",
    },
    data: {
      title: "数据保存在哪里",
      subtitle: "文档、附件和备份都在应用的数据目录中。",
      caption: "EliasNote 在各操作系统上的数据目录",
      footnote: "卸载应用不会删除数据文件夹；如果想清空工作区，请手动删除。",
      browserPath: "浏览器自身的 IndexedDB",
      systems: {
        windows: "Windows",
        macos: "macOS",
        linux: "Linux",
        browser: "浏览器",
      },
    },
    workflow: {
      before:
        "每个 v* 标签都会触发 release 工作流，运行 typecheck、测试和构建，并把 Windows、Linux 和 macOS 的安装包附到 release 上。运行记录见 ",
      actionsLink: "GitHub Actions",
      middle: "。如果出现问题，请在 ",
      repoLink: "github.com/HenriqueNaTTo/EliasNote",
      after: " 开一个 issue。",
    },
  },
  about: {
    header: {
      eyebrow: "关于",
      title: "一个能装进你电脑的思考工具。",
      description:
        "EliasNote 把 Milanote 的可视化整理与 Excalidraw 的绘图结合在一起——没有账户、服务器或同步。材料始终属于你，即使应用已关闭。",
    },
    paragraphs: [
      "源于一个简单的需求：可视化地思考，又不把草稿交给第三方服务。与其在想法和交付之间堆叠多个应用，这个项目把笔记、任务、参考、画板和示意图放进同一个无限画布。",
      "应用使用 Tauri 2 和 React 构建，桌面端用 SQLite，浏览器用 IndexedDB，并把绘图视为流程的一部分，而不是附件。Excalidraw 内嵌且可编辑，支持场景合并和 PNG、SVG、PDF 导出。",
      "没有登录、订阅或遥测。版本由一个公开工作流生成，它在附上三个平台的安装包之前运行 typecheck、测试和构建。",
    ],
    tags: ["Tauri 2", "React 18", "TypeScript", "Tailwind CSS", "Excalidraw", "SQLite"],
    summary: {
      title: "概要",
      rows: [
        { label: "模式", value: "本地优先 · 100% 离线" },
        { label: "平台", value: "Windows、Linux 和 macOS" },
        { label: "许可证", value: "MIT" },
        { label: "当前版本", value: "{version}" },
      ],
      repository: "代码仓库",
      license: "MIT 许可证",
    },
    principles: {
      eyebrow: "原则",
      title: "定义这个应用的四个决定。",
      description: "它们体现在架构、界面和产品的边界之中。",
      items: [
        {
          title: "文件属于你",
          description:
            "画板保存在桌面端的 SQLite 或浏览器的 IndexedDB 中，并可导出为 JSON 和 Markdown。没有封闭格式。",
        },
        {
          title: "默认离线",
          description:
            "应用打开即可使用，无需联网。链接在默认浏览器中打开；工作区内容永远不会离开设备。",
        },
        {
          title: "没有账户，没有遥测",
          description: "没有登录、订阅、同步或服务器。安装过程不索取任何个人信息。",
        },
        {
          title: "开源",
          description: "原创代码以 MIT 许可证发布，第三方库保留各自的许可证，不使用 Milanote 的任何专有资源。",
        },
      ],
    },
    limits: {
      title: "已知限制",
      subtitle: "透明和新功能同样重要。",
      items: [
        "没有认证、协作、服务器或同步——这是设计选择。",
        "撤销/重做历史仅限当前会话，不会持久化。",
        "Excalidraw 编辑器首次打开时按需加载（压缩后约 4.6 MB）。",
        "图片导出只捕获画布已取景的区域；大型画板请使用 2x 或 3x 缩放。",
        "release 中的安装包未签名，因此系统可能在首次运行时显示警告。",
      ],
      link: "查看完整列表",
    },
    stack: {
      title: "技术栈与决定",
      subtitle: "全部开源，可在仓库中审计。",
      layers: ["桌面应用", "界面", "视觉基础", "绘图", "状态与历史", "持久化", "构建与测试"],
      footnote: { start: "架构文档见 ", link: "架构", end: "。" },
    },
    credits: {
      title: "致谢与许可证",
      text: "原创代码以 MIT 许可证发布。第三方库保留各自的许可证：Excalidraw（MIT）、React、TypeScript、Vite、Tailwind CSS、Radix UI、lucide、Zustand、Immer、marked、DOMPurify、html-to-image、jsPDF、Tauri 2 和 rusqlite。未使用 Milanote 的任何专有代码或资源。",
      license: "阅读许可证",
      docs: "完整文档",
    },
  },
  contact: {
    header: {
      eyebrow: "联系",
      title: "直接和项目对话。",
      description:
        "没有客服中心，也没有服务器端表单：消息会变成官方仓库中预填好的 issue。由你检查并决定是否发布。",
    },
    channels: [
      {
        title: "缺陷与建议",
        description: "描述问题并给出复现步骤，或提出新功能。",
        action: "打开 issues",
      },
      {
        title: "下载与版本",
        description: "Windows、Linux 和 macOS 的安装包以及每个版本的说明。",
        action: "查看版本",
      },
      {
        title: "文档",
        description: "架构、功能、快捷键、Obsidian 导入和开发指南。",
        action: "阅读文档",
      },
    ],
    privacy: {
      title: "不经过任何服务器",
      description:
        "EliasNote 没有后端。这个表单唯一可能的去处是 GitHub，在你确认发布 issue 之前不会发送任何内容。",
    },
    startFresh: {
      before: "想从空白开始？",
      issue: "开一个空白 issue",
      middle: "，或者查看",
      repo: "官方仓库",
      after: "。",
    },
    form: {
      title: "开一个 issue",
      subtitle: "下面的文字会变成 GitHub 上的消息正文。",
      labels: { name: "姓名", email: "电子邮件", subject: "主题", topic: "消息类型", message: "消息" },
      placeholders: {
        name: "我们该怎么称呼你",
        email: "voce@exemplo.com",
        subject: "一行摘要",
        message: "说明发生了什么、你期望的结果以及如何复现。如果是建议，请描述使用场景。",
      },
      topics: {
        sugestao: "功能建议",
        bug: "缺陷报告",
        duvida: "使用疑问",
        outro: "其他事项",
      },
      errors: {
        name: "请填写你的名字。",
        email: "请填写有效的电子邮件。",
        subject: "请用至少 3 个字符概括主题。",
        message: "请至少写 20 个字符。",
      },
      counter: "{count} / 4000 字符",
      submit: "在 GitHub 上打开 issue",
      disclaimer: "不会自动发布任何内容。",
      successTitle: "已生成 issue 草稿",
      successDescription:
        "如果 GitHub 没有在新标签页中打开，请使用下面的链接。检查文本后点击“Submit new issue”发布。",
      successLink: "打开草稿",
      copyLink: "复制链接",
      edit: "编辑消息",
      issue: { name: "姓名", email: "电子邮件", type: "类型", footer: "在 EliasNote 网站表单中填写的消息。" },
    },
  },
  docs: zhDocs,
};
