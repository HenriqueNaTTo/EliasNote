import { memo, useRef } from "react";
import {
  ArrowDownToLine,
  ArrowRightLeft,
  ArrowUpToLine,
  Check,
  Copy,
  CornerDownRight,
  EyeOff,
  Lock,
  PenTool,
  Trash2,
  Unlock,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import type { CanvasNode, ID, NodeColor, NodeTransferMode } from "@/core/domain/types";
import type { Point } from "@/lib/geometry";
import { snapToGrid } from "@/lib/geometry";
import { COLOR_OPTIONS, NODE_WIDTHS } from "@/core/domain/constants";
import { boardNodeAtPoint, columnAtPoint } from "@/core/domain/layout";
import { isDescendantOf } from "@/core/domain/tree";
import { useAppStore } from "@/core/store";
import { activeBoard, activeBoardId } from "@/core/store/helpers";
import { NodeRenderer } from "@/features/nodes/NodeRenderer";
import { TextFormatBar } from "@/features/nodes/TextFormatBar";
import { cn, plural } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface CanvasNodeViewProps {
  node: CanvasNode;
  zoom: number;
  connectorMode: boolean;
  getWorldPoint: (clientX: number, clientY: number) => Point;
  onStartConnector: (nodeId: ID, clientX: number, clientY: number) => void;
  /** Modo apresentação: apenas desenha o conteúdo, sem interação. */
  readOnly?: boolean;
}

interface DragState {
  ids: ID[];
  startClient: Point;
  primaryStart: Point;
  moved: boolean;
  raised: boolean;
}

const RESIZE_HANDLES = [
  { dir: "nw", className: "left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize" },
  { dir: "n", className: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize" },
  { dir: "ne", className: "right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize" },
  { dir: "e", className: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize" },
  { dir: "se", className: "bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize" },
  { dir: "s", className: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-ns-resize" },
  { dir: "sw", className: "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize" },
  { dir: "w", className: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize" },
] as const;

const CONNECTOR_HANDLES = [
  { className: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2", cursor: "cursor-crosshair" },
  { className: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2", cursor: "cursor-crosshair" },
  { className: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2", cursor: "cursor-crosshair" },
  { className: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2", cursor: "cursor-crosshair" },
] as const;

export const CanvasNodeView = memo(function CanvasNodeView({
  node,
  zoom,
  connectorMode,
  getWorldPoint,
  onStartConnector,
  readOnly = false,
}: CanvasNodeViewProps) {
  const selected = useAppStore((state) => state.selection.includes(node.id));
  const editing = useAppStore((state) => state.editingNodeId === node.id);
  const showShadows = useAppStore((state) => state.settings.showNodeShadows);
  const dragging = useAppStore((state) => Boolean(state.nodeDrag?.nodeIds.includes(node.id)));
  const dragRef = useRef<DragState | null>(null);

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest("[data-no-drag]")) return;
    if (node.locked) return;
    if (connectorMode) {
      event.stopPropagation();
      event.preventDefault();
      onStartConnector(node.id, event.clientX, event.clientY);
      return;
    }

    const state = useAppStore.getState();
    event.stopPropagation();
    if (event.shiftKey) {
      state.toggleSelect(node.id);
      return;
    }
    const wasSelected = state.selection.includes(node.id);
    if (!wasSelected) state.select([node.id]);
    if (state.editingNodeId === node.id) return;

    const board = activeBoard(state);
    if (!board) return;
    const ids = wasSelected ? state.selection : [node.id];
    const primary = board.nodes[node.id];
    if (!primary) return;

    state.beginTransaction("Mover elementos");
    dragRef.current = {
      ids,
      startClient: { x: event.clientX, y: event.clientY },
      primaryStart: { x: primary.x, y: primary.y },
      moved: false,
      raised: false,
    };

    /** Quadro de destino sob o ponteiro: cartão de quadro no canvas ou linha da árvore lateral. */
    const findDropTarget = (
      clientX: number,
      clientY: number,
      altKey: boolean,
    ): { boardId: ID; mode: NodeTransferMode } | null => {
      const currentState = useAppStore.getState();
      const boardNow = activeBoard(currentState);
      const activeId = activeBoardId(currentState);
      if (!boardNow || !activeId) return null;

      const refuses = (targetBoardId: string | null | undefined): boolean => {
        if (!targetBoardId || targetBoardId === activeId || !currentState.boards[targetBoardId]) return true;
        for (const id of ids) {
          const childBoardId = boardNow.nodes[id]?.childBoardId;
          if (!childBoardId) continue;
          if (childBoardId === targetBoardId) return true;
          if (isDescendantOf(currentState.boards, targetBoardId, childBoardId)) return true;
        }
        return false;
      };

      const tile = boardNodeAtPoint(boardNow.nodes, getWorldPoint(clientX, clientY), ids);
      if (tile?.childBoardId && !refuses(tile.childBoardId)) {
        return { boardId: tile.childBoardId, mode: altKey ? "copy" : "move" };
      }

      const row =
        typeof document.elementFromPoint === "function"
          ? (document.elementFromPoint(clientX, clientY) as HTMLElement | null)?.closest<HTMLElement>(
              "[data-board-drop]",
            )
          : null;
      const rowBoardId = row?.dataset.boardDrop;
      if (rowBoardId && !refuses(rowBoardId)) {
        return { boardId: rowBoardId, mode: "move" };
      }
      return null;
    };

    const onMove = (moveEvent: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const currentState = useAppStore.getState();
      const dx = (moveEvent.clientX - drag.startClient.x) / zoom;
      const dy = (moveEvent.clientY - drag.startClient.y) / zoom;
      let targetX = drag.primaryStart.x + dx;
      let targetY = drag.primaryStart.y + dy;
      if (currentState.settings.snapToGrid) {
        targetX = snapToGrid(targetX, currentState.settings.gridSize);
        targetY = snapToGrid(targetY, currentState.settings.gridSize);
      }
      const boardNow = activeBoard(currentState);
      const currentNode = boardNow?.nodes[node.id];
      if (!currentNode) return;
      const step = { x: Math.round(targetX - currentNode.x), y: Math.round(targetY - currentNode.y) };
      if (step.x !== 0 || step.y !== 0) {
        drag.moved = true;
        currentState.moveNodes(drag.ids, step);
      }
      const movedEnough =
        Math.abs(moveEvent.clientX - drag.startClient.x) + Math.abs(moveEvent.clientY - drag.startClient.y) > 3;
      if (movedEnough && !drag.raised) {
        drag.raised = true;
        currentState.bringToFront(drag.ids);
      }
      if (movedEnough) drag.moved = true;
      if (!drag.moved) return;

      const target = findDropTarget(moveEvent.clientX, moveEvent.clientY, moveEvent.altKey);
      if (!currentState.nodeDrag) currentState.startNodeDrag(drag.ids);
      currentState.hoverNodeDragTarget(target?.boardId ?? null, target?.mode ?? "move");
    };

    const onUp = (upEvent: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      const drag = dragRef.current;
      dragRef.current = null;
      if (!drag) return;
      const currentState = useAppStore.getState();
      const boardNow = activeBoard(currentState);
      const pendingDrop = drag.moved ? currentState.nodeDrag : null;
      currentState.endNodeDrag();

      if (pendingDrop?.overBoardId) {
        // Cópia por arraste: os originais voltam para o lugar de onde saíram.
        if (pendingDrop.mode === "copy" && boardNow) {
          const primary = boardNow.nodes[node.id];
          const dx = primary ? primary.x - drag.primaryStart.x : 0;
          const dy = primary ? primary.y - drag.primaryStart.y : 0;
          if (dx !== 0 || dy !== 0) {
            currentState.moveNodes(pendingDrop.nodeIds, { x: -dx, y: -dy });
          }
        }
        const result = currentState.transferNodes(
          pendingDrop.nodeIds,
          pendingDrop.overBoardId,
          pendingDrop.mode,
        );
        currentState.endTransaction();
        if (result) {
          currentState.flashDropTarget(result.boardId);
          toast.success(
            `${pendingDrop.mode === "copy" ? "Copiado" : "Movido"} para "${result.title}"`,
            {
              description: `${result.count} ${plural(result.count, "elemento", "elementos")} · Ctrl+Z desfaz`,
              action: { label: "Abrir", onClick: () => useAppStore.getState().openBoard(result.boardId) },
            },
          );
        }
        return;
      }

      if (drag.moved && drag.ids.length === 1 && node.type !== "column" && boardNow) {
        const point = getWorldPoint(upEvent.clientX, upEvent.clientY);
        const column = columnAtPoint(boardNow.nodes, point, [], node.id);
        const current = boardNow.nodes[node.id];
        if (column && current && current.parentId !== column.id) {
          currentState.updateNode(node.id, { parentId: column.id }, { label: "Mover para coluna" });
        }
      }
      currentState.endTransaction();
      if (!drag.moved && drag.ids.length > 1 && !upEvent.shiftKey) {
        currentState.select([node.id]);
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const startResize = (direction: string, event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (node.locked) return;
    const state = useAppStore.getState();
    state.select([node.id]);
    state.beginTransaction("Redimensionar");
    const startClient = { x: event.clientX, y: event.clientY };
    const startRect = { x: node.x, y: node.y, w: node.w, h: node.h };
    const min = NODE_WIDTHS[node.type];

    const onMove = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - startClient.x) / zoom;
      const dy = (moveEvent.clientY - startClient.y) / zoom;
      let { x, y, w, h } = startRect;
      if (direction.includes("e")) w = startRect.w + dx;
      if (direction.includes("s")) h = startRect.h + dy;
      if (direction.includes("w")) w = startRect.w - dx;
      if (direction.includes("n")) h = startRect.h - dy;
      w = Math.max(min.minW, Math.round(w));
      h = Math.max(min.minH, Math.round(h));
      if (direction.includes("w")) x = Math.round(startRect.x + startRect.w - w);
      if (direction.includes("n")) y = Math.round(startRect.y + startRect.h - h);
      useAppStore.getState().resizeNode(node.id, { x, y, w, h });
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      useAppStore.getState().endTransaction();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const handleDoubleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("[data-no-drag]")) return;
    event.stopPropagation();
    const state = useAppStore.getState();
    if (node.type === "board" && node.childBoardId) {
      state.openBoard(node.childBoardId);
      return;
    }
    if (node.type === "drawing") {
      state.openDrawing(node.id);
      return;
    }
    if (node.type === "column") return;
    state.setEditingNode(node.id);
  };

  const setColor = (color: NodeColor) => {
    useAppStore.getState().updateNode(node.id, { color }, { label: "Alterar cor" });
  };

  if (readOnly) {
    return (
      <div
        data-node-id={node.id}
        className="node-frame presentation-readonly absolute select-none rounded-xl"
        style={{ left: node.x, top: node.y, width: node.w, height: node.h }}
      >
        <div
          className={cn(
            "h-full w-full overflow-hidden rounded-none",
            showShadows && "shadow-node",
            node.locked && "opacity-95",
          )}
        >
          <NodeRenderer node={node} editing={false} selected={false} />
        </div>
      </div>
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          data-node-id={node.id}
          className={cn(
            "node-frame absolute select-none rounded-xl",
            selected && "node-selected",
            dragging && "node-dragging",
            connectorMode && "cursor-crosshair",
          )}
          style={{ left: node.x, top: node.y, width: node.w, height: node.h }}
          onPointerDown={startDrag}
          onDoubleClick={handleDoubleClick}
          onContextMenu={() => {
            const state = useAppStore.getState();
            if (!state.selection.includes(node.id)) state.select([node.id]);
          }}
        >
          <div
            className={cn(
              "h-full w-full overflow-hidden rounded-none",
              showShadows && "shadow-node",
              node.locked && "opacity-95",
            )}
          >
            <NodeRenderer node={node} editing={editing} selected={selected} />
          </div>

          {selected ? (
            <div className="pointer-events-none absolute -inset-[2px] rounded-none ring-2 ring-primary/80" />
          ) : null}

          {selected && node.type === "text" && !node.locked ? (
            <TextFormatBar node={node} className="absolute -top-9 left-0 z-20" />
          ) : null}

          {node.locked ? (
            <div className="pointer-events-none absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-none bg-card text-muted-foreground shadow ring-1 ring-border">
              <Lock className="h-3 w-3" />
            </div>
          ) : null}

          {selected && !node.locked
            ? RESIZE_HANDLES.map((handle) => (
                <button
                  key={handle.dir}
                  type="button"
                  data-no-drag
                  aria-label={`Redimensionar ${handle.dir}`}
                  onPointerDown={(event) => startResize(handle.dir, event)}
                  className={cn(
                    "resize-handle absolute h-2 w-2 rounded-none border border-primary bg-background shadow-sm",
                    handle.className,
                  )}
                />
              ))
            : null}

          {selected && !node.locked && !connectorMode
            ? CONNECTOR_HANDLES.map((handle, index) => (
                <button
                  key={index}
                  type="button"
                  data-no-drag
                  aria-label="Criar conector"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onStartConnector(node.id, event.clientX, event.clientY);
                  }}
                  className={cn(
                    "absolute h-2.5 w-2.5 rounded-none border-2 border-primary bg-background opacity-0 transition-opacity hover:opacity-100 node-selected:opacity-100",
                    handle.className,
                    handle.cursor,
                  )}
                />
              ))
            : null}
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-60">
        <ContextMenuLabel>
          {node.title?.trim() || (node.type === "board" ? "Quadro" : "Elemento")}
        </ContextMenuLabel>
        {node.type === "board" && node.childBoardId ? (
          <ContextMenuItem onSelect={() => useAppStore.getState().openBoard(node.childBoardId as ID)}>
            <CornerDownRight /> Abrir quadro
          </ContextMenuItem>
        ) : null}
        {node.type === "drawing" ? (
          <ContextMenuItem onSelect={() => useAppStore.getState().openDrawing(node.id)}>
            <PenTool /> Editar desenho
          </ContextMenuItem>
        ) : null}
        <ContextMenuItem onSelect={() => useAppStore.getState().setEditingNode(node.id)}>
          <Upload /> Editar conteúdo
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => useAppStore.getState().duplicateNodes(useAppStore.getState().selection)}>
          <Copy /> Duplicar
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() =>
            useAppStore.getState().openNodeTransfer(useAppStore.getState().selection, "move")
          }
        >
          <ArrowRightLeft /> Mover para outro quadro…
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() =>
            useAppStore.getState().openNodeTransfer(useAppStore.getState().selection, "copy")
          }
        >
          <Copy /> Copiar para outro quadro…
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border border-border" style={{ background: colorSwatch(node.color) }} />
              Cor
            </span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-44">
            {COLOR_OPTIONS.map((option) => (
              <ContextMenuItem key={option.value} onSelect={() => setColor(option.value)}>
                <span className="h-3.5 w-3.5 rounded-full border border-border" style={{ background: option.hex }} />
                {option.label}
                {node.color === option.value ? <Check className="ml-auto h-3.5 w-3.5" /> : null}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => useAppStore.getState().bringToFront([node.id])}>
          <ArrowUpToLine /> Trazer para frente
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => useAppStore.getState().sendToBack([node.id])}>
          <ArrowDownToLine /> Enviar para trás
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() => useAppStore.getState().updateNode(node.id, { locked: !node.locked }, { label: "Bloquear" })}
        >
          {node.locked ? <Unlock /> : <Lock />}
          {node.locked ? "Desbloquear" : "Bloquear"}
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() => useAppStore.getState().updateNode(node.id, { hidden: true }, { label: "Ocultar" })}
        >
          <EyeOff /> Ocultar
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem destructive onSelect={() => useAppStore.getState().removeNodes([node.id])}>
          <Trash2 /> Excluir
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
});

function colorSwatch(color: NodeColor): string {
  return COLOR_OPTIONS.find((option) => option.value === color)?.hex ?? "#ffffff";
}