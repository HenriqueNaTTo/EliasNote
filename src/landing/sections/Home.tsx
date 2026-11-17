import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Download,
  FolderTree,
  Github,
  HardDrive,
  Link2,
  PenTool,
  ShieldCheck,
  StickyNote,
  WifiOff,
} from "lucide-react";
import { AppPreview } from "@/landing/components/AppPreview";
import { CountUp, Reveal } from "@/landing/components/animate";
import { CheckItem, Container, SectionHeading } from "@/landing/components/ui";
import { Button, buttonVariants } from "@/components/ui/button";
import { useContent } from "@/landing/i18n/LocaleContext";
import { REPO_URL, docHref, type TabId } from "@/landing/site";
import { cn } from "@/lib/utils";

const STATS = [
  { value: 100, suffix: "%" },
  { value: 13, suffix: "" },
  { value: 9, suffix: "" },
  { value: 0, suffix: "" },
];

const PILLAR_ICONS = [HardDrive, WifiOff, ShieldCheck];
const STEP_ICONS = [StickyNote, Link2, PenTool];

export function Home({ onNavigate }: { onNavigate: (tab: TabId) => void }) {
  const c = useContent().home;

  return (
    <div className="landing-page-enter">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="landing-canvas pointer-events-none absolute inset-0 opacity-70" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background"
          aria-hidden
        />
        <Container className="relative grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1fr_1.05fr] lg:py-20">
          <div>
            <span className="landing-enter inline-flex items-center gap-1.5 border border-border bg-card/70 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
              {c.hero.badge}
            </span>
            <h1
              className="landing-enter mt-5 text-balance text-[32px] font-semibold leading-[1.05] tracking-tight sm:text-[46px] lg:text-[52px]"
              style={{ animationDelay: "80ms" }}
            >
              {c.hero.titleBefore}
              <span className="relative inline-block text-primary">
                {c.hero.titleHighlight}
                <svg
                  className="pointer-events-none absolute -bottom-1 left-0 h-2 w-full text-primary/50"
                  viewBox="0 0 220 10"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <path
                    className="landing-underline"
                    pathLength={1}
                    d="M3 7 C 45 2, 85 2, 120 5 S 180 3, 217 2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              {c.hero.titleAfter}
            </h1>
            <p
              className="landing-enter mt-4 max-w-xl text-[13.5px] leading-relaxed text-muted-foreground sm:text-[15px]"
              style={{ animationDelay: "160ms" }}
            >
              {c.hero.description}
            </p>
            <div className="landing-enter mt-6 flex flex-wrap items-center gap-2" style={{ animationDelay: "240ms" }}>
              <Button size="lg" className="landing-cta h-11 px-5 text-[13px]" onClick={() => onNavigate("downloads")}>
                <Download className="h-4 w-4" />
                {c.hero.primaryCta}
              </Button>
              <a
                href="#funcionalidades"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "landing-cta group h-11 px-5 text-[13px]",
                )}
              >
                {c.hero.secondaryCta}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </a>
            </div>
            <p className="landing-enter mt-3 text-[11px] text-muted-foreground" style={{ animationDelay: "320ms" }}>
              {c.hero.footnote}
            </p>
          </div>

          <div className="relative">
            <div className="landing-hero-glow pointer-events-none absolute -inset-8" aria-hidden />
            <div className="landing-enter-scale relative" style={{ animationDelay: "160ms" }}>
              <AppPreview />
            </div>
          </div>
        </Container>
      </section>

      {/* Números */}
      <section className="border-b border-border" aria-label={c.statsLabel}>
        <Container>
          <Reveal>
            <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
              {STATS.map((stat, index) => (
                <div key={c.stats[index]} className="bg-background px-4 py-5 sm:px-5">
                  <p className="text-[26px] font-semibold leading-none tracking-tight sm:text-[30px]">
                    <CountUp value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{c.stats[index]}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Pilares */}
      <section className="border-b border-border">
        <Container className="py-12 sm:py-16">
          <Reveal>
            <SectionHeading
              eyebrow={c.pillars.eyebrow}
              title={c.pillars.title}
              description={c.pillars.description}
            />
          </Reveal>
          <div className="mt-7 grid gap-3 md:grid-cols-3">
            {c.pillars.items.map((pillar, index) => {
              const Icon = PILLAR_ICONS[index] ?? HardDrive;
              return (
                <Reveal key={pillar.title} delay={index * 90} className="h-full">
                  <article className="landing-lift group flex h-full flex-col border border-border bg-card p-5 transition-colors hover:border-primary/40">
                    <span className="grid h-9 w-9 place-items-center border border-primary/20 bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <h3 className="mt-4 text-[13.5px] font-semibold tracking-tight">{pillar.title}</h3>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">{pillar.description}</p>
                    <p className="mt-4 border-t border-border pt-2 text-[10.5px] uppercase tracking-wide text-muted-foreground/80">
                      {pillar.proof}
                    </p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Fluxo */}
      <section className="border-b border-border bg-card/25">
        <Container className="py-12 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
            <Reveal>
              <div>
                <SectionHeading eyebrow={c.flow.eyebrow} title={c.flow.title} description={c.flow.description} />
                <div className="mt-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {c.flow.templatesLabel}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {c.templates.map((template) => (
                      <span
                        key={template}
                        className="border border-border bg-background px-2 py-1 text-[10.5px] text-muted-foreground"
                      >
                        {template}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <ol className="border-t border-border">
                {c.flow.steps.map((step, index) => {
                  const Icon = STEP_ICONS[index] ?? StickyNote;
                  return (
                    <li
                      key={step.title}
                      className="landing-row flex gap-3 border-b border-border py-4"
                      style={{ animationDelay: `${index * 90}ms` }}
                    >
                      <span className="pt-0.5 font-mono text-[11px] text-primary">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[13px] font-semibold tracking-tight">{step.title}</h3>
                        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{step.description}</p>
                      </div>
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70" aria-hidden />
                    </li>
                  );
                })}
              </ol>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Recursos + Obsidian */}
      <section className="border-b border-border">
        <Container className="grid gap-8 py-12 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <Reveal>
            <div>
              <SectionHeading eyebrow={c.toolkit.eyebrow} title={c.toolkit.title} description={c.toolkit.description} />
              <ul className="mt-5 grid gap-2 sm:grid-cols-2 sm:gap-x-5">
                {c.toolkit.items.map((item) => (
                  <CheckItem key={item}>{item}</CheckItem>
                ))}
              </ul>
              <a
                href="#funcionalidades"
                className={cn(buttonVariants({ variant: "outline" }), "landing-cta group mt-6 h-9 text-[12.5px]")}
              >
                {c.toolkit.cta}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </a>
            </div>
          </Reveal>

          <Reveal variant="right" delay={120} className="h-full">
            <div className="landing-lift flex h-full flex-col border border-border bg-card p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center border border-primary/20 bg-primary/10 text-primary">
                  <FolderTree className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {c.obsidian.eyebrow}
                  </p>
                  <h3 className="text-[14px] font-semibold tracking-tight">{c.obsidian.title}</h3>
                </div>
              </div>
              <p className="mt-3 text-[12.5px] leading-relaxed text-muted-foreground">{c.obsidian.description}</p>
              <ul className="mt-3 space-y-1.5">
                {c.obsidian.items.map((item) => (
                  <CheckItem key={item}>{item}</CheckItem>
                ))}
              </ul>
              <a
                href={docHref("obsidian")}
                className="group mt-auto inline-flex items-center gap-1 pt-4 text-[11.5px] font-medium text-primary hover:underline"
              >
                {c.obsidian.link}
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* CTA final */}
      <section className="border-b border-border">
        <Container className="py-12 sm:py-16">
          <Reveal variant="scale">
            <div className="landing-lift relative overflow-hidden border border-border bg-card p-6 sm:p-10">
              <div className="landing-canvas pointer-events-none absolute inset-0 opacity-60" aria-hidden />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-card via-card/85 to-card/60"
                aria-hidden
              />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-xl">
                  <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {c.cta.eyebrow}
                  </p>
                  <h2 className="mt-2 text-balance text-[24px] font-semibold leading-tight tracking-tight sm:text-[30px]">
                    {c.cta.title}
                  </h2>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">{c.cta.description}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button
                    size="lg"
                    className="landing-cta h-11 px-5 text-[13px]"
                    onClick={() => onNavigate("downloads")}
                  >
                    <Download className="h-4 w-4" />
                    {c.cta.primary}
                  </Button>
                  <a
                    href={REPO_URL}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "landing-cta group h-11 px-5 text-[13px]",
                    )}
                  >
                    <Github className="h-4 w-4" />
                    {c.cta.secondary}
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
