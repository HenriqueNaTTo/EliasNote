import { memo } from "react";
import {
  arrowHeadPath,
  elementPath,
  sketchBounds,
  sketchViewBox,
  strokeDashArray,
  textLines,
  type SketchDocument,
  type SketchElement,
  type SketchStyle,
} from "@/core/domain/sketch";
import { cn } from "@/lib/utils";

interface SketchViewProps {
  sketch: SketchDocument;
  className?: string;
  padding?: number;
  /** Texto alternativo; por padrão a view é decorativa. */
  alt?: string;
}

function fillOf(style: SketchStyle): string {
  return style.fill === "none" ? "none" : style.fill;
}

export function SketchElementShape({ element }: { element: SketchElement }) {
  const style = element.style;
  const opacity = style.opacity < 1 ? style.opacity : undefined;
  const dash = strokeDashArray(style);

  if (element.kind === "text") {
    const lines = textLines(element.text);
    return (
      <text
        x={element.at.x}
        y={element.at.y}
        fill={style.stroke}
        opacity={opacity}
        fontSize={element.fontSize}
        fontFamily="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
        dominantBaseline="hanging"
      >
        {lines.map((line, index) => (
          <tspan key={index} x={element.at.x} dy={index === 0 ? 0 : element.fontSize * 1.32}>
            {line || " "}
          </tspan>
        ))}
      </text>
    );
  }

  return (
    <>
      <path
        d={elementPath(element)}
        fill={element.kind === "line" || element.kind === "arrow" ? "none" : fillOf(style)}
        stroke={style.stroke}
        strokeWidth={style.width}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dash}
        opacity={opacity}
      />
      {element.kind === "arrow" ? (
        <path d={arrowHeadPath(element)} fill={style.stroke} opacity={opacity} />
      ) : null}
    </>
  );
}

/** Prévia vetorial de um desenho nativo (sem interação). */
export const SketchView = memo(function SketchView({
  sketch,
  className,
  padding = 24,
  alt,
}: SketchViewProps) {
  const bounds = sketchBounds(sketch.elements);
  if (!bounds) return null;

  return (
    <svg
      viewBox={sketchViewBox(sketch.elements, padding)}
      className={cn("h-full w-full", className)}
      preserveAspectRatio="xMidYMid meet"
      role={alt ? "img" : undefined}
      aria-label={alt}
      aria-hidden={alt ? undefined : true}
    >
      {sketch.elements.map((element) => (
        <SketchElementShape key={element.id} element={element} />
      ))}
    </svg>
  );
});
