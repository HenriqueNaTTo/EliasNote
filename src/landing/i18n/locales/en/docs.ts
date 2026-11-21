import type { DocsContent } from "@/landing/i18n/types";
import { enDocsExtra } from "@/landing/i18n/locales/en/docs-extra";

export const enDocs: DocsContent = {
  hub: {
    eyebrow: "Documentation",
    title: "The entire documentation, inside the site.",
    description:
      "Six pages covering the product, the shortcuts, the Obsidian import, the architecture, the development environment and version publishing — in the same visual language as the app.",
    searchLabel: "Filter documentation pages",
    searchPlaceholder: "Filter by topic or technical term",
    count: "{count} of {total} pages",
    emptyTitle: "No page matches “{query}”.",
    emptyDescription: "Try a shorter term — for example “canvas”, “Obsidian”, “shortcuts” or “release”.",
    clear: "Clear filter",
    trailsEyebrow: "Where to start",
    trailsTitle: "Short trails for your goal.",
    trailsDescription:
      "Each trail leads straight to the pages that matter for the next step, with no need to read everything in order.",
    fileFooterBefore: "The content follows the Markdown files under ",
    fileFooterAfter: " in the repository.",
    fileLink: "View the original files",
    cardSections: "{count} sections",
    cardMinutes: "{minutes} min",
    trails: [
      {
        title: "I want to use the app",
        description: "Understand the product, the elements and the keyboard combinations before your first board.",
        pages: ["funcionalidades", "atalhos"],
      },
      {
        title: "I want to bring my Obsidian",
        description: "See what gets converted, how the hierarchy becomes boards and which limits exist.",
        pages: ["obsidian", "funcionalidades"],
      },
      {
        title: "I want to contribute or publish",
        description: "Local environment, tests, Rust backend, architecture and the path of a new version.",
        pages: ["desenvolvimento", "arquitetura", "release"],
      },
    ],
  },
  page: {
    breadcrumb: "Documentation",
    breadcrumbAria: "Documentation trail",
    eyebrow: "Documentation",
    minutes: "{minutes} min read",
    sections: "{count} sections",
    editOnGithub: "Edit on GitHub",
    onThisPage: "On this page",
    mobileToc: "On this page · {count} sections",
    previous: "Previous",
    next: "Next",
    index: "Index",
    allPages: "View all pages",
    navAria: "Navigation between documentation pages",
    docsNav: "Documentation",
  },
  pages: {
    funcionalidades: {
      title: "Features",
      shortTitle: "Features",
      summary:
        "The complete inventory of what is already done: canvas, elements, Excalidraw, organization, search, productivity and declared limits.",
      sections: [
        {
          id: "canvas-e-organizacao",
          title: "Canvas and organization",
          hint: "features/canvas",
          blocks: [
            {
              kind: "list",
              items: [
                "Infinite canvas with panning by mouse wheel, trackpad, middle button, hand tool or space bar.",
                "Zoom with `Ctrl/Cmd + wheel`, pinch, buttons, a percentage menu (25%–200%) and shortcuts.",
                "Frame the board (`Shift+1`), 100% zoom (`Ctrl/Cmd+0`), a minimap you can click and drag.",
                "Optional snapping to a grid with 8/16/24/32 px sizes.",
                "Multiple selection by dragging, Shift+click, `Ctrl/Cmd+A`, moving with the arrow keys (Shift = 10 px) and aligners in the inspector.",
                "Duplicate, bring to front, send to back, lock, hide and delete with undo.",
                "Move or copy the selection to another board from the context menu: columns take their items along, subboards follow the card and the content lands centered in the destination.",
                "Drag the selection onto a board card on the canvas or onto the board row in the side tree to move it (hold `Alt` on the canvas to copy); the destination reacts to the drag and pulses when it receives the elements.",
                "Double-click an empty area to create a note; double-click an element to open its editor.",
                "Drag files from the system onto the canvas: images, videos, files, Markdown (becomes a note), `.excalidraw` (becomes a drawing) and JSON (imports elements).",
                "Drag images/files onto a **note**: the attachment is saved locally, the thumbnail appears inside the card and the element sits next to it with a two-way reference.",
                "Drag files onto a **nested board**: they go straight into the child board (with a warning), without duplicating in the current board.",
              ],
            },
          ],
        },
        {
          id: "elementos",
          title: "Elements",
          hint: "core/domain/nodes",
          blocks: [
            {
              kind: "table",
              columns: ["Element", "Capabilities"],
              caption: "EliasNote node types and what each one offers",
              rows: [
                ["Note", "Markdown with a formatting bar, preview, word count, title and colors"],
                ["Text", "Free text directly on the canvas, no card: double-click to write, it grows with the content and accepts colors"],
                ["Card", "Title, description, label and colors"],
                ["Task", "Complete, priority, due date, Enter creates the next task"],
                ["Checklist", "Editable items, progress, add/remove, complete"],
                ["Image / Video", "Local attachment, caption, cover/contain, lightbox"],
                ["File", "Name, type, size, download"],
                ["Link", "Title, description, URL and opening in the default browser"],
                ["Board", "Real subboard, statistics, colored preview and opening in a tab"],
                ["Column", "Draggable children, collapse, resize, quick-create menu"],
                ["Comment", "Local author, resolution, replies and a dedicated panel"],
                ["Drawing", "Full Excalidraw, thumbnail, element library, export"],
                [
                  "Drawing in a note",
                  "Link a drawing to the note (pen button in the note header); the thumbnails appear inside the card and open the editor",
                ],
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
                "Full-screen editor opened by double-click, the node button or the `D` shortcut.",
                "Every Excalidraw tool: selection, shapes, lines, arrows, freehand writing, text, image, eraser, frame, laser, library and links.",
                "Automatic saving of the scene (elements, serializable app state and files) with debounce.",
                "PNG thumbnail generated with a delay to keep the canvas light.",
                "Element library persisted locally and importable/exportable as `.excalidrawlib` from the library itself.",
                "Export of the drawing as PNG, SVG and PDF.",
                "Import of `.excalidraw` files by dragging or through the import dialog.",
                "**Scene merging** through the **Scene** menu: paste from the clipboard, import an `.excalidraw` or merge another drawing from the workspace (including one imported from Obsidian).",
                "Merging generates new IDs, remaps texts/containers, arrows/bindings, groups and images, and shifts the scene so it does not overlap the existing content.",
              ],
            },
          ],
        },
        {
          id: "quadros-workspaces-abas",
          title: "Boards, workspaces and tabs",
          blocks: [
            {
              kind: "list",
              items: [
                "Multiple workspaces with creation, renaming and deletion.",
                "Side tree with expand, drag to nest, move to the root, rename, duplicate and delete.",
                "Independent tabs per board, closed by a button, middle click and `Ctrl/Cmd+W`.",
                "Recursive subboards created from the bar, the inspector, the tree or the shortcut.",
              ],
            },
          ],
        },
        {
          id: "busca-e-referencias",
          title: "Search and references",
          hint: "core/search",
          blocks: [
            {
              kind: "list",
              items: [
                "Global search across all workspaces with scoring per field and filters by type.",
                "Results show the snippet, the type and the board path; Enter opens and centers the element.",
                "Task panel (`Ctrl/Cmd+Shift+P`) gathers tasks from every board, with due dates, priority, filters and opening on the canvas.",
                "Editable tags in the inspector, with board suggestions, and a canvas tag filter; the filter is a temporary view and does not change the data.",
                "Presentation mode (`Ctrl/Cmd+Shift+F`) hides the interface, fits the board and navigates the workspace tree without editing anything.",
                "Two-way references: add boards or elements in `Refs`; backlinks list what points to the current item.",
              ],
            },
          ],
        },
        {
          id: "produtividade",
          title: "Productivity",
          blocks: [
            {
              kind: "list",
              items: [
                "Undo/redo with smart grouping; `Ctrl/Cmd+Z` and `Ctrl/Cmd+Shift+Z` (or `Ctrl+Y`).",
                "Built-in templates: brainstorm, project, kanban, meeting notes, research, moodboard, week, script and retrospective.",
                "Save the current board as a reusable template (serializable payload, persists across sessions).",
                "PNG/PDF export of the whole board with automatic framing and zoom restoration.",
                "Markdown export (columns, tasks, notes) and JSON export (reimportable backup).",
                "Import of board/workspace/fragment JSON, Markdown, `.excalidraw` and attachments.",
                "Obsidian vault import: folder hierarchy into boards, notes with frontmatter/tags, clickable wiki-links with references, local attachments, `.canvas` (text, links, files, groups and edges) and `.excalidraw`.",
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
              text: "The **File → Obsidian vault** menu (or **Import → Import Obsidian vault**) creates a new workspace from a vault folder without modifying the original. On desktop it uses the native folder picker; everything runs locally and the whole import is a single undo entry.",
            },
            {
              kind: "list",
              items: [
                "Folders become nested boards; notes become Markdown notes positioned on a grid.",
                "`[[Nota]]`, `[[Nota|alias]]` and `[[Nota#Título]]` become clickable internal links + two-way references.",
                "`![[imagem]]`, relative Markdown links and attachments are saved locally and become referenced media nodes.",
                "`.canvas` becomes a subboard with nodes and connectors; groups become columns.",
                "`.excalidraw` becomes an editable drawing.",
                "Limitations: plugins/themes/Dataview are not executed, transclusions become links, groups rearrange the items.",
              ],
            },
          ],
        },
        {
          id: "dados-e-configuracoes",
          title: "Data and settings",
          hint: "core/persistence",
          blocks: [
            {
              kind: "list",
              items: [
                "Milanote-inspired visuals: neutral gray canvas, white cards, colored notes without a header, boards in colored tiles, transparent columns, thin connectors with dark labels and square corners throughout the interface.",
                "Incremental autosave with a status indicator, identified storage (SQLite/IndexedDB).",
                "Automatic backups at a configurable interval and manual ones, with retention and restoration.",
                "Light/dark/system theme, accent color, canvas texture, density, UI scale, element shadow, minimap and connector labels.",
                "Fully remappable shortcuts with conflict detection and restoration of the defaults.",
                "Local attachments, storage per device, no uploads.",
              ],
            },
          ],
        },
        {
          id: "limites-conhecidos",
          title: "Known limits",
          blocks: [
            {
              kind: "note",
              tone: "warning",
              text: "Transparency is part of the documentation. If one of these points blocks your workflow, open an issue describing the use case.",
            },
            {
              kind: "list",
              items: [
                "There is no authentication, collaboration, server or sync (by design).",
                "Links open in the default browser; the app content stays offline.",
                "The Excalidraw editor loads on demand (~4.6 MB compressed) on first open.",
                "Image export captures the framed area of the canvas; for very large boards use 2x/3x scale.",
                "The undo/redo history is per session and is not persisted.",
              ],
            },
          ],
        },
      ],
    },
    atalhos: {
      title: "Shortcuts",
      shortTitle: "Shortcuts",
      summary:
        "Every shortcut in the app, separated by navigation, creation, canvas and file. Each combination can be remapped in Settings → Shortcuts.",
      sections: [
        {
          id: "navegacao",
          title: "Navigation",
          blocks: [
            {
              kind: "shortcuts",
              items: [
                { action: "Global search", keys: [["Mod", "K"]] },
                { action: "Task panel", keys: [["Mod", "Shift", "P"]] },
                { action: "Presentation mode", keys: [["Mod", "Shift", "F"]] },
                { action: "Open/enter the selected board", keys: [["Mod", "Enter"]] },
                { action: "Close tab", keys: [["Mod", "W"]] },
                { action: "Next tab", keys: [["Mod", "Tab"]] },
                { action: "Toggle sidebar", keys: [["Mod", "B"]] },
                { action: "Toggle inspector", keys: [["Mod", "Shift", "I"]] },
                { action: "Toggle theme", keys: [["Mod", "Shift", "L"]] },
              ],
            },
          ],
        },
        {
          id: "criacao",
          title: "Creation",
          blocks: [
            {
              kind: "shortcuts",
              items: [
                { action: "New note", keys: [["N"]] },
                { action: "New free text", keys: [["Shift", "T"]] },
                { action: "New card", keys: [["C"]] },
                { action: "New task", keys: [["T"]] },
                { action: "New checklist", keys: [["L"]] },
                { action: "New column", keys: [["Mod", "Shift", "K"]] },
                { action: "New board", keys: [["Mod", "Shift", "N"]] },
                { action: "New Excalidraw drawing", keys: [["D"]] },
                { action: "New comment", keys: [["M"]] },
                { action: "New subboard in the tree", keys: [["Board menu", "New subboard"]] },
              ],
            },
          ],
        },
        {
          id: "canvas",
          title: "Canvas",
          blocks: [
            {
              kind: "shortcuts",
              items: [
                { action: "Selection tool", keys: [["V"]] },
                { action: "Hand tool", keys: [["H"]] },
                { action: "Connector tool", keys: [["R"]] },
                { action: "Move selection (1 px)", keys: [["Arrows"]] },
                { action: "Move selection (10 px)", keys: [["Shift", "Arrows"]] },
                { action: "Duplicate", keys: [["Mod", "D"]] },
                { action: "Delete", keys: [["Delete"], ["Backspace"]] },
                { action: "Select all", keys: [["Mod", "A"]] },
                { action: "Undo", keys: [["Mod", "Z"]] },
                { action: "Redo", keys: [["Mod", "Shift", "Z"], ["Ctrl", "Y"]] },
                { action: "Zoom +", keys: [["Mod", "="]] },
                { action: "Zoom −", keys: [["Mod", "−"]] },
                { action: "Zoom 100%", keys: [["Mod", "0"]] },
                { action: "Frame the board", keys: [["Shift", "1"]] },
                { action: "Leave the tool / close the editor", keys: [["Esc"]] },
              ],
            },
          ],
        },
        {
          id: "arquivo",
          title: "File",
          blocks: [
            {
              kind: "shortcuts",
              items: [
                { action: "Save now", keys: [["Mod", "S"]] },
                { action: "Export board", keys: [["Mod", "Shift", "E"]] },
                { action: "Templates", keys: [["Mod", "Shift", "T"]] },
                { action: "Backups", keys: [["Mod", "Shift", "B"]] },
                { action: "Settings", keys: [["Mod", ","]] },
              ],
            },
          ],
        },
        {
          id: "observacoes",
          title: "Notes",
          blocks: [
            {
              kind: "text",
              text: "`Mod` stands for `Ctrl` on Windows/Linux and `⌘` on macOS. Every shortcut can be remapped in **Settings → Shortcuts**, with conflict detection and restoration of the defaults.",
            },
            {
              kind: "list",
              items: [
                "Single-letter shortcuts are ignored while you type in text fields.",
                "`Mod` combinations stay active for undo, save and search.",
                "In the browser, some system shortcuts (such as `Ctrl+W` and `Ctrl+Tab`) may be intercepted. In the Tauri app they work as usual.",
              ],
            },
          ],
        },
      ],
    },
    obsidian: {
      title: "Import an Obsidian vault",
      shortTitle: "Obsidian",
      summary:
        "How to turn a whole vault into a new workspace: what gets converted, how the organization is generated, limits and privacy.",
      sections: [
        {
          id: "como-usar",
          title: "How to use it",
          blocks: [
            {
              kind: "text",
              text: "EliasNote imports an Obsidian vault as a **new workspace**, without changing the original vault and without sending anything to the internet. All reading happens on your machine.",
            },
            {
              kind: "list",
              ordered: true,
              items: [
                "Open the **File (⋯) → Obsidian vault** menu, or **Import → Import Obsidian vault**.",
                "Select the **root folder** of the vault. On desktop the system's native folder picker opens; in the browser, use the browser's own folder picker.",
                "Review the summary (notes, folders, canvases, drawings and attachments), adjust the workspace name and choose whether you want to import unreferenced attachments.",
                "Click **Import vault**. EliasNote opens the root board of the new workspace.",
              ],
            },
            {
              kind: "note",
              text: "There is a sample vault in examples/obsidian-vault in the repository for testing the whole flow.",
            },
            {
              kind: "text",
              text: "After importing an `.excalidraw` from the vault, it becomes a drawing node. To reuse that scene in another drawing, open the destination drawing, use **Scene → Merge workspace drawing** and pick the imported drawing. You can also use **Scene → Paste scene from the clipboard** or import the `.excalidraw` file directly in the editor.",
            },
            {
              kind: "text",
              text: "The import is a single operation in the history: `Ctrl/Cmd + Z` undoes the entire workspace. The vault on disk is not modified.",
            },
          ],
        },
        {
          id: "o-que-e-convertido",
          title: "What gets converted",
          hint: "obsidianParser.ts · obsidianPlan.ts",
          blocks: [
            {
              kind: "table",
              columns: ["Obsidian", "EliasNote"],
              caption: "Equivalence between the vault elements and the result in the workspace",
              rows: [
                ["Folders", "Nested boards (the root becomes the initial board; each subfolder becomes a subboard)"],
                ["Notes `.md`", "Markdown notes with a title, content, tag/alias frontmatter and tasks"],
                ["`[[Nota]]` / `[[Nota|alias]]`", "Clickable internal link (`eliasnote://node/...`) + two-way reference"],
                ["`[[Nota#Título]]`", "Internal link with the snippet in the link title and a reference to the note"],
                ["`![[imagem.png]]`", "Local attachment + image/video/file node on the board, referenced by the note"],
                ["`[[arquivo.pdf]]`", "Local attachment + file node"],
                ["`[[Quadro.canvas]]`", "Link to the board imported from the canvas"],
                ["`[[desenho.excalidraw]]`", "Link to the Excalidraw drawing node"],
                [
                  "Relative Markdown links (`[Nota](Pasta/Nota.md)`, `![](img.png)`)",
                  "Converted into internal links/attachments when the target exists in the vault",
                ],
                [".canvas", "Its own board with notes, links, images, groups and connectors"],
                [".excalidraw", "Editable drawing node (same scene)"],
                ["Images, videos and files", "Local attachments; the reference becomes a media node"],
                ["Canvas `group`", "Column with the elements contained in the group (vertically rearranged)"],
                [
                  "Canvas colors (1–6)",
                  "EliasNote color palette (rose, sand, amber, mint, sky, lilac)",
                ],
                ["Canvas edges", "Connectors with a label, color and arrows according to `fromEnd`/`toEnd`"],
              ],
            },
          ],
        },
        {
          id: "organizacao-gerada",
          title: "Generated organization",
          blocks: [
            {
              kind: "list",
              items: [
                "The workspace is named `Obsidian · <vault>` (editable).",
                "The workspace root is a board named after the vault. It holds board cards for each top-level folder and for canvases in the root, plus the notes that live in the root.",
                "Each folder has its own board, with subfolders, canvases, notes, drawings and an attachments area on the right.",
                "Notes are positioned on a three-column grid; attachments go in a reserved column on the right.",
                "Canvas boards open as subboards and appear as cards on the folder board.",
              ],
            },
          ],
        },
        {
          id: "limitacoes",
          title: "Known limitations",
          blocks: [
            {
              kind: "list",
              items: [
                "**Obsidian plugins and themes are neither executed nor imported** (`.obsidian` is ignored). Dataview, Templater, plugin metadata and CSS snippets have no effect.",
                "**Dataview and query blocks** come in as text/code, not as results.",
                "**Transclusion** (`![[Nota]]`) becomes a link to the note, not embedded content.",
                "**Obsidian callouts** are rendered as ordinary quotes; HTML is sanitized.",
                "**Canvas groups** become columns and the items are rearranged vertically — the original position inside the group is not preserved.",
                "Markdown links with spaces in the path inside `<...>` may not resolve; prefer `[[...]]`.",
                "Note names repeated in different folders may be resolved by the shortest path; use `[[Pasta/Nota]]` to disambiguate.",
                "Vaults with more than **20,000 files** are read partially; the app warns you and you can import subfolders separately.",
                "Text files above 8 MB are ignored.",
                "The import does not create templates from the vault; use **Templates → Save current board** afterwards if you want to.",
              ],
            },
          ],
        },
        {
          id: "privacidade",
          title: "Privacy",
          blocks: [
            {
              kind: "list",
              items: [
                "The folder is read by the system's local picker (`webkitdirectory`); nothing is sent over the network.",
                "Attachments are copied into EliasNote's local storage (SQLite/IndexedDB), keeping the vault intact.",
                "Internal links open inside the app; external links (`http`, `mailto`) open in the default browser.",
              ],
            },
          ],
        },
        {
          id: "solucao-de-problemas",
          title: "Troubleshooting",
          blocks: [
            {
              kind: "list",
              items: [
                "**Nothing was found:** make sure you selected the folder that contains the `.md` files, not a folder above the vault.",
                "**Images are missing:** check that the attachments are inside the vault and that the link uses `![[...]]` or a valid relative path. Enable “Unreferenced attachments” to import images without links.",
                "**Broken links:** the app shows the count of unresolved links in the summary; they remain as text.",
                "**Empty canvas:** the `.canvas` file must be valid JSON in the JSON Canvas format; invalid files show up as ignored.",
                "**Many files:** select a subfolder of the vault and repeat the import; each import creates a new workspace.",
              ],
            },
          ],
        },
      ],
    },
    ...enDocsExtra,
  },
};
