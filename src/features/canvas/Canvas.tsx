import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LayoutTemplate, Plus, Sparkles } from "lucide-react";
import { DEFAULT_VIEWPORT, rectFromPoints, rectsIntersect, screenToWorld, type Point, type Rect } from "@/lib/geometry";
import { nodeRect, visibleNodes as filterVisible } from "@/core/domain/layout";
import { collectBoardTags, visibleNodeIdsForTag } from "@/core/domain/tags";
import { useAppStore } from "@/core/store";
import { activeBoard } from "@/core/store/helpers";
import { useActiveBoard, useRenderNodes, useViewport } from "@/core/store/selectors";
import { defaultSize } from "@/core/domain/constants";
import { importFiles, readFileAsText } from "@/core/media/attachments";
import { parseExcalidrawScene, markdownToNoteSeed, parseImportJson } from "@/core/export/importer";
import { Button } from "@/components/ui/button";
import { CanvasNodeView } from "./CanvasNodeView";
import { ConnectorLayer } from "./ConnectorLayer";
import { CanvasToolbar } from "./CanvasToolbar";
import { CanvasControls } from "./CanvasControls";
import { CanvasDropOverlay } from "./CanvasDropOverlay";
import { BoardHeader } from "./BoardHeader";
import { TagFilter } from "./TagFilter";
import type { ConnectorDraft } from "./canvasTypes";
import type { ID, NodeType } from "@/core/domain/types";
import { openDialogs } from "@/features/shell/dialogActions";

const TOOL_TYPES: Partial<Record<string, NodeType>> = {
  note: "note",
  text: "text",
  code: "code",
  card: "card",
  task: "task",
  checklist: "checklist",
  column: "column",
  drawing: "drawing",
  comment: "comment",
};

export function Canvas() {
  const board = useActiveBoard();
  const boardId = board?.id ?? null;
  const viewport = useViewport(boardId);
  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;

  const containerRef = useRef<HTMLDivElement>(null);
  const size = useAppStore((state) => state.canvasSize);
  const activeTool = useAppStore((state) => state.activeTool);
  const selection = useAppStore((state) => state.selection);
  const selectedConnectors = useAppStore((state) => state.selectedConnectors);
  const settings = useAppStore((state) => state.settings);
  const tagFilter = useAppStore((state) =>
    boardId ? state.tagFilters[boardId] ?? null : null,
  );
  const setTagFilter = useAppStore((state) => state.setTagFilter);

  const ordered = useRenderNodes(board);
  const [marquee, setMarquee] = useState<Rect | null>(null);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [panning, setPanning] = useState(false);
  const [connectorDraft, setConnectorDraft] = useState<ConnectorDraft | null>(null);
  const [dropActive, setDropActive] = useState(false);

  const nodeCount = board ? Object.keys(board.nodes).length : 0;
  const boardTags = useMemo(() => (board ? collectBoardTags(board) : []), [board]);
  const tagVisibleIds = useMemo(
    () => (board && tagFilter ? visibleNodeIdsForTag(board, tagFilter) : null),
    [board, tagFilter],
  );

  useEffect(() => {
    if (!board || !tagFilter) return;
    if (!boardTags.some((option) => option.key === tagFilter)) {
      setTagFilter(board.id, null);
    }
  }, [board, boardTags, tagFilter, setTagFilter]);

  useEffect(() => {
    useAppStore.getState().clearSelection();
  }, [tagFilter]);

  const collapsedParents = useMemo(() => {
    const ids = new Set<ID>();
    for (const node of Object.values(board?.nodes ?? {})) {
      if (node.type === "column" && node.collapsed) ids.add(node.id);
    }
    return ids;
  }, [board?.nodes]);

  const visible = useMemo(() => {
    if (!board) return [];
    const withoutCollapsed = ordered.filter((node) => {
      if (node.parentId && collapsedParents.has(node.parentId)) return false;
      return !tagVisibleIds || tagVisibleIds.has(node.id);
    });
    if (!size.width || !size.height) return withoutCollapsed;
    const world = {
      x: -viewport.x / viewport.zoom,
      y: -viewport.y / viewport.zoom,
      w: size.width / viewport.zoom,
      h: size.height / viewport.zoom,
    };
    return filterVisible(withoutCollapsed, world, 260);
  }, [board, ordered, collapsedParents, size.width, size.height, viewport, tagVisibleIds]);

  const localPoint = useCallback((clientX: number, clientY: number): Point => {
    const rect = containerRef.current?.getBoundingClientRect();
    return { x: clientX - (rect?.left ?? 0), y: clientY - (rect?.top ?? 0) };
  }, []);

  const getWorldPoint = useCallback(
    (clientX: number, clientY: number): Point => screenToWorld(localPoint(clientX, clientY), viewportRef.current),
    [localPoint],
  );

  // Tamanho do canvas para zoom/enquadramento e culling.
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const update = () => {
      const rect = element.getBoundingClientRect();
      useAppStore.getState().setCanvasSize({ width: rect.width, height: rect.height });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Barra de espaço = ferramenta mão temporária.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space") return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      event.preventDefault();
      setSpaceHeld(true);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") setSpaceHeld(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // Zoom / pan via wheel (não-passivo para poder cancelar o scroll).
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) event.preventDefault();
      const state = useAppStore.getState();
      const currentBoardId = state.tabs.find((tab) => tab.id === state.activeTabId)?.boardId;
      if (!currentBoardId) return;
      const current = state.viewports[currentBoardId] ?? DEFAULT_VIEWPORT;
      const anchor = localPoint(event.clientX, event.clientY);
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        const factor = Math.exp(-event.deltaY * 0.0016);
        const nextZoom = Math.min(3, Math.max(0.1, current.zoom * factor));
        const world = screenToWorld(anchor, current);
        state.setViewport(currentBoardId, {
          zoom: nextZoom,
          x: anchor.x - world.x * nextZoom,
          y: anchor.y - world.y * nextZoom,
        });
      } else {
        state.setViewport(currentBoardId, {
          x: current.x - event.deltaX,
          y: current.y - event.deltaY,
          zoom: current.zoom,
        });
      }
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [localPoint]);

  const startPan = (event: React.PointerEvent<HTMLDivElement>) => {
    const currentBoardId = boardId;
    if (!currentBoardId) return;
    const startViewport = useAppStore.getState().viewports[currentBoardId] ?? DEFAULT_VIEWPORT;
    const start = { x: event.clientX, y: event.clientY };
    setPanning(true);
    const onMove = (moveEvent: PointerEvent) => {
      useAppStore.getState().setViewport(currentBoardId, {
        x: startViewport.x + (moveEvent.clientX - start.x),
        y: startViewport.y + (moveEvent.clientY - start.y),
        zoom: startViewport.zoom,
      });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setPanning(false);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  /** Pan com espaço, botão do meio ou ferramenta mão funciona também sobre elementos. */
  const handleSurfacePointerDownCapture = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch" && event.isPrimary === false) return;
    const target = event.target as HTMLElement;
    if (target.closest("[data-canvas-ui]")) return;
    const wantsPan = event.button === 1 || (event.button === 0 && (spaceHeld || activeTool === "pan"));
    if (!wantsPan) return;
    event.preventDefault();
    event.stopPropagation();
    startPan(event);
  };

  const startMarquee = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!boardId) return;
    const state = useAppStore.getState();
    const start = localPoint(event.clientX, event.clientY);
    const additive = event.shiftKey;
    const base = additive ? state.selection : [];
    if (!additive) state.clearSelection();
    setMarquee({ x: start.x, y: start.y, w: 0, h: 0 });

    const onMove = (moveEvent: PointerEvent) => {
      const current = localPoint(moveEvent.clientX, moveEvent.clientY);
      const rect = rectFromPoints(start, current);
      setMarquee(rect);
      const currentState = useAppStore.getState();
      const currentBoard = activeBoard(currentState);
      if (!currentBoard) return;
      const vp = currentState.viewports[boardId] ?? DEFAULT_VIEWPORT;
      const world = {
        x: (rect.x - vp.x) / vp.zoom,
        y: (rect.y - vp.y) / vp.zoom,
        w: rect.w / vp.zoom,
        h: rect.h / vp.zoom,
      };
      const hits = Object.values(currentBoard.nodes)
        .filter((node) => !node.hidden && !node.locked && rectsIntersect(nodeRect(node), world))
        .filter((node) => !(node.parentId && currentBoard.nodes[node.parentId]?.collapsed))
        .filter((node) => !tagVisibleIds || tagVisibleIds.has(node.id))
        .map((node) => node.id);
      currentState.select(Array.from(new Set([...base, ...hits])));
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setMarquee(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const handleSurfacePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("[data-node-id]") || target.closest("[data-canvas-ui]")) return;
    if (event.button === 2) return;

    const state = useAppStore.getState();
    if (!board) return;

    if (event.button === 1 || spaceHeld || state.activeTool === "pan") {
      event.preventDefault();
      startPan(event);
      return;
    }

    if (state.activeTool === "connector") {
      state.setTool("select");
      state.clearSelection();
      return;
    }

    const nodeType = TOOL_TYPES[state.activeTool];
    if (nodeType) {
      const world = getWorldPoint(event.clientX, event.clientY);
      const dimensions = defaultSize(nodeType);
      const id = state.addNode(nodeType, {
        x: Math.round(world.x - dimensions.w / 2),
        y: Math.round(world.y - dimensions.h / 2),
      });
      if (id && nodeType === "drawing") state.openDrawing(id);
      if (id && (nodeType === "text" || nodeType === "code")) state.setEditingNode(id);
      state.setTool("select");
      return;
    }

    if (event.button === 0) {
      if (!event.shiftKey) state.clearSelection();
      startMarquee(event);
    }
  };

  const handleDoubleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("[data-node-id]") || target.closest("[data-canvas-ui]")) return;
    if (!board) return;
    const state = useAppStore.getState();
    if (state.activeTool !== "select") return;
    const world = getWorldPoint(event.clientX, event.clientY);
    const sizeOfNote = defaultSize("note");
    const id = state.addNode("note", {
      x: Math.round(world.x - sizeOfNote.w / 2),
      y: Math.round(world.y - sizeOfNote.h / 2),
    });
    if (id) state.setEditingNode(id);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDropActive(false);
    if (!board) return;
    const point = getWorldPoint(event.clientX, event.clientY);
    const files = Array.from(event.dataTransfer.files ?? []);
    if (files.length === 0) return;
    const media = [];
    for (const file of files) {
      if (/\.(md|markdown|txt)$/i.test(file.name)) {
        const text = await readFileAsText(file);
        const seed = markdownToNoteSeed(text, { filename: file.name });
        useAppStore.getState().addNode("note", point, {
          title: seed.title,
          content: seed.content,
          w: seed.w,
          h: seed.h,
        });
      } else if (/\.excalidraw$/i.test(file.name)) {
        const scene = parseExcalidrawScene(await readFileAsText(file));
        if (scene) {
          const id = useAppStore.getState().addNode("drawing", point, { fields: { scene } });
          if (id) useAppStore.getState().openDrawing(id);
        }
      } else if (/\.json$/i.test(file.name)) {
        try {
          const result = parseImportJson(await readFileAsText(file));
          useAppStore.getState().importNodes(result.nodes, result.connectors);
        } catch {
          media.push(file);
        }
      } else {
        media.push(file);
      }
    }
    if (media.length > 0) await importFiles(media, point);
  };

  const startConnector = useCallback(
    (nodeId: ID, clientX: number, clientY: number) => {
      const state = useAppStore.getState();
      const currentBoard = activeBoard(state);
      const node = currentBoard?.nodes[nodeId];
      if (!node) return;
      setConnectorDraft({
        fromNodeId: nodeId,
        from: { x: node.x + node.w / 2, y: node.y + node.h / 2 },
        to: getWorldPoint(clientX, clientY),
      });

      const onMove = (event: PointerEvent) => {
        const point = getWorldPoint(event.clientX, event.clientY);
        setConnectorDraft((previous) => (previous ? { ...previous, to: point } : previous));
      };
      const onUp = (event: PointerEvent) => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        setConnectorDraft(null);
        const latest = useAppStore.getState();
        const boardNow = activeBoard(latest);
        if (!boardNow) return;
        const point = getWorldPoint(event.clientX, event.clientY);
        const tolerance = 12 / viewportRef.current.zoom;
        const target = Object.values(boardNow.nodes)
          .filter((candidate) => candidate.id !== nodeId && !candidate.hidden)
          .filter((candidate) => !tagVisibleIds || tagVisibleIds.has(candidate.id))
          .sort((a, b) => b.z - a.z)
          .find(
            (candidate) =>
              point.x >= candidate.x - tolerance &&
              point.x <= candidate.x + candidate.w + tolerance &&
              point.y >= candidate.y - tolerance &&
              point.y <= candidate.y + candidate.h + tolerance,
          );
        if (target) {
          latest.addConnector({ nodeId, x: 0, y: 0 }, { nodeId: target.id, x: 0, y: 0 });
        } else if (
          point.x < node.x ||
          point.x > node.x + node.w ||
          point.y < node.y ||
          point.y > node.y + node.h
        ) {
          latest.addConnector({ nodeId, x: 0, y: 0 }, { nodeId: null, x: point.x, y: point.y });
        }
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [getWorldPoint],
  );

  if (!board) {
    return <EmptyWorkspace />;
  }

  const textureClass =
    settings.canvasTexture === "dots"
      ? "canvas-surface"
      : settings.canvasTexture === "grid"
        ? "canvas-surface-grid"
        : "canvas-surface-plain";
  const baseGrid = settings.gridSize * viewport.zoom;
  const gridSize =
    baseGrid >= 12 ? baseGrid : baseGrid * 2 ** Math.ceil(Math.log2(12 / Math.max(baseGrid, 0.0001)));
  const backgroundStyle =
    settings.canvasTexture === "plain"
      ? undefined
      : {
          backgroundSize: `${gridSize}px ${gridSize}px`,
          backgroundPosition: `${viewport.x}px ${viewport.y}px`,
        };

  const panMode = spaceHeld || activeTool === "pan";
  const cursorClass =
    panning
      ? "cursor-grabbing"
      : panMode
        ? "cursor-grab"
        : activeTool === "connector"
          ? "cursor-crosshair"
          : "cursor-default";

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden ${textureClass} ${cursorClass} ${
        panMode && !panning ? "canvas-pan-mode" : ""
      } ${panning ? "canvas-panning" : ""}`}
      style={backgroundStyle}
      onPointerDownCapture={handleSurfacePointerDownCapture}
      onPointerDown={handleSurfacePointerDown}
      onDoubleClick={handleDoubleClick}
      onDragOverCapture={(event) => {
        const target = event.target;
        if (target instanceof Element && target.closest("[data-drop-target]")) {
          setDropActive(false);
        }
      }}
      onDragOver={(event) => {
        if (!event.dataTransfer.types.includes("Files")) return;
        event.preventDefault();
        setDropActive(true);
      }}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) return;
        setDropActive(false);
      }}
      onDrop={(event) => void handleDrop(event)}
      data-canvas-root
      tabIndex={-1}
    >
      <div id="canvas-export-surface" className="absolute inset-0">
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{ transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})` }}
        >
          <ConnectorLayer
            board={board}
            draft={connectorDraft}
            selectedConnectors={selectedConnectors}
            showLabels={settings.showConnectorLabels}
            visibleNodeIds={tagVisibleIds}
          />
          {visible.map((node) => (
            <CanvasNodeView
              key={node.id}
              node={node}
              zoom={viewport.zoom}
              connectorMode={activeTool === "connector"}
              getWorldPoint={getWorldPoint}
              onStartConnector={startConnector}
            />
          ))}
        </div>
      </div>

      {marquee ? (
        <div
          className="pointer-events-none absolute rounded-md border border-primary/70 bg-primary/10"
          style={{ left: marquee.x, top: marquee.y, width: marquee.w, height: marquee.h }}
        />
      ) : null}

      <BoardHeader board={board} />
      <TagFilter
        board={board}
        value={tagFilter}
        onChange={(tag) => setTagFilter(board.id, tag)}
      />

      {nodeCount === 0 && !dropActive ? <EmptyBoard /> : null}

      <CanvasControls board={board} visibleNodeIds={tagVisibleIds} />
      <CanvasToolbar />

      {activeTool !== "select" && activeTool !== "pan" ? (
        <div
          className="pointer-events-none absolute bottom-24 left-1/2 z-20 -translate-x-1/2 rounded-full border border-border bg-popover/90 px-3 py-1.5 text-[11px] text-popover-foreground shadow-floating backdrop-blur"
          data-canvas-ui
        >
          {activeTool === "connector"
            ? "Arraste de um elemento para outro para criar uma seta · Esc para sair"
            : "Clique no canvas para posicionar · Esc para cancelar"}
        </div>
      ) : null}

      {selection.length > 0 || selectedConnectors.length > 0 ? (
        <div
          className="pointer-events-none absolute bottom-24 right-4 z-10 rounded-lg border border-border bg-popover/85 px-2.5 py-1 text-[10px] font-medium text-muted-foreground shadow-sm backdrop-blur"
          data-canvas-ui
        >
          {selectedConnectors.length > 0
            ? `${selectedConnectors.length} ${selectedConnectors.length === 1 ? "conector" : "conectores"}`
            : `${selection.length} ${selection.length === 1 ? "elemento" : "elementos"}`}
        </div>
      ) : null}

      <CanvasDropOverlay active={dropActive} />
      <input
        id="canvas-file-input"
        type="file"
        multiple
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          if (files.length === 0) return;
          const state = useAppStore.getState();
          const vp = state.viewports[board.id] ?? DEFAULT_VIEWPORT;
          const center = {
            x: (state.canvasSize.width / 2 - vp.x) / vp.zoom,
            y: (state.canvasSize.height / 2 - vp.y) / vp.zoom,
          };
          void importFiles(files, center);
        }}
      />
    </div>
  );
}

function EmptyBoard() {
  const state = useAppStore.getState();
  const applyTemplate = useAppStore((store) => store.applyTemplate);
  const viewport = useViewport(state.tabs.find((tab) => tab.id === state.activeTabId)?.boardId ?? null);
  const canvasSize = useAppStore((store) => store.canvasSize);
  const worldCenter = {
    x: (canvasSize.width / 2 - viewport.x) / viewport.zoom || 200,
    y: (canvasSize.height / 2 - viewport.y) / viewport.zoom || 160,
  };
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
      data-canvas-ui
    >
      <div className="pointer-events-auto w-[320px] rounded-2xl border border-border bg-card/95 p-5 text-center shadow-floating backdrop-blur">
        <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <h2 className="text-sm font-semibold">Canvas vazio</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Duplo clique em qualquer lugar para criar uma nota, ou comece com um modelo.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Button
            size="sm"
            onClick={() =>
              state.addNode("note", {
                x: Math.round(worldCenter.x - 140),
                y: Math.round(worldCenter.y - 110),
              })
            }
          >
            <Plus className="h-3.5 w-3.5" /> Adicionar nota
          </Button>
          <Button size="sm" variant="outline" onClick={() => applyTemplate("brainstorm")}>
            <LayoutTemplate className="h-3.5 w-3.5" /> Usar modelo Brainstorm
          </Button>
          <Button size="sm" variant="ghost" onClick={() => openDialogs.templates()}>
            Ver todos os modelos
          </Button>
        </div>
      </div>
    </div>
  );
}

function EmptyWorkspace() {
  const createBoard = useAppStore((state) => state.createBoard);
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-canvas">
      <div className="w-[340px] rounded-2xl border border-border bg-card p-6 text-center shadow-panel">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="h-6 w-6" />
        </div>
        <h2 className="text-base font-semibold">Nenhum quadro aberto</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Crie um quadro novo para começar a organizar suas ideias visualmente.
        </p>
        <Button className="mt-4 w-full" onClick={() => createBoard({})}>
          <Plus className="h-4 w-4" /> Criar quadro
        </Button>
      </div>
    </div>
  );
}
