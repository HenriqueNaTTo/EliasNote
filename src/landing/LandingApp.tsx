import { useCallback, useEffect, useState, type MouseEvent } from "react";
import {
  ArrowUp,
  BookOpen,
  Download,
  Home as HomeIcon,
  Info,
  Languages,
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
import { Docs } from "@/landing/docs/Docs";
import { useContent, useLocale } from "@/landing/i18n/LocaleContext";
import { LOCALES, format, getLocaleEntry } from "@/landing/i18n/locale";
import type { DocId, Locale, SiteContent, TabId } from "@/landing/i18n/types";
import { About } from "@/landing/sections/About";
import { Contact } from "@/landing/sections/Contact";
import { Downloads } from "@/landing/sections/Downloads";
import { Features } from "@/landing/sections/Features";
import { Home as HomeSection } from "@/landing/sections/Home";
import {
  ACCENTS,
  APP_VERSION,
  DOCS_URL,
  ISSUES_URL,
  LICENSE_URL,
  RELEASES_PAGE_URL,
  RELEASES_URL,
  REPO_URL,
  TAB_IDS,
  docHref,
  parseRoute,
  type AccentId,
  type SiteRoute,
} from "@/landing/site";
import { cn } from "@/lib/utils";

const THEME_KEY = "eliasnote-landing-theme";
const ACCENT_KEY = "eliasnote-landing-accent";

type ThemeMode = "light" | "dark";

const TAB_ICONS: Record<TabId, typeof HomeIcon> = {
  principal: HomeIcon,
  funcionalidades: LayoutGrid,
  downloads: Download,
  documentacao: BookOpen,
  sobre: Info,
  contato: Mail,
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
  id,
  label,
  active,
  onNavigate,
}: {
  id: TabId;
  label: string;
  active: boolean;
  onNavigate: (target: TabId) => void;
}) {
  const Icon = TAB_ICONS[id];
  return (
    <a
      href={`#${id}`}
      aria-current={active ? "page" : undefined}
      onClick={navClickHandler(id, onNavigate)}
      className={cn(
        "group inline-flex h-8 shrink-0 items-center gap-1.5 border px-2 text-[12px] transition-colors",
        active
          ? "border-border bg-muted/70 font-medium text-foreground"
          : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground",
      )}
    >
      <Icon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
      {label}
    </a>
  );
}

/** Seletor de idioma. Um `select` nativo mantém o foco, o teclado e o mobile previsíveis. */
function LanguageSelect() {
  const { locale, content, setLocale } = useLocale();
  const current = getLocaleEntry(locale);

  return (
    <label
      className="relative inline-flex h-8 items-center gap-1 border border-border bg-card/60 pl-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
      title={content.nav.languageAria}
    >
      <Languages className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <select
        aria-label={content.nav.languageAria}
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        className="h-8 max-w-[6.5rem] cursor-pointer appearance-none bg-transparent pr-1 text-[11px] font-medium text-foreground outline-none"
      >
        {LOCALES.map((entry) => (
          <option key={entry.id} value={entry.id}>
            {entry.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none pr-1.5 font-mono text-[9px] uppercase text-muted-foreground/70" aria-hidden>
        {current.short}
      </span>
    </label>
  );
}

function SiteFooter({ onNavigate }: { onNavigate: (target: TabId) => void }) {
  const c = useContent();
  const year = new Date().getFullYear();
  const resources = [
    { label: c.footer.links.repo, href: REPO_URL },
    { label: c.footer.links.releases, href: RELEASES_PAGE_URL },
    { label: c.footer.links.issues, href: ISSUES_URL },
    { label: c.footer.links.docs, href: DOCS_URL },
    { label: c.footer.links.license, href: LICENSE_URL },
  ];

  return (
    <footer className="mt-auto border-t border-border bg-[hsl(var(--sidebar))]">
      <Container className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <Reveal className="sm:col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-card text-foreground shadow-sm">
              <AppMark className="h-4 w-4" />
            </span>
            <span className="text-[13px] font-semibold tracking-tight">{c.nav.brand}</span>
            <Badge variant="outline">v{APP_VERSION}</Badge>
          </div>
          <p className="mt-3 max-w-sm text-[12px] leading-relaxed text-muted-foreground">{c.footer.summary}</p>
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
            {c.footer.offline}
          </p>
        </Reveal>

        <Reveal delay={90}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{c.footer.navigate}</p>
          <ul className="mt-2.5 space-y-1.5">
            {TAB_IDS.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={navClickHandler(id, onNavigate)}
                  className="text-[12px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {c.nav.tabs[id]}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={160}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{c.footer.resources}</p>
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
          <p>{format(c.footer.copyright, { year })}</p>
          <p>{c.footer.tech}</p>
        </Container>
      </div>
    </footer>
  );
}

function pageTitle(content: SiteContent, tab: TabId, docId: DocId | null): string {
  return docId
    ? format(content.meta.docTitle, { page: content.docs.pages[docId].title })
    : content.meta.titles[tab];
}

function setMeta(attribute: "name" | "property", key: string, value: string) {
  let node = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!node) {
    node = document.createElement("meta");
    node.setAttribute(attribute, key);
    document.head.appendChild(node);
  }
  node.setAttribute("content", value);
}

/** Título, descrição e Open Graph acompanham a aba, a página de docs e o idioma. */
function syncDocumentMeta(content: SiteContent, tab: TabId, docId: DocId | null, locale: Locale) {
  const title = pageTitle(content, tab, docId);
  const description = docId ? content.docs.pages[docId].summary : content.meta.description;

  document.title = title;
  setMeta("name", "description", description);
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:locale", getLocaleEntry(locale).ogLocale);
}

export function LandingApp() {
  const content = useContent();
  const { locale } = useLocale();
  const [route, setRoute] = useState<SiteRoute>(() => parseRoute(window.location.hash));
  const { tab: active, doc: docId } = route;
  const [theme, setTheme] = useState<ThemeMode>(initialTheme);
  const [accent, setAccent] = useState<AccentId>(initialAccent);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const reducedMotion = useReducedMotion();
  const c = content;

  const scrollToTop = useCallback(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const pushHash = useCallback((hash: string) => {
    try {
      window.history.pushState(null, "", hash);
    } catch {
      window.location.hash = hash.replace(/^#/, "");
    }
  }, []);

  const navigate = useCallback(
    (tab: TabId) => {
      // Volta ao topo antes de montar a nova aba: assim as revelações por scroll
      // começam do zero em vez de já nascerem visíveis na posição anterior.
      scrollToTop();
      setRoute({ tab, doc: null });
      pushHash(`#${tab}`);
    },
    [pushHash, scrollToTop],
  );

  const navigateDoc = useCallback(
    (doc: DocId | null) => {
      scrollToTop();
      setRoute({ tab: "documentacao", doc });
      pushHash(docHref(doc));
    },
    [pushHash, scrollToTop],
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
    syncDocumentMeta(c, active, docId, locale);
    scrollToTop();
  }, [active, c, docId, locale, scrollToTop]);

  useEffect(() => {
    const sync = () => {
      scrollToTop();
      setRoute(parseRoute(window.location.hash));
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
  }, [active, locale]);

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
            aria-label={c.nav.homeAria}
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-card text-foreground shadow-sm transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
              <AppMark className="h-4 w-4" />
            </span>
            <span className="leading-tight">
              <span className="block text-[13px] font-semibold tracking-tight">{c.nav.brand}</span>
              <span className="hidden text-[10px] text-muted-foreground sm:block">{c.nav.brandSubtitle}</span>
            </span>
            <Badge variant="outline" className="ml-1 hidden md:inline-flex">
              v{APP_VERSION}
            </Badge>
          </a>

          <nav aria-label={c.nav.sectionsAria} className="ml-2 hidden flex-1 items-center gap-1 xl:flex">
            {TAB_IDS.map((id) => (
              <TabLink key={id} id={id} label={c.nav.tabs[id]} active={active === id} onNavigate={navigate} />
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <div
              className="hidden items-center gap-1 border border-border bg-card/60 px-1.5 py-1 md:flex"
              role="group"
              aria-label={c.nav.accentGroup}
            >
              {ACCENTS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-label={`${c.nav.accentPrefix} ${c.nav.accentNames[option.id]}`}
                  aria-pressed={accent === option.id}
                  title={c.nav.accentNames[option.id]}
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

            <LanguageSelect />

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? c.nav.themeToLight : c.nav.themeToDark}
            >
              <span key={theme} className="landing-count inline-flex">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </span>
            </Button>

            <Button asChild size="sm" className="landing-cta h-8 px-2.5 text-[12px]">
              <a href={RELEASES_URL} target="_blank" rel="noreferrer" aria-label={c.nav.downloadAria}>
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{c.nav.download}</span>
              </a>
            </Button>
          </div>
        </Container>

        <div className="border-t border-border/70 xl:hidden">
          <Container className="flex gap-1 overflow-x-auto py-1.5">
            {TAB_IDS.map((id) => (
              <TabLink key={id} id={id} label={c.nav.tabs[id]} active={active === id} onNavigate={navigate} />
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
        {active === "documentacao" ? <Docs docId={docId} onNavigateDoc={navigateDoc} /> : null}
        {active === "sobre" ? <About /> : null}
        {active === "contato" ? <Contact /> : null}
      </main>

      <SiteFooter onNavigate={navigate} />

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" })}
        aria-label={c.nav.backToTop}
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
