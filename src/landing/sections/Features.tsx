import { useState } from "react";
import { ArrowUpRight, FolderTree, Keyboard, PenTool } from "lucide-react";
import { Reveal } from "@/landing/components/animate";
import { FeatureCard, type FeatureCardItem } from "@/landing/components/FeatureCard";
import { CheckItem, Container, Kbd, PageHeader, SectionHeading } from "@/landing/components/ui";
import { FEATURE_CATEGORY_IDS, FEATURE_META } from "@/landing/data";
import { useContent } from "@/landing/i18n/LocaleContext";
import { format } from "@/landing/i18n/locale";
import { ELEMENT_META, EXCALIDRAW_URL, SHORTCUT_META, docHref } from "@/landing/site";
import type { FeatureCategoryId } from "@/landing/i18n/types";
import { cn } from "@/lib/utils";

type CategoryFilter = "todos" | FeatureCategoryId;

export function Features() {
  const content = useContent();
  const c = content.features;
  const [category, setCategory] = useState<CategoryFilter>("todos");

  const items: FeatureCardItem[] = FEATURE_META.map((meta) => ({ ...meta, ...c.items[meta.id] }));
  const filtered = items.filter((feature) => category === "todos" || feature.category === category);
  const filters: { id: CategoryFilter; label: string }[] = [
    { id: "todos", label: c.allCategories },
    ...FEATURE_CATEGORY_IDS.map((id) => ({ id, label: c.categories[id] })),
  ];

  return (
    <div className="landing-page-enter">
      <PageHeader eyebrow={c.header.eyebrow} title={c.header.title} description={c.header.description}>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={c.filterAria}>
          {filters.map((item) => {
            const count =
              item.id === "todos" ? items.length : items.filter((feature) => feature.category === item.id).length;
            const active = category === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(item.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 border px-2.5 py-1 text-[11.5px] transition-colors",
                  active
                    ? "border-primary bg-primary/10 font-medium text-primary"
                    : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {item.label}
                <span className={cn("font-mono text-[10px]", active ? "text-primary/70" : "text-muted-foreground/70")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </PageHeader>

      <Container className="py-8 sm:py-12">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground" aria-live="polite">
            <span key={category} className="landing-count inline-block">
              {format(filtered.length === 1 ? c.countOne : c.countMany, { count: filtered.length })}
            </span>
          </p>
          <p className="text-[11px] text-muted-foreground">{c.meta}</p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((feature, index) => (
            <Reveal key={`${category}-${feature.id}`} delay={(index % 3) * 70} className="h-full">
              <FeatureCard feature={feature} />
            </Reveal>
          ))}
        </div>

        {/* Elementos */}
        <section className="mt-12 sm:mt-16">
          <Reveal>
            <SectionHeading eyebrow={c.elements.eyebrow} title={c.elements.title} description={c.elements.description} />
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-5 overflow-x-auto border border-border bg-card">
              <table className="w-full border-collapse text-[12px]">
                <caption className="sr-only">{c.elements.caption}</caption>
                <thead>
                  <tr className="border-b border-border bg-muted/60">
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
                    >
                      {c.elements.columnName}
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
                    >
                      {c.elements.columnDescription}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ELEMENT_META.map((element, index) => (
                    <tr
                      key={element.id}
                      className="landing-row border-b border-border transition-colors last:border-0 hover:bg-muted/40"
                      style={{ animationDelay: `${index * 28}ms` }}
                    >
                      <th scope="row" className="whitespace-nowrap px-3 py-2 text-left font-medium">
                        <span
                          className={cn("mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle", element.dot)}
                          aria-hidden
                        />
                        {c.elements.items[element.id].name}
                      </th>
                      <td className="px-3 py-2 text-muted-foreground">{c.elements.items[element.id].description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
          <p className="mt-2 text-[11px] text-muted-foreground">{c.elements.footnote}</p>
        </section>

        {/* Atalhos + destaques */}
        <section className="mt-12 grid gap-4 lg:grid-cols-[1.05fr_0.95fr] sm:mt-16">
          <Reveal variant="left">
            <div className="border border-border bg-card">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <span className="grid h-8 w-8 place-items-center border border-primary/20 bg-primary/10 text-primary">
                  <Keyboard className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-[13px] font-semibold tracking-tight">{c.shortcuts.title}</h3>
                  <p className="text-[11px] text-muted-foreground">{c.shortcuts.subtitle}</p>
                </div>
              </div>
              <ul className="divide-y divide-border">
                {SHORTCUT_META.map((shortcut, index) => (
                  <li
                    key={shortcut.id}
                    className="landing-row flex items-center justify-between gap-3 px-4 py-2"
                    style={{ animationDelay: `${index * 45}ms` }}
                  >
                    <span className="text-[12px] text-muted-foreground">{c.shortcuts.actions[shortcut.id]}</span>
                    <span className="flex shrink-0 gap-1">
                      {shortcut.keys.map((key) => (
                        <Kbd key={key}>{key}</Kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">{c.shortcuts.note}</p>
            </div>
          </Reveal>

          <Reveal variant="right" delay={100} className="h-full">
            <div className="flex h-full flex-col gap-3">
              <div className="landing-lift flex flex-1 flex-col border border-border bg-card p-5">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center border border-primary/20 bg-primary/10 text-primary">
                    <PenTool className="h-4 w-4" />
                  </span>
                  <h3 className="text-[13.5px] font-semibold tracking-tight">{c.drawing.title}</h3>
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{c.drawing.description}</p>
                <ul className="mt-3 space-y-1.5">
                  {c.drawing.items.map((item) => (
                    <CheckItem key={item}>{item}</CheckItem>
                  ))}
                </ul>
                <a
                  href={EXCALIDRAW_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="group mt-auto inline-flex items-center gap-1 pt-4 text-[11.5px] font-medium text-primary hover:underline"
                >
                  {c.drawing.link}
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </div>

              <div className="landing-lift flex flex-col border border-border bg-card p-5">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center border border-primary/20 bg-primary/10 text-primary">
                    <FolderTree className="h-4 w-4" />
                  </span>
                  <h3 className="text-[13.5px] font-semibold tracking-tight">{c.obsidian.title}</h3>
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{c.obsidian.description}</p>
                <a
                  href={docHref("obsidian")}
                  className="group mt-auto inline-flex items-center gap-1 pt-4 text-[11.5px] font-medium text-primary hover:underline"
                >
                  {c.obsidian.link}
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </div>
            </div>
          </Reveal>
        </section>

        <Reveal variant="fade">
          <p className="mt-8 border-t border-border pt-4 text-[11px] text-muted-foreground">
            {c.footnote.start}
            <a href={docHref("funcionalidades")} className="font-medium text-primary hover:underline">
              {c.footnote.featuresLink}
            </a>
            {c.footnote.middle}
            <a href={docHref("atalhos")} className="font-medium text-primary hover:underline">
              {c.footnote.shortcutsLink}
            </a>
            {c.footnote.end}
          </p>
        </Reveal>
      </Container>
    </div>
  );
}
