import { useMemo } from "react";
import type { Board, ID } from "@/core/domain/types";
import { useAppStore } from "@/core/store";
import { useViewport } from "@/core/store/selectors";
import { nodesBounds } from "@/core/domain/layout";
import { DEFAULT_VIEWPORT, unionRects, viewportWorldRect } from "@/lib/geometry";
import { cn } from "@/lib/utils";

const MAP_WIDTH = 168;
const MAP_HEIGHT = 108;

/** Minimapa com todos os elementos e o retângulo do viewport atual. */
export function Minimap({
  board,
  visibleNodeIds,
}: {
  board: Board;
  visibleNodeIds?: ReadonlySet<ID> | null;
}) {
  const viewport = useViewport(board.id);
  const size = useAppStore((state) => state.canvasSize);
  const viewRect = useMemo(() => viewportWorldRect(viewport, size), [viewport, size]);

  const nodes = useMemo(
    () =>
      Object.values(board.nodes).filter(
        (node) => !node.hidden && (!visibleNodeIds || visibleNodeIds.has(node.id)),
      ),
    [board.nodes, visibleNodeIds],
  );
  const bounds = useMemo(() => nodesBounds(nodes), [nodes]);

  const union = useMemo(() => {
    if (!bounds) return { x: viewRect.x, y: viewRect.y, w: Math.max(viewRect.w, 800), h: Math.max(viewRect.h, 600) };
    return unionRects([bounds, viewRect]) ?? bounds;
  }, [bounds, viewRect]);

  const padding = 48;
  const scale = Math.min(
    MAP_WIDTH / Math.max(union.w + padding * 2, 1),
    MAP_HEIGHT / Math.max(union.h + padding * 2, 1),
  );
  const offsetX = (MAP_WIDTH - union.w * scale) / 2 - union.x * scale;
  const offsetY = (MAP_HEIGHT - union.h * scale) / 2 - union.y * scale;

  const handlePointer = (clientX: number, clientY: number, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    const world = { x: (localX - offsetX) / scale, y: (localY - offsetY) / scale };
    const state = useAppStore.getState();
    const current = state.viewports[board.id] ?? DEFAULT_VIEWPORT;
    state.setViewport(board.id, {
      zoom: current.zoom,
      x: state.canvasSize.width / 2 - world.x * current.zoom,
      y: state.canvasSize.height / 2 - world.y * current.zoom,
    });
  };

  return (
    <div
      data-canvas-ui
      className="glass-panel relative overflow-hidden rounded-xl border border-border shadow-panel"
      style={{ width: MAP_WIDTH, height: MAP_HEIGHT }}
      onPointerDown={(event) => {
        event.stopPropagation();
        const element = event.currentTarget;
        handlePointer(event.clientX, event.clientY, element);
        const onMove = (moveEvent: PointerEvent) => handlePointer(moveEvent.clientX, moveEvent.clientY, element);
        const onUp = () => {
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerup", onUp);
        };
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
      }}
      aria-label="Minimapa do quadro"
    >
      {nodes.length === 0 ? (
        <div className="grid h-full place-items-center text-[10px] text-muted-foreground">Sem elementos</div>
      ) : (
        nodes.map((node) => (
          <div
            key={node.id}
            className={cn(
              "absolute rounded-[1.5px] border border-black/5 dark:border-white/5",
              `node-color-${node.color}`,
            )}
            style={{
              left: node.x * scale + offsetX,
              top: node.y * scale + offsetY,
              width: Math.max(2, node.w * scale),
              height: Math.max(2, node.h * scale),
              backgroundColor: "var(--node-bg)",
              opacity: node.parentId ? 0.75 : 1,
            }}
          />
        ))
      )}
      <div
        className="pointer-events-none absolute rounded border border-primary/80 bg-primary/10"
        style={{
          left: viewRect.x * scale + offsetX,
          top: viewRect.y * scale + offsetY,
          width: Math.max(6, viewRect.w * scale),
          height: Math.max(6, viewRect.h * scale),
        }}
      />
    </div>
  );
}
