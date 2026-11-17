import type { SiteContent } from "@/landing/i18n/types";
import { enDocs } from "@/landing/i18n/locales/en/docs";

export const enSite: SiteContent = {
  meta: {
    titles: {
      principal: "EliasNote — infinite canvas, 100% offline",
      funcionalidades: "Features · EliasNote",
      downloads: "Downloads · EliasNote",
      documentacao: "Documentation · EliasNote",
      sobre: "About · EliasNote",
      contato: "Contact · EliasNote",
    },
    docTitle: "{page} · Documentation · EliasNote",
    description:
      "EliasNote is a local-first desktop app for visual organization: infinite canvas, nested boards, notes, tasks and native Excalidraw. No accounts, no cloud, no sync.",
  },
  nav: {
    brand: "EliasNote",
    brandSubtitle: "Local-first canvas",
    homeAria: "EliasNote — home page",
    sectionsAria: "Site sections",
    download: "Download",
    downloadAria: "Download EliasNote installers",
    tabs: {
      principal: "Home",
      funcionalidades: "Features",
      downloads: "Downloads",
      documentacao: "Documentation",
      sobre: "About",
      contato: "Contact",
    },
    accentGroup: "Accent color",
    accentPrefix: "Color",
    accentNames: { blue: "Blue", emerald: "Emerald", rose: "Rose", amber: "Amber", slate: "Slate" },
    themeToLight: "Switch to light theme",
    themeToDark: "Switch to dark theme",
    language: "Language",
    languageAria: "Choose site language",
    backToTop: "Back to top",
  },
  footer: {
    summary:
      "Local-first visual organization with an infinite canvas and native Excalidraw. 100% offline, no accounts and no sync.",
    offline: "Built to run without internet",
    navigate: "Navigate",
    resources: "Resources",
    links: {
      repo: "Repository",
      releases: "Releases",
      issues: "Issues",
      docs: "Documentation sources",
      license: "MIT license",
    },
    copyright: "© {year} EliasNote · open source under the MIT license",
    tech: "Tauri 2 · React · Excalidraw · no tracking cookies",
  },
  home: {
    hero: {
      badge: "Local-first · 100% offline",
      titleBefore: "Your next project starts on an ",
      titleHighlight: "infinite canvas",
      titleAfter: ".",
      description:
        "Notes, tasks, images, boards and Excalidraw drawings in the same visual space. Everything saved on your computer — no account, no cloud, no sync.",
      primaryCta: "Download EliasNote",
      secondaryCta: "See features",
      footnote: "Windows, Linux and macOS · installers attached to the official release · MIT license",
    },
    statsLabel: "EliasNote in numbers",
    stats: ["of your data on your device", "element types", "ready-made templates", "accounts, cloud or subscription"],
    pillars: {
      eyebrow: "Why local-first",
      title: "No cloud. No account. No surprises.",
      description:
        "EliasNote was designed for people who want to think visually without handing their own material to a third-party service.",
      items: [
        {
          title: "Your data on your disk",
          description:
            "Each board is written to SQLite on desktop or IndexedDB in the browser, with incremental autosave and rotating backups you can restore.",
          proof: "Autosave every 700 ms",
        },
        {
          title: "Works without internet",
          description:
            "Open, write and draw anywhere. The app does not depend on a server, account or sync to work.",
          proof: "Zero data requests",
        },
        {
          title: "No accounts, no tracking",
          description:
            "No login, telemetry or subscription. Links open in your default browser and the workspace content always stays with you.",
          proof: "Open source under MIT",
        },
      ],
    },
    flow: {
      eyebrow: "How it works",
      title: "From draft to delivery, on the same board.",
      description:
        "Every step reuses what you already created. No exporting to another tool, no restarting the context.",
      templatesLabel: "Start with a template",
      steps: [
        {
          title: "Capture without formatting",
          description:
            "Create notes, tasks and checklists with a shortcut. Drop files straight onto the canvas: an image becomes a card, Markdown becomes a note.",
        },
        {
          title: "Connect the ideas",
          description:
            "Columns, nested boards and connectors organize the chaos without losing context. Ctrl/Cmd+K finds everything.",
        },
        {
          title: "Draw and deliver",
          description:
            "Open Excalidraw to diagram, merge scenes and export as PNG, SVG, PDF, Markdown or reimportable JSON.",
        },
      ],
    },
    toolkit: {
      eyebrow: "The toolbox",
      title: "Everything in one place — drawing included.",
      description:
        "Visual organization and diagrams live in the same workspace. No switching apps in the middle of an idea.",
      items: [
        "Thirteen element types, from Markdown notes to editable drawings",
        "Global search across titles, notes, tasks, links, comments and tags",
        "Nested boards, independent workspaces and tabs per board",
        "Native Excalidraw with a local library, autosave and scene merging",
        "Nine ready-made templates: brainstorm, kanban, meeting notes, research, week and more",
        "Undo/redo with transactions: one drag is one history entry",
      ],
      cta: "See all features",
    },
    obsidian: {
      eyebrow: "Integration",
      title: "Already have an Obsidian vault?",
      description:
        "Import the whole folder as a new workspace, without changing the original and without sending anything over the internet. The import is a single history entry.",
      items: [
        "Folders become nested boards, notes become Markdown",
        "Wiki-links, tags and frontmatter become clickable references",
        "Images and attachments stay saved locally",
        ".canvas and .excalidraw files come in editable",
      ],
      link: "Read the import documentation",
    },
    cta: {
      eyebrow: "Start in a minute",
      title: "Your next board starts empty. Like every interesting project.",
      description:
        "Install the app, pick a template and start organizing. When you need to draw, Excalidraw is already there.",
      primary: "Download now",
      secondary: "View on GitHub",
    },
    templates: [
      "Brainstorm",
      "Project",
      "Kanban",
      "Meeting notes",
      "Research",
      "Moodboard",
      "Week",
      "Script",
      "Retrospective",
    ],
  },
  features: {
    header: {
      eyebrow: "Features",
      title: "Everything EliasNote does",
      description:
        "A single app to capture, organize, draw and deliver. Below is the complete inventory of what is already ready in the current version.",
    },
    filterAria: "Filter features by category",
    allCategories: "All",
    categories: {
      canvas: "Canvas",
      elementos: "Elements",
      desenho: "Drawing",
      organizacao: "Organization",
      dados: "Data and integrations",
    },
    countOne: "{count} feature in this category",
    countMany: "{count} features in this category",
    meta: "Remappable shortcuts · interface in Portuguese",
    items: {
      "canvas-infinito": {
        title: "Infinite canvas",
        description:
          "Pan with the wheel, trackpad, middle button or space bar. Zoom from 25% to 200%, clickable minimap and frame with Shift+1.",
      },
      "encaixe-grade": {
        title: "Snapping and alignment guides",
        description:
          "Optional 8, 16, 24 or 32 px grid, alignment guides in the inspector and fine movement with the arrow keys.",
      },
      "selecao-multipla": {
        title: "Multiple selection",
        description:
          "Selection box, Shift+click and Ctrl/Cmd+A with batch actions to duplicate, lock, hide and arrange.",
      },
      "mover-entre-quadros": {
        title: "Move between boards",
        description:
          "Drag the selection onto a board card or into the sidebar tree. Hold Alt to copy instead of moving.",
      },
      "tipos-de-elementos": {
        title: "13 element types",
        description:
          "Notes, text, cards, tasks, checklists, images, videos, files, links, boards, columns, comments and drawings.",
      },
      "notas-markdown": {
        title: "Markdown notes",
        description:
          "Formatting bar, preview, word count, title and colors. Drop an image into the note to embed the thumbnail.",
      },
      "tarefas-checklists": {
        title: "Tasks and checklists",
        description:
          "Complete items, set priority and due date, track progress and create the next task with Enter.",
      },
      "midia-local": {
        title: "Local media",
        description:
          "Images, videos and files with the attachment on the device, caption, lightbox and no upload to servers.",
      },
      colunas: {
        title: "Smart columns",
        description:
          "Drag elements inside, reorder, collapse, resize and move the whole column with its children.",
      },
      comentarios: {
        title: "Local comments",
        description: "Threads with author, replies and resolution, without depending on an account or an external service.",
      },
      conectores: {
        title: "Connectors and arrows",
        description:
          "Curved, straight or elbow, with labels, colors, dashes and arrowheads to show relationships.",
      },
      excalidraw: {
        title: "Native Excalidraw",
        description:
          "Full-screen editor with every tool, autosave, local library and thumbnails on the canvas.",
      },
      "mesclar-cenas": {
        title: "Merge scenes",
        description:
          "Combine a drawing with the clipboard, an .excalidraw file or another drawing from the workspace while preserving bindings and images.",
      },
      "exportar-desenho": {
        title: "PNG, SVG and PDF",
        description:
          "Export any drawing in the three formats straight from the editor, without leaving the app and without losing the original scene.",
      },
      "quadros-aninhados": {
        title: "Nested boards",
        description:
          "Recursive sub-boards with a draggable tree, duplication, ordering and colored tiles on the canvas.",
      },
      "workspaces-abas": {
        title: "Workspaces and tabs",
        description:
          "Several independent workspaces and tabs per board, closed with the button, middle click or Ctrl/Cmd+W.",
      },
      "busca-global": {
        title: "Global search",
        description:
          "Ctrl/Cmd+K searches titles, notes, tasks, checklists, links, comments, tags and boards.",
      },
      referencias: {
        title: "References and backlinks",
        description:
          "Point boards and elements in Refs and see who references the current item in the backlinks panel.",
      },
      modelos: {
        title: "9 ready-made templates",
        description:
          "Brainstorm, project, kanban, meeting notes, research, moodboard, week, script and retrospective.",
      },
      autosave: {
        title: "Autosave in SQLite",
        description:
          "Incremental saving per board on desktop (SQLite) and in the browser (IndexedDB), with a 700 ms debounce.",
      },
      backups: {
        title: "Backups and restore",
        description:
          "Automatic snapshots by interval or manual ones, with configurable retention and restore from the panel.",
      },
      "exportar-importar": {
        title: "Export and import",
        description:
          "PNG and PDF of the whole board, Markdown, reimportable JSON and drag-and-drop import of files and .excalidraw.",
      },
      obsidian: {
        title: "Obsidian vault",
        description:
          "Folders become boards, notes become Markdown with wiki-links, attachments stay local and .canvas becomes a sub-board with connectors.",
      },
      personalizacao: {
        title: "Theme and customization",
        description:
          "Light, dark or system, six accent colors, density, UI scale, canvas texture and remappable shortcuts.",
      },
      historico: {
        title: "Reliable history",
        description:
          "Undo and redo with transactions: one drag is one entry, and typing is grouped intelligently.",
      },
    },
    elements: {
      eyebrow: "Elements",
      title: "Every kind of content gets the right format.",
      description:
        "Drag from the system onto the canvas: an image becomes media, Markdown becomes a note, .excalidraw becomes a drawing and JSON imports elements.",
      columnName: "Element",
      columnDescription: "What it does",
      caption: "EliasNote element types and what each one does",
      footnote: "Every element supports color, resizing, locking, hiding and bidirectional references.",
      items: {
        nota: {
          name: "Note",
          description: "Markdown with a formatting bar, preview, word count, title and colors.",
        },
        texto: {
          name: "Text",
          description: "Free text straight on the canvas, with no card: it grows with the content and supports colors.",
        },
        cartao: { name: "Card", description: "Title, description, tag and color to group references and summaries." },
        tarefa: {
          name: "Task",
          description: "Complete, priority and due date; Enter creates the next task in the sequence.",
        },
        checklist: { name: "Checklist", description: "Editable items with progress, add, remove and complete." },
        midia: {
          name: "Image and video",
          description: "Local attachment, caption, cover or contain and lightbox.",
        },
        arquivo: { name: "File", description: "Name, type, size and download of the attachment stored on the device." },
        link: { name: "Link", description: "Title, description, URL and opening in the default browser." },
        quadro: {
          name: "Board",
          description: "A real sub-board with stats, colored preview and open in a tab.",
        },
        coluna: {
          name: "Column",
          description: "Draggable children, collapse, resize and a quick-create menu.",
        },
        comentario: {
          name: "Comment",
          description: "Local author, resolution, replies and a dedicated panel inside the inspector.",
        },
        desenho: {
          name: "Drawing",
          description: "Full Excalidraw, thumbnail on the canvas, local library and export.",
        },
        "desenho-nota": {
          name: "Drawing in a note",
          description: "Link a drawing to the note: the thumbnail appears on the card and opens the editor.",
        },
      },
    },
    shortcuts: {
      title: "Essential shortcuts",
      subtitle: "All remappable in Settings → Shortcuts.",
      note: "Ctrl/Cmd stands for ⌘ on macOS. Single-letter shortcuts are ignored while you type.",
      actions: {
        busca: "Global search",
        "nova-nota": "New note",
        "nova-tarefa": "New task",
        desenho: "New Excalidraw drawing",
        enquadrar: "Frame board",
        zoom: "Zoom 100%",
        sidebar: "Toggle sidebar",
        desfazer: "Undo",
      },
    },
    drawing: {
      title: "Drawing without switching apps",
      description:
        "The Excalidraw editor opens full screen and the scene is saved in the board itself, with a thumbnail on the canvas. The element library is local and can be imported or exported as .excalidrawlib.",
      items: [
        "Scene merging with binding and image remapping",
        "Drawing export as PNG, SVG and PDF",
        "Drag-and-drop import of .excalidraw files",
      ],
      link: "Learn about Excalidraw",
    },
    obsidian: {
      title: "Obsidian vault in one click",
      description:
        "The import creates a new workspace with the folder hierarchy, notes, attachments, canvases and drawings. The original vault is not modified.",
      link: "See what gets converted",
    },
    footnote: {
      start: "Technical details and known limits are on the ",
      featuresLink: "features page",
      middle: " and the full list of combinations lives in ",
      shortcutsLink: "Shortcuts",
      end: ".",
    },
  },
  downloads: {
    header: {
      eyebrow: "Downloads",
      title: "Download once. Works forever.",
      description:
        "Official installers published on GitHub. No sign-up, no license to activate: download, install and start organizing.",
    },
    version: "Version {version}",
    free: "Free · open source",
    allReleases: "All releases",
    downloadButton: "Download installer",
    unsigned: {
      title: "Unsigned installers",
      description:
        "The packages are produced by the release workflow and carry no code signature, so the system may show a warning on the first run.",
      windowsLabel: "Windows:",
      windows: "in SmartScreen, use “More info” → “Run anyway”.",
      macosLabel: "macOS:",
      macos: "if the system blocks the app from opening, remove the quarantine flag from it.",
      codeTitle: "macOS · terminal",
      codeNote: "Only needed when macOS prevents the first launch.",
    },
    requirements: {
      title: "Requirements",
      windowsLabel: "Windows 10/11",
      windows: "with WebView2 up to date.",
      linuxLabel: "Linux",
      linux: "with WebKitGTK 4.1; the AppImage is portable and the .deb resolves the dependencies.",
      macosLabel: "macOS 11+",
      macos: "on Intel or Apple Silicon, with a single universal DMG.",
      buildLabel: "To build:",
      build: "Node 20+ and Rust 1.77.2+, plus the Tauri 2 dependencies.",
      footnote: "The app asks for no network permissions to work: the workspace stays on the device.",
    },
    platforms: {
      windows: {
        name: "Windows",
        requirement: "Windows 10/11 · WebView2",
        note: "Visual installer (.exe) and WiX (MSI) for silent installation.",
      },
      linux: {
        name: "Linux",
        requirement: "Distributions with WebKitGTK 4.1",
        note: "Portable AppImage and Debian package.",
      },
      macos: {
        name: "macOS",
        requirement: "macOS 11+ · universal (Intel and Apple Silicon)",
        note: "A single universal DMG for both architectures.",
      },
    },
    source: {
      title: "Build from source",
      description:
        "Clone the repository and run the app in development mode. In the browser, persistence uses IndexedDB; on the desktop, SQLite.",
      codeNote: "On Linux and macOS, use npm run tauri build to generate the platform's native package.",
      repository: "Code on GitHub",
      guide: "Development guide",
    },
    data: {
      title: "Where your data lives",
      subtitle: "Documents, attachments and backups live in the app's data directory.",
      caption: "EliasNote data directories by operating system",
      footnote:
        "Uninstalling the app does not delete the data folder; remove it manually if you want to start the workspace from scratch.",
      browserPath: "The browser's own IndexedDB",
      systems: {
        windows: "Windows",
        macos: "macOS",
        linux: "Linux",
        browser: "Browser",
      },
    },
    workflow: {
      before: "Every v* tag triggers the release workflow, which runs typecheck, tests and build and attaches the Windows, Linux and macOS installers to the release. Follow the runs on ",
      actionsLink: "GitHub Actions",
      middle: ". If something fails, open an issue at ",
      repoLink: "github.com/HenriqueNaTTo/EliasNote",
      after: ".",
    },
  },
  about: {
    header: {
      eyebrow: "About",
      title: "A thinking tool that fits on your computer.",
      description:
        "EliasNote combines Milanote's visual organization with Excalidraw's drawing — with no accounts, servers or sync. The material stays yours, even when the app is closed.",
    },
    paragraphs: [
      "was born from a simple need: to think visually without handing the draft to a third-party service. Instead of a stack of apps between the idea and the delivery, the project brings notes, tasks, references, boards and diagrams together on a single infinite canvas.",
      "The app is built with Tauri 2 and React, uses SQLite on desktop and IndexedDB in the browser, and treats drawing as part of the flow — not as an attachment. Excalidraw is embedded and editable, with mergeable scenes and export to PNG, SVG and PDF.",
      "There is no login, subscription or telemetry. The release is produced by a public workflow that runs typecheck, tests and build before attaching the installers for the three platforms.",
    ],
    tags: ["Tauri 2", "React 18", "TypeScript", "Tailwind CSS", "Excalidraw", "SQLite"],
    summary: {
      title: "At a glance",
      rows: [
        { label: "Model", value: "Local-first · 100% offline" },
        { label: "Platforms", value: "Windows, Linux and macOS" },
        { label: "License", value: "MIT" },
        { label: "Current version", value: "{version}" },
      ],
      repository: "Repository",
      license: "MIT license",
    },
    principles: {
      eyebrow: "Principles",
      title: "Four decisions that define the app.",
      description: "They show up in the architecture, in the interface and in the limits of the product.",
      items: [
        {
          title: "The file is yours",
          description:
            "Boards live in SQLite on desktop or IndexedDB in the browser, with export to JSON and Markdown. No closed format.",
        },
        {
          title: "Offline by default",
          description:
            "The app opens and works without internet. Links open in your default browser; workspace content never leaves the device.",
        },
        {
          title: "No accounts and no telemetry",
          description:
            "There is no login, subscription, sync or server. Installing it asks for no personal data.",
        },
        {
          title: "Open source",
          description:
            "Original code under the MIT license, libraries with their own licenses and no proprietary Milanote asset.",
        },
      ],
    },
    limits: {
      title: "Known limits",
      subtitle: "Transparency matters as much as the new feature.",
      items: [
        "There is no authentication, collaboration, server or sync — by design.",
        "The undo/redo history is per session and is not persisted.",
        "The Excalidraw editor loads on demand (~4.6 MB compressed) the first time it opens.",
        "Image export captures the framed area of the canvas; for large boards use 2x or 3x scale.",
        "Release installers are not signed, so the system may show a warning on the first run.",
      ],
      link: "See the complete list",
    },
    stack: {
      title: "Stack and technical decisions",
      subtitle: "Everything open and auditable in the repository.",
      layers: [
        "Desktop app",
        "Interface",
        "Visual base",
        "Drawing",
        "State and history",
        "Persistence",
        "Build and tests",
      ],
      footnote: { start: "Architecture documentation at ", link: "Architecture", end: "." },
    },
    credits: {
      title: "Credits and licenses",
      text: "Original code under the MIT license. Third-party libraries keep their own licenses: Excalidraw (MIT), React, TypeScript, Vite, Tailwind CSS, Radix UI, lucide, Zustand, Immer, marked, DOMPurify, html-to-image, jsPDF, Tauri 2 and rusqlite. No proprietary Milanote code or asset was used.",
      license: "Read the license",
      docs: "Full documentation",
    },
  },
  contact: {
    header: {
      eyebrow: "Contact",
      title: "Talk to the project directly.",
      description:
        "No support desk and no server-side form: the message becomes a pre-filled issue in the official repository. You review it and decide whether to publish.",
    },
    channels: [
      {
        title: "Bugs and suggestions",
        description: "Describe the problem with steps to reproduce or propose a new feature.",
        action: "Open issues",
      },
      {
        title: "Downloads and versions",
        description: "Installers and notes for each release published for Windows, Linux and macOS.",
        action: "View releases",
      },
      {
        title: "Documentation",
        description: "Architecture, features, shortcuts, Obsidian import and the development guide.",
        action: "Read the documentation",
      },
    ],
    privacy: {
      title: "Nothing goes through a server",
      description:
        "EliasNote has no backend. The only possible destination of this form is GitHub, and nothing is sent until you confirm publishing the issue.",
    },
    startFresh: {
      before: "Prefer to start from scratch? ",
      issue: "Open a blank issue",
      middle: " or check the ",
      repo: "official repository",
      after: ".",
    },
    form: {
      title: "Open an issue",
      subtitle: "The text below becomes the message body on GitHub.",
      labels: { name: "Name", email: "Email", subject: "Subject", topic: "Message type", message: "Message" },
      placeholders: {
        name: "What should we call you",
        email: "you@example.com",
        subject: "One-line summary",
        message:
          "Tell us what happened, what you expected and how to reproduce it. If it is a suggestion, describe the use case.",
      },
      topics: {
        sugestao: "Feature suggestion",
        bug: "Bug report",
        duvida: "Usage question",
        outro: "Something else",
      },
      errors: {
        name: "Enter your name.",
        email: "Enter a valid email.",
        subject: "Summarize the subject in at least 3 characters.",
        message: "Describe it in at least 20 characters.",
      },
      counter: "{count} of 4000 characters",
      submit: "Open issue on GitHub",
      disclaimer: "Nothing is published automatically.",
      successTitle: "Issue draft generated",
      successDescription:
        "If GitHub did not open in another tab, use the link below. Review the text and click “Submit new issue” to publish.",
      successLink: "Open draft",
      copyLink: "Copy link",
      edit: "Edit message",
      issue: { name: "Name", email: "Email", type: "Type", footer: "Message written in the EliasNote landing page form." },
    },
  },
  docs: enDocs,
};
