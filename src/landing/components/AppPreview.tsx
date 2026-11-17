import {
  ChevronsUpDown,
  CircleCheck,
  Database,
  Image,
  ListChecks,
  MoreHorizontal,
  MousePointer2,
  PanelRight,
  PenTool,
  Plus,
  Search,
  Settings,
  StickyNote,
  Sun,
  X,
} from "lucide-react";
import { AppMark } from "@/components/brand/AppMark";
import { cn } from "@/lib/utils";

function SidebarRow({
  label,
  dot,
  indent = false,
  active = false,
}: {
  label: string;
  dot: string;
  indent?: boolean;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 px-1 py-[3px] text-[7.5px] leading-none",
        indent && "pl-3",
        active ? "bg-muted/70 font-medium text-foreground" : "text-muted-foreground",
      )}
    >
      <span className={cn("h-1 w-1 shrink-0 rounded-full", dot)} aria-hidden />
      <span className="truncate">{label}</span>
    </div>
  );
}

function CanvasTool({ icon: Icon, active = false }: { icon: typeof PenTool; active?: boolean }) {
  return (
    <span
      className={cn(
        "grid h-4 w-4 place-items-center",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground",
      )}
      aria-hidden
    >
      <Icon className="h-2.5 w-2.5" />
    </span>
  );
}

export function AppPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[560px] select-none" aria-hidden="true">
      <div className="landing-preview-frame overflow-hidden border border-border bg-background shadow-panel">
        {/* Barra de título */}
        <div className="flex h-8 items-center gap-1.5 border-b border-border bg-[hsl(var(--sidebar))] px-2">
          <span className="grid h-4 w-4 place-items-center rounded-sm border border-border bg-card text-foreground">
            <AppMark className="h-2.5 w-2.5" />
          </span>
          <span className="text-[8.5px] font-semibold tracking-tight">EliasNote</span>
          <span className="hidden text-[7.5px] text-muted-foreground sm:inline">Canvas local-first</span>
          <span className="ml-auto flex items-center gap-1.5 text-muted-foreground">
            <Search className="h-2.5 w-2.5" />
            <Sun className="h-2.5 w-2.5" />
            <Settings className="h-2.5 w-2.5" />
          </span>
        </div>

        <div className="flex h-[300px] sm:h-[360px] lg:h-[380px]">
          {/* Barra lateral */}
          <div className="hidden w-[136px] shrink-0 flex-col border-r border-border bg-[hsl(var(--sidebar))] p-1.5 sm:flex">
            <div className="flex items-center gap-1 border border-border bg-background px-1 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" aria-hidden />
              <span className="truncate text-[7.5px] font-medium">Estúdio Elias</span>
              <ChevronsUpDown className="ml-auto h-2 w-2 text-muted-foreground" />
            </div>

            <p className="mt-2 px-1 text-[6.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Quadros
            </p>
            <div className="mt-1 space-y-px">
              <SidebarRow label="Pesquisa de campo" dot="bg-sky-400" active />
              <SidebarRow label="Identidade visual" dot="bg-violet-400" indent />
              <SidebarRow label="Referências" dot="bg-amber-400" indent />
              <SidebarRow label="Lançamento" dot="bg-emerald-400" />
              <SidebarRow label="Reuniões" dot="bg-orange-300" />
            </div>

            <div className="mt-auto border-t border-border pt-1.5">
              <p className="flex items-center gap-1 text-[6.5px] text-muted-foreground">
                <CircleCheck className="h-2 w-2 animate-pulse text-emerald-500" /> Salvo agora
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[6.5px] text-muted-foreground/70">
                <Database className="h-2 w-2" /> SQLite local
              </p>
            </div>
          </div>

          {/* Área principal */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex h-7 items-center gap-1 border-b border-border px-1.5">
              <div className="flex h-5 items-center gap-1 border border-border bg-muted/60 px-1 text-[7.5px] font-medium">
                <span className="h-1 w-1 rounded-full bg-sky-400" aria-hidden />
                Pesquisa de campo
                <X className="h-2 w-2 text-muted-foreground" />
              </div>
              <div className="flex h-5 items-center gap-1 px-1 text-[7.5px] text-muted-foreground">
                <span className="h-1 w-1 rounded-full bg-rose-400" aria-hidden />
                Moodboard
              </div>
              <Plus className="h-2.5 w-2.5 text-muted-foreground" />
              <div className="ml-auto flex items-center gap-1.5 text-muted-foreground">
                <PanelRight className="h-2.5 w-2.5" />
                <MoreHorizontal className="h-2.5 w-2.5" />
              </div>
            </div>

            {/* Canvas */}
            <div className="landing-canvas relative min-h-0 flex-1 overflow-hidden">
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 400 340"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path
                  className="landing-connector"
                  d="M200 40 C 214 92, 186 128, 200 176"
                  fill="none"
                  stroke="hsl(var(--muted-foreground) / 0.45)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <path
                  d="M200 240 C 206 262, 194 274, 200 292"
                  fill="none"
                  stroke="hsl(var(--muted-foreground) / 0.35)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <circle cx="200" cy="40" r="1.6" fill="hsl(var(--primary))" />
                <circle cx="200" cy="176" r="1.6" fill="hsl(var(--primary))" />
              </svg>

              <div className="relative z-10 grid h-full grid-cols-2 content-start gap-x-3 gap-y-3 p-2.5 pb-12">
                {/* Nota */}
                <div className="node-color-amber node-surface flex h-[86px] flex-col border p-1.5 sm:h-[104px]">
                  <p className="text-[7.5px] font-semibold leading-none">Perguntas da entrevista</p>
                  <p className="mt-1 line-clamp-3 text-[6.5px] leading-[1.5] opacity-70">
                    O que as pessoas fazem antes de abrir o computador? Onde as ideias se perdem entre a reunião e a
                    execução?
                  </p>
                  <p className="mt-auto text-[6px] opacity-50">62 palavras · markdown</p>
                </div>

                {/* Cartão com referência visual */}
                <div className="node-color-none node-surface flex h-[86px] flex-col border p-1.5 sm:h-[104px]">
                  <p className="text-[7.5px] font-semibold leading-none">Moodboard</p>
                  <div className="relative mt-1 h-[46px] overflow-hidden border border-black/5 bg-gradient-to-br from-sky-200 via-sky-100 to-emerald-100 sm:h-[62px]">
                    <span className="absolute right-1.5 top-1 h-2.5 w-2.5 rounded-full bg-white/80" />
                    <span
                      className="absolute -bottom-3 left-1 h-8 w-10 bg-emerald-300/70"
                      style={{ clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }}
                    />
                    <span
                      className="absolute -bottom-4 right-2 h-9 w-12 bg-sky-400/50"
                      style={{ clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }}
                    />
                    <span className="absolute bottom-1 left-1 flex items-center gap-0.5 text-[5.5px] text-slate-700/80">
                      <Image className="h-2 w-2" /> 8 referências
                    </span>
                  </div>
                  <p className="mt-auto text-[6px] text-muted-foreground">Anexos locais</p>
                </div>

                {/* Checklist */}
                <div className="node-color-mint node-surface relative flex h-[86px] flex-col border p-1.5 sm:h-[104px]">
                  <div className="flex items-center gap-1">
                    <ListChecks className="h-2.5 w-2.5 opacity-70" />
                    <p className="text-[7.5px] font-semibold leading-none">Checklist de lançamento</p>
                  </div>
                  <ul className="mt-1 space-y-[3px] text-[6.5px] leading-none">
                    <li className="flex items-center gap-1 opacity-70">
                      <span className="grid h-2 w-2 place-items-center bg-[var(--node-accent)] text-white">
                        <span className="text-[5px] leading-none">✓</span>
                      </span>
                      <span className="line-through">Fechar escopo</span>
                    </li>
                    <li className="flex items-center gap-1 opacity-70">
                      <span className="grid h-2 w-2 place-items-center bg-[var(--node-accent)] text-white">
                        <span className="text-[5px] leading-none">✓</span>
                      </span>
                      <span className="line-through">Revisar protótipo</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <span className="h-2 w-2 border border-current opacity-60" />
                      Publicar landing
                    </li>
                  </ul>
                  <div className="mt-auto">
                    <div className="h-1 w-full bg-black/10">
                      <div className="h-full w-2/3 bg-[var(--node-accent)]" />
                    </div>
                    <p className="mt-1 hidden text-[6px] opacity-55 sm:block">2 de 3 concluídos</p>
                  </div>
                  <span className="absolute -right-1 -top-1 h-1.5 w-1.5 border border-primary bg-background" />
                  <span className="absolute -bottom-1 -right-1 h-1.5 w-1.5 border border-primary bg-background" />
                </div>

                {/* Quadro */}
                <div className="node-color-lilac node-surface flex h-[86px] flex-col border p-1.5 sm:h-[104px]">
                  <p className="text-[7.5px] font-semibold leading-none">Identidade visual</p>
                  <div className="mt-1 flex gap-1">
                    <div className="h-[34px] flex-1 border border-white/50 bg-white/60" />
                    <div className="h-[34px] flex-1 border border-white/50 bg-white/40" />
                    <div className="h-[34px] flex-1 border border-white/50 bg-white/25" />
                  </div>
                  <p className="mt-auto flex items-center gap-1 text-[6px] opacity-55">12 elementos · 3 subquadros</p>
                </div>

                {/* Tarefa */}
                <div className="node-color-sky node-surface col-span-2 flex h-[34px] items-center gap-1.5 border px-1.5">
                  <span className="h-2.5 w-2.5 shrink-0 border border-current opacity-60" />
                  <p className="truncate text-[7px] font-medium">Enviar convite para a entrevista</p>
                  <span className="ml-auto shrink-0 border border-black/10 bg-black/5 px-1 py-[1px] text-[5.5px]">
                    Alta
                  </span>
                  <span className="shrink-0 text-[5.5px] opacity-60">Sex</span>
                </div>
              </div>

              {/* Barra flutuante */}
              <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 items-center gap-0.5 border border-border bg-popover/95 p-0.5 shadow-floating">
                <CanvasTool icon={MousePointer2} active />
                <CanvasTool icon={StickyNote} />
                <CanvasTool icon={ListChecks} />
                <CanvasTool icon={Image} />
                <CanvasTool icon={PenTool} />
                <span className="mx-0.5 h-3 w-px bg-border" />
                <span className="px-1 text-[6.5px] text-muted-foreground">100%</span>
              </div>

              {/* Minimapa */}
              <div className="absolute bottom-2 right-2 z-20 h-9 w-14 border border-border bg-popover/85 p-1 shadow-floating">
                <div className="relative h-full w-full bg-muted/60">
                  <span className="absolute inset-x-1 inset-y-0.5 border border-primary/60" />
                  <span className="absolute left-1.5 top-1 h-1 w-3 bg-amber-300" />
                  <span className="absolute right-1.5 top-1 h-1 w-2 bg-violet-300" />
                  <span className="absolute bottom-1 left-2 h-1 w-4 bg-emerald-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Etiquetas flutuantes */}
      <div className="landing-float absolute -left-4 top-16 hidden items-center gap-1.5 border border-border bg-popover/95 px-2 py-1 text-[10px] text-muted-foreground shadow-floating backdrop-blur xl:flex">
        <Database className="h-3 w-3 text-primary" />
        SQLite local
      </div>
      <div
        className="landing-float absolute -right-3 bottom-24 hidden items-center gap-1.5 border border-border bg-popover/95 px-2 py-1 text-[10px] text-muted-foreground shadow-floating backdrop-blur xl:flex"
        style={{ animationDelay: "1.2s" }}
      >
        <PenTool className="h-3 w-3 text-primary" />
        Excalidraw nativo
      </div>
    </div>
  );
}
