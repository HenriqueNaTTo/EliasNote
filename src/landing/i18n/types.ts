import type { LucideIcon } from "lucide-react";

/**
 * Contrato de tradução do site. Cada arquivo em `locales/<idioma>` implementa
 * estas interfaces; o `typecheck` e o teste de estrutura garantem que nenhum
 * idioma esqueça um texto.
 */

export type Locale = "pt" | "en" | "es" | "zh";

export type TabId =
  | "principal"
  | "funcionalidades"
  | "downloads"
  | "atualizacoes"
  | "documentacao"
  | "sobre"
  | "contato";

export type AccentId = "blue" | "emerald" | "rose" | "amber" | "slate";

export type FeatureCategoryId = "canvas" | "elementos" | "desenho" | "organizacao" | "dados";

export type FeatureId = string;

export type ElementId = string;

export type ShortcutId = string;

export type PlatformId = string;

export type DataPathId = string;

export type DocId = "funcionalidades" | "atalhos" | "obsidian" | "arquitetura" | "desenvolvimento" | "release";

/** Sub-abas internas de Documentação: as páginas em si ou o histórico de releases. */
export type DocsView = "pages" | "updates";

export type ReleaseId =
  | "0.2.0"
  | "0.2.1"
  | "0.2.2"
  | "0.2.3"
  | "0.2.4"
  | "0.2.5"
  | "0.2.6"
  | "0.3.0"
  | "0.4.0"
  | "0.5.0";

export type ReleaseKind = "initial" | "feature" | "fix" | "infra";

export interface ReleaseContent {
  title: string;
  summary: string;
  changes: string[];
}

export interface UpdatesContent {
  header: { eyebrow: string; title: string; description: string };
  current: string;
  allReleases: string;
  releaseLink: string;
  changesLabel: string;
  kindLabels: Record<ReleaseKind, string>;
  releases: Record<ReleaseId, ReleaseContent>;
}

/** Textos com `{chave}` substituídos por `format()`. */
export type Template = string;

export interface DocShortcut {
  action: string;
  /** Cada item é uma alternativa; as teclas de uma alternativa formam um atalho. */
  keys: string[][];
}

export type DocBlock =
  | { kind: "text"; text: string }
  | { kind: "list"; items: string[]; ordered?: boolean }
  | { kind: "code"; code: string; title?: string; note?: string }
  | { kind: "table"; columns: string[]; rows: string[][]; caption?: string }
  | { kind: "shortcuts"; items: DocShortcut[] }
  | { kind: "note"; text: string; tone?: "info" | "warning" };

export interface DocSectionContent {
  id: string;
  title: string;
  /** Caminho ou módulo relacionado, exibido em monoespaçado sob o título. */
  hint?: string;
  blocks: DocBlock[];
}

export interface DocPageContent {
  title: string;
  shortTitle: string;
  summary: string;
  sections: DocSectionContent[];
}

export interface DocsContent {
  hub: {
    eyebrow: string;
    title: string;
    description: string;
    searchLabel: string;
    searchPlaceholder: string;
    count: Template;
    emptyTitle: Template;
    emptyDescription: string;
    clear: string;
    trailsEyebrow: string;
    trailsTitle: string;
    trailsDescription: string;
    /** Texto antes do trecho em monoespaçado `docs/`. */
    fileFooterBefore: string;
    /** Texto depois do trecho em monoespaçado. */
    fileFooterAfter: string;
    fileLink: string;
    cardSections: Template;
    cardMinutes: Template;
    trails: { title: string; description: string; pages: DocId[] }[];
  };
  page: {
    breadcrumb: string;
    breadcrumbAria: string;
    eyebrow: string;
    minutes: Template;
    sections: Template;
    editOnGithub: string;
    onThisPage: string;
    mobileToc: Template;
    previous: string;
    next: string;
    index: string;
    allPages: string;
    navAria: string;
    docsNav: string;
  };
  pages: Record<DocId, DocPageContent>;
}

export interface PlatformContent {
  name: string;
  requirement: string;
  note: string;
}

export interface SiteContent {
  beta: {
    /** Selo curto exibido no header, no rodapé e nos downloads, ex.: "Beta". */
    badge: string;
    /** Frase do aviso fixo no topo do site. */
    message: string;
    /** Rótulo do link do aviso. */
    link: string;
    downloads: {
      title: string;
      description: string;
      items: string[];
    };
  };
  updates: UpdatesContent;
  meta: {
    titles: Record<TabId, string>;
    /** Ex.: "{page} · Documentação · EliasNote". */
    docTitle: Template;
    /** Usada em `<meta name="description">` e no Open Graph. */
    description: string;
  };
  nav: {
    brand: string;
    brandSubtitle: string;
    homeAria: string;
    sectionsAria: string;
    download: string;
    downloadAria: string;
    tabs: Record<TabId, string>;
    accentGroup: string;
    accentPrefix: string;
    accentNames: Record<AccentId, string>;
    themeToLight: string;
    themeToDark: string;
    language: string;
    languageAria: string;
    backToTop: string;
  };
  footer: {
    summary: string;
    offline: string;
    navigate: string;
    resources: string;
    links: { repo: string; releases: string; issues: string; docs: string; license: string };
    copyright: Template;
    tech: string;
  };
  home: {
    hero: {
      badge: string;
      titleBefore: string;
      titleHighlight: string;
      titleAfter: string;
      description: string;
      primaryCta: string;
      secondaryCta: string;
      footnote: string;
    };
    statsLabel: string;
    stats: string[];
    pillars: {
      eyebrow: string;
      title: string;
      description: string;
      items: { title: string; description: string; proof: string }[];
    };
    flow: {
      eyebrow: string;
      title: string;
      description: string;
      templatesLabel: string;
      steps: { title: string; description: string }[];
    };
    toolkit: {
      eyebrow: string;
      title: string;
      description: string;
      items: string[];
      cta: string;
    };
    obsidian: {
      eyebrow: string;
      title: string;
      description: string;
      items: string[];
      link: string;
    };
    cta: {
      eyebrow: string;
      title: string;
      description: string;
      primary: string;
      secondary: string;
    };
    templates: string[];
  };
  features: {
    header: { eyebrow: string; title: string; description: string };
    filterAria: string;
    allCategories: string;
    categories: Record<FeatureCategoryId, string>;
    countOne: Template;
    countMany: Template;
    meta: string;
    items: Record<FeatureId, { title: string; description: string }>;
    elements: {
      eyebrow: string;
      title: string;
      description: string;
      columnName: string;
      columnDescription: string;
      caption: string;
      footnote: string;
      items: Record<ElementId, { name: string; description: string }>;
    };
    shortcuts: {
      title: string;
      subtitle: string;
      note: string;
      actions: Record<ShortcutId, string>;
    };
    drawing: { title: string; description: string; items: string[]; link: string };
    obsidian: { title: string; description: string; link: string };
    footnote: { start: string; featuresLink: string; middle: string; shortcutsLink: string; end: string };
  };
  downloads: {
    header: { eyebrow: string; title: string; description: string };
    version: Template;
    free: string;
    allReleases: string;
    downloadButton: string;
    unsigned: {
      title: string;
      description: string;
      windowsLabel: string;
      windows: string;
      macosLabel: string;
      macos: string;
      codeTitle: string;
      codeNote: string;
    };
    requirements: {
      title: string;
      windowsLabel: string;
      windows: string;
      linuxLabel: string;
      linux: string;
      macosLabel: string;
      macos: string;
      buildLabel: string;
      build: string;
      footnote: string;
    };
    platforms: Record<PlatformId, PlatformContent>;
    source: {
      title: string;
      description: string;
      codeNote: string;
      repository: string;
      guide: string;
    };
    data: {
      title: string;
      subtitle: string;
      caption: string;
      footnote: string;
      /** Caminho exibido para o navegador, onde não existe pasta de dados. */
      browserPath: string;
      systems: Record<DataPathId, string>;
    };
    workflow: { before: string; actionsLink: string; middle: string; repoLink: string; after: string };
  };
  about: {
    header: { eyebrow: string; title: string; description: string };
    paragraphs: string[];
    tags: string[];
    summary: {
      title: string;
      rows: { label: string; value: string }[];
      repository: string;
      license: string;
    };
    principles: {
      eyebrow: string;
      title: string;
      description: string;
      items: { title: string; description: string }[];
    };
    limits: { title: string; subtitle: string; items: string[]; link: string };
    stack: { title: string; subtitle: string; layers: string[]; footnote: { start: string; link: string; end: string } };
    credits: { title: string; text: string; license: string; docs: string };
  };
  contact: {
    header: { eyebrow: string; title: string; description: string };
    channels: { title: string; description: string; action: string }[];
    privacy: { title: string; description: string };
    startFresh: { before: string; issue: string; middle: string; repo: string; after: string };
    form: {
      title: string;
      subtitle: string;
      labels: { name: string; email: string; subject: string; topic: string; message: string };
      placeholders: { name: string; email: string; subject: string; message: string };
      topics: Record<"sugestao" | "bug" | "duvida" | "outro", string>;
      errors: { name: string; email: string; subject: string; message: string };
      counter: Template;
      submit: string;
      disclaimer: string;
      successTitle: string;
      successDescription: string;
      successLink: string;
      copyLink: string;
      edit: string;
      issue: { name: string; email: string; type: string; footer: string };
    };
  };
  docs: DocsContent;
}

export interface LocaleEntry {
  id: Locale;
  /** Nome nativo exibido no seletor. */
  label: string;
  /** Código curto no botão do header. */
  short: string;
  /** Valor de `lang` no documento. */
  htmlLang: string;
  /** Valor de `og:locale`. */
  ogLocale: string;
}

export interface DocMeta {
  id: DocId;
  icon: LucideIcon;
  file: string;
}
