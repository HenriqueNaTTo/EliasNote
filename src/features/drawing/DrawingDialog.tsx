import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ClipboardPaste, Download, FileUp, Layers, Loader2, PenTool, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Excalidraw, exportToBlob } from "@excalidraw/excalidraw";
import { useAppStore } from "@/core/store";
import { getAdapter } from "@/core/persistence/adapter";
import { downloadBlob, readFileAsText } from "@/core/media/attachments";
import type { CanvasNode, DrawingScene } from "@/core/domain/types";
import { blobToDataUrl, sceneToPdfBlob, sceneToPngBlob, sceneToSvgString } from "./drawingExport";
import { mergeExcalidrawScenes, parseExcalidrawSceneData } from "./sceneMerge";
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

interface SceneSnapshot {
  elements: readonly unknown[];
  appState: Record<string, unknown>;
  files: Record<string, unknown>;
}

interface ExcalidrawApi {
  getSceneElements: () => readonly Record<string, unknown>[];
  getAppState: () => Record<string, unknown>;
  getFiles: () => Record<string, unknown>;
  addFiles: (files: unknown[]) => void;
  updateScene: (scene: { elements: readonly Record<string, unknown>[] }) => void;
  scrollToContent: (target?: readonly Record<string, unknown>[]) => void;
}

const APP_STATE_KEYS = [
  "viewBackgroundColor",
  "gridSize",
  "currentItemStrokeColor",
  "currentItemBackgroundColor",
  "currentItemFillStyle",
  "currentItemStrokeWidth",
  "currentItemRoughness",
  "currentItemOpacity",
  "currentItemFontFamily",
  "currentItemFontSize",
  "currentItemTextAlign",
  "currentItemStrokeStyle",
  "currentItemRoundness",
  "scrollX",
  "scrollY",
  "zoom",
];

function pickAppState(appState: Record<string, unknown>): Record<string, unknown> {
  const picked: Record<string, unknown> = {};
  for (const key of APP_STATE_KEYS) {
    if (appState[key] !== undefined) picked[key] = appState[key];
  }
  return picked;
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Falha ao carregar miniatura"));
    image.src = dataUrl;
  });
}

async function makeThumbnail(snapshot: SceneSnapshot): Promise<string | null> {
  if (snapshot.elements.length === 0) return null;
  if (snapshot.elements.length > 900) return null;
  try {
    const blob = await exportToBlob({
      elements: snapshot.elements as never,
      appState: {
        ...snapshot.appState,
        exportBackground: true,
        viewBackgroundColor: "#ffffff",
      } as never,
      files: snapshot.files as never,
      mimeType: "image/png",
      quality: 0.7,
      exportPadding: 16,
    });
    const dataUrl = await blobToDataUrl(blob);
    const image = await loadImage(dataUrl);
    const scale = Math.min(1, 520 / image.width, 380 / image.height);
    if (scale >= 1) return dataUrl;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");
    if (!context) return dataUrl;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

/**
 * Editor Excalidraw em tela cheia. O estado é salvo com debounce e a miniatura
 * é gerada de forma adiada para manter o canvas principal leve.
 */
export function DrawingDialog() {
  const open = useAppStore((state) => state.dialog === "drawing");
  const closeDialog = useAppStore((state) => state.closeDialog);
  const node = useAppStore((state) => {
    if (!state.drawingNodeId) return undefined;
    for (const board of Object.values(state.boards)) {
      const found = board.nodes[state.drawingNodeId];
      if (found) return found;
    }
    return undefined;
  });
  const updateDrawingScene = useAppStore((state) => state.updateDrawingScene);
  const updateNode = useAppStore((state) => state.updateNode);
  const theme = useAppStore((state) => state.settings.theme);
  const boards = useAppStore((state) => state.boards);

  const [ready, setReady] = useState(false);
  const [title, setTitle] = useState(node?.title ?? "Desenho");
  const [count, setCount] = useState(node?.scene?.elements.length ?? 0);
  const [saving, setSaving] = useState(false);
  const [libraryItems, setLibraryItems] = useState<unknown[]>([]);
  const sceneRef = useRef<SceneSnapshot | null>(null);
  const saveTimer = useRef<number | null>(null);
  const thumbTimer = useRef<number | null>(null);
  const apiRef = useRef<ExcalidrawApi | null>(null);
  const mergeInputRef = useRef<HTMLInputElement>(null);
  const nodeRef = useRef(node);
  nodeRef.current = node;

  const otherDrawings = useMemo(() => {
    if (!node) return [];
    const items: { node: CanvasNode; boardTitle: string }[] = [];
    for (const board of Object.values(boards)) {
      for (const candidate of Object.values(board.nodes)) {
        if (
          candidate.type === "drawing" &&
          candidate.id !== node.id &&
          (candidate.scene?.elements.length ?? 0) > 0
        ) {
          items.push({ node: candidate, boardTitle: board.title });
        }
      }
    }
    return items
      .sort((a, b) => (a.node.title ?? "").localeCompare(b.node.title ?? "", "pt-BR"))
      .slice(0, 12);
  }, [boards, node?.id]);

  useEffect(() => {
    if (!open) return;
    apiRef.current = null;
    const current = nodeRef.current;
    setTitle(current?.title ?? "Desenho");
    setCount(current?.scene?.elements.length ?? 0);
    setReady(false);
    let active = true;
    void getAdapter().then(async (adapter) => {
      const stored = await adapter.readDoc<{ items: unknown[] }>("library", "main");
      if (!active) return;
      setLibraryItems(stored?.items ?? []);
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, [open, node?.id]);

  const persist = useCallback(
    async (withThumbnail: boolean) => {
      const current = nodeRef.current;
      const scene = sceneRef.current;
      if (!current || !scene) return;
      setSaving(true);
      try {
        let thumbnail = current.scene?.thumbnail ?? null;
        if (withThumbnail) {
          const generated = await makeThumbnail(scene);
          if (generated !== null) thumbnail = generated;
        }
        updateDrawingScene(
          current.id,
          {
            elements: [...scene.elements],
            appState: scene.appState,
            files: scene.files,
            updatedAt: Date.now(),
          },
          thumbnail,
        );
      } finally {
        setSaving(false);
      }
    },
    [updateDrawingScene],
  );

  useEffect(() => {
    if (!open || !ready) return;
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      if (thumbTimer.current) window.clearTimeout(thumbTimer.current);
      if (sceneRef.current) {
        void persist(true);
      }
    };
  }, [open, ready, persist]);

  const handleChange = (
    elements: readonly unknown[],
    appState: Record<string, unknown>,
    files: Record<string, unknown>,
  ) => {
    sceneRef.current = {
      elements,
      appState: pickAppState(appState),
      files,
    };
    setCount(elements.length);
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => void persist(false), 900);
    if (thumbTimer.current) window.clearTimeout(thumbTimer.current);
    thumbTimer.current = window.setTimeout(() => void persist(true), 4200);
  };

  const handleClose = async () => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    if (thumbTimer.current) window.clearTimeout(thumbTimer.current);
    const current = nodeRef.current;
    if (current && sceneRef.current) await persist(true);
    sceneRef.current = null;
    if (current && title.trim() && title.trim() !== current.title) {
      updateNode(current.id, { title: title.trim() }, { label: "Renomear desenho" });
    }
    closeDialog();
  };

  const mergeScene = (incoming: DrawingScene, sourceLabel: string) => {
    const api = apiRef.current;
    if (!api) {
      toast.error("O editor ainda está carregando.");
      return;
    }
    const currentElements = [...api.getSceneElements()];
    const currentFiles = api.getFiles();
    const result = mergeExcalidrawScenes(
      { elements: currentElements, files: currentFiles },
      incoming,
    );
    if (result.addedCount === 0) {
      toast.info("Nada para mesclar nesta cena.");
      return;
    }

    const appState = pickAppState(api.getAppState());
    sceneRef.current = { elements: result.elements, appState, files: result.files };
    setCount(result.elements.length);

    const fileData = Object.values(result.addedFiles).filter(
      (file): file is Record<string, unknown> => Boolean(file) && typeof file === "object",
    );
    if (fileData.length > 0) api.addFiles(fileData);
    api.updateScene({ elements: result.elements });
    api.scrollToContent(result.elements);

    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = null;
    if (thumbTimer.current) window.clearTimeout(thumbTimer.current);
    thumbTimer.current = null;
    void persist(true);

    toast.success(
      `${result.addedCount} ${result.addedCount === 1 ? "elemento adicionado" : "elementos adicionados"}`,
      { description: sourceLabel },
    );
  };

  const mergeFromRaw = (raw: string, sourceLabel: string) => {
    const scene = parseExcalidrawSceneData(raw);
    if (!scene || scene.elements.length === 0) {
      throw new Error("O conteúdo não é uma cena Excalidraw válida.");
    }
    mergeScene(scene, sourceLabel);
  };

  const importSceneFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      mergeFromRaw(await readFileAsText(file), file.name);
    } catch (error) {
      toast.error("Arquivo Excalidraw inválido", {
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const pasteScene = async () => {
    try {
      if (!navigator.clipboard?.readText) {
        throw new Error("A área de transferência não está acessível.");
      }
      const text = await navigator.clipboard.readText();
      mergeFromRaw(text, "Área de transferência");
    } catch (error) {
      toast.error("Não foi possível colar a cena", {
        description: `${error instanceof Error ? error.message : String(error)} Use “Importar arquivo .excalidraw” ou “Mesclar desenho do workspace”.`,
      });
    }
  };

  const mergeOtherDrawing = (candidate: CanvasNode) => {
    if (!candidate.scene) return;
    mergeScene(candidate.scene, `Desenho: ${candidate.title || "sem título"}`);
  };

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const initialData = useMemo(() => {
    if (!node) return null;
    return {
      elements: node.scene?.elements ?? [],
      appState: {
        viewBackgroundColor: isDark ? "#111214" : "#ffffff",
        gridSize: 20,
        ...(node.scene?.appState ?? {}),
      },
      files: node.scene?.files ?? {},
      libraryItems,
      scrollToContent: true,
    } as unknown as Record<string, unknown>;
  }, [node?.id, libraryItems, isDark, ready]);

  const openNativeEditor = async () => {
    const current = nodeRef.current;
    if (!current) return;
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    if (thumbTimer.current) {
      window.clearTimeout(thumbTimer.current);
      thumbTimer.current = null;
    }
    if (sceneRef.current) await persist(true);
    sceneRef.current = null;
    const trimmed = title.trim();
    if (trimmed && trimmed !== current.title) {
      useAppStore.getState().updateNode(current.id, { title: trimmed }, { label: "Renomear desenho" });
    }
    useAppStore.getState().openSketch(current.id);
  };

  const exportScene = async (mode: "png" | "svg" | "pdf") => {
    const scene = sceneRef.current ?? (node?.scene ? {
      elements: node.scene.elements,
      appState: node.scene.appState,
      files: node.scene.files,
    } : null);
    if (!scene) return;
    const drawingScene = {
      elements: [...scene.elements],
      appState: scene.appState,
      files: scene.files,
      thumbnail: node?.scene?.thumbnail ?? null,
      updatedAt: Date.now(),
    };
    try {
      const name = suggestedFilename(title || "desenho", mode);
      if (mode === "png") downloadBlob(name, await sceneToPngBlob(drawingScene));
      else if (mode === "pdf") downloadBlob(name, await sceneToPdfBlob(drawingScene));
      else downloadBlob(name, new Blob([await sceneToSvgString(drawingScene)], { type: "image/svg+xml" }));
      toast.success(`Desenho exportado em ${mode.toUpperCase()}`);
    } catch (error) {
      toast.error("Falha ao exportar desenho", { description: String(error) });
    }
  };

  if (!open || !node) return null;

  return (
    <Dialog open={open} onOpenChange={(value) => (value ? undefined : void handleClose())}>
      <DialogContent className="flex h-[92vh] w-[96vw] max-w-none flex-col gap-0 overflow-hidden p-0" hideClose>
        <DialogTitle className="sr-only">Editor de desenho</DialogTitle>
        <input
          ref={mergeInputRef}
          type="file"
          accept=".excalidraw,application/json,.json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            void importSceneFile(file);
          }}
        />
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/10 text-primary">
            <PenTool className="h-4 w-4" />
          </span>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() => {
              if (node && title.trim() && title.trim() !== node.title) {
                useAppStore.getState().updateNode(node.id, { title: title.trim() }, { label: "Renomear desenho" });
              }
            }}
            className="h-8 max-w-[280px] border-transparent bg-transparent text-sm font-medium shadow-none focus-visible:border-input"
          />
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {count} elementos
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
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>Editor</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => void openNativeEditor()}>
                  <PenTool /> Abrir no editor nativo
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Adicionar elementos</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => void pasteScene()}>
                  <ClipboardPaste /> Colar cena do clipboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => mergeInputRef.current?.click()}>
                  <FileUp /> Importar arquivo .excalidraw
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Mesclar desenho do workspace</DropdownMenuLabel>
                {otherDrawings.length === 0 ? (
                  <DropdownMenuItem disabled>Nenhum outro desenho</DropdownMenuItem>
                ) : (
                  otherDrawings.map((item) => (
                    <DropdownMenuItem
                      key={item.node.id}
                      onClick={() => mergeOtherDrawing(item.node)}
                    >
                      <PenTool />
                      <span className="min-w-0 flex-1 truncate">{item.node.title || "Desenho"}</span>
                      <span className="max-w-[76px] shrink-0 truncate text-[9px] text-muted-foreground">
                        {item.boardTitle}
                      </span>
                    </DropdownMenuItem>
                  ))
                )}
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
                <DropdownMenuItem onClick={() => void exportScene("png")}>PNG (imagem)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => void exportScene("svg")}>SVG (vetor)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => void exportScene("pdf")}>PDF (documento)</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void persist(true)}>Salvar agora</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" onClick={() => void handleClose()}>
              <X className="h-3.5 w-3.5" /> Fechar
            </Button>
          </div>
        </header>

        <div className="excalidraw-host relative min-h-0 flex-1">
          {ready ? (
            <Excalidraw
              key={node.id}
              initialData={initialData as never}
              onChange={(elements, appState, files) =>
                handleChange(
                  elements,
                  appState as unknown as Record<string, unknown>,
                  files as unknown as Record<string, unknown>,
                )
              }
              onLibraryChange={(items) => {
                setLibraryItems(items as unknown[]);
                void getAdapter().then((adapter) =>
                  adapter.writeDoc("library", "main", { items }),
                );
              }}
              excalidrawAPI={(api) => {
                apiRef.current = api as unknown as ExcalidrawApi;
              }}
              theme={isDark ? "dark" : "light"}
              langCode="pt-BR"
              name={title}
              UIOptions={{
                canvasActions: {
                  loadScene: false,
                  saveToActiveFile: false,
                  toggleTheme: false,
                },
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando biblioteca de desenho…
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
