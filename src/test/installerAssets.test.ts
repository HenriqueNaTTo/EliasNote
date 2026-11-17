import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Guarda-corpo do assistente de instalação (NSIS): as artes BMP, o template
 * vendorizado e o cabeamento em `tauri.conf.json` precisam continuar coerentes
 * com a paleta da marca e com os placeholders que o bundler do Tauri injeta.
 */

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const readText = (relative: string) => readFileSync(resolve(root, relative), "utf8");
const readBinary = (relative: string) => readFileSync(resolve(root, relative));

interface Bitmap {
  width: number;
  height: number;
  bitsPerPixel: number;
  pixel: (x: number, y: number) => [number, number, number];
}

function readBitmap(relative: string): Bitmap {
  const data = readBinary(relative);
  expect(data.subarray(0, 2).toString("ascii")).toBe("BM");

  const offset = data.readUInt32LE(10);
  const width = data.readInt32LE(18);
  const height = data.readInt32LE(22);
  const bitsPerPixel = data.readUInt16LE(28);
  const compression = data.readUInt32LE(30);
  expect(data.readUInt32LE(2)).toBe(data.length);
  expect(compression).toBe(0);

  const pixel = (x: number, y: number): [number, number, number] => {
    const start = offset + (height - 1 - y) * Math.ceil((width * 3) / 4) * 4 + x * 3;
    return [data[start + 2], data[start + 1], data[start]];
  };

  return { width, height, bitsPerPixel, pixel };
}

const channelDistance = (a: [number, number, number], b: [number, number, number]) =>
  Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]));

/** Lê os extremos do gradiente direto do módulo compartilhado da marca. */
function brandGradientEnds(): { start: [number, number, number]; end: [number, number, number] } {
  const source = readText("scripts/lib/brand-mark.mjs");
  const parse = (name: string): [number, number, number] => {
    const match = new RegExp(`${name} = \\[(\\d+), (\\d+), (\\d+)\\]`).exec(source);
    expect(match, `${name} não encontrado em scripts/lib/brand-mark.mjs`).not.toBeNull();
    const [, r, g, b] = match as RegExpExecArray;
    return [Number(r), Number(g), Number(b)];
  };
  return { start: parse("BRAND_GRADIENT_START"), end: parse("BRAND_GRADIENT_END") };
}

describe("artes do instalador", () => {
  it("mantém o painel lateral 164x314 com o gradiente da marca", () => {
    const bitmap = readBitmap("src-tauri/installer/assets/sidebar.bmp");
    expect(bitmap.width).toBe(164);
    expect(bitmap.height).toBe(314);
    expect(bitmap.bitsPerPixel).toBe(24);

    const { start, end } = brandGradientEnds();
    expect(channelDistance(bitmap.pixel(0, 0), start)).toBeLessThanOrEqual(2);
    expect(channelDistance(bitmap.pixel(bitmap.width - 1, bitmap.height - 1), end)).toBeLessThanOrEqual(2);
  });

  it("mantém o cabeçalho 150x57 no tamanho exigido pelo MUI2", () => {
    const bitmap = readBitmap("src-tauri/installer/assets/header.bmp");
    expect(bitmap.width).toBe(150);
    expect(bitmap.height).toBe(57);
    expect(bitmap.bitsPerPixel).toBe(24);

    // Fundo branco como as superfícies do app, com a hairline na base.
    expect(bitmap.pixel(bitmap.width - 2, 2)).toEqual([255, 255, 255]);
    expect(channelDistance(bitmap.pixel(10, bitmap.height - 1), [227, 227, 227])).toBeLessThanOrEqual(2);
  });

  it("não deixa as artes desatualizadas em relação ao script", () => {
    expect(() =>
      execFileSync(process.execPath, [resolve(root, "scripts/generate-installer-assets.mjs"), "--check"], {
        cwd: root,
        stdio: "pipe",
      }),
    ).not.toThrow();
  });
});

describe("template do instalador", () => {
  const template = readText("src-tauri/installer/installer.nsi");

  it("preserva os placeholders que o bundler do Tauri injeta", () => {
    const required = [
      "{{compression}}",
      "{{product_name}}",
      "{{version}}",
      "{{main_binary_name}}",
      "{{main_binary_path}}",
      "{{out_file}}",
      "{{install_mode}}",
      "{{header_image}}",
      "{{sidebar_image}}",
      "{{installer_icon}}",
      "{{installer_hooks}}",
      "{{webview2_bootstrapper_path}}",
      "{{#each languages}}",
      "{{#each language_files}}",
    ];
    for (const placeholder of required) {
      expect(template, `placeholder ausente: ${placeholder}`).toContain(placeholder);
    }
  });

  it("mantém as etapas funcionais do instalador", () => {
    for (const marker of [
      "Page custom PageReinstall PageLeaveReinstall",
      "MUI_PAGE_LICENSE",
      "MUI_PAGE_DIRECTORY",
      "MUI_PAGE_INSTFILES",
      "MUI_PAGE_FINISH",
      "Section WebView2",
      "Section Install",
      "Section Uninstall",
    ]) {
      expect(template, `trecho ausente: ${marker}`).toContain(marker);
    }
  });

  it("aplica a identidade da marca", () => {
    expect(template).toContain('BrandingText "${ELIASNOTE_BRANDING}"');
    expect(template).toContain('!define MUI_HEADERIMAGE_UNBITMAP "${HEADERIMAGE}"');
    expect(template).toContain('!define MUI_UNICON "${INSTALLERICON}"');
  });
});

describe("configuração do bundle NSIS", () => {
  const config = JSON.parse(readText("src-tauri/tauri.conf.json")) as {
    bundle: {
      licenseFile?: string;
      windows?: { nsis?: Record<string, unknown> };
    };
  };

  const nsis = config.bundle.windows?.nsis ?? {};

  it("aponta para o template, as artes e os textos da marca", () => {
    expect(nsis.template).toBe("installer/installer.nsi");
    expect(nsis.installerHooks).toBe("installer/brand.nsh");
    expect(nsis.headerImage).toBe("installer/assets/header.bmp");
    expect(nsis.sidebarImage).toBe("installer/assets/sidebar.bmp");
    expect(nsis.installerIcon).toBe("icons/icon.ico");
  });

  it("instala por usuário, em pt-BR, sem seletor de idioma", () => {
    expect(nsis.installMode).toBe("currentUser");
    expect(nsis.languages).toEqual(["PortugueseBR"]);
    expect(nsis.displayLanguageSelector).toBe(false);
    expect(nsis.startMenuFolder).toBe("EliasNote");
  });

  it("referencia arquivos que existem no repositório", () => {
    const files = [
      config.bundle.licenseFile ?? "",
      String(nsis.template),
      String(nsis.installerHooks),
      String(nsis.headerImage),
      String(nsis.sidebarImage),
    ];
    for (const file of files) {
      expect(file.length, "caminho vazio").toBeGreaterThan(0);
      expect(() => readBinary(`src-tauri/${file}`), `arquivo ausente: ${file}`).not.toThrow();
    }
  });

  it("mantém a licença e o instalador padrão fora do escopo do app", () => {
    const brand = readText("src-tauri/installer/brand.nsh");
    expect(brand).toContain('!define MUI_BGCOLOR "FFFFFF"');
    expect(brand).toContain("!define MUI_WELCOMEPAGE_TITLE");
    expect(brand).toContain("!define MUI_FINISHPAGE_TEXT");
  });
});
