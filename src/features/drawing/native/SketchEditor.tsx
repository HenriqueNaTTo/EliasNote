import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize, Minus, Plus } from "lucide-react";
import {
  SKETCH_FONT_SIZE,
  createSketchStyle,
  elementBounds,
  moveElement,
  normalizeRect,
  sketchBounds,
  sketchElement,
  topmostElementAt,
  type SketchDocument,
  type SketchElement,
  type SketchPoint,
  type SketchStyle,
  type SketchTool,
} from "@/core/domain/sketch";
import { clamp } from "@/lib/utils";
import { SketchElementShape } from "./SketchView";

interface ViewState {
  x: number;
  y: number;
  zoom: number;
}

interface SketchEditorProps {
  doc: SketchDocument;
  tool: SketchTool;
  style: SketchStyle;
  selectedIds: string[];
  fitNonce: number;
  onToolChange: (tool: SketchTool) => void;
  onSelectionChange: (ids: string[]) => void;
  onChange: (elements: SketchElement[], options?: { history?: boolean }) => void;
}

type Gesture =
  | {
      kind: "move";
      start: SketchPoint;
      elements: SketchElement[];
      ids: Set<string>;
      historyPushed: boolean;
    }
  | { kind: "draw"; start: SketchPoint; element: SketchElement }
  | { kind: "erase"; remaining: SketchElement[]; historyPushed: boolean }
  | { kind: "pan"; startClient: SketchPoint; view: ViewState };

const CURSORS: Record<SketchTool, string> = {
  select: "default",
  hand: "grab",
  pen: "crosshair",
  line: "crosshair",
  arrow: "crosshair",
  rect: "crosshair",
  ellipse: "crosshair",
  diamond: "crosshair",
  text: "text",
  eraser: "cell",
};

function DEFAULT_SHAPE_SIZE(tool: SketchTool): { w: number; h: number } {
  return tool === "line" || tool === "arrow" ? { w: 120, h: 0 } : { w: 150, h: 100 };
}

export function SketchEditor({
  doc,
  tool,
  style,
  selectedIds,
  fitNonce,
  onToolChange,
  onSelectionChange,
  onChange,
}: SketchEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<ViewState>({ x: 60, y: 40, zoom: 1 });
  const viewRef = useRef(view);
  viewRef.current = view;
  const docRef = useRef(doc);
  docRef.current = doc;
  const gestureRef = useRef<Gesture | null>(null);
  const [draft, setDraft] = useState<SketchElement | null>(null);
  const [textEdit, setTextEdit] = useState<{ id: string; value: string; original: string } | null>(null);
  const fittedRef = useRef(false);

  const fitToContent = useCallback(() => {
    const element = containerRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const bounds = sketchBounds(docRef.current.elements);
    if (!bounds || rect.width === 0 || rect.height === 0) {
      setView({ x: 60, y: 40, zoom: 1 });
      return;
    }
    const padding = 56;
    const zoom = clamp(
      Math.min((rect.width - padding * 2) / bounds.w, (rect.height - padding * 2) / bounds.h),
      0.2,
      2.5,
    );
    fittedRef.current = true;
    setView({
      zoom,
      x: (rect.width - bounds.w * zoom) / 2 - bounds.x * zoom,
      y: (rect.height - bounds.h * zoom) / 2 - bounds.y * zoom,
    });
  }, []);

  useEffect(() => {
    fitToContent();
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      if (!fittedRef.current) fitToContent();
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [fitToContent]);

  useEffect(() => {
    if (fitNonce === 0) return;
    fitToContent();
  }, [fitNonce, fitToContent]);

  // Pan/zoom com a roda: roda = rolar, Ctrl/Cmd + roda = zoom no ponteiro.
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const current = viewRef.current;
      if (event.ctrlKey || event.metaKey) {
        const rect = element.getBoundingClientRect();
        const factor = Math.exp(-event.deltaY * 0.0016);
        const zoom = clamp(current.zoom * factor, 0.15, 4);
        const px = event.clientX - rect.left;
        const py = event.clientY - rect.top;
        const worldX = (px - current.x) / current.zoom;
        const worldY = (py - current.y) / current.zoom;
        setView({ zoom, x: px - worldX * zoom, y: py - worldY * zoom });
      } else {
        setView({ ...current, x: current.x - event.deltaX, y: current.y - event.deltaY });
      }
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, []);

  const toWorld = (clientX: number, clientY: number): SketchPoint => {
    const rect = containerRef.current?.getBoundingClientRect();
    const current = viewRef.current;
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - current.x) / current.zoom,
      y: (clientY - rect.top - current.y) / current.zoom,
    };
  };

  const updateText = (id: string, value: string) => {
    const elements = docRef.current.elements.map((element) =>
      element.id === id && element.kind === "text" ? { ...element, text: value } : element,
    );
    onChange(elements);
  };

  const commitText = (cancel = false) => {
    const editing = textEdit;
    if (!editing) return;
    setTextEdit(null);
    const element = docRef.current.elements.find((candidate) => candidate.id === editing.id);
    if (!element) return;
    const value = cancel ? editing.original : editing.value;
    if (!value.trim()) {
      onChange(
        docRef.current.elements.filter((candidate) => candidate.id !== editing.id),
        { history: false },
      );
      onSelectionChange([]);
      return;
    }
    onChange(
      docRef.current.elements.map((candidate) =>
        candidate.id === editing.id && candidate.kind === "text" ? { ...candidate, text: value } : candidate,
      ),
    );
  };

  const startTextEditing = (elementId: string, value = "") => {
    if (!value) {
      const element = docRef.current.elements.find((candidate) => candidate.id === elementId);
      value = element?.kind === "text" ? element.text : "";
    }
    setTextEdit({ id: elementId, value, original: value });
  };

  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    if (event.button === 2) return;
    if (textEdit) commitText();
    containerRef.current?.focus();
    const point = toWorld(event.clientX, event.clientY);
    const currentDoc = docRef.current;

    if (event.button === 1 || tool === "hand") {
      event.preventDefault();
      gestureRef.current = {
        kind: "pan",
        startClient: { x: event.clientX, y: event.clientY },
        view: { ...viewRef.current },
      };
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }

    if (tool === "select") {
      const shift = event.shiftKey;
      const hit = topmostElementAt(currentDoc.elements, point, 8 / viewRef.current.zoom);
      if (hit) {
        const nextSelection = shift
          ? selectedIds.includes(hit.id)
            ? selectedIds.filter((id) => id !== hit.id)
            : [...selectedIds, hit.id]
          : selectedIds.includes(hit.id)
            ? selectedIds
            : [hit.id];
        onSelectionChange(nextSelection);
        gestureRef.current = {
          kind: "move",
          start: point,
          elements: currentDoc.elements,
          ids: new Set(nextSelection),
          historyPushed: false,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
        return;
      }
      if (!shift) onSelectionChange([]);
      return;
    }

    if (tool === "eraser") {
      const hit = topmostElementAt(currentDoc.elements, point, 10 / viewRef.current.zoom);
      onChange(currentDoc.elements, { history: true });
      const remaining = hit
        ? currentDoc.elements.filter((element) => element.id !== hit.id)
        : currentDoc.elements;
      gestureRef.current = { kind: "erase", remaining, historyPushed: true };
      if (hit) onChange(remaining);
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }

    if (tool === "text") {
      const element = sketchElement({
        kind: "text",
        style: { ...style, fill: "none" },
        at: point,
        text: "",
        fontSize: SKETCH_FONT_SIZE,
      });
      onChange([...currentDoc.elements, element], { history: true });
      onSelectionChange([element.id]);
      startTextEditing(element.id, "");
      return;
    }

    const element = createDraftElement(tool, point, point, style);
    if (!element) return;
    gestureRef.current = { kind: "draw", start: point, element };
    setDraft(element);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const gesture = gestureRef.current;
    if (!gesture) return;

    if (gesture.kind === "pan") {
      setView({
        ...gesture.view,
        x: gesture.view.x + (event.clientX - gesture.startClient.x),
        y: gesture.view.y + (event.clientY - gesture.startClient.y),
      });
      return;
    }

    if (gesture.kind === "move") {
      const point = toWorld(event.clientX, event.clientY);
      const delta = { x: point.x - gesture.start.x, y: point.y - gesture.start.y };
      if (Math.abs(delta.x) + Math.abs(delta.y) < 2 / viewRef.current.zoom) return;
      if (!gesture.historyPushed) {
        gesture.historyPushed = true;
        onChange(gesture.elements, { history: true });
      }
      onChange(
        gesture.elements.map((element) =>
          gesture.ids.has(element.id) ? moveElement(element, delta) : element,
        ),
      );
      return;
    }

    if (gesture.kind === "draw") {
      const point = toWorld(event.clientX, event.clientY);
      if (gesture.element.kind === "stroke") {
        const last = gesture.element.points[gesture.element.points.length - 1];
        if (Math.hypot(point.x - last.x, point.y - last.y) < 1.2 / viewRef.current.zoom) return;
        setDraft({ ...gesture.element, points: [...gesture.element.points, point] });
      } else {
        const element = createDraftElement(tool, gesture.start, point, style);
        if (element) setDraft(element);
      }
      return;
    }

    if (gesture.kind === "erase") {
      const point = toWorld(event.clientX, event.clientY);
      const hit = topmostElementAt(gesture.remaining, point, 10 / viewRef.current.zoom);
      if (!hit) return;
      gesture.remaining = gesture.remaining.filter((element) => element.id !== hit.id);
      onChange(gesture.remaining);
    }
  };

  const handlePointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    const gesture = gestureRef.current;
    gestureRef.current = null;
    if (!gesture) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (gesture.kind === "draw") {
      const point = toWorld(event.clientX, event.clientY);
      let element = draft ?? gesture.element;
      setDraft(null);
      if (!element) return;
      if (element.kind === "stroke") {
        const points = [...element.points];
        const last = points[points.length - 1];
        if (Math.hypot(point.x - last.x, point.y - last.y) > 0) points.push(point);
        element = { ...element, points };
      } else if (element.kind === "line" || element.kind === "arrow") {
        if (Math.hypot(element.to.x - element.from.x, element.to.y - element.from.y) < 3) return;
      } else if (element.kind === "rect" || element.kind === "ellipse" || element.kind === "diamond") {
        const rect = normalizeRect(element.rect);
        if (rect.w < 3 || rect.h < 3) {
          const fallback = DEFAULT_SHAPE_SIZE(element.kind);
          element = {
            ...element,
            rect: {
              x: gesture.start.x - fallback.w / 2,
              y: gesture.start.y - fallback.h / 2,
              w: fallback.w,
              h: fallback.h,
            },
          };
        }
      } else {
        return;
      }
      onChange([...docRef.current.elements, element], { history: true });
      onSelectionChange([element.id]);
    }
  };

  const handleDoubleClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (tool !== "select") return;
    const point = toWorld(event.clientX, event.clientY);
    const hit = topmostElementAt(docRef.current.elements, point, 8 / viewRef.current.zoom);
    if (hit?.kind === "text") {
      onSelectionChange([hit.id]);
      startTextEditing(hit.id);
    }
  };

  const selected = new Set(selectedIds);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      data-no-drag
      className="relative h-full w-full overflow-hidden bg-white outline-none"
      style={{ cursor: CURSORS[tool] }}
      onPointerDown={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        const shortcut: Record<string, SketchTool> = {
          v: "select",
          h: "hand",
          p: "pen",
          l: "line",
          a: "arrow",
          r: "rect",
          o: "ellipse",
          d: "diamond",
          t: "text",
          e: "eraser",
        };
        const next = shortcut[event.key.toLowerCase()];
        if (next) {
          event.preventDefault();
          onToolChange(next);
        }
      }}
    >
      <svg
        className="absolute inset-0 h-full w-full touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
      >
        <g transform={`translate(${view.x} ${view.y}) scale(${view.zoom})`}>
          {doc.elements.map((element) =>
            element.kind === "text" && textEdit?.id === element.id ? null : (
              <SketchElementShape key={element.id} element={element} />
            ),
          )}
          {draft ? <SketchElementShape element={draft} /> : null}
          {doc.elements
            .filter((element) => selected.has(element.id))
            .map((element) => {
              const bounds = elementBounds(element);
              return (
                <rect
                  key={`selection-${element.id}`}
                  x={bounds.x - 6 / view.zoom}
                  y={bounds.y - 6 / view.zoom}
                  width={bounds.w + 12 / view.zoom}
                  height={bounds.h + 12 / view.zoom}
                  fill="none"
                  stroke="#3d8fd6"
                  strokeWidth={1.5 / view.zoom}
                  strokeDasharray={`${6 / view.zoom} ${4 / view.zoom}`}
                />
              );
            })}
        </g>
      </svg>

      {doc.elements.length === 0 && !draft && !textEdit ? (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-[#94a3b8]">
          <span className="text-sm font-medium">Comece a desenhar</span>
          <span className="text-xs">Caneta, formas e texto — tudo fica salvo no elemento.</span>
        </div>
      ) : null}

      {textEdit
        ? (() => {
            const element = doc.elements.find(
              (candidate): candidate is Extract<SketchElement, { kind: "text" }> =>
                candidate.id === textEdit.id && candidate.kind === "text",
            );
            if (!element) return null;
            const left = view.x + element.at.x * view.zoom;
            const top = view.y + element.at.y * view.zoom;
            return (
              <textarea
                autoFocus
                data-no-drag
                value={textEdit.value}
                onChange={(event) => {
                  const value = event.target.value;
                  setTextEdit((current) => (current ? { ...current, value } : current));
                  updateText(element.id, value);
                }}
                onBlur={() => commitText()}
                onPointerDown={(event) => event.stopPropagation()}
                onDoubleClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    commitText(true);
                    return;
                  }
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    commitText();
                  }
                }}
                rows={Math.max(1, textEdit.value.split("\n").length)}
                placeholder="Texto…"
                aria-label="Editar texto do desenho"
                className="absolute z-10 resize-none border border-primary bg-white/95 px-1 py-0.5 leading-tight text-[#1f2328] shadow outline-none"
                style={{
                  left,
                  top,
                  minWidth: 180 * view.zoom,
                  fontSize: element.fontSize * view.zoom,
                }}
              />
            );
          })()
        : null}

      <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded border border-border bg-white/95 p-1 text-[#1f2328] shadow">
        <button
          type="button"
          aria-label="Diminuir zoom"
          title="Diminuir zoom"
          onClick={() => setView((current) => ({ ...current, zoom: clamp(current.zoom / 1.2, 0.15, 4) }))}
          className="grid h-6 w-6 place-items-center rounded hover:bg-black/5"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-10 text-center text-[10.5px] tabular-nums">{Math.round(view.zoom * 100)}%</span>
        <button
          type="button"
          aria-label="Aumentar zoom"
          title="Aumentar zoom"
          onClick={() => setView((current) => ({ ...current, zoom: clamp(current.zoom * 1.2, 0.15, 4) }))}
          className="grid h-6 w-6 place-items-center rounded hover:bg-black/5"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <span className="mx-0.5 h-4 w-px bg-black/10" />
        <button
          type="button"
          aria-label="Enquadrar desenho"
          title="Enquadrar desenho"
          onClick={fitToContent}
          className="grid h-6 w-6 place-items-center rounded hover:bg-black/5"
        >
          <Maximize className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function createDraftElement(
  tool: SketchTool,
  from: SketchPoint,
  to: SketchPoint,
  style: SketchStyle,
): SketchElement | null {
  const draftStyle = createSketchStyle(style);
  switch (tool) {
    case "pen":
      return sketchElement({ kind: "stroke", style: draftStyle, points: [from] });
    case "line":
    case "arrow":
      return sketchElement({ kind: tool, style: draftStyle, from, to });
    case "rect":
    case "ellipse":
    case "diamond":
      return sketchElement({
        kind: tool,
        style: draftStyle,
        rect: normalizeRect({ x: from.x, y: from.y, w: to.x - from.x, h: to.y - from.y }),
      });
    default:
      return null;
  }
}
