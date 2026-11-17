import { useCallback, useEffect, useState, type MouseEvent } from "react";
import {
  ArrowUp,
  Download,
  Home as HomeIcon,
  Info,
  LayoutGrid,
  Mail,
  Moon,
  Sun,
} from "lucide-react";
import { AppMark } from "@/components/brand/AppMark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal, useReducedMotion } from "@/landing/components/animate";
import { Container } from "@/landing/components/ui";
import { About } from "@/landing/sections/About";
import { Contact } from "@/landing/sections/Contact";
import { Downloads } from "@/landing/sections/Downloads";
import { Features } from "@/landing/sections/Features";
import { Home as HomeSection } from "@/landing/sections/Home";
import {
  APP_VERSION,
  DOCS_URL,
  ISSUES_URL,
  LICENSE_URL,
  RELEASES_PAGE_URL,
  RELEASES_URL,
  REPO_URL,
  TABS,
  parseTab,
  type TabId,
} from "@/landing/site";
import { cn } from "@/lib/utils";

const THEME_KEY = "eliasnote-landing-theme";
const ACCENT_KEY = "eliasnote-landing-accent";

type ThemeMode = "light" | "dark";
type AccentId = "blue" | "emerald" | "rose" | "amber" | "slate";

const ACCENTS: { id: AccentId; label: string; color: string }[] = [
  { id: "blue", label: "Azul", color: "#2f7fe0" },
  { id: "emerald", label: "Esmeralda", color: "#159a6a" },
  { id: "rose", label: "Rosa", color: "#e0436e" },
  { id: "amber", label: "Âmbar", color: "#d98a0b" },
  { id: "slate", label: "Ardósia", color: "#5b6472" },
];

const TAB_ICONS: Record<TabId, typeof HomeIcon> = {
  principal: HomeIcon,
  funcionalidades: LayoutGrid,
  downloads: Download,
  sobre: Info,
  contato: Mail,
};

const PAGE_TITLES: Record<TabId, string> = {
  principal: "EliasNote — canvas infinito, 100% offline",
  funcionalidades: "Funcionalidades · EliasNote",
  downloads: "Downloads · EliasNote",
  sobre: "Sobre · EliasNote",
  contato: "Contato · EliasNote",
};

function readStored(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* modo privado ou armazenamento bloqueado */
  }
}

function initialTheme(): ThemeMode {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function initialAccent(): AccentId {
  const value = document.documentElement.dataset.accent;
  return ACCENTS.some((accent) => accent.id === value) ? (value as AccentId) : "blue";
}

function navClickHandler(tab: TabId, onNavigate: (target: TabId) => void) {
  return (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onNavigate(tab);
  };
}

function TabLink({
  tab,
  active,
  onNavigate,
}: {
  tab: (typeof TABS)[number];
  active: boolean;
  onNavigate: (target: TabId) => void;
}) {
  const Icon = TAB_ICONS[tab.id];
  return (
    <a
      href={`#${tab.id}`}
      aria-current={active ? "page" : undefined}
      onClick={navClickHandler(tab.id, onNavigate)}
      className={cn(
        "group inline-flex h-8 shrink-0 items-center gap-1.5 border px-2 text-[12px] transition-colors",
        active
          ? "border-border bg-muted/70 font-medium text-foreground"
          : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground",
      )}
    >
      <Icon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
      {tab.label}
    </a>
  );
}

function SiteFooter({ onNavigate }: { onNavigate: (target: TabId) => void }) {
  const year = new Date().getFullYear();
  const resources = [
    { label: "Repositório", href: REPO_URL },
    { label: "Releases", href: RELEASES_PAGE_URL },
    { label: "Issues", href: ISSUES_URL },
    { label: "Documentação", href: DOCS_URL },
    { label: "Licença MIT", href: LICENSE_URL },
  ];

  return (
    <footer className="mt-auto border-t border-border bg-[hsl(var(--sidebar))]">
      <Container className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <Reveal className="sm:col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-card text-foreground shadow-sm">
              <AppMark className="h-4 w-4" />
            </span>
            <span className="text-[13px] font-semibold tracking-tight">EliasNote</span>
            <Badge variant="outline">v{APP_VERSION}</Badge>
          </div>
          <p className="mt-3 max-w-sm text-[12px] leading-relaxed text-muted-foreground">
            Organização visual local-first com canvas infinito e Excalidraw nativo. 100% offline, sem contas e sem
            sincronização.
          </p>
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
            Feito para rodar sem internet
          </p>
        </Reveal>

        <Reveal delay={90}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Navegar</p>
          <ul className="mt-2.5 space-y-1.5">
            {TABS.map((tab) => (
              <li key={tab.id}>
                <a
                  href={`#${tab.id}`}
                  onClick={navClickHandler(tab.id, onNavigate)}
                  className="text-[12px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {tab.label}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={160}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Recursos</p>
          <ul className="mt-2.5 space-y-1.5">
            {resources.map((resource) => (
              <li key={resource.label}>
                <a
                  href={resource.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[12px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {resource.label}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>

      <div className="border-t border-border">
        <Container className="flex flex-col gap-1.5 py-4 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} EliasNote · código aberto sob licença MIT</p>
          <p>Tauri 2 · React · Excalidraw · sem cookies de rastreio</p>
        </Container>
      </div>
    </footer>
  );
}

export function LandingApp() {
  const [active, setActive] = useState<TabId>(() => parseTab(window.location.hash));
  const [theme, setTheme] = useState<ThemeMode>(initialTheme);
  const [accent, setAccent] = useState<AccentId>(initialAccent);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const reducedMotion = useReducedMotion();

  const scrollToTop = useCallback(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const navigate = useCallback(
    (tab: TabId) => {
      // Volta ao topo antes de montar a nova aba: assim as revelações por scroll
      // começam do zero em vez de já nascerem visíveis na posição anterior.
      scrollToTop();
      setActive(tab);
      try {
        window.history.pushState(null, "", `#${tab}`);
      } catch {
        window.location.hash = tab;
      }
    },
    [scrollToTop],
  );

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    document.querySelector('meta[name="color-scheme"]')?.setAttribute("content", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.accent = accent;
  }, [accent]);

  useEffect(() => {
    document.title = PAGE_TITLES[active];
    scrollToTop();
  }, [active, scrollToTop]);

  useEffect(() => {
    const sync = () => {
      scrollToTop();
      setActive(parseTab(window.location.hash));
    };
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, [scrollToTop]);

  useEffect(() => {
    const stored = readStored(THEME_KEY);
    if (stored === "light" || stored === "dark") return;
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setTheme(query.matches ? "dark" : "light");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const root = document.documentElement;
      const max = root.scrollHeight - window.innerHeight;
      const top = window.scrollY;
      setProgress(max > 0 ? Math.min(1, Math.max(0, top / max)) : 0);
      setScrolled(top > 8);
      setShowTop(top > 720);
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [active]);

  function toggleTheme() {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(next);
    writeStored(THEME_KEY, next);
  }

  function changeAccent(next: AccentId) {
    setAccent(next);
    writeStored(ACCENT_KEY, next);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header
        className="landing-header sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl"
        data-scrolled={scrolled ? "true" : "false"}
      >
        <Container className="flex h-14 items-center gap-2 sm:gap-3">
          <a
            href="#principal"
            onClick={navClickHandler("principal", navigate)}
            className="group flex shrink-0 items-center gap-2"
            aria-label="EliasNote — página principal"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-card text-foreground shadow-sm transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
              <AppMark className="h-4 w-4" />
            </span>
            <span className="leading-tight">
              <span className="block text-[13px] font-semibold tracking-tight">EliasNote</span>
              <span className="hidden text-[10px] text-muted-foreground sm:block">Canvas local-first</span>
            </span>
            <Badge variant="outline" className="ml-1 hidden md:inline-flex">
              v{APP_VERSION}
            </Badge>
          </a>

          <nav aria-label="Seções do site" className="ml-2 hidden flex-1 items-center gap-1 lg:flex">
            {TABS.map((tab) => (
              <TabLink key={tab.id} tab={tab} active={active === tab.id} onNavigate={navigate} />
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <div
              className="hidden items-center gap-1 border border-border bg-card/60 px-1.5 py-1 md:flex"
              role="group"
              aria-label="Cor de destaque"
            >
              {ACCENTS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-label={`Cor ${option.label}`}
                  aria-pressed={accent === option.id}
                  title={option.label}
                  onClick={() => changeAccent(option.id)}
                  className="grid h-6 w-6 place-items-center rounded-full"
                >
                  <span
                    className={cn(
                      "h-3.5 w-3.5 rounded-full border transition-transform",
                      accent === option.id
                        ? "border-foreground/50 ring-2 ring-primary/40"
                        : "border-transparent hover:scale-110",
                    )}
                    style={{ backgroundColor: option.color }}
                  />
                </button>
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
            >
              <span key={theme} className="landing-count inline-flex">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </span>
            </Button>

            <Button asChild size="sm" className="landing-cta h-8 px-2.5 text-[12px]">
              <a href={RELEASES_URL} target="_blank" rel="noreferrer" aria-label="Baixar instaladores do EliasNote">
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Baixar</span>
              </a>
            </Button>
          </div>
        </Container>

        <div className="border-t border-border/70 lg:hidden">
          <Container className="flex gap-1 overflow-x-auto py-1.5">
            {TABS.map((tab) => (
              <TabLink key={tab.id} tab={tab} active={active === tab.id} onNavigate={navigate} />
            ))}
          </Container>
        </div>

        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px">
          <div className="landing-progress h-full bg-primary/80" style={{ transform: `scaleX(${progress})` }} />
        </div>
      </header>

      <main id="conteudo" className="flex-1">
        {active === "principal" ? <HomeSection onNavigate={navigate} /> : null}
        {active === "funcionalidades" ? <Features /> : null}
        {active === "downloads" ? <Downloads /> : null}
        {active === "sobre" ? <About /> : null}
        {active === "contato" ? <Contact /> : null}
      </main>

      <SiteFooter onNavigate={navigate} />

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" })}
        aria-label="Voltar ao topo"
        className={cn(
          "fixed bottom-5 right-5 z-40 grid h-10 w-10 place-items-center border border-border bg-card/95 text-muted-foreground shadow-floating backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:text-foreground sm:bottom-6 sm:right-6",
          showTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
        )}
      >
        <ArrowUp className="h-4 w-4" />
      </button>
    </div>
  );
}
