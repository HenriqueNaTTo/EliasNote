import { Apple, ArrowUpRight, Cpu, Download, FlaskConical, Github, Info, Monitor, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/landing/components/animate";
import { CodeBlock, Container, PageHeader } from "@/landing/components/ui";
import { useContent } from "@/landing/i18n/LocaleContext";
import { format } from "@/landing/i18n/locale";
import {
  ACTIONS_URL,
  APP_VERSION,
  DATA_PATH_META,
  PLATFORM_META,
  RELEASES_PAGE_URL,
  RELEASES_URL,
  REPO_URL,
  docHref,
} from "@/landing/site";
import { cn } from "@/lib/utils";

const MACOS_QUARANTINE = "xattr -dr com.apple.quarantine /Applications/EliasNote.app";

export function Downloads() {
  const content = useContent();
  const c = content.downloads;
  const sourceCode = [
    "npm install",
    "npm run dev        # browser, IndexedDB",
    "npm run tauri dev  # desktop, SQLite",
    "npm run tauri build -- --bundles nsis",
  ].join("\n");

  return (
    <div className="landing-page-enter">
      <PageHeader eyebrow={c.header.eyebrow} title={c.header.title} description={c.header.description}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success">{format(c.version, { version: APP_VERSION })}</Badge>
          <Badge variant="warning" className="normal-case tracking-normal">
            {content.beta.badge}
          </Badge>
          <Badge variant="outline">{c.free}</Badge>
          <a
            href={RELEASES_PAGE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11.5px] font-medium text-primary hover:underline"
          >
            {c.allReleases}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </PageHeader>

      <Container className="py-8 sm:py-12">
        <Reveal variant="fade">
          <section
            aria-labelledby="beta-notice"
            className="mb-4 flex gap-3 border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center border border-amber-600/40 bg-amber-500/15 text-amber-700 dark:text-amber-300">
              <FlaskConical className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 id="beta-notice" className="text-[13px] font-semibold tracking-tight">
                {content.beta.downloads.title}
              </h2>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                {content.beta.downloads.description}
              </p>
              <ul className="mt-2 space-y-1">
                {content.beta.downloads.items.map((item) => (
                  <li key={item} className="flex gap-2 text-[12px] leading-relaxed text-muted-foreground">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-amber-500" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </Reveal>

        <div className="grid gap-3 md:grid-cols-3">
          {PLATFORM_META.map((platform, index) => {
            const text = c.platforms[platform.id];
            const Icon = platform.icon;
            return (
              <Reveal key={platform.id} delay={index * 85} className="h-full">
                <article className="landing-lift flex h-full flex-col border border-border bg-card p-4 transition-colors hover:border-primary/40">
                  <div className="flex items-start justify-between">
                    <span className="grid h-9 w-9 place-items-center border border-primary/20 bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">v{APP_VERSION}</span>
                  </div>
                  <h2 className="mt-3 text-[15px] font-semibold tracking-tight">{text.name}</h2>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">{text.requirement}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {platform.formats.map((formatName) => (
                      <span
                        key={formatName}
                        className="border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px]"
                      >
                        {formatName}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{text.note}</p>
                  <a
                    href={RELEASES_URL}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "landing-cta mt-4 h-9 w-full text-[12.5px]",
                    )}
                  >
                    {c.downloadButton}
                    <Download className="h-4 w-4" />
                  </a>
                </article>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <div className="border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-amber-500" />
                <h2 className="text-[13.5px] font-semibold tracking-tight">{c.unsigned.title}</h2>
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{c.unsigned.description}</p>
              <ul className="mt-2.5 space-y-1 text-[12px] text-muted-foreground">
                <li>
                  <strong className="font-medium text-foreground">{c.unsigned.windowsLabel}</strong> {c.unsigned.windows}
                </li>
                <li>
                  <strong className="font-medium text-foreground">{c.unsigned.macosLabel}</strong> {c.unsigned.macos}
                </li>
              </ul>
              <CodeBlock
                className="mt-3"
                title={c.unsigned.codeTitle}
                code={MACOS_QUARANTINE}
                note={c.unsigned.codeNote}
              />
            </div>
          </Reveal>

          <Reveal variant="right" delay={100}>
            <div className="border border-border bg-card p-5">
              <h2 className="text-[13.5px] font-semibold tracking-tight">{c.requirements.title}</h2>
              <ul className="mt-3 space-y-2.5">
                <li className="flex gap-2.5">
                  <Monitor className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-[12px] leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">{c.requirements.windowsLabel}</span>{" "}
                    {c.requirements.windows}
                  </p>
                </li>
                <li className="flex gap-2.5">
                  <Terminal className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-[12px] leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">{c.requirements.linuxLabel}</span>{" "}
                    {c.requirements.linux}
                  </p>
                </li>
                <li className="flex gap-2.5">
                  <Apple className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-[12px] leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">{c.requirements.macosLabel}</span>{" "}
                    {c.requirements.macos}
                  </p>
                </li>
                <li className="flex gap-2.5">
                  <Cpu className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-[12px] leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">{c.requirements.buildLabel}</span>{" "}
                    {c.requirements.build}
                  </p>
                </li>
              </ul>
              <p className="mt-3 border-t border-border pt-2.5 text-[11px] leading-relaxed text-muted-foreground">
                {c.requirements.footnote}
              </p>
            </div>
          </Reveal>
        </div>

        <section className="mt-12 grid gap-4 lg:grid-cols-2 sm:mt-16">
          <Reveal variant="left">
            <div>
              <h2 className="text-[16px] font-semibold tracking-tight">{c.source.title}</h2>
              <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">{c.source.description}</p>
              <CodeBlock className="mt-3" title="terminal" code={sourceCode} note={c.source.codeNote} />
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "landing-cta h-8 text-[12px]")}
                >
                  <Github className="h-3.5 w-3.5" />
                  {c.source.repository}
                </a>
                <a
                  href={docHref("desenvolvimento")}
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "landing-cta h-8 text-[12px]")}
                >
                  {c.source.guide}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal variant="right" delay={100}>
            <div className="border border-border bg-card">
              <div className="border-b border-border px-4 py-3">
                <h2 className="text-[13.5px] font-semibold tracking-tight">{c.data.title}</h2>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{c.data.subtitle}</p>
              </div>
              <table className="w-full border-collapse text-[12px]">
                <caption className="sr-only">{c.data.caption}</caption>
                <tbody>
                  {DATA_PATH_META.map((entry, index) => (
                    <tr
                      key={entry.id}
                      className="landing-row border-b border-border last:border-0"
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <th scope="row" className="whitespace-nowrap px-3 py-2 text-left font-medium">
                        {c.data.systems[entry.id]}
                      </th>
                      <td className="break-all px-3 py-2 font-mono text-[10.5px] text-muted-foreground">
                        {entry.id === "browser" ? c.data.browserPath : entry.path}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">{c.data.footnote}</p>
            </div>
          </Reveal>
        </section>

        <Reveal variant="fade">
          <div className="mt-8 border-t border-border pt-4 text-[11px] leading-relaxed text-muted-foreground">
            <p>
              {c.workflow.before}
              <a href={ACTIONS_URL} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
                {c.workflow.actionsLink}
              </a>
              {c.workflow.middle}
              <a
                href={`${REPO_URL}/issues`}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary hover:underline"
              >
                {c.workflow.repoLink}
              </a>
              {c.workflow.after}
            </p>
          </div>
        </Reveal>
      </Container>
    </div>
  );
}
