import { ArrowUpRight, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/landing/components/animate";
import { Container, PageHeader, SectionHeading } from "@/landing/components/ui";
import {
  APP_VERSION,
  DOCS_URL,
  LICENSE_URL,
  LIMITS,
  PRINCIPLES,
  REPO_URL,
  STACK,
} from "@/landing/site";
import { cn } from "@/lib/utils";

const SUMMARY: { label: string; value: string }[] = [
  { label: "Modelo", value: "Local-first · 100% offline" },
  { label: "Plataformas", value: "Windows, Linux e macOS" },
  { label: "Licença", value: "MIT" },
  { label: "Versão atual", value: APP_VERSION },
];

export function About() {
  return (
    <div className="landing-page-enter">
      <PageHeader
        eyebrow="Sobre"
        title="Uma ferramenta de pensamento que cabe no seu computador."
        description="EliasNote combina a organização visual do Milanote com o desenho do Excalidraw — sem contas, servidores ou sincronização. O material continua sendo seu, inclusive quando o app está fechado."
      />

      <Container className="py-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <Reveal>
            <div className="space-y-3 text-[13.5px] leading-relaxed text-muted-foreground">
              <p>
                <strong className="font-medium text-foreground">EliasNote</strong> nasceu de uma necessidade simples:
                pensar visualmente sem entregar o rascunho para um serviço de terceiros. Em vez de uma pilha de apps
                entre a ideia e a entrega, o projeto reúne notas, tarefas, referências, quadros e diagramas em um
                único canvas infinito.
              </p>
              <p>
                O app é feito com Tauri 2 e React, usa SQLite no desktop e IndexedDB no navegador, e trata o desenho
                como parte do fluxo — não como um anexo. O Excalidraw é embutido e editável, com cenas mescláveis e
                exportação em PNG, SVG e PDF.
              </p>
              <p>
                Não há login, assinatura ou telemetria. A release é gerada por um workflow público que roda
                typecheck, testes e build antes de anexar os instaladores das três plataformas.
              </p>
              <div className="!mt-5 flex flex-wrap gap-1.5">
                {["Tauri 2", "React 18", "TypeScript", "Tailwind CSS", "Excalidraw", "SQLite"].map((item) => (
                  <span
                    key={item}
                    className="border border-border bg-card px-2 py-1 text-[10.5px] text-muted-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal variant="right" delay={100}>
            <div className="border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h2 className="text-[13.5px] font-semibold tracking-tight">Em resumo</h2>
                <Badge variant="outline">v{APP_VERSION}</Badge>
              </div>
              <dl className="divide-y divide-border">
                {SUMMARY.map((item) => (
                  <div key={item.label} className="flex items-start justify-between gap-3 px-4 py-2.5">
                    <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{item.label}</dt>
                    <dd className="text-right text-[12px] font-medium">{item.value}</dd>
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
                  Repositório
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
                <a
                  href={LICENSE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "landing-cta h-8 text-[12px]")}
                >
                  Licença MIT
                </a>
              </div>
            </div>
          </Reveal>
        </div>

        <section className="mt-12 sm:mt-16">
          <Reveal>
            <SectionHeading
              eyebrow="Princípios"
              title="Quatro decisões que definem o app."
              description="Elas aparecem na arquitetura, na interface e nos limites do produto."
            />
          </Reveal>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {PRINCIPLES.map((principle, index) => (
              <Reveal key={principle.title} delay={index * 80} className="h-full">
                <article className="landing-lift h-full border border-border bg-card p-5">
                  <p className="font-mono text-[11px] text-primary">{String(index + 1).padStart(2, "0")}</p>
                  <h3 className="mt-1.5 text-[13.5px] font-semibold tracking-tight">{principle.title}</h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
                    {principle.description}
                  </p>
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
                <h2 className="text-[13.5px] font-semibold tracking-tight">Limites conhecidos</h2>
              </div>
              <p className="mt-1.5 text-[11.5px] text-muted-foreground">
                Transparência importa tanto quanto o recurso novo.
              </p>
              <ul className="mt-3 space-y-2">
                {LIMITS.map((limit) => (
                  <li key={limit} className="flex gap-2 text-[12px] leading-relaxed text-muted-foreground">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500" aria-hidden />
                    <span>{limit}</span>
                  </li>
                ))}
              </ul>
              <a
                href={`${DOCS_URL}/FEATURES.md`}
                target="_blank"
                rel="noreferrer"
                className="group mt-4 inline-flex items-center gap-1 text-[11.5px] font-medium text-primary hover:underline"
              >
                Ver a lista completa
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </Reveal>

          <Reveal variant="right" delay={100}>
            <div className="border border-border bg-card">
              <div className="border-b border-border px-4 py-3">
                <h2 className="text-[13.5px] font-semibold tracking-tight">Stack e decisões técnicas</h2>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Tudo aberto e auditável no repositório.</p>
              </div>
              <table className="w-full border-collapse text-[12px]">
                <caption className="sr-only">Tecnologias usadas no EliasNote e suas camadas</caption>
                <tbody>
                  {STACK.map((entry, index) => (
                    <tr
                      key={entry.layer}
                      className="landing-row border-b border-border last:border-0"
                      style={{ animationDelay: `${index * 45}ms` }}
                    >
                      <th scope="row" className="px-4 py-2 text-left font-medium">
                        {entry.layer}
                      </th>
                      <td className="px-4 py-2 text-muted-foreground">{entry.technology}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">
                Documentação de arquitetura em{" "}
                <a
                  href={`${DOCS_URL}/ARCHITECTURE.md`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  docs/ARCHITECTURE.md
                </a>
                .
              </p>
            </div>
          </Reveal>
        </section>

        <Reveal variant="fade">
          <section className="mt-12 border border-border bg-card p-5 sm:p-6">
            <h2 className="text-[13.5px] font-semibold tracking-tight">Créditos e licenças</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
              Código original sob licença MIT. As bibliotecas de terceiros mantêm suas próprias licenças: Excalidraw
              (MIT), React, TypeScript, Vite, Tailwind CSS, Radix UI, lucide, Zustand, Immer, marked, DOMPurify,
              html-to-image, jsPDF, Tauri 2 e rusqlite. Nenhum código ou asset proprietário do Milanote foi utilizado.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={LICENSE_URL}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "landing-cta h-8 text-[12px]")}
              >
                Ler a licença
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a
                href={DOCS_URL}
                target="_blank"
                rel="noreferrer"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "landing-cta h-8 text-[12px]")}
              >
                Pasta de documentação
              </a>
            </div>
          </section>
        </Reveal>
      </Container>
    </div>
  );
}
