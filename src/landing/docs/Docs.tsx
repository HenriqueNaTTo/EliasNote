import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
  Search,
} from "lucide-react";
import { Reveal, useReducedMotion } from "@/landing/components/animate";
import { CodeBlock, Container, Kbd, PageHeader, SectionHeading } from "@/landing/components/ui";
import { DOC_IDS, docReadingMinutes, docSearchText, getDocMeta } from "@/landing/docs/content";
import { useContent } from "@/landing/i18n/LocaleContext";
import { format } from "@/landing/i18n/locale";
import type { DocBlock, DocId, DocPageContent, DocSectionContent, DocsView } from "@/landing/i18n/types";
import { APP_VERSION, DOCS_URL } from "@/landing/site";
import { Updates } from "@/landing/sections/Updates";
import { cn } from "@/lib/utils";

/** Texto corrido com `código`, **negrito** e *ênfase* no mesmo estilo do app. */
const INLINE_PATTERN = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;

function renderInline(text: string): ReactNode[] {
  return text
    .split(INLINE_PATTERN)
    .filter((part) => part.length > 0)
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-medium text-foreground">
            {renderInline(part.slice(2, -2))}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={index}
            className="rounded border border-border bg-muted/60 px-1 py-0.5 font-mono text-[11px] text-foreground"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return <span key={index}>{part}</span>;
    });
}

function sectionAnchor(docId: DocId, sectionId: string): string {
  return `doc-${docId}-${sectionId}`;
}

function DocList({ block }: { block: Extract<DocBlock, { kind: "list" }> }) {
  if (block.ordered) {
    return (
      <ol className="space-y-2">
        {block.items.map((item, index) => (
          <li key={index} className="flex gap-2.5 text-[12.5px] leading-relaxed text-muted-foreground">
            <span className="mt-px grid h-5 w-5 shrink-0 place-items-center border border-primary/25 bg-primary/10 font-mono text-[10.5px] text-primary">
              {index + 1}
            </span>
            <span className="min-w-0">{renderInline(item)}</span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ul className="space-y-1.5">
      {block.items.map((item, index) => (
        <li key={index} className="flex gap-2 text-[12.5px] leading-relaxed text-muted-foreground">
          <span className="mt-[7px] h-1 w-1 shrink-0 bg-primary/70" aria-hidden />
          <span className="min-w-0">{renderInline(item)}</span>
        </li>
      ))}
    </ul>
  );
}

function DocTable({ block }: { block: Extract<DocBlock, { kind: "table" }> }) {
  return (
    <div className="overflow-x-auto border border-border bg-card">
      <table className="w-full border-collapse text-[12px]">
        {block.caption ? <caption className="sr-only">{block.caption}</caption> : null}
        <thead>
          <tr className="border-b border-border bg-muted/60">
            {block.columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="whitespace-nowrap px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border transition-colors last:border-0 hover:bg-muted/40">
              {row.map((cell, cellIndex) =>
                cellIndex === 0 ? (
                  <th key={cellIndex} scope="row" className="px-3 py-2 text-left align-top font-medium">
                    {renderInline(cell)}
                  </th>
                ) : (
                  <td key={cellIndex} className="px-3 py-2 align-top text-muted-foreground">
                    {renderInline(cell)}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DocShortcuts({ items }: { items: Extract<DocBlock, { kind: "shortcuts" }>["items"] }) {
  return (
    <ul className="divide-y divide-border border border-border bg-card">
      {items.map((item) => (
        <li key={item.action} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
          <span className="text-[12px] leading-snug text-muted-foreground">{renderInline(item.action)}</span>
          <span className="flex flex-wrap items-center gap-1">
            {item.keys.map((combo, comboIndex) => (
              <span key={comboIndex} className="flex items-center gap-1">
                {comboIndex > 0 ? (
                  <span className="px-0.5 text-[9.5px] uppercase tracking-wide text-muted-foreground/60">/</span>
                ) : null}
                {combo.map((key) => (
                  <Kbd key={key}>{key}</Kbd>
                ))}
              </span>
            ))}
          </span>
        </li>
      ))}
    </ul>
  );
}

function DocBlocks({ blocks }: { blocks: DocBlock[] }) {
  return (
    <div className="mt-3 space-y-3">
      {blocks.map((block, index) => {
        switch (block.kind) {
          case "text":
            return (
              <p key={index} className="text-[12.5px] leading-relaxed text-muted-foreground sm:text-[13px]">
                {renderInline(block.text)}
              </p>
            );
          case "list":
            return <DocList key={index} block={block} />;
          case "code":
            return <CodeBlock key={index} title={block.title} code={block.code} note={block.note} />;
          case "table":
            return <DocTable key={index} block={block} />;
          case "shortcuts":
            return <DocShortcuts key={index} items={block.items} />;
          case "note":
            return (
              <div
                key={index}
                className={cn(
                  "flex gap-2 border border-l-2 border-border bg-card px-3 py-2.5",
                  block.tone === "warning" ? "border-l-amber-500" : "border-l-primary",
                )}
              >
                {block.tone === "warning" ? (
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden />
                ) : (
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                )}
                <p className="text-[12px] leading-relaxed text-muted-foreground">{renderInline(block.text)}</p>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

function DocSectionView({
  docId,
  section,
  index,
}: {
  docId: DocId;
  section: DocSectionContent;
  index: number;
}) {
  return (
    <section id={sectionAnchor(docId, section.id)} className="border-t border-border pt-6 first:border-0 first:pt-0">
      <header>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[11px] text-primary/70">{String(index + 1).padStart(2, "0")}</span>
          <h2 className="text-[16px] font-semibold leading-snug tracking-tight sm:text-[18px]">{section.title}</h2>
        </div>
        {section.hint ? (
          <p className="mt-1 pl-[26px] font-mono text-[10.5px] text-muted-foreground/80">{section.hint}</p>
        ) : null}
      </header>
      <div className="pl-0 sm:pl-[26px]">
        <DocBlocks blocks={section.blocks} />
      </div>
    </section>
  );
}

function DocPageView({ docId, onNavigateDoc }: { docId: DocId; onNavigateDoc: (doc: DocId | null) => void }) {
  const docs = useContent().docs;
  const page: DocPageContent = docs.pages[docId];
  const meta = getDocMeta(docId);
  const reduced = useReducedMotion();
  const DocIcon = meta.icon;
  const [current, setCurrent] = useState(page.sections[0]?.id ?? "");
  const index = DOC_IDS.indexOf(docId);
  const previous = index > 0 ? DOC_IDS[index - 1] : null;
  const next = index >= 0 && index < DOC_IDS.length - 1 ? DOC_IDS[index + 1] : null;
  const minutes = docReadingMinutes(page);

  useEffect(() => {
    setCurrent(page.sections[0]?.id ?? "");
  }, [page]);

  // Realça a seção visível na lista "Nesta página".
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      let activeId = page.sections[0]?.id ?? "";
      for (const section of page.sections) {
        const node = document.getElementById(sectionAnchor(docId, section.id));
        if (node && node.getBoundingClientRect().top <= 160) activeId = section.id;
      }
      setCurrent(activeId);
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [docId, page]);

  function goToSection(id: string) {
    const node = document.getElementById(sectionAnchor(docId, id));
    if (!node) return;
    const top = window.scrollY + node.getBoundingClientRect().top - 96;
    window.scrollTo({ top: Math.max(0, top), behavior: reduced ? "auto" : "smooth" });
  }

  return (
    <div className="landing-page-enter">
      <header className="relative overflow-hidden border-b border-border">
        <div className="landing-canvas pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/40 via-background/75 to-background"
          aria-hidden
        />
        <div className="landing-hero-glow pointer-events-none absolute -right-24 -top-28 h-72 w-72 opacity-70" aria-hidden />
        <Container className="relative py-8 sm:py-11">
          <nav
            aria-label={docs.page.breadcrumbAria}
            className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground"
          >
            <button
              type="button"
              onClick={() => onNavigateDoc(null)}
              className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
            >
              <BookOpen className="h-3 w-3" aria-hidden />
              {docs.page.breadcrumb}
            </button>
            <ChevronRight className="h-3 w-3" aria-hidden />
            <span className="text-foreground" aria-current="page">
              {page.title}
            </span>
          </nav>

          <div className="mt-3 flex items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center border border-primary/20 bg-primary/10 text-primary">
              <DocIcon className="h-4 w-4" />
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">{docs.page.eyebrow}</p>
          </div>

          <h1 className="mt-2.5 max-w-3xl text-balance text-[27px] font-semibold leading-[1.1] tracking-tight sm:text-[36px]">
            {page.title}
          </h1>
          <p className="mt-2.5 max-w-2xl text-[13px] leading-relaxed text-muted-foreground sm:text-[14.5px]">
            {page.summary}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10.5px] text-muted-foreground">
            <span className="border border-border bg-card/70 px-1.5 py-0.5 font-mono">docs/{meta.file}</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden />
              {format(docs.page.minutes, { minutes })}
            </span>
            <span>{format(docs.page.sections, { count: page.sections.length })}</span>
            <span>v{APP_VERSION}</span>
            <a
              href={`${DOCS_URL}/${meta.file}`}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              {docs.page.editOnGithub}
              <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
        </Container>
      </header>

      <div className="border-b border-border lg:hidden">
        <Container className="flex gap-1 overflow-x-auto py-1.5">
          {DOC_IDS.map((id) => {
            const active = id === docId;
            return (
              <button
                key={id}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => onNavigateDoc(id)}
                className={cn(
                  "inline-flex h-8 shrink-0 items-center border px-2 text-[11.5px] transition-colors",
                  active
                    ? "border-border bg-muted/70 font-medium text-foreground"
                    : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                )}
              >
                {docs.pages[id].shortTitle}
              </button>
            );
          })}
        </Container>
      </div>

      <Container className="grid gap-8 py-8 sm:py-10 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-10">
        <aside className="hidden lg:sticky lg:top-20 lg:block lg:max-h-[calc(100dvh_-_6rem)] lg:self-start lg:overflow-y-auto lg:pr-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {docs.page.docsNav}
          </p>
          <ul className="mt-2 space-y-0.5">
            {DOC_IDS.map((id) => {
              const active = id === docId;
              const Icon = getDocMeta(id).icon;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => onNavigateDoc(id)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex w-full items-center gap-1.5 border-l px-2 py-1.5 text-left text-[11.5px] transition-colors",
                      active
                        ? "border-primary bg-primary/10 font-medium text-primary"
                        : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span className="min-w-0">{docs.pages[id].shortTitle}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {docs.page.onThisPage}
          </p>
          <ul className="mt-2 space-y-0.5">
            {page.sections.map((section, sectionIndex) => (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => goToSection(section.id)}
                  aria-current={current === section.id ? "location" : undefined}
                  className={cn(
                    "flex w-full items-start gap-2 border-l px-2 py-1 text-left text-[11.5px] leading-snug transition-colors",
                    current === section.id
                      ? "border-primary/60 text-foreground"
                      : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  <span className="font-mono text-[10px] text-muted-foreground/70">
                    {String(sectionIndex + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">{section.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="min-w-0">
          <details className="mb-6 border border-border bg-card lg:hidden">
            <summary className="cursor-pointer px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {format(docs.page.mobileToc, { count: page.sections.length })}
            </summary>
            <ol className="border-t border-border px-3 py-2">
              {page.sections.map((section) => (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => goToSection(section.id)}
                    className="w-full border-b border-border/60 py-1.5 text-left text-[12px] text-muted-foreground last:border-0 hover:text-foreground"
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ol>
          </details>

          <div className="space-y-8">
            {page.sections.map((section, sectionIndex) => (
              <DocSectionView key={section.id} docId={docId} section={section} index={sectionIndex} />
            ))}
          </div>

          <nav aria-label={docs.page.navAria} className="mt-10 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
            {previous ? (
              <button
                type="button"
                onClick={() => onNavigateDoc(previous)}
                className="landing-lift group flex flex-col items-start border border-border bg-card p-3 text-left transition-colors hover:border-primary/40"
              >
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                  <ChevronLeft className="h-3 w-3 transition-transform duration-300 group-hover:-translate-x-0.5" aria-hidden />
                  {docs.page.previous}
                </span>
                <span className="mt-1 text-[12.5px] font-medium group-hover:text-primary">
                  {docs.pages[previous].title}
                </span>
              </button>
            ) : (
              <span />
            )}
            {next ? (
              <button
                type="button"
                onClick={() => onNavigateDoc(next)}
                className="landing-lift group flex flex-col items-end border border-border bg-card p-3 text-right transition-colors hover:border-primary/40"
              >
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {docs.page.next}
                  <ChevronRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
                </span>
                <span className="mt-1 text-[12.5px] font-medium group-hover:text-primary">{docs.pages[next].title}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigateDoc(null)}
                className="landing-lift group flex flex-col items-end border border-border bg-card p-3 text-right transition-colors hover:border-primary/40"
              >
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{docs.page.index}</span>
                <span className="mt-1 text-[12.5px] font-medium group-hover:text-primary">{docs.page.allPages}</span>
              </button>
            )}
          </nav>
        </div>
      </Container>
    </div>
  );
}

function DocsHub({ onNavigateDoc }: { onNavigateDoc: (doc: DocId | null) => void }) {
  const docs = useContent().docs;
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const entries = DOC_IDS.map((id) => ({ id, page: docs.pages[id], file: getDocMeta(id).file }));
    if (!term) return entries;
    return entries.filter((entry) => docSearchText(entry.page, entry.file).includes(term));
  }, [docs, query]);

  return (
    <div className="landing-page-enter">
      <PageHeader eyebrow={docs.hub.eyebrow} title={docs.hub.title} description={docs.hub.description}>
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative block">
            <span className="sr-only">{docs.hub.searchLabel}</span>
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={docs.hub.searchPlaceholder}
              className="h-9 w-72 max-w-full border border-border bg-background pl-8 pr-3 text-[12.5px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <p className="text-[11px] text-muted-foreground" aria-live="polite">
            {format(docs.hub.count, { count: filtered.length, total: DOC_IDS.length })}
          </p>
        </div>
      </PageHeader>

      <Container className="py-8 sm:py-12">
        {filtered.length === 0 ? (
          <div className="border border-border bg-card px-4 py-8 text-center">
            <p className="text-[13px] font-medium">{format(docs.hub.emptyTitle, { query: query.trim() })}</p>
            <p className="mt-1 text-[12px] text-muted-foreground">{docs.hub.emptyDescription}</p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-4 inline-flex h-8 items-center gap-1.5 border border-border bg-background px-2.5 text-[12px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {docs.hub.clear}
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((entry, index) => {
              const Icon = getDocMeta(entry.id).icon;
              return (
                <Reveal key={entry.id} delay={(index % 3) * 70} className="h-full">
                  <button
                    type="button"
                    onClick={() => onNavigateDoc(entry.id)}
                    className="landing-lift group flex h-full w-full flex-col border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-accent/20"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="grid h-8 w-8 shrink-0 place-items-center border border-primary/20 bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <h2 className="text-[13px] font-semibold tracking-tight">{entry.page.title}</h2>
                        <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground/80">
                          docs/{entry.file}
                        </p>
                      </div>
                      <ArrowRight
                        className="ml-auto mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-primary"
                        aria-hidden
                      />
                    </div>
                    <p className="mt-2.5 flex-1 text-[12px] leading-relaxed text-muted-foreground">{entry.page.summary}</p>
                    <p className="mt-3 flex items-center gap-3 border-t border-border pt-2 text-[10px] uppercase tracking-wide text-muted-foreground/80">
                      <span>{format(docs.hub.cardSections, { count: entry.page.sections.length })}</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden />
                        {format(docs.hub.cardMinutes, { minutes: docReadingMinutes(entry.page) })}
                      </span>
                    </p>
                  </button>
                </Reveal>
              );
            })}
          </div>
        )}

        <section className="mt-12 sm:mt-16">
          <Reveal>
            <SectionHeading
              eyebrow={docs.hub.trailsEyebrow}
              title={docs.hub.trailsTitle}
              description={docs.hub.trailsDescription}
            />
          </Reveal>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {docs.hub.trails.map((trail, index) => (
              <Reveal key={trail.title} delay={index * 80} className="h-full">
                <article className="flex h-full flex-col border border-border bg-card p-4">
                  <h3 className="text-[13px] font-semibold tracking-tight">{trail.title}</h3>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">{trail.description}</p>
                  <ul className="mt-auto pt-3">
                    {trail.pages.map((pageId) => (
                      <li key={pageId}>
                        <button
                          type="button"
                          onClick={() => onNavigateDoc(pageId)}
                          className="group flex w-full items-center gap-1.5 border-t border-border py-1.5 text-left text-[11.5px] text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <ChevronRight
                            className="h-3 w-3 shrink-0 text-primary/70 transition-transform duration-300 group-hover:translate-x-0.5"
                            aria-hidden
                          />
                          {docs.pages[pageId].title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <Reveal variant="fade">
          <div className="mt-8 flex flex-col gap-2 border border-border bg-card px-4 py-3 text-[11px] leading-relaxed text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              {docs.hub.fileFooterBefore}
              <code className="rounded border border-border bg-muted/60 px-1 py-0.5 font-mono text-[10.5px] text-foreground">
                docs/
              </code>
              {docs.hub.fileFooterAfter}
            </p>
            <a
              href={DOCS_URL}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              {docs.hub.fileLink}
              <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
        </Reveal>
      </Container>
    </div>
  );
}

export function Docs({
  docId,
  view,
  onNavigateDoc,
}: {
  docId: DocId | null;
  view: DocsView;
  onNavigateDoc: (doc: DocId | null) => void;
}) {
  return view === "updates" ? (
    <Updates />
  ) : docId ? (
    <DocPageView docId={docId} onNavigateDoc={onNavigateDoc} />
  ) : (
    <DocsHub onNavigateDoc={onNavigateDoc} />
  );
}
