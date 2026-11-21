import type { UpdatesContent } from "@/landing/i18n/types";

export const enUpdates: UpdatesContent = {
  header: {
    eyebrow: "Updates",
    title: "Everything that changed, release by release.",
    description:
      "The public EliasNote history: every feature, fix and infrastructure milestone that shipped, from the first beta to presentation mode.",
  },
  current: "Current version",
  allReleases: "View all on GitHub",
  releaseLink: "Open release",
  changesLabel: "What changed",
  kindLabels: {
    initial: "Initial beta",
    feature: "New features",
    fix: "Fix",
    infra: "Infrastructure",
  },
  releases: {
    "0.5.0": {
      title: "Presentation mode",
      summary: "Present a board without the app interface and move through the workspace.",
      changes: [
        "Read-only mode that hides the sidebar, top bar, inspector and controls",
        "Automatic fit and navigation with arrows, PageUp/PageDown or buttons",
        "On exit, restores tabs, active tab and viewports; the tag filter is preserved",
      ],
    },
    "0.4.0": {
      title: "Editable tags and tag filter",
      summary: "Organize elements with tags and keep focus on what matters.",
      changes: [
        "Tag editor with chips, board suggestions and deduplication",
        "Canvas tag filter that keeps context columns",
        "Connectors, minimap and selection respect the active filter",
      ],
    },
    "0.3.0": {
      title: "Global task panel",
      summary: "Due dates and priorities from every board in one view.",
      changes: [
        "Tasks from every workspace with their board path",
        "Groups for overdue, today, next 7 days, later and no due date",
        "Complete and open on the canvas; Ctrl/Cmd+Shift+P shortcut",
      ],
    },
    "0.2.6": {
      title: "Centered arrows and pan over elements",
      summary: "More precise connectors and smoother canvas navigation.",
      changes: [
        "Connected arrows point at element centers",
        "Pan with space or middle mouse even over an element",
        "12 px tolerance when dropping a connector on a target",
      ],
    },
    "0.2.5": {
      title: "More resilient releases",
      summary: "The publishing flow now respects the GitHub API rate limit.",
      changes: [
        "Workflow tracking with request throttling",
        "Fixes to the publishing process and attachments",
        "No changes to the data format",
      ],
    },
    "0.2.4": {
      title: "Free text with formatting",
      summary: "Write directly on the canvas with typography controls.",
      changes: [
        "Bold, italic, underline, strikethrough and colors",
        "Size, font family and alignment per element",
        "Floating bar, inspector and formatting shortcuts",
      ],
    },
    "0.2.3": {
      title: "Release in one command",
      summary: "Checks, version, tag, push and site in a single flow.",
      changes: [
        "Single release script with typecheck, tests and builds",
        "Version sync across manifests and Cargo.lock",
        "Workflow tracking through the installers",
      ],
    },
    "0.2.2": {
      title: "Code, game templates and releases",
      summary: "More tools for game developers and a publishing routine.",
      changes: [
        "Code node with highlighting for GDScript, C#, shaders, JSON and more",
        "GDD, level design, systems and game sprint templates",
        "First release routine and project assets",
      ],
    },
    "0.2.1": {
      title: "Flexible inspector and updates",
      summary: "More room to edit and a notice when a new version is available.",
      changes: [
        "Resizable inspector with saved width",
        "Latest GitHub release check",
        "Update button in the top bar when a newer version exists",
      ],
    },
    "0.2.0": {
      title: "First public beta",
      summary: "The local-first, offline canvas with native Excalidraw goes public.",
      changes: [
        "Infinite canvas, nested boards and editable Excalidraw",
        "Notes, tasks, checklists, columns, connectors, search and references",
        "SQLite/IndexedDB autosave, backups and Obsidian vault import",
      ],
    },
  },
};
