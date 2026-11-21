import { describe, expect, it } from "vitest";
import {
  DEFAULT_TEXT_FONT_SIZE,
  MAX_TEXT_FONT_SIZE,
  MIN_TEXT_FONT_SIZE,
  clampFontSize,
  hasTextFormatting,
  stepFontSize,
  textCssStyle,
  textDecorationLine,
  textFormatOf,
} from "./textStyle";

describe("formatação do texto avulso", () => {
  it("usa os padrões quando o nó não define nada", () => {
    expect(textFormatOf({})).toEqual({
      fontSize: DEFAULT_TEXT_FONT_SIZE,
      bold: false,
      italic: false,
      underline: false,
      strike: false,
      fontFamily: "sans",
      align: "left",
    });
  });

  it("limita e arredonda o tamanho da fonte", () => {
    expect(clampFontSize(1000)).toBe(MAX_TEXT_FONT_SIZE);
    expect(clampFontSize(1)).toBe(MIN_TEXT_FONT_SIZE);
    expect(clampFontSize(17.6)).toBe(18);
    expect(clampFontSize(Number.NaN)).toBe(DEFAULT_TEXT_FONT_SIZE);
    expect(stepFontSize(14, 2)).toBe(16);
    expect(stepFontSize(MIN_TEXT_FONT_SIZE, -4)).toBe(MIN_TEXT_FONT_SIZE);
    expect(stepFontSize(MAX_TEXT_FONT_SIZE, 8)).toBe(MAX_TEXT_FONT_SIZE);
  });

  it("combina sublinhado e riscado na decoração", () => {
    expect(textDecorationLine({ underline: false, strike: false })).toBe("none");
    expect(textDecorationLine({ underline: true, strike: false })).toBe("underline");
    expect(textDecorationLine({ underline: false, strike: true })).toBe("line-through");
    expect(textDecorationLine({ underline: true, strike: true })).toBe("underline line-through");
  });

  it("monta o CSS aplicado ao texto", () => {
    const style = textCssStyle({
      bold: true,
      italic: true,
      underline: true,
      fontSize: 24,
      fontFamily: "serif",
      align: "center",
    });
    expect(style.fontSize).toBe("24px");
    expect(style.fontWeight).toBe(700);
    expect(style.fontStyle).toBe("italic");
    expect(style.textDecorationLine).toBe("underline");
    expect(style.textAlign).toBe("center");
    expect(String(style.fontFamily)).toContain("serif");
  });

  it("detecta formatação fora do padrão", () => {
    expect(hasTextFormatting({})).toBe(false);
    expect(hasTextFormatting({ fontSize: DEFAULT_TEXT_FONT_SIZE })).toBe(false);
    expect(hasTextFormatting({ bold: true })).toBe(true);
    expect(hasTextFormatting({ fontSize: 20 })).toBe(true);
    expect(hasTextFormatting({ align: "right" })).toBe(true);
    expect(hasTextFormatting({ fontFamily: "mono" })).toBe(true);
  });
});
