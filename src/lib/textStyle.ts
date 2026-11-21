import type { CSSProperties } from "react";
import type { CanvasNode, TextAlign, TextFontFamily } from "@/core/domain/types";

/** Tamanhos de fonte oferecidos no seletor, em px. */
export const TEXT_FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64, 80];

export const DEFAULT_TEXT_FONT_SIZE = 14;
export const MIN_TEXT_FONT_SIZE = 8;
export const MAX_TEXT_FONT_SIZE = 96;

export interface TextFontFamilyOption {
  id: TextFontFamily;
  label: string;
  stack: string;
}

/** Pilhas tipográficas do texto avulso; `sans` herda a fonte da interface. */
export const TEXT_FONT_FAMILIES: TextFontFamilyOption[] = [
  { id: "sans", label: "Sans", stack: "inherit" },
  {
    id: "serif",
    label: "Serifa",
    stack: "'Iowan Old Style', 'Palatino Linotype', Georgia, 'Times New Roman', serif",
  },
  {
    id: "mono",
    label: "Mono",
    stack: "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Courier New', monospace",
  },
];

export const TEXT_ALIGNMENTS: TextAlign[] = ["left", "center", "right"];

export const TEXT_ALIGN_LABELS: Record<TextAlign, string> = {
  left: "Alinhar à esquerda",
  center: "Centralizar",
  right: "Alinhar à direita",
};

export interface TextFormat {
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  fontFamily: TextFontFamily;
  align: TextAlign;
}

/** Campos do nó que participam da formatação do texto. */
export type TextFormatFields = Pick<
  CanvasNode,
  "fontSize" | "bold" | "italic" | "underline" | "strike" | "fontFamily" | "align"
>;

export function clampFontSize(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_TEXT_FONT_SIZE;
  return Math.min(MAX_TEXT_FONT_SIZE, Math.max(MIN_TEXT_FONT_SIZE, Math.round(value)));
}

/** Um passo de tamanho, sem sair dos limites. */
export function stepFontSize(current: number, step: number): number {
  return clampFontSize(clampFontSize(current) + step);
}

export function fontFamilyStack(family: TextFontFamily | undefined): string {
  const option = TEXT_FONT_FAMILIES.find((item) => item.id === family);
  return option?.stack ?? "inherit";
}

/** Formatação efetiva do nó, já com os padrões aplicados. */
export function textFormatOf(node: TextFormatFields): TextFormat {
  return {
    fontSize: node.fontSize === undefined ? DEFAULT_TEXT_FONT_SIZE : clampFontSize(node.fontSize),
    bold: Boolean(node.bold),
    italic: Boolean(node.italic),
    underline: Boolean(node.underline),
    strike: Boolean(node.strike),
    fontFamily: node.fontFamily ?? "sans",
    align: node.align ?? "left",
  };
}

export function textDecorationLine(format: Pick<TextFormat, "underline" | "strike">): string {
  if (format.underline && format.strike) return "underline line-through";
  if (format.underline) return "underline";
  if (format.strike) return "line-through";
  return "none";
}

/** CSS de texto aplicado tanto à escrita quanto à prévia do nó. */
export function textCssStyle(node: TextFormatFields): CSSProperties {
  const format = textFormatOf(node);
  return {
    fontSize: `${format.fontSize}px`,
    fontFamily: fontFamilyStack(format.fontFamily),
    fontWeight: format.bold ? 700 : 400,
    fontStyle: format.italic ? "italic" : "normal",
    textDecorationLine: textDecorationLine(format),
    textAlign: format.align,
  };
}

/** Há alguma formatação fora do padrão? (usado para mostrar o botão de limpar) */
export function hasTextFormatting(node: TextFormatFields): boolean {
  const format = textFormatOf(node);
  return (
    format.fontSize !== DEFAULT_TEXT_FONT_SIZE ||
    format.bold ||
    format.italic ||
    format.underline ||
    format.strike ||
    format.fontFamily !== "sans" ||
    format.align !== "left"
  );
}
