import type { Locale, SiteContent } from "@/landing/i18n/types";
import { enSite } from "@/landing/i18n/locales/en/site";
import { esSite } from "@/landing/i18n/locales/es/site";
import { ptSite } from "@/landing/i18n/locales/pt/site";
import { zhSite } from "@/landing/i18n/locales/zh/site";

/** Textos do site por idioma. */
export const SITE_CONTENT: Record<Locale, SiteContent> = {
  pt: ptSite,
  en: enSite,
  es: esSite,
  zh: zhSite,
};

export function getSiteContent(locale: Locale): SiteContent {
  return SITE_CONTENT[locale] ?? ptSite;
}
