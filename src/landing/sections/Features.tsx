import { useState } from "react";
import { ArrowUpRight, FolderTree, Keyboard, PenTool } from "lucide-react";
import { Reveal } from "@/landing/components/animate";
import { FeatureCard } from "@/landing/components/FeatureCard";
import { CheckItem, Container, Kbd, PageHeader, SectionHeading } from "@/landing/components/ui";
import { FEATURES, FEATURE_CATEGORIES, type FeatureCategoryId } from "@/landing/data";
import { DOCS_URL, ELEMENTS, EXCALIDRAW_URL, SHORTCUTS } from "@/landing/site";
import { cn } from "@/lib/utils";

type CategoryFilter = "todos" | FeatureCategoryId;

export function Features() {
  const [category, setCategory] = useState<CategoryFilter>("todos");
  const filtered = FEATURES.filter((feature) => category === "todos" || feature.category === category);

  return (
    <div className="landing-page-enter">
      <PageHeader
        eyebrow="Funcionalidades"
        title="Tudo que o EliasNote faz"
        description="Um app só para capturar, organizar, desenhar e entregar. Abaixo, o inventário completo do que já está pronto na versão atual."
      >
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar funcionalidades por categoria">
          {FEATURE_CATEGORIES.map((item) => {
            const count =
              item.id === "todos" ? FEATURES.length : FEATURES.filter((feature) => feature.category === item.id).length;
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
              {filtered.length} {filtered.length === 1 ? "recurso" : "recursos"} nesta categoria
            </span>
          </p>
          <p className="text-[11px] text-muted-foreground">Atalhos remapeáveis · interface em português</p>
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
            <SectionHeading
              eyebrow="Elementos"
              title="Cada conteúdo tem o formato certo."
              description="Arraste do sistema para o canvas: imagem vira mídia, Markdown vira nota, .excalidraw vira desenho e JSON importa elementos."
            />
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-5 overflow-x-auto border border-border bg-card">
              <table className="w-full border-collapse text-[12px]">
                <caption className="sr-only">Tipos de elementos do EliasNote e o que cada um faz</caption>
                <thead>
                  <tr className="border-b border-border bg-muted/60">
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
                    >
                      Elemento
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
                    >
                      O que faz
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ELEMENTS.map((element, index) => (
                    <tr
                      key={element.name}
                      className="landing-row border-b border-border transition-colors last:border-0 hover:bg-muted/40"
                      style={{ animationDelay: `${index * 28}ms` }}
                    >
                      <th scope="row" className="whitespace-nowrap px-3 py-2 text-left font-medium">
                        <span
                          className={cn("mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle", element.dot)}
                          aria-hidden
                        />
                        {element.name}
                      </th>
                      <td className="px-3 py-2 text-muted-foreground">{element.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Todos os elementos aceitam cor, redimensionamento, bloqueio, ocultação e referências bidirecionais.
          </p>
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
                  <h3 className="text-[13px] font-semibold tracking-tight">Atalhos essenciais</h3>
                  <p className="text-[11px] text-muted-foreground">Todos remapeáveis em Configurações → Atalhos.</p>
                </div>
              </div>
              <ul className="divide-y divide-border">
                {SHORTCUTS.map((shortcut, index) => (
                  <li
                    key={shortcut.action}
                    className="landing-row flex items-center justify-between gap-3 px-4 py-2"
                    style={{ animationDelay: `${index * 45}ms` }}
                  >
                    <span className="text-[12px] text-muted-foreground">{shortcut.action}</span>
                    <span className="flex shrink-0 gap-1">
                      {shortcut.keys.map((key) => (
                        <Kbd key={key}>{key}</Kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">
                Ctrl/Cmd representa ⌘ no macOS. Atalhos de uma letra são ignorados enquanto você digita.
              </p>
            </div>
          </Reveal>

          <Reveal variant="right" delay={100} className="h-full">
            <div className="flex h-full flex-col gap-3">
              <div className="landing-lift flex flex-1 flex-col border border-border bg-card p-5">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center border border-primary/20 bg-primary/10 text-primary">
                    <PenTool className="h-4 w-4" />
                  </span>
                  <h3 className="text-[13.5px] font-semibold tracking-tight">Desenho sem trocar de app</h3>
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                  O editor Excalidraw abre em tela cheia e a cena fica salva no próprio quadro, com miniatura no
                  canvas. A biblioteca de elementos é local e pode ser importada ou exportada em .excalidrawlib.
                </p>
                <ul className="mt-3 space-y-1.5">
                  <CheckItem>Mesclagem de cenas com remapeamento de bindings e imagens</CheckItem>
                  <CheckItem>Exportação do desenho em PNG, SVG e PDF</CheckItem>
                  <CheckItem>Importação de arquivos .excalidraw por arraste</CheckItem>
                </ul>
                <a
                  href={EXCALIDRAW_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="group mt-auto inline-flex items-center gap-1 pt-4 text-[11.5px] font-medium text-primary hover:underline"
                >
                  Conhecer o Excalidraw
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </div>

              <div className="landing-lift flex flex-col border border-border bg-card p-5">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center border border-primary/20 bg-primary/10 text-primary">
                    <FolderTree className="h-4 w-4" />
                  </span>
                  <h3 className="text-[13.5px] font-semibold tracking-tight">Cofre do Obsidian em um clique</h3>
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                  A importação cria um workspace novo com a hierarquia de pastas, notas, anexos, canvases e desenhos.
                  O cofre original não é modificado.
                </p>
                <a
                  href={`${DOCS_URL}/OBSIDIAN.md`}
                  target="_blank"
                  rel="noreferrer"
                  className="group mt-auto inline-flex items-center gap-1 pt-4 text-[11.5px] font-medium text-primary hover:underline"
                >
                  Ver o que é convertido
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </div>
            </div>
          </Reveal>
        </section>

        <Reveal variant="fade">
          <p className="mt-8 border-t border-border pt-4 text-[11px] text-muted-foreground">
            Detalhes técnicos e limites conhecidos estão em{" "}
            <a
              href={`${DOCS_URL}/FEATURES.md`}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary hover:underline"
            >
              docs/FEATURES.md
            </a>
            .
          </p>
        </Reveal>
      </Container>
    </div>
  );
}
