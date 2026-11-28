import { useCallback, useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Circle,
  Copy,
  Diamond,
  Download,
  Eraser,
  Hand,
  Layers,
  Loader2,
  Minus,
  MousePointer2,
  MoveUpRight,
  Pencil,
  PenTool,
  Redo2,
  Save,
  Slash,
  Square,
  Trash2,
  Type,
  Undo2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/core/store";
import { downloadBlob } from "@/core/media/attachments";
import {
  SKETCH_FILL_COLORS,
  SKETCH_FONT_SIZE,
  SKETCH_STROKE_COLORS,
  SKETCH_WIDTHS,
  createSketch,
  createSketchStyle,
  duplicateElements,
  type SketchDocument,
  type SketchElement,
  type SketchStyle,
  type SketchTool,
} from "@/core/domain/sketch";
import { suggestedFilename } from "@/features/export/boardExport";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { SketchEditor } from "./SketchEditor";
import { sketchToPdfBlob, sketchToPngBlob, sketchToSvg, type SketchExportFormat } from "./sketchExport";

const TOOLS: { id: SketchTool; label: string; shortcut: string; icon: LucideIcon }[] = [
  { id: "select", label: "Selecionar", shortcut: "V", icon: MousePointer2 },
  { id: "hand", label: "Mover tela", shortcut: "H", icon: Hand },
  { id: "pen", label: "Caneta", shortcut: "P", icon: Pencil },
  { id: "line", label: "Linha", shortcut: "L", icon: Slash },
  { id: "arrow", label: "Seta", shortcut: "A", icon: MoveUpRight },
  { id: "rect", label: "Retângulo", shortcut: "R", icon: Square },
  { id: "ellipse", label: "Elipse", shortcut: "O", icon: Circle },
  { id: "diamond", label: "Losango", shortcut: "D", icon: Diamond },
  { id: "text", label: "Texto", shortcut: "T", icon: Type },
  { id: "eraser", label: "Borracha", shortcut: "E", icon: Eraser },
];

/**
 * Editor do desenho nativo do app: ferramentas vetoriais, histórico próprio,
 * salvamento automático e exportação. Conteúdo Excalidraw antigo continua no
 * diálogo original; cada desenho guarda em `drawingEngine` qual editor usar.
 */
export function SketchDialog() {
  const open = useAppStore((state) => state.dialog === "sketch");
  const closeDialog = useAppStore((state) => state.closeDialog);
  const node = useAppStore((state) => {
    if (!state.sketchNodeId) return undefined;
    for (const board of Object.values(state.boards)) {
      const found = board.nodes[state.sketchNodeId];
      if (found) return found;
    }
    return undefined;
  });
  const updateSketch = useAppStore((state) => state.updateSketch);
  const updateNode = useAppStore((state) => state.updateNode);

  const [doc, setDoc] = useState<SketchDocument>(() => node?.sketch ?? createSketch());
  const [title, setTitle] = useState(node?.title ?? "Desenho");
  const [tool, setTool] = useState<SketchTool>("select");
  const [style, setStyle] = useState<SketchStyle>(() => createSketchStyle());
  const [selection, setSelection] = useState<string[]>([]);
  const [fitNonce, setFitNonce] = useState(0);
  const [saving, setSaving] = useState(false);
  const [historyCounts, setHistoryCounts] = useState({ past: 0, future: 0 });

  const nodeRef = useRef(node);
  nodeRef.current = node;
  const docRef = useRef(doc);
  docRef.current = doc;
  const past = useRef<SketchDocument[]>([]);
  const future = useRef<SketchDocument[]>([]);
  const saveTimer = useRef<number | null>(null);
  const dirty = useRef(false);

  useEffect(() => {
    if (!open) return;
    const current = nodeRef.current;
    const next = current?.sketch ?? createSketch();
    docRef.current = next;
    setDoc(next);
    setTitle(current?.title ?? "Desenho");
    setTool("select");
    setStyle(createSketchStyle());
    setSelection([]);
    past.current = [];
    future.current = [];
    setHistoryCounts({ past: 0, future: 0 });
    dirty.current = false;
  }, [open, node?.id]);

  const flush = useCallback(
    (withSavingState = true) => {
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
      const current = nodeRef.current;
      if (!current || !dirty.current) return;
      dirty.current = false;
      if (withSavingState) setSaving(true);
      try {
        updateSketch(current.id, { ...docRef.current, updatedAt: Date.now() });
      } finally {
        if (withSavingState) setSaving(false);
      }
    },
    [updateSketch],
  );

  const scheduleSave = useCallback(() => {
    dirty.current = true;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => flush(false), 700);
  }, [flush]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      const current = nodeRef.current;
      if (current && dirty.current) {
        updateSketch(current.id, { ...docRef.current, updatedAt: Date.now() });
        dirty.current = false;
      }
    };
  }, [updateSketch]);

  const applyElements = useCallback(
    (elements: SketchElement[], options: { history?: boolean } = {}) => {
      if (options.history) {
        past.current = [...past.current, docRef.current].slice(-80);
        future.current = [];
        setHistoryCounts({ past: past.current.length, future: future.current.length });
      }
      const next: SketchDocument = { ...docRef.current, elements, updatedAt: Date.now() };
      docRef.current = next;
      setDoc(next);
      scheduleSave();
    },
    [scheduleSave],
  );

  const undo = useCallback(() => {
    const previous = past.current.pop();
    if (!previous) return;
    future.current = [...future.current, docRef.current].slice(-80);
    docRef.current = previous;
    setDoc(previous);
    setSelection((current) => current.filter((id) => previous.elements.some((element) => element.id === id)));
    setHistoryCounts({ past: past.current.length, future: future.current.length });
    scheduleSave();
  }, [scheduleSave]);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    past.current = [...past.current, docRef.current].slice(-80);
    docRef.current = next;
    setDoc(next);
    setSelection((current) => current.filter((id) => next.elements.some((element) => element.id === id)));
    setHistoryCounts({ past: past.current.length, future: future.current.length });
    scheduleSave();
  }, [scheduleSave]);

  const removeSelected = useCallback(() => {
    if (selection.length === 0) return;
    const ids = new Set(selection);
    applyElements(
      docRef.current.elements.filter((element) => !ids.has(element.id)),
      { history: true },
    );
    setSelection([]);
  }, [applyElements, selection]);

  const duplicateSelected = useCallback(() => {
    if (selection.length === 0) return;
    const clones = duplicateElements(docRef.current.elements, selection);
    if (clones.length === 0) return;
    applyElements([...docRef.current.elements, ...clones], { history: true });
    setSelection(clones.map((clone) => clone.id));
  }, [applyElements, selection]);

  const applyStyle = (patch: Partial<SketchStyle>) => {
    setStyle((current) => ({ ...current, ...patch }));
    if (selection.length === 0) return;
    const ids = new Set(selection);
    applyElements(
      docRef.current.elements.map((element) =>
        ids.has(element.id) ? { ...element, style: { ...element.style, ...patch } } : element,
      ),
      { history: true },
    );
  };

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      ) {
        return;
      }
      const mod = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      if (mod && key === "d") {
        event.preventDefault();
        duplicateSelected();
        return;
      }
      if (mod && key === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if (mod && key === "y") {
        event.preventDefault();
        redo();
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        removeSelected();
        return;
      }
      if (event.key === "Escape") {
        setSelection([]);
        return;
      }
      if (event.key === "?" || event.key === "1") {
        setFitNonce((value) => value + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, undo, redo, removeSelected, duplicateSelected]);

  const exportSketch = async (format: SketchExportFormat) => {
    try {
      const name = suggestedFilename(title || "desenho", format);
      if (format === "svg") {
        downloadBlob(name, new Blob([sketchToSvg(docRef.current)], { type: "image/svg+xml" }));
      } else if (format === "png") {
        downloadBlob(name, await sketchToPngBlob(docRef.current));
      } else {
        downloadBlob(name, await sketchToPdfBlob(docRef.current));
      }
      toast.success(`Desenho exportado em ${format.toUpperCase()}`);
    } catch (error) {
      toast.error("Falha ao exportar desenho", {
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const handleClose = () => {
    flush(false);
    const current = nodeRef.current;
    if (current) {
      const trimmed = title.trim();
      if (trimmed && trimmed !== current.title) {
        updateNode(current.id, { title: trimmed }, { label: "Renomear desenho" });
      }
    }
    closeDialog();
  };

  const openExcalidraw = () => {
    const current = nodeRef.current;
    if (!current) return;
    flush(false);
    useAppStore.getState().openDrawing(current.id);
  };

  if (!open || !node) return null;

  const canUndo = historyCounts.past > 0;
  const canRedo = historyCounts.future > 0;
  const selectedCount = selection.length;

  return (
    <Dialog open={open} onOpenChange={(value) => (value ? undefined : handleClose())}>
      <DialogContent
        className="flex h-[92vh] w-[96vw] max-w-none flex-col gap-0 overflow-hidden p-0"
        hideClose
      >
        <DialogTitle className="sr-only">Editor de desenho nativo</DialogTitle>

        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-primary">
            <PenTool className="h-4 w-4" />
          </span>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() => {
              const trimmed = title.trim();
              if (node && trimmed && trimmed !== node.title) {
                updateNode(node.id, { title: trimmed }, { label: "Renomear desenho" });
              }
            }}
            aria-label="Título do desenho"
            className="h-8 max-w-[280px] border-transparent bg-transparent text-sm font-medium shadow-none focus-visible:border-input"
          />
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {doc.elements.length} {doc.elements.length === 1 ? "elemento" : "elementos"}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            {saving ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" /> salvando…
              </>
            ) : (
              <>
                <Save className="h-3 w-3" /> salvo automaticamente
              </>
            )}
          </span>

          <div className="ml-auto flex items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  <Layers className="h-3.5 w-3.5" /> Cena
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Editor</DropdownMenuLabel>
                <DropdownMenuItem onClick={openExcalidraw}>
                  <PenTool /> Abrir no Excalidraw
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Exportar</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => void exportSketch("png")}>PNG (imagem)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => void exportSketch("svg")}>SVG (vetor)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => void exportSketch("pdf")}>PDF (documento)</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => flush()}>Salvar agora</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  <Download className="h-3.5 w-3.5" /> Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Formato</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => void exportSketch("png")}>PNG (imagem)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => void exportSketch("svg")}>SVG (vetor)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => void exportSketch("pdf")}>PDF (documento)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" onClick={handleClose}>
              <X className="h-3.5 w-3.5" /> Fechar
            </Button>
          </div>
        </header>

        <div className="flex shrink-0 flex-wrap items-center gap-1 border-b border-border bg-muted/30 px-3 py-1.5">
          <div className="flex items-center gap-0.5">
            {TOOLS.map((item) => {
              const Icon = item.icon;
              const active = tool === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-label={item.label}
                  aria-pressed={active}
                  title={`${item.label} (${item.shortcut})`}
                  onClick={() => setTool(item.id)}
                  className={cn(
                    "grid h-7 w-7 place-items-center rounded transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/70 hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              );
            })}
          </div>

          <span className="mx-1 h-5 w-px bg-border" />

          <button
            type="button"
            aria-label="Desfazer"
            title="Desfazer (Ctrl+Z)"
            disabled={!canUndo}
            onClick={undo}
            className="grid h-7 w-7 place-items-center rounded text-foreground/70 hover:bg-accent disabled:opacity-30"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Refazer"
            title="Refazer (Ctrl+Shift+Z)"
            disabled={!canRedo}
            onClick={redo}
            className="grid h-7 w-7 place-items-center rounded text-foreground/70 hover:bg-accent disabled:opacity-30"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>

          <span className="mx-1 h-5 w-px bg-border" />

          <div className="flex items-center gap-1" role="group" aria-label="Cor do traço">
            {SKETCH_STROKE_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                aria-label={`Cor ${color.label}`}
                title={color.label}
                onClick={() => applyStyle({ stroke: color.value })}
                className={cn(
                  "h-4 w-4 rounded-full border transition-transform hover:scale-110",
                  style.stroke === color.value ? "ring-2 ring-primary ring-offset-1" : "border-black/10",
                )}
                style={{ backgroundColor: color.value }}
              />
            ))}
          </div>

          <span className="mx-1 h-5 w-px bg-border" />

          <div className="flex items-center gap-0.5" role="group" aria-label="Espessura do traço">
            {SKETCH_WIDTHS.map((width) => (
              <button
                key={width}
                type="button"
                aria-label={`Espessura ${width}`}
                title={`Espessura ${width}`}
                aria-pressed={style.width === width}
                onClick={() => applyStyle({ width })}
                className={cn(
                  "grid h-6 w-6 place-items-center rounded",
                  style.width === width ? "bg-primary/15 text-primary" : "text-foreground/70 hover:bg-accent",
                )}
              >
                <Minus style={{ strokeWidth: Math.max(1, width / 2) }} className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>

          <button
            type="button"
            aria-label="Traço tracejado"
            aria-pressed={style.dashed}
            title="Traço tracejado"
            onClick={() => applyStyle({ dashed: !style.dashed })}
            className={cn(
              "h-6 rounded px-1.5 text-[10px] font-medium",
              style.dashed ? "bg-primary/15 text-primary" : "text-foreground/70 hover:bg-accent",
            )}
          >
            - - -
          </button>

          <select
            value={style.fill}
            onChange={(event) => applyStyle({ fill: event.target.value })}
            aria-label="Preenchimento"
            title="Preenchimento"
            className="h-6 rounded bg-transparent px-1 text-[10.5px] outline-none hover:bg-accent"
          >
            {SKETCH_FILL_COLORS.map((fill) => (
              <option key={fill.value} value={fill.value}>
                {fill.label}
              </option>
            ))}
          </select>

          <span className="mx-1 h-5 w-px bg-border" />

          <button
            type="button"
            aria-label="Excluir seleção"
            title="Excluir seleção (Delete)"
            disabled={selectedCount === 0}
            onClick={removeSelected}
            className="grid h-7 w-7 place-items-center rounded text-foreground/70 hover:bg-accent disabled:opacity-30"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Duplicar seleção"
            title="Duplicar seleção (Ctrl+D)"
            disabled={selectedCount === 0}
            onClick={duplicateSelected}
            className="grid h-7 w-7 place-items-center rounded text-foreground/70 hover:bg-accent disabled:opacity-30"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <span className="text-[10px] text-muted-foreground">
            {selectedCount > 0 ? `${selectedCount} selecionado${selectedCount > 1 ? "s" : ""}` : ""}
          </span>
        </div>

        <div className="relative min-h-0 flex-1">
          <SketchEditor
            doc={doc}
            tool={tool}
            style={style}
            selectedIds={selection}
            fitNonce={fitNonce}
            onToolChange={setTool}
            onSelectionChange={setSelection}
            onChange={(elements, options) => applyElements(elements, options)}
          />
        </div>

        <footer className="flex shrink-0 items-center justify-between border-t border-border px-3 py-1 text-[10px] text-muted-foreground">
          <span>
            Roda move a tela · Ctrl/Cmd + roda dá zoom · Delete apaga · Ctrl/Cmd+D duplica
          </span>
          <span className="tabular-nums">Desenho nativo · {SKETCH_FONT_SIZE}px de texto</span>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
