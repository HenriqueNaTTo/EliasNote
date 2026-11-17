import type { CSSProperties } from "react";
import logoMask from "@/assets/brand/logo-mask.png";
import logoHeadMask from "@/assets/brand/logo-head-mask.png";
import { cn } from "@/lib/utils";

function maskStyle(url: string): CSSProperties {
  return {
    WebkitMaskImage: `url("${url}")`,
    maskImage: `url("${url}")`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  };
}

/**
 * Marca do EliasNote (goblin lendo um livro).
 *
 * A arte original é usada como máscara: o corpo/livro herda `currentColor` e a
 * cabeça recebe a cor de destaque do app (`--primary`), então o logo acompanha
 * tema e acento automaticamente.
 */
export function AppMark({
  className,
  headColor = "hsl(var(--primary))",
}: {
  className?: string;
  headColor?: string;
}) {
  return (
    <span
      data-brand-mark
      className={cn("relative inline-block aspect-square shrink-0", className)}
      aria-hidden="true"
    >
      <span data-brand-base className="absolute inset-0 bg-current" style={maskStyle(logoMask)} />
      <span
        data-brand-head
        className="absolute inset-0"
        style={{ ...maskStyle(logoHeadMask), backgroundColor: headColor }}
      />
    </span>
  );
}
