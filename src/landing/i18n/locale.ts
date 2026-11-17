import type { Locale, LocaleEntry } from "@/landing/i18n/types";

export const DEFAULT_LOCALE: Locale = "pt";

export const LOCALES: LocaleEntry[] = [
  { id: "pt", label: "Português", short: "PT", htmlLang: "pt-BR", ogLocale: "pt_BR" },
  { id: "en", label: "English", short: "EN", htmlLang: "en", ogLocale: "en_US" },
  { id: "es", label: "Español", short: "ES", htmlLang: "es", ogLocale: "es_ES" },
  { id: "zh", label: "中文", short: "ZH", htmlLang: "zh-CN", ogLocale: "zh_CN" },
];

export const LOCALE_STORAGE_KEY = "eliasnote-landing-locale";

export function isLocale(value: string | null | undefined): value is Locale {
  return LOCALES.some((locale) => locale.id === value);
}

export function getLocaleEntry(locale: Locale): LocaleEntry {
  return LOCALES.find((entry) => entry.id === locale) ?? LOCALES[0];
}

/**
 * Escolhe o idioma pela preferência salva e, na primeira visita, pelas línguas
 * do navegador. Sem preferência conhecida, mantém o português.
 */
export function detectLocale(
  stored: string | null | undefined,
  languages: readonly string[] | undefined,
  fallback: Locale = DEFAULT_LOCALE,
): Locale {
  if (isLocale(stored)) return stored;

  for (const language of languages ?? []) {
    const base = language.toLowerCase().split(/[-_]/)[0];
    if (isLocale(base)) return base;
  }

  return fallback;
}

/** Substitui `{chave}` pelos valores informados. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
