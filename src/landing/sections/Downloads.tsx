import { Apple, ArrowUpRight, Cpu, Download, Github, Info, Monitor, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/landing/components/animate";
import { CodeBlock, Container, PageHeader } from "@/landing/components/ui";
import {
  ACTIONS_URL,
  APP_VERSION,
  DATA_PATHS,
  DOCS_URL,
  PLATFORMS,
  RELEASES_PAGE_URL,
  RELEASES_URL,
  REPO_URL,
} from "@/landing/site";
import { cn } from "@/lib/utils";

const SOURCE_CODE = `npm install
npm run dev        # navegador, com IndexedDB
npm run tauri dev  # desktop, com SQLite
npm run tauri build -- --bundles nsis  # instalador no Windows`;

export function Downloads() {
  return (
    <div className="landing-page-enter">
      <PageHeader
        eyebrow="Downloads"
        title="Baixe uma vez. Funcione para sempre."
        description="Instaladores oficiais publicados no GitHub. Nenhum cadastro, nenhuma licença para ativar: baixe, instale e comece a organizar."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success">Versão {APP_VERSION}</Badge>
          <Badge variant="outline">Gratuito · código aberto</Badge>
          <a
            href={RELEASES_PAGE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11.5px] font-medium text-primary hover:underline"
          >
            Todas as releases
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </PageHeader>

      <Container className="py-8 sm:py-12">
        <div className="grid gap-3 md:grid-cols-3">
          {PLATFORMS.map((platform, index) => (
            <Reveal key={platform.id} delay={index * 85} className="h-full">
              <article className="landing-lift flex h-full flex-col border border-border bg-card p-4 transition-colors hover:border-primary/40">
                <div className="flex items-start justify-between">
                  <span className="grid h-9 w-9 place-items-center border border-primary/20 bg-primary/10 text-primary">
                    <platform.icon className="h-4 w-4" />
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">v{APP_VERSION}</span>
                </div>
                <h2 className="mt-3 text-[15px] font-semibold tracking-tight">{platform.name}</h2>
                <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">{platform.requirement}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {platform.formats.map((format) => (
                    <span
                      key={format}
                      className="border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px]"
                    >
                      {format}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{platform.note}</p>
                <a
                  href={RELEASES_URL}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "landing-cta mt-4 h-9 w-full text-[12.5px]",
                  )}
                >
                  Baixar instalador
                  <Download className="h-4 w-4" />
                </a>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <div className="border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-amber-500" />
                <h2 className="text-[13.5px] font-semibold tracking-tight">Instaladores não assinados</h2>
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                Os pacotes são gerados pelo workflow de release e não têm assinatura de código, então o sistema pode
                exibir um aviso na primeira execução.
              </p>
              <ul className="mt-2.5 space-y-1 text-[12px] text-muted-foreground">
                <li>
                  <strong className="font-medium text-foreground">Windows:</strong> no SmartScreen, use “Mais
                  informações” → “Executar assim mesmo”.
                </li>
                <li>
                  <strong className="font-medium text-foreground">macOS:</strong> se o sistema bloquear a abertura,
                  remova a quarentena do app.
                </li>
              </ul>
              <CodeBlock
                className="mt-3"
                title="macOS · terminal"
                code="xattr -dr com.apple.quarantine /Applications/EliasNote.app"
                note="Só é necessário quando o macOS impede a primeira abertura."
              />
            </div>
          </Reveal>

          <Reveal variant="right" delay={100}>
            <div className="border border-border bg-card p-5">
              <h2 className="text-[13.5px] font-semibold tracking-tight">Requisitos</h2>
              <ul className="mt-3 space-y-2.5">
                <li className="flex gap-2.5">
                  <Monitor className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-[12px] leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">Windows 10/11</span> com WebView2 atualizado.
                  </p>
                </li>
                <li className="flex gap-2.5">
                  <Terminal className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-[12px] leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">Linux</span> com WebKitGTK 4.1; o AppImage é
                    portátil e o .deb resolve as dependências.
                  </p>
                </li>
                <li className="flex gap-2.5">
                  <Apple className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-[12px] leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">macOS 11+</span> em Intel ou Apple Silicon, com um
                    único DMG universal.
                  </p>
                </li>
                <li className="flex gap-2.5">
                  <Cpu className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-[12px] leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">Para compilar:</span> Node 20+ e Rust 1.77.2+, além
                    das dependências do Tauri 2.
                  </p>
                </li>
              </ul>
              <p className="mt-3 border-t border-border pt-2.5 text-[11px] leading-relaxed text-muted-foreground">
                O app não pede permissões de rede para funcionar: o workspace fica no dispositivo.
              </p>
            </div>
          </Reveal>
        </div>

        <section className="mt-12 grid gap-4 lg:grid-cols-2 sm:mt-16">
          <Reveal variant="left">
            <div>
              <h2 className="text-[16px] font-semibold tracking-tight">Compilar do código-fonte</h2>
              <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                Clone o repositório e rode o app em modo de desenvolvimento. No navegador, a persistência usa
                IndexedDB; no desktop, SQLite.
              </p>
              <CodeBlock
                className="mt-3"
                title="terminal"
                code={SOURCE_CODE}
                note="No Linux e no macOS, use npm run tauri build para gerar o pacote nativo da plataforma."
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "landing-cta h-8 text-[12px]")}
                >
                  <Github className="h-3.5 w-3.5" />
                  Código no GitHub
                </a>
                <a
                  href={`${DOCS_URL}/DEVELOPMENT.md`}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "landing-cta h-8 text-[12px]")}
                >
                  Guia de desenvolvimento
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal variant="right" delay={100}>
            <div className="border border-border bg-card">
              <div className="border-b border-border px-4 py-3">
                <h2 className="text-[13.5px] font-semibold tracking-tight">Onde ficam seus dados</h2>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Documentos, anexos e backups ficam no diretório de dados do app.
                </p>
              </div>
              <table className="w-full border-collapse text-[12px]">
                <caption className="sr-only">Diretórios de dados do EliasNote por sistema operacional</caption>
                <tbody>
                  {DATA_PATHS.map((entry, index) => (
                    <tr
                      key={entry.system}
                      className="landing-row border-b border-border last:border-0"
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <th scope="row" className="whitespace-nowrap px-3 py-2 text-left font-medium">
                        {entry.system}
                      </th>
                      <td className="break-all px-3 py-2 font-mono text-[10.5px] text-muted-foreground">
                        {entry.path}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">
                Desinstalar o app não apaga a pasta de dados; remova-a manualmente se quiser zerar o workspace.
              </p>
            </div>
          </Reveal>
        </section>

        <Reveal variant="fade">
          <div className="mt-8 border-t border-border pt-4 text-[11px] leading-relaxed text-muted-foreground">
            <p>
              Cada tag <span className="font-mono text-[10.5px]">v*</span> dispara o workflow de release, que roda
              typecheck, testes e build e anexa os instaladores de Windows, Linux e macOS à release. Acompanhe as
              execuções em{" "}
              <a
                href={ACTIONS_URL}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary hover:underline"
              >
                GitHub Actions
              </a>
              . Se algo falhar, abra uma issue em{" "}
              <a
                href={`${REPO_URL}/issues`}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary hover:underline"
              >
                github.com/HenriqueNaTTo/EliasNote
              </a>
              .
            </p>
          </div>
        </Reveal>
      </Container>
    </div>
  );
}
