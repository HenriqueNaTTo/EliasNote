import { describe, expect, it } from "vitest";
import { SITE_CONTENT } from "@/landing/i18n";
import { detectLocale, format } from "@/landing/i18n/locale";
import type { DocId, Locale, SiteContent } from "@/landing/i18n/types";

const TRANSLATED: Locale[] = ["en", "es", "zh"];

/**
 * Percorre o contrato comparando com o português: garante que nenhuma tradução
 * perca uma chave, encurte uma lista ou deixe um texto vazio.
 */
function compareShape(reference: unknown, candidate: unknown, path: string, issues: string[]): void {
  if (typeof reference === "string") {
    if (typeof candidate !== "string" || candidate.trim().length === 0) {
      issues.push(`${path}: texto ausente ou vazio`);
    }
    return;
  }

  if (typeof reference !== "object" || reference === null) return;

  if (Array.isArray(reference)) {
    if (!Array.isArray(candidate)) {
      issues.push(`${path}: esperava uma lista`);
      return;
    }
    if (candidate.length !== reference.length) {
      issues.push(`${path}: ${candidate.length} itens (esperado ${reference.length})`);
      return;
    }
    reference.forEach((item, index) => compareShape(item, candidate[index], `${path}[${index}]`, issues));
    return;
  }

  if (typeof candidate !== "object" || candidate === null || Array.isArray(candidate)) {
    issues.push(`${path}: esperava um objeto`);
    return;
  }

  const referenceKeys = Object.keys(reference as Record<string, unknown>);
  const candidateKeys = Object.keys(candidate as Record<string, unknown>);
  for (const key of referenceKeys) {
    if (!candidateKeys.includes(key)) {
      issues.push(`${path}.${key}: chave ausente`);
      continue;
    }
    compareShape(
      (reference as Record<string, unknown>)[key],
      (candidate as Record<string, unknown>)[key],
      `${path}.${key}`,
      issues,
    );
  }
  for (const key of candidateKeys) {
    if (!referenceKeys.includes(key)) issues.push(`${path}.${key}: chave extra`);
  }
}

function collectCode(content: SiteContent): string[] {
  return Object.values(content.docs.pages).flatMap((page) =>
    page.sections.flatMap((section) =>
      section.blocks.flatMap((block) => (block.kind === "code" ? [block.code] : [])),
    ),
  );
}

describe("i18n do site", () => {
  it("mantém a mesma estrutura em todos os idiomas", () => {
    for (const locale of TRANSLATED) {
      const issues: string[] = [];
      compareShape(SITE_CONTENT.pt, SITE_CONTENT[locale], locale, issues);
      expect(issues, `divergências em ${locale}`).toEqual([]);
    }
  });

  it("mantém os blocos de código idênticos ao português", () => {
    const reference = collectCode(SITE_CONTENT.pt);
    expect(reference.length).toBeGreaterThan(0);
    for (const locale of TRANSLATED) {
      expect(collectCode(SITE_CONTENT[locale]), `código alterado em ${locale}`).toEqual(reference);
    }
  });

  it("preserva os identificadores de rota da documentação", () => {
    const ids = Object.keys(SITE_CONTENT.pt.docs.pages) as DocId[];
    for (const locale of TRANSLATED) {
      expect(Object.keys(SITE_CONTENT[locale].docs.pages)).toEqual(ids);
      for (const id of ids) {
        expect(SITE_CONTENT[locale].docs.pages[id].sections.map((section) => section.id)).toEqual(
          SITE_CONTENT.pt.docs.pages[id].sections.map((section) => section.id),
        );
      }
    }
  });

  it("reaproveita as chaves de template do português", () => {
    const placeholders = (value: string) => (value.match(/\{(\w+)\}/g) ?? []).sort();
    for (const locale of TRANSLATED) {
      const other = SITE_CONTENT[locale];
      expect(placeholders(other.docs.hub.count)).toEqual(placeholders(SITE_CONTENT.pt.docs.hub.count));
      expect(placeholders(other.docs.hub.cardSections)).toEqual(placeholders(SITE_CONTENT.pt.docs.hub.cardSections));
      expect(placeholders(other.footer.copyright)).toEqual(placeholders(SITE_CONTENT.pt.footer.copyright));
      expect(placeholders(other.contact.form.counter)).toEqual(placeholders(SITE_CONTENT.pt.contact.form.counter));
    }
  });
});

describe("detecção de idioma", () => {
  it("prioriza a preferência salva", () => {
    expect(detectLocale("es", ["en-US"])).toBe("es");
    expect(detectLocale("invalido", ["en-US", "pt-BR"])).toBe("en");
  });

  it("cai no idioma do navegador e depois no padrão", () => {
    expect(detectLocale(null, ["zh-Hans-CN"])).toBe("zh");
    expect(detectLocale(null, ["fr-FR", "es-ES"])).toBe("es");
    expect(detectLocale(null, ["fr-FR"])).toBe("pt");
    expect(detectLocale(null, undefined)).toBe("pt");
  });
});

describe("format", () => {
  it("substitui os marcadores e mantém os desconhecidos", () => {
    expect(format("{count} de {total} páginas", { count: 3, total: 6 })).toBe("3 de 6 páginas");
    expect(format("© {year} EliasNote", {})).toBe("© {year} EliasNote");
  });
});
