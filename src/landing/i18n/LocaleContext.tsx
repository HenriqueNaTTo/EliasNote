import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getSiteContent } from "@/landing/i18n";
import { LOCALE_STORAGE_KEY, detectLocale, getLocaleEntry } from "@/landing/i18n/locale";
import type { Locale, SiteContent } from "@/landing/i18n/types";

interface LocaleContextValue {
  locale: Locale;
  content: SiteContent;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLocale(): string | null {
  try {
    return localStorage.getItem(LOCALE_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredLocale(locale: Locale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* modo privado ou armazenamento bloqueado */
  }
}

function initialLocale(): Locale {
  if (typeof navigator === "undefined") return detectLocale(null, undefined);
  const languages = navigator.languages && navigator.languages.length > 0 ? navigator.languages : [navigator.language];
  return detectLocale(readStoredLocale(), languages);
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    writeStoredLocale(next);
  }, []);

  const content = useMemo(() => getSiteContent(locale), [locale]);

  useEffect(() => {
    document.documentElement.lang = getLocaleEntry(locale).htmlLang;
  }, [locale]);

  const value = useMemo<LocaleContextValue>(() => ({ locale, content, setLocale }), [content, locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale precisa ser usado dentro de <LocaleProvider>");
  return context;
}

/** Atalho para o conteúdo do idioma atual. */
export function useContent(): SiteContent {
  return useLocale().content;
}
