import { ArrowUpRight, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/landing/components/animate";
import { Container, PageHeader } from "@/landing/components/ui";
import { useContent, useLocale } from "@/landing/i18n/LocaleContext";
import type { ReleaseKind } from "@/landing/i18n/types";
import { RELEASES, releaseDate, releaseUrl } from "@/landing/releases";
import { APP_VERSION, RELEASES_PAGE_URL } from "@/landing/site";
import { cn } from "@/lib/utils";

const KIND_VARIANT: Record<ReleaseKind, "success" | "default" | "warning" | "outline"> = {
  initial: "success",
  feature: "default",
  fix: "warning",
  infra: "outline",
};

export function Updates() {
  const c = useContent().updates;
  const { locale } = useLocale();
  const dateFormatter = new Intl.DateTimeFormat(
    locale === "pt" ? "pt-BR" : locale === "zh" ? "zh-CN" : locale,
    { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" },
  );

  return (
    <div className="landing-page-enter">
      <PageHeader eyebrow={c.header.eyebrow} title={c.header.title} description={c.header.description}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success">
            {c.current} · v{APP_VERSION}
          </Badge>
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
        <ol className="space-y-3">
          {RELEASES.map((release, index) => {
            const content = c.releases[release.id];
            const latest = release.id === APP_VERSION;
            return (
              <li key={release.id}>
                <Reveal variant="fade" delay={Math.min(index * 45, 220)}>
                  <article
                    id={`v${release.id}`}
                    className={cn(
                      "grid gap-4 border bg-card p-4 transition-colors sm:grid-cols-[10.5rem_1fr] sm:p-5",
                      latest ? "border-primary/45 shadow-panel" : "border-border",
                    )}
                  >
                    <div className="flex min-w-0 flex-row items-center gap-2 sm:flex-col sm:items-start sm:gap-1.5">
                      <Badge variant={KIND_VARIANT[release.kind]}>{c.kindLabels[release.kind]}</Badge>
                      <p className="font-mono text-[17px] font-semibold tracking-tight">v{release.id}</p>
                      <p className="flex items-center gap-1 text-[10.5px] text-muted-foreground">
                        <CalendarDays className="h-3 w-3 shrink-0" aria-hidden />
                        {dateFormatter.format(releaseDate(release.date))}
                      </p>
                      {latest ? (
                        <Badge variant="outline" className="border-primary/30 text-primary">
                          {c.current}
                        </Badge>
                      ) : null}
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-[16px] font-semibold tracking-tight">{content.title}</h2>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">
                        {content.summary}
                      </p>
                      <p className="mt-3 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {c.changesLabel}
                      </p>
                      <ul className="mt-1.5 space-y-1">
                        {content.changes.map((change) => (
                          <li key={change} className="flex gap-2 text-[12px] leading-relaxed text-muted-foreground">
                            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-primary/70" aria-hidden />
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                      <a
                        href={releaseUrl(release.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-medium text-primary hover:underline"
                      >
                        {c.releaseLink}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </Container>
    </div>
  );
}
