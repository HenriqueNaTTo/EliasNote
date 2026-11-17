import type { ReactNode } from "react";
import { AppMark } from "@/components/brand/AppMark";
import type { Feature } from "@/landing/data";
import { cn } from "@/lib/utils";

const NODE_CLASS = {
  none: "node-color-none",
  amber: "node-color-amber",
  rose: "node-color-rose",
  sky: "node-color-sky",
  mint: "node-color-mint",
  lilac: "node-color-lilac",
  sand: "node-color-sand",
  slate: "node-color-slate",
} as const;

type NodeTone = keyof typeof NODE_CLASS;

function MiniNode({
  tone = "none",
  className,
  children,
}: {
  tone?: NodeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        NODE_CLASS[tone],
        "node-surface flex flex-col overflow-hidden border p-1 text-[5px] leading-[1.35]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function MiniCheck({ done = false, children }: { done?: boolean; children: ReactNode }) {
  return (
    <span className="flex items-center gap-0.5">
      <span
        className={cn(
          "grid h-1.5 w-1.5 place-items-center border",
          done ? "border-transparent bg-[var(--node-accent)] text-white" : "border-current opacity-40",
        )}
      >
        {done ? <span className="text-[3px] leading-none">✓</span> : null}
      </span>
      <span className={cn(done && "line-through opacity-60")}>{children}</span>
    </span>
  );
}

function MiniChip({ active = false, children }: { active?: boolean; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-1 py-0.5 text-[4.5px] leading-none",
        active ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

function MiniButton({ primary = false, children }: { primary?: boolean; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-3.5 items-center justify-center px-1.5 text-[4.5px] font-medium leading-none",
        primary ? "bg-primary text-primary-foreground" : "border border-border bg-background text-foreground",
      )}
    >
      {children}
    </span>
  );
}

function MiniBar({ value = 60, className }: { value?: number; className?: string }) {
  return (
    <span className={cn("block h-0.5 w-full bg-black/10", className)}>
      <span className="block h-full bg-[var(--node-accent)]" style={{ width: `${value}%` }} />
    </span>
  );
}

function SidebarRow({
  label,
  dot,
  active = false,
  indent = false,
}: {
  label: string;
  dot: string;
  active?: boolean;
  indent?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-0.5 px-0.5 py-[2px] text-[4.5px] leading-none",
        indent && "pl-2",
        active ? "bg-muted/70 font-medium" : "text-muted-foreground",
      )}
    >
      <span className={cn("h-0.5 w-0.5 shrink-0 rounded-full", dot)} />
      <span className="truncate">{label}</span>
    </div>
  );
}

function MiniSidebar() {
  return (
    <div className="hidden w-[58px] shrink-0 flex-col border-r border-border bg-[hsl(var(--sidebar))] p-1 sm:flex">
      <div className="flex items-center gap-0.5 border border-border bg-background px-0.5 py-0.5">
        <span className="h-1 w-1 shrink-0 rounded-full bg-violet-400" />
        <span className="truncate text-[4.5px] font-medium">Estúdio</span>
      </div>
      <p className="mt-1 px-0.5 text-[4px] font-semibold uppercase tracking-wider text-muted-foreground">Quadros</p>
      <SidebarRow label="Pesquisa" dot="bg-sky-400" active />
      <SidebarRow label="Identidade" dot="bg-violet-400" indent />
      <SidebarRow label="Referências" dot="bg-amber-400" indent />
      <SidebarRow label="Lançamento" dot="bg-emerald-400" />
      <div className="mt-auto border-t border-border pt-0.5 text-[4px] text-muted-foreground">Salvo agora</div>
    </div>
  );
}

function PreviewShell({
  tab,
  sidebar = true,
  children,
}: {
  tab: string;
  sidebar?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex h-5 shrink-0 items-center gap-1 border-b border-border bg-[hsl(var(--sidebar))] px-1.5">
        <AppMark className="h-2 w-2 shrink-0 text-foreground" />
        <span className="text-[6px] font-semibold tracking-tight">EliasNote</span>
        <span className="truncate text-[5.5px] text-muted-foreground">/ {tab}</span>
        <span className="ml-auto flex items-center gap-1 text-muted-foreground">
          <span className="h-1 w-1 rounded-full bg-current opacity-40" />
          <span className="h-1 w-1 rounded-full bg-current opacity-40" />
          <span className="h-1 w-1 rounded-full bg-current opacity-40" />
        </span>
      </div>
      <div className="flex min-h-0 flex-1">
        {sidebar ? <MiniSidebar /> : null}
        <div className="relative min-w-0 flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

function MiniToolbar() {
  const tools = ["bg-primary", "bg-muted-foreground/30", "bg-muted-foreground/30", "bg-muted-foreground/30", "bg-muted-foreground/30"];
  return (
    <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-0.5 border border-border bg-popover/95 p-0.5 shadow-sm">
      {tools.map((tone, index) => (
        <span key={index} className={cn("h-2 w-2", tone)} />
      ))}
      <span className="mx-0.5 h-2 w-px bg-border" />
      <span className="px-0.5 text-[4px] text-muted-foreground">100%</span>
    </div>
  );
}

function MiniMinimap() {
  return (
    <div className="absolute bottom-1 right-1 h-4 w-6 border border-border bg-popover/85 p-0.5">
      <div className="relative h-full w-full bg-muted/70">
        <span className="absolute inset-x-0.5 inset-y-0 border border-primary/60" />
      </div>
    </div>
  );
}

function BoardNodes() {
  return (
    <>
      <MiniNode tone="amber" className="absolute left-[2%] top-[3%] h-[48%] w-[36%]">
        <p className="text-[5.5px] font-semibold leading-none">Entrevistas</p>
        <p className="mt-0.5 line-clamp-4 opacity-70">
          O que as pessoas fazem antes de abrir o computador? Onde as ideias se perdem?
        </p>
        <p className="mt-auto text-[4.5px] opacity-50">62 palavras</p>
      </MiniNode>
      <MiniNode tone="none" className="absolute right-[2%] top-[4%] h-[44%] w-[31%]">
        <p className="text-[5.5px] font-semibold leading-none">Moodboard</p>
        <div className="mt-0.5 h-[58%] w-full bg-gradient-to-br from-sky-200 via-sky-100 to-emerald-100" />
        <p className="mt-auto text-[4.5px] text-muted-foreground">8 imagens</p>
      </MiniNode>
      <MiniNode tone="mint" className="absolute left-[7%] top-[55%] h-[39%] w-[34%]">
        <p className="text-[5.5px] font-semibold leading-none">Checklist</p>
        <div className="mt-0.5 space-y-0.5 text-[4.5px]">
          <MiniCheck done>Fechar escopo</MiniCheck>
          <MiniCheck done>Revisar</MiniCheck>
          <MiniCheck>Publicar</MiniCheck>
        </div>
        <MiniBar value={66} className="mt-auto" />
      </MiniNode>
      <MiniNode tone="lilac" className="absolute right-[6%] top-[53%] h-[38%] w-[28%]">
        <p className="text-[5.5px] font-semibold leading-none">Identidade</p>
        <div className="mt-0.5 flex gap-0.5">
          <span className="h-4 flex-1 border border-white/50 bg-white/60" />
          <span className="h-4 flex-1 border border-white/50 bg-white/40" />
          <span className="h-4 flex-1 border border-white/50 bg-white/25" />
        </div>
        <p className="mt-auto text-[4.5px] opacity-50">12 itens</p>
      </MiniNode>
    </>
  );
}

function ConnectorSvg() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 300 180" preserveAspectRatio="none">
      <defs>
        <marker id="preview-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
          <path d="M0 0 L5 2.5 L0 5 Z" fill="hsl(var(--muted-foreground))" />
        </marker>
      </defs>
      <path
        d="M104 58 C 140 20, 190 22, 228 42"
        fill="none"
        stroke="hsl(var(--muted-foreground) / 0.5)"
        strokeWidth="1"
        markerEnd="url(#preview-arrow)"
      />
    </svg>
  );
}

function BoardScene({
  variant = "default",
}: {
  variant?: "default" | "grid" | "selection" | "transfer" | "connectors" | "nested";
}) {
  return (
    <PreviewShell tab="Pesquisa de campo">
      <div className={cn("absolute inset-0 p-1.5 pb-6", variant === "grid" ? "landing-feature-grid" : "landing-canvas")}>
        <BoardNodes />
        {variant === "default" ? <ConnectorSvg /> : null}

        {variant === "grid" ? (
          <>
            <span className="pointer-events-none absolute left-[44%] top-0 h-full w-px bg-primary/30" />
            <span className="pointer-events-none absolute left-0 top-[51%] h-px w-full bg-primary/30" />
            <span className="absolute right-1 top-1 border border-primary/40 bg-primary/10 px-1 py-0.5 text-[4.5px] text-primary">
              grade 16 px
            </span>
          </>
        ) : null}

        {variant === "selection" ? (
          <>
            <div className="pointer-events-none absolute left-[3%] top-[6%] h-[56%] w-[63%] border border-primary">
              <span className="absolute -left-0.5 -top-0.5 h-1 w-1 border border-primary bg-background" />
              <span className="absolute -right-0.5 -top-0.5 h-1 w-1 border border-primary bg-background" />
              <span className="absolute -bottom-0.5 -left-0.5 h-1 w-1 border border-primary bg-background" />
              <span className="absolute -bottom-0.5 -right-0.5 h-1 w-1 border border-primary bg-background" />
              <span className="absolute -top-3 left-0 bg-primary px-1 py-0.5 text-[4px] text-primary-foreground">
                2 selecionados
              </span>
            </div>
            <span className="absolute bottom-7 left-1/2 -translate-x-1/2 border border-border bg-popover px-1 py-0.5 text-[4.5px] text-muted-foreground shadow-sm">
              Shift + clique · Ctrl/Cmd + A
            </span>
          </>
        ) : null}

        {variant === "transfer" ? (
          <>
            <div className="absolute left-[28%] top-[28%] z-10 w-[36%] rotate-2">
              <MiniNode tone="sky" className="h-[38px] shadow-lg">
                <p className="text-[5.5px] font-semibold leading-none">Revisar protótipo</p>
                <p className="mt-0.5 text-[4.5px] opacity-60">Alta · Sex</p>
              </MiniNode>
            </div>
            <div className="absolute right-[3%] top-[8%] h-[28%] w-[24%] border border-dashed border-primary/60 bg-primary/5 p-0.5 text-[4px] text-primary">
              Identidade
            </div>
            <div className="absolute bottom-[10%] right-[8%] h-[24%] w-[22%] border border-dashed border-primary/60 bg-primary/5 p-0.5 text-[4px] text-primary">
              Lançamento
            </div>
            <span className="absolute bottom-7 left-1/2 -translate-x-1/2 border border-border bg-popover px-1 py-0.5 text-[4.5px] text-muted-foreground shadow-sm">
              Alt para copiar
            </span>
          </>
        ) : null}

        {variant === "connectors" ? (
          <>
            <ConnectorSvg />
            <span className="absolute left-[46%] top-[2%] border border-border bg-foreground px-1 py-0.5 text-[4px] text-background">
              depende de
            </span>
            <div className="absolute right-1 top-1 flex gap-0.5">
              <MiniChip active>curva</MiniChip>
              <MiniChip>reta</MiniChip>
              <MiniChip>cotovelo</MiniChip>
            </div>
          </>
        ) : null}

        {variant === "nested" ? (
          <>
            <div className="absolute left-[3%] top-1 border border-border bg-popover/90 px-1 py-0.5 text-[4px] text-muted-foreground">
              Projetos / Identidade
            </div>
            <div className="absolute bottom-[10%] left-[42%] flex h-[26%] w-[26%] items-center justify-center border border-dashed border-primary/50 bg-primary/5 text-[4px] text-primary">
              + subquadro
            </div>
          </>
        ) : null}

        <MiniToolbar />
        <MiniMinimap />
      </div>
    </PreviewShell>
  );
}

function ElementsScene() {
  return (
    <PreviewShell tab="Elementos" sidebar={false}>
      <div className="landing-canvas absolute inset-0 p-2">
        <span className="absolute right-1.5 top-1.5 border border-border bg-popover px-1 py-0.5 text-[4.5px] text-muted-foreground">
          13 tipos
        </span>
        <div className="grid grid-cols-3 gap-1">
          <MiniNode tone="amber" className="h-[52px]">
            <p className="text-[5.5px] font-semibold">Nota</p>
            <p className="mt-0.5 line-clamp-3 text-[4.5px] opacity-70">Markdown, prévia e contagem de palavras.</p>
          </MiniNode>
          <MiniNode tone="sky" className="h-[52px]">
            <p className="text-[5.5px] font-semibold">Tarefa</p>
            <MiniCheck>Revisar protótipo</MiniCheck>
            <span className="mt-1 w-fit border border-black/10 bg-black/5 px-0.5 text-[4px]">Alta</span>
          </MiniNode>
          <MiniNode tone="mint" className="h-[52px]">
            <p className="text-[5.5px] font-semibold">Checklist</p>
            <MiniCheck done>Escopo</MiniCheck>
            <MiniCheck>Publicar</MiniCheck>
            <MiniBar value={50} className="mt-1" />
          </MiniNode>
          <MiniNode tone="none" className="h-[52px]">
            <p className="text-[5.5px] font-semibold">Imagem</p>
            <div className="mt-0.5 h-6 w-full bg-gradient-to-br from-sky-200 to-emerald-100" />
          </MiniNode>
          <MiniNode tone="none" className="h-[52px]">
            <p className="text-[5.5px] font-semibold">Link</p>
            <p className="mt-0.5 text-[4.5px] text-muted-foreground">excalidraw.com</p>
            <span className="mt-auto text-[4px] text-primary">abrir ↗</span>
          </MiniNode>
          <MiniNode tone="lilac" className="h-[52px]">
            <p className="text-[5.5px] font-semibold">Quadro</p>
            <div className="mt-0.5 flex gap-0.5">
              <span className="h-4 flex-1 border border-white/50 bg-white/60" />
              <span className="h-4 flex-1 border border-white/50 bg-white/30" />
            </div>
          </MiniNode>
        </div>
        <MiniToolbar />
      </div>
    </PreviewShell>
  );
}

function NoteScene() {
  return (
    <PreviewShell tab="Nota" sidebar={false}>
      <div className="landing-canvas absolute inset-0 p-2">
        <MiniNode tone="amber" className="h-full">
          <div className="flex items-center gap-0.5 border-b border-black/10 pb-0.5 text-[4.5px] font-semibold opacity-60">
            <span className="border border-black/10 px-0.5">B</span>
            <span className="border border-black/10 px-0.5 italic">I</span>
            <span className="border border-black/10 px-0.5">H1</span>
            <span className="border border-black/10 px-0.5">•</span>
            <span className="border border-black/10 px-0.5">{"</>"}</span>
            <span className="ml-auto opacity-60">markdown</span>
          </div>
          <p className="mt-1 text-[7px] font-semibold leading-none">Perguntas da entrevista</p>
          <p className="mt-1 text-[4.8px] leading-[1.5] opacity-80">
            Antes de abrir o computador, onde as ideias costumam se perder?
          </p>
          <p className="mt-1 text-[4.8px] font-semibold leading-none opacity-80">Roteiro</p>
          <div className="mt-0.5 space-y-0.5 text-[4.5px] opacity-70">
            <p>• Como você organiza o dia?</p>
            <p>• O que costuma ficar de fora?</p>
            <p>• Onde o contexto se perde?</p>
          </div>
          <p className="mt-auto text-[4px] opacity-50">112 palavras · salvo automaticamente</p>
        </MiniNode>
      </div>
    </PreviewShell>
  );
}

function TasksScene() {
  return (
    <PreviewShell tab="Meu plano">
      <div className="landing-canvas absolute inset-0 p-2">
        <MiniNode tone="mint" className="absolute left-[4%] top-[6%] h-[64%] w-[45%]">
          <p className="text-[5.5px] font-semibold leading-none">Primeiros passos</p>
          <div className="mt-1 space-y-0.5 text-[4.5px]">
            <MiniCheck done>Explorar o canvas</MiniCheck>
            <MiniCheck done>Criar um quadro</MiniCheck>
            <MiniCheck>Experimentar o Excalidraw</MiniCheck>
          </div>
          <MiniBar value={66} className="mt-auto" />
          <p className="mt-0.5 text-[4px] opacity-50">2 de 3 concluídos</p>
        </MiniNode>
        <MiniNode tone="none" className="absolute right-[4%] top-[10%] h-[34%] w-[43%]">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 border border-current opacity-50" />
            <span className="text-[5px] font-medium">Definir o próximo projeto</span>
          </span>
          <div className="mt-auto flex items-center gap-0.5">
            <span className="border border-black/10 bg-black/5 px-0.5 text-[4px]">Alta</span>
            <span className="text-[4px] text-muted-foreground">Sex</span>
          </div>
        </MiniNode>
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 border border-border bg-popover px-1 py-0.5 text-[4.5px] text-muted-foreground shadow-sm">
          Enter cria a próxima tarefa
        </span>
      </div>
    </PreviewShell>
  );
}

function MediaScene() {
  return (
    <PreviewShell tab="Referências" sidebar={false}>
      <div className="absolute inset-0 bg-background p-2">
        <div className="flex items-center justify-between">
          <p className="text-[5.5px] font-semibold">Anexos locais</p>
          <span className="text-[4px] text-muted-foreground">3 arquivos · 12,8 MB</span>
        </div>
        <div className="mt-1 grid grid-cols-2 gap-1">
          <div className="h-[52px] border border-border bg-gradient-to-br from-sky-200 via-sky-100 to-emerald-100" />
          <div className="h-[52px] border border-border bg-gradient-to-br from-rose-200 via-amber-100 to-violet-200" />
        </div>
        <div className="mt-1 space-y-0.5">
          <div className="flex items-center gap-1 border border-border bg-card px-1 py-0.5 text-[4.5px]">
            <span className="h-2 w-2 bg-sky-300" />
            <span className="truncate">IMG_4821.jpg</span>
            <span className="ml-auto text-muted-foreground">2,4 MB</span>
          </div>
          <div className="flex items-center gap-1 border border-border bg-card px-1 py-0.5 text-[4.5px]">
            <span className="h-2 w-2 bg-rose-300" />
            <span className="truncate">briefing.pdf</span>
            <span className="ml-auto text-muted-foreground">840 KB</span>
          </div>
        </div>
        <span className="absolute bottom-2 left-2 border border-border bg-popover px-1 py-0.5 text-[4px] text-muted-foreground">
          duplo clique abre o lightbox
        </span>
      </div>
    </PreviewShell>
  );
}

function ColumnScene() {
  return (
    <PreviewShell tab="Meu plano">
      <div className="landing-canvas absolute inset-0 p-2">
        <div className="node-color-sky node-column absolute left-[5%] top-[5%] h-[78%] w-[54%] border p-1">
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            <span className="text-[5.5px] font-semibold">Meu plano</span>
            <span className="ml-auto text-[4px] opacity-50">3 itens</span>
          </div>
          <div className="mt-1 flex flex-col gap-1">
            <MiniNode tone="mint" className="h-[34px]">
              <p className="text-[5px] font-semibold">Checklist</p>
              <MiniCheck done>Explorar</MiniCheck>
            </MiniNode>
            <MiniNode tone="none" className="h-[28px]">
              <p className="text-[5px] font-medium">Definir projeto</p>
            </MiniNode>
            <MiniNode tone="amber" className="h-[24px]">
              <p className="text-[5px]">Referências</p>
            </MiniNode>
          </div>
          <span className="mt-auto text-[4px] opacity-50">+ adicionar</span>
        </div>
        <div className="absolute right-[4%] top-[12%] w-[35%] border border-border bg-popover p-1 shadow-sm">
          <p className="text-[4.5px] font-semibold">Coluna inteligente</p>
          <p className="mt-0.5 text-[4px] leading-relaxed text-muted-foreground">
            Arraste itens para dentro, recolha ou mova a coluna inteira.
          </p>
          <span className="mt-1 inline-flex border border-primary/30 bg-primary/10 px-1 py-0.5 text-[4px] text-primary">
            arraste para dentro
          </span>
        </div>
      </div>
    </PreviewShell>
  );
}

function CommentsScene() {
  return (
    <PreviewShell tab="Pesquisa" sidebar={false}>
      <div className="landing-canvas absolute inset-0 p-2">
        <MiniNode tone="none" className="absolute left-[6%] top-[8%] w-[72%]">
          <div className="flex items-center gap-1">
            <span className="grid h-3 w-3 place-items-center rounded-full bg-primary/15 text-[4px] font-semibold text-primary">
              A
            </span>
            <span className="text-[5px] font-medium">Ana Souza</span>
            <span className="text-[4px] text-muted-foreground">agora</span>
            <span className="ml-auto border border-emerald-500/30 bg-emerald-500/10 px-0.5 text-[3.5px] text-emerald-600 dark:text-emerald-400">
              aberto
            </span>
          </div>
          <p className="mt-1 text-[4.8px] leading-relaxed opacity-75">
            Esse bloco pode virar um subquadro para não poluir o canvas principal?
          </p>
          <div className="mt-1 border-l border-border pl-1">
            <p className="text-[4px] font-medium text-muted-foreground">Você</p>
            <p className="mt-0.5 text-[4.5px] opacity-70">Sim, vou separar em Identidade visual.</p>
          </div>
          <div className="mt-1 flex gap-1">
            <MiniButton>Responder</MiniButton>
            <MiniButton primary>Resolver</MiniButton>
          </div>
        </MiniNode>
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 border border-border bg-popover px-1 py-0.5 text-[4.5px] text-muted-foreground">
          2 respostas · autor local
        </span>
      </div>
    </PreviewShell>
  );
}

function DrawingScene({ withExport = false }: { withExport?: boolean }) {
  return (
    <PreviewShell tab="Fluxo de ideias" sidebar={false}>
      <div className="absolute inset-0 bg-background">
        <div className="absolute left-0 top-1/2 flex -translate-y-1/2 flex-col gap-0.5 border border-border bg-card p-0.5">
          {["bg-primary", "bg-muted", "bg-muted", "bg-muted", "bg-muted", "bg-muted"].map((tone, index) => (
            <span key={index} className={cn("h-2 w-2", tone)} />
          ))}
        </div>
        <span className="absolute left-2 top-1 border border-border bg-popover px-1 py-0.5 text-[4px]">
          Cena ▾
        </span>
        <svg className="absolute inset-0 h-full w-full text-foreground/70" viewBox="0 0 300 180" preserveAspectRatio="none">
          <rect x="36" y="34" width="66" height="38" rx="2" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <text x="48" y="56" fontSize="7" fill="currentColor" stroke="none">ideia</text>
          <ellipse cx="190" cy="53" rx="38" ry="22" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <text x="176" y="56" fontSize="7" fill="currentColor" stroke="none">projeto</text>
          <path d="M104 53 C 128 53, 140 53, 150 53" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <path d="M147 50 L153 53 L147 56" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <path d="M60 112 q 18 -18 36 0 t 36 0" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <path d="M160 116 l 30 -14 l 4 30 z" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <text x="38" y="138" fontSize="6" fill="currentColor" stroke="none">brainstorm</text>
        </svg>
        <div className="absolute bottom-1 right-1 border border-border bg-popover px-1 py-0.5 text-[4px] text-muted-foreground">
          100%
        </div>
        {withExport ? (
          <div className="absolute inset-0 grid place-items-center bg-background/40 p-2">
            <div className="w-[62%] border border-border bg-card p-1.5 shadow-panel">
              <p className="text-[5.5px] font-semibold">Exportar desenho</p>
              <div className="mt-1 grid grid-cols-3 gap-0.5">
                <span className="border border-primary bg-primary/10 py-0.5 text-center text-[4px] text-primary">PNG</span>
                <span className="border border-border py-0.5 text-center text-[4px]">SVG</span>
                <span className="border border-border py-0.5 text-center text-[4px]">PDF</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[4px] text-muted-foreground">escala 2x</span>
                <MiniButton primary>Exportar</MiniButton>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </PreviewShell>
  );
}

function MergeScene() {
  return (
    <PreviewShell tab="Cena" sidebar={false}>
      <div className="absolute inset-0 bg-background p-2">
        <div className="flex items-center justify-center gap-1">
          <div className="h-9 w-[30%] border border-border bg-gradient-to-br from-sky-100 to-sky-200" />
          <span className="text-[6px] text-muted-foreground">＋</span>
          <div className="h-9 w-[30%] border border-border bg-gradient-to-br from-amber-100 to-rose-200" />
        </div>
        <p className="mt-1 text-center text-[4.5px] text-muted-foreground">duas cenas</p>
        <div className="mt-1 flex justify-center text-[5px] text-primary">↓</div>
        <div className="mt-1 h-[58px] w-full border border-border bg-gradient-to-r from-sky-100 via-violet-100 to-amber-100" />
        <div className="absolute right-1 top-6 w-[38%] border border-border bg-popover p-1 shadow-panel">
          <p className="text-[4.5px] font-semibold">Cena</p>
          <p className="mt-0.5 border border-border bg-background px-1 py-0.5 text-[4px]">Colar cena</p>
          <p className="mt-0.5 border border-border bg-background px-1 py-0.5 text-[4px]">Importar .excalidraw</p>
          <p className="mt-0.5 border border-primary bg-primary/10 px-1 py-0.5 text-[4px] text-primary">
            Mesclar desenho do workspace
          </p>
        </div>
        <span className="absolute bottom-1 left-2 border border-border bg-popover px-1 py-0.5 text-[4px] text-muted-foreground">
          bindings preservados
        </span>
      </div>
    </PreviewShell>
  );
}

function TabsScene() {
  return (
    <PreviewShell tab="Abas">
      <div className="absolute inset-0 flex flex-col">
        <div className="flex items-center gap-0.5 border-b border-border bg-background px-1 py-0.5">
          <span className="flex items-center gap-0.5 border border-border bg-muted/70 px-1 py-0.5 text-[4.5px] font-medium">
            <span className="h-0.5 w-0.5 rounded-full bg-sky-400" /> Pesquisa
          </span>
          <span className="flex items-center gap-0.5 px-1 py-0.5 text-[4.5px] text-muted-foreground">
            <span className="h-0.5 w-0.5 rounded-full bg-rose-400" /> Moodboard
          </span>
          <span className="text-[4.5px] text-muted-foreground">+</span>
          <span className="ml-auto text-[4px] text-muted-foreground">Ctrl/Cmd + W</span>
        </div>
        <div className="landing-canvas relative flex-1 p-2">
          <MiniNode tone="amber" className="absolute left-[6%] top-[10%] w-[40%]">
            <p className="text-[5px] font-semibold">Quadro em aba</p>
            <p className="mt-0.5 text-[4px] opacity-70">Cada quadro abre em uma aba independente.</p>
          </MiniNode>
          <div className="absolute right-[6%] top-[18%] w-[32%] border border-border bg-popover p-1 shadow-sm">
            <p className="text-[4px] font-semibold">Workspace</p>
            <p className="mt-0.5 text-[4px] text-muted-foreground">Espaço pessoal ▾</p>
          </div>
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 border border-border bg-popover px-1 py-0.5 text-[4px] text-muted-foreground">
            clique do meio fecha a aba
          </span>
        </div>
      </div>
    </PreviewShell>
  );
}

function SearchScene() {
  return (
    <PreviewShell tab="Busca global">
      <div className="landing-canvas absolute inset-0">
        <BoardNodes />
        <div className="absolute inset-0 bg-background/45" />
        <div className="absolute left-1/2 top-1/2 w-[82%] -translate-x-1/2 -translate-y-1/2 border border-border bg-popover shadow-panel">
          <div className="flex items-center gap-1 border-b border-border px-1.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full border border-muted-foreground/60" />
            <span className="text-[5px]">ident</span>
            <span className="ml-auto text-[4px] text-muted-foreground">Ctrl/Cmd + K</span>
          </div>
          <div className="p-1">
            {[
              ["Nota", "Identidade visual", "bg-amber-400"],
              ["Quadro", "Identidade", "bg-violet-400"],
              ["Tarefa", "Revisar identidade", "bg-sky-400"],
            ].map(([kind, title, dot]) => (
              <div key={title} className="flex items-center gap-1 border-b border-border/60 px-1 py-1 last:border-0">
                <span className={cn("h-1 w-1 rounded-full", dot)} />
                <span className="text-[4.8px]">{title}</span>
                <span className="ml-auto border border-border px-0.5 text-[3.5px] text-muted-foreground">{kind}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 border-t border-border px-1.5 py-0.5 text-[3.8px] text-muted-foreground">
            <span>↑↓ navegar</span>
            <span>Enter abrir</span>
            <span className="ml-auto">todos os workspaces</span>
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}

function ReferencesScene() {
  return (
    <PreviewShell tab="Referências">
      <div className="landing-canvas absolute inset-0">
        <MiniNode tone="amber" className="absolute left-[4%] top-[12%] w-[40%]">
          <p className="text-[5px] font-semibold">Identidade visual</p>
          <p className="mt-0.5 text-[4px] opacity-70">Nota com referências bidirecionais.</p>
        </MiniNode>
        <div className="absolute right-0 top-0 h-full w-[48%] border-l border-border bg-card p-1.5">
          <p className="text-[5px] font-semibold">Inspector</p>
          <p className="mt-1 text-[4px] font-semibold uppercase tracking-wider text-muted-foreground">Refs</p>
          <div className="mt-0.5 flex flex-wrap gap-0.5">
            <MiniChip active>Moodboard</MiniChip>
            <MiniChip>Lançamento</MiniChip>
            <MiniChip>+ quadro</MiniChip>
          </div>
          <p className="mt-1.5 text-[4px] font-semibold uppercase tracking-wider text-muted-foreground">
            Backlinks (2)
          </p>
          <div className="mt-0.5 space-y-0.5 text-[4px]">
            <p className="border border-border bg-background px-1 py-0.5">Pesquisa de campo</p>
            <p className="border border-border bg-background px-1 py-0.5">Reunião de kickoff</p>
          </div>
          <span className="mt-1 inline-flex border border-primary/30 bg-primary/10 px-1 py-0.5 text-[4px] text-primary">
            aponta para você
          </span>
        </div>
      </div>
    </PreviewShell>
  );
}

function TemplatesScene() {
  return (
    <PreviewShell tab="Modelos" sidebar={false}>
      <div className="landing-canvas absolute inset-0 p-2">
        <div className="absolute inset-0 bg-background/35" />
        <div className="relative mx-auto w-[86%] border border-border bg-card p-1.5 shadow-panel">
          <div className="flex items-center gap-1">
            <p className="text-[5.5px] font-semibold">Modelos</p>
            <span className="ml-auto text-[4px] text-muted-foreground">9 prontos</span>
          </div>
          <div className="mt-1 grid grid-cols-3 gap-1">
            {[
              ["Brainstorm", "from-amber-200 to-amber-100"],
              ["Projeto", "from-sky-200 to-sky-100"],
              ["Kanban", "from-emerald-200 to-emerald-100"],
              ["Ata", "from-rose-200 to-rose-100"],
              ["Pesquisa", "from-violet-200 to-violet-100"],
              ["Semana", "from-orange-200 to-orange-100"],
            ].map(([label, gradient]) => (
              <div key={label} className="border border-border">
                <div className={cn("h-5 w-full bg-gradient-to-br", gradient)} />
                <p className="px-0.5 py-0.5 text-[4px]">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-1 flex justify-end">
            <MiniButton primary>Usar modelo</MiniButton>
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}

function AutosaveScene() {
  return (
    <PreviewShell tab="Autosave">
      <div className="landing-canvas absolute inset-0">
        <BoardNodes />
        <div className="absolute bottom-2 left-2 w-[54%] border border-border bg-card p-1.5 shadow-panel">
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            <p className="text-[5px] font-semibold">Salvo agora</p>
            <span className="ml-auto text-[4px] text-muted-foreground">SQLite</span>
          </div>
          <div className="mt-1 space-y-0.5 text-[4px] text-muted-foreground">
            <p>Autosave incremental por quadro</p>
            <p>debounce de 700 ms · backups a cada 20 min</p>
          </div>
          <div className="mt-1 flex gap-0.5">
            <span className="h-0.5 flex-1 bg-emerald-500" />
            <span className="h-0.5 flex-1 bg-emerald-500/70" />
            <span className="h-0.5 flex-1 bg-border" />
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}

function BackupsScene() {
  return (
    <PreviewShell tab="Backups" sidebar={false}>
      <div className="absolute inset-0 bg-background p-2">
        <div className="flex items-center justify-between">
          <p className="text-[5.5px] font-semibold">Backups automáticos</p>
          <MiniButton primary>Backup agora</MiniButton>
        </div>
        <div className="mt-1 space-y-0.5">
          {[
            ["Hoje · 12:40", "1,8 MB"],
            ["Hoje · 12:20", "1,8 MB"],
            ["Hoje · 12:00", "1,7 MB"],
          ].map(([date, size]) => (
            <div key={date} className="flex items-center gap-1 border border-border bg-card px-1 py-1 text-[4.5px]">
              <span className="h-1 w-1 rounded-full bg-primary/50" />
              <span>{date}</span>
              <span className="ml-auto text-muted-foreground">{size}</span>
              <span className="border border-border bg-background px-1 py-0.5 text-[3.8px] text-primary">Restaurar</span>
            </div>
          ))}
        </div>
        <p className="mt-1 text-[4px] text-muted-foreground">Retenção: 20 snapshots · restauração com um clique</p>
      </div>
    </PreviewShell>
  );
}

function ExportScene() {
  return (
    <PreviewShell tab="Exportar" sidebar={false}>
      <div className="landing-canvas absolute inset-0 p-2">
        <div className="absolute inset-0 bg-background/40" />
        <div className="relative mx-auto mt-2 w-[80%] border border-border bg-card p-2 shadow-panel">
          <p className="text-[6px] font-semibold">Exportar quadro</p>
          <div className="mt-1 grid grid-cols-2 gap-1">
            {[
              ["PNG", "imagem do quadro"],
              ["PDF", "documento"],
              ["Markdown", "colunas e notas"],
              ["JSON", "backup reimportável"],
            ].map(([format, hint], index) => (
              <div
                key={format}
                className={cn(
                  "border px-1 py-1",
                  index === 0 ? "border-primary bg-primary/10 text-primary" : "border-border bg-background",
                )}
              >
                <p className="text-[5px] font-semibold">{format}</p>
                <p className="text-[3.8px] text-muted-foreground">{hint}</p>
              </div>
            ))}
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <div className="flex gap-0.5">
              <MiniChip active>1x</MiniChip>
              <MiniChip>2x</MiniChip>
              <MiniChip>3x</MiniChip>
            </div>
            <MiniButton primary>Exportar</MiniButton>
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}

function ObsidianScene() {
  return (
    <PreviewShell tab="Importar cofre" sidebar={false}>
      <div className="grid h-full grid-cols-[42%_58%]">
        <div className="border-r border-border bg-[hsl(var(--sidebar))] p-1.5">
          <p className="text-[4.5px] font-semibold uppercase tracking-wider text-muted-foreground">Cofre</p>
          <div className="mt-1 space-y-0.5 text-[4.5px]">
            <p>▾ Projetos</p>
            <p className="pl-2 text-muted-foreground">Pesquisa</p>
            <p className="pl-2 text-muted-foreground">Identidade</p>
            <p>▾ Diário</p>
            <p>▾ Referências</p>
            <p>▸ Anexos</p>
          </div>
        </div>
        <div className="bg-background p-2">
          <p className="text-[5.5px] font-semibold">Importar como workspace</p>
          <p className="mt-0.5 text-[4px] leading-relaxed text-muted-foreground">
            Pastas viram quadros, notas viram Markdown e anexos ficam locais.
          </p>
          <div className="mt-1 grid grid-cols-3 gap-0.5 text-center">
            <div className="border border-border bg-card py-1">
              <p className="text-[6px] font-semibold">64</p>
              <p className="text-[3.5px] text-muted-foreground">notas</p>
            </div>
            <div className="border border-border bg-card py-1">
              <p className="text-[6px] font-semibold">8</p>
              <p className="text-[3.5px] text-muted-foreground">quadros</p>
            </div>
            <div className="border border-border bg-card py-1">
              <p className="text-[6px] font-semibold">12</p>
              <p className="text-[3.5px] text-muted-foreground">anexos</p>
            </div>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="border border-emerald-500/30 bg-emerald-500/10 px-1 py-0.5 text-[3.8px] text-emerald-600 dark:text-emerald-400">
              sem upload
            </span>
            <MiniButton primary>Importar cofre</MiniButton>
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}

function AppearanceScene() {
  return (
    <PreviewShell tab="Aparência" sidebar={false}>
      <div className="grid h-full grid-cols-[56%_44%]">
        <div className="bg-background p-2">
          <p className="text-[5px] font-semibold">Aparência</p>
          <p className="mt-1 text-[4px] uppercase tracking-wider text-muted-foreground">Tema</p>
          <div className="mt-0.5 flex gap-0.5">
            <MiniChip>Claro</MiniChip>
            <MiniChip active>Escuro</MiniChip>
            <MiniChip>Sistema</MiniChip>
          </div>
          <p className="mt-1.5 text-[4px] uppercase tracking-wider text-muted-foreground">Cor de destaque</p>
          <div className="mt-0.5 flex gap-1">
            {["bg-sky-500", "bg-emerald-500", "bg-rose-500", "bg-amber-500", "bg-slate-500"].map((tone) => (
              <span key={tone} className={cn("h-2 w-2 rounded-full", tone)} />
            ))}
          </div>
          <p className="mt-1.5 text-[4px] uppercase tracking-wider text-muted-foreground">Densidade</p>
          <div className="mt-0.5 flex gap-0.5">
            <MiniChip active>Confortável</MiniChip>
            <MiniChip>Compacta</MiniChip>
          </div>
        </div>
        <div className="landing-canvas border-l border-border p-1.5">
          <div className="node-color-lilac node-surface border p-1">
            <p className="text-[5px] font-semibold">Prévia</p>
            <p className="mt-0.5 text-[4px] opacity-60">tema e escala aplicados</p>
            <div className="mt-1 h-0.5 w-3/4 bg-current opacity-20" />
            <div className="mt-0.5 h-0.5 w-1/2 bg-current opacity-20" />
          </div>
          <div className="mt-1 flex gap-0.5">
            <MiniChip active>16 px</MiniChip>
            <MiniChip>24 px</MiniChip>
            <MiniChip>32 px</MiniChip>
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}

function HistoryScene() {
  return (
    <PreviewShell tab="Histórico">
      <div className="landing-canvas absolute inset-0">
        <BoardNodes />
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 border border-border bg-popover px-1.5 py-1 shadow-panel">
          <span className="grid h-3 w-3 place-items-center border border-border text-[5px]">↶</span>
          <p className="text-[4.8px]">Alteração desfeita</p>
          <span className="ml-1 border border-border px-1 py-0.5 text-[3.8px] text-muted-foreground">Ctrl/Cmd + Z</span>
        </div>
        <div className="absolute right-1 top-1 w-[30%] border border-border bg-card p-1 shadow-sm">
          <p className="text-[4.5px] font-semibold">Histórico</p>
          <div className="mt-0.5 space-y-0.5 text-[3.8px] text-muted-foreground">
            <p>Edição · agora</p>
            <p>Arraste · 12:41</p>
            <p>Criação · 12:40</p>
          </div>
          <div className="mt-1 flex gap-0.5">
            <MiniChip active>↶</MiniChip>
            <MiniChip>↷</MiniChip>
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}

function sceneFor(feature: Feature) {
  switch (feature.id) {
    case "canvas-infinito":
      return <BoardScene />;
    case "encaixe-grade":
      return <BoardScene variant="grid" />;
    case "selecao-multipla":
      return <BoardScene variant="selection" />;
    case "mover-entre-quadros":
      return <BoardScene variant="transfer" />;
    case "conectores":
      return <BoardScene variant="connectors" />;
    case "quadros-aninhados":
      return <BoardScene variant="nested" />;
    case "tipos-de-elementos":
      return <ElementsScene />;
    case "notas-markdown":
      return <NoteScene />;
    case "tarefas-checklists":
      return <TasksScene />;
    case "midia-local":
      return <MediaScene />;
    case "colunas":
      return <ColumnScene />;
    case "comentarios":
      return <CommentsScene />;
    case "excalidraw":
      return <DrawingScene />;
    case "mesclar-cenas":
      return <MergeScene />;
    case "exportar-desenho":
      return <DrawingScene withExport />;
    case "workspaces-abas":
      return <TabsScene />;
    case "busca-global":
      return <SearchScene />;
    case "referencias":
      return <ReferencesScene />;
    case "modelos":
      return <TemplatesScene />;
    case "autosave":
      return <AutosaveScene />;
    case "backups":
      return <BackupsScene />;
    case "exportar-importar":
      return <ExportScene />;
    case "obsidian":
      return <ObsidianScene />;
    case "personalizacao":
      return <AppearanceScene />;
    case "historico":
      return <HistoryScene />;
    default:
      return <BoardScene />;
  }
}

export function FeaturePreview({ feature }: { feature: Feature }) {
  return <div className="h-full w-full">{sceneFor(feature)}</div>;
}
