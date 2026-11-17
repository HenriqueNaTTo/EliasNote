import { ArrowUpRight, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/landing/components/animate";
import { Container, PageHeader, SectionHeading } from "@/landing/components/ui";
import { useContent } from "@/landing/i18n/LocaleContext";
import { format } from "@/landing/i18n/locale";
import { APP_VERSION, LICENSE_URL, REPO_URL, STACK_TECHNOLOGIES, docHref } from "@/landing/site";
import { cn } from "@/lib/utils";

export function About() {
  const content = useContent();
  const c = content.about;
  const [intro, ...rest] = c.paragraphs;

  return (
    <div className="landing-page-enter">
      <PageHeader eyebrow={c.header.eyebrow} title={c.header.title} description={c.header.description} />

      <Container className="py-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <Reveal>
            <div className="space-y-3 text-[13.5px] leading-relaxed text-muted-foreground">
              <p>
                <strong className="font-medium text-foreground">{content.nav.brand}</strong> {intro}
              </p>
              {rest.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <div className="!mt-5 flex flex-wrap gap-1.5">
                {c.tags.map((item) => (
                  <span key={item} className="border border-border bg-card px-2 py-1 text-[10.5px] text-muted-foreground">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal variant="right" delay={100}>
            <div className="border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h2 className="text-[13.5px] font-semibold tracking-tight">{c.summary.title}</h2>
                <Badge variant="outline">v{APP_VERSION}</Badge>
              </div>
              <dl className="divide-y divide-border">
                {c.summary.rows.map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-3 px-4 py-2.5">
                    <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{row.label}</dt>
                    <dd className="text-right text-[12px] font-medium">{format(row.value, { version: APP_VERSION })}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3">
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "landing-cta h-8 text-[12px]")}
                >
                  {c.summary.repository}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
                <a
                  href={LICENSE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "landing-cta h-8 text-[12px]")}
                >
                  {c.summary.license}
                </a>
              </div>
            </div>
          </Reveal>
        </div>

        <section className="mt-12 sm:mt-16">
          <Reveal>
            <SectionHeading
              eyebrow={c.principles.eyebrow}
              title={c.principles.title}
              description={c.principles.description}
            />
          </Reveal>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {c.principles.items.map((principle, index) => (
              <Reveal key={principle.title} delay={index * 80} className="h-full">
                <article className="landing-lift h-full border border-border bg-card p-5">
                  <p className="font-mono text-[11px] text-primary">{String(index + 1).padStart(2, "0")}</p>
                  <h3 className="mt-1.5 text-[13.5px] font-semibold tracking-tight">{principle.title}</h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">{principle.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-4 lg:grid-cols-2 sm:mt-16">
          <Reveal variant="left">
            <div className="border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <h2 className="text-[13.5px] font-semibold tracking-tight">{c.limits.title}</h2>
              </div>
              <p className="mt-1.5 text-[11.5px] text-muted-foreground">{c.limits.subtitle}</p>
              <ul className="mt-3 space-y-2">
                {c.limits.items.map((limit) => (
                  <li key={limit} className="flex gap-2 text-[12px] leading-relaxed text-muted-foreground">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" aria-hidden />
                    <span>{limit}</span>
                  </li>
                ))}
              </ul>
              <a
                href={docHref("funcionalidades")}
                className="group mt-4 inline-flex items-center gap-1 text-[11.5px] font-medium text-primary hover:underline"
              >
                {c.limits.link}
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </Reveal>

          <Reveal variant="right" delay={100}>
            <div className="border border-border bg-card">
              <div className="border-b border-border px-4 py-3">
                <h2 className="text-[13.5px] font-semibold tracking-tight">{c.stack.title}</h2>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{c.stack.subtitle}</p>
              </div>
              <table className="w-full border-collapse text-[12px]">
                <caption className="sr-only">{c.stack.title}</caption>
                <tbody>
                  {STACK_TECHNOLOGIES.map((technology, index) => (
                    <tr
                      key={technology}
                      className="landing-row border-b border-border last:border-0"
                      style={{ animationDelay: `${index * 45}ms` }}
                    >
                      <th scope="row" className="px-4 py-2 text-left font-medium">
                        {c.stack.layers[index] ?? ""}
                      </th>
                      <td className="px-4 py-2 text-muted-foreground">{technology}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">
                {c.stack.footnote.start}
                <a href={docHref("arquitetura")} className="font-medium text-primary hover:underline">
                  {c.stack.footnote.link}
                </a>
                {c.stack.footnote.end}
              </p>
            </div>
          </Reveal>
        </section>

        <Reveal variant="fade">
          <section className="mt-12 border border-border bg-card p-5 sm:p-6">
            <h2 className="text-[13.5px] font-semibold tracking-tight">{c.credits.title}</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{c.credits.text}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={LICENSE_URL}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "landing-cta h-8 text-[12px]")}
              >
                {c.credits.license}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a
                href={docHref()}
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "landing-cta h-8 text-[12px]")}
              >
                {c.credits.docs}
              </a>
            </div>
          </section>
        </Reveal>
      </Container>
    </div>
  );
}
