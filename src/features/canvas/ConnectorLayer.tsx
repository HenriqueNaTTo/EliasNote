import { useMemo } from "react";
import type { Board, Connector, ID } from "@/core/domain/types";
import { CONNECTOR_COLORS } from "@/core/domain/constants";
import { anchorPoint, arrowHeadPath, centerOf, connectorGeometry, type Point } from "@/lib/geometry";
import { nodeRect } from "@/core/domain/layout";
import { useAppStore } from "@/core/store";
import { cn } from "@/lib/utils";
import type { ConnectorDraft } from "./canvasTypes";

interface ConnectorLayerProps {
  board: Board;
  draft: ConnectorDraft | null;
  selectedConnectors: ID[];
  showLabels: boolean;
}

interface ResolvedEndpoints {
  from: Point;
  to: Point;
  labelPoint: Point;
  path: string;
  startAngle: number;
  endAngle: number;
}

function resolveEndpoints(connector: Connector, board: Board): ResolvedEndpoints {
  const fromNode = connector.from.nodeId ? board.nodes[connector.from.nodeId] : undefined;
  const toNode = connector.to.nodeId ? board.nodes[connector.to.nodeId] : undefined;

  const fromCenter = fromNode ? centerOf(nodeRect(fromNode)) : { x: connector.from.x, y: connector.from.y };
  const toCenter = toNode ? centerOf(nodeRect(toNode)) : { x: connector.to.x, y: connector.to.y };

  const from = fromNode ? anchorPoint(nodeRect(fromNode), toCenter) : fromCenter;
  const to = toNode ? anchorPoint(nodeRect(toNode), fromCenter) : toCenter;
  const geometry = connectorGeometry(from, to, { kind: connector.kind });
  return {
    from,
    to,
    path: geometry.path,
    labelPoint: geometry.mid,
    startAngle: geometry.startAngle,
    endAngle: geometry.endAngle,
  };
}

/** Desenha conectores e setas em coordenadas do mundo. */
export function ConnectorLayer({ board, draft, selectedConnectors, showLabels }: ConnectorLayerProps) {
  const selectConnector = useAppStore((state) => state.selectConnector);
  const connectors = useMemo(() => Object.values(board.connectors), [board.connectors]);
  const resolved = useMemo(
    () =>
      connectors
        .map((connector) => ({ connector, geometry: resolveEndpoints(connector, board) }))
        .filter(({ geometry }) => Number.isFinite(geometry.from.x) && Number.isFinite(geometry.to.x)),
    [connectors, board],
  );

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0 overflow-visible"
      width={1}
      height={1}
      aria-hidden
    >
      {resolved.map(({ connector, geometry }) => {
        const selected = selectedConnectors.includes(connector.id);
        const stroke = CONNECTOR_COLORS[connector.color];
        return (
          <g key={connector.id} className="pointer-events-auto">
            <path
              d={geometry.path}
              fill="none"
              stroke="transparent"
              strokeWidth={16}
              className="cursor-pointer"
              onPointerDown={(event) => {
                event.stopPropagation();
                selectConnector(connector.id);
              }}
              onDoubleClick={(event) => {
                event.stopPropagation();
                selectConnector(connector.id);
                useAppStore.getState().setInspectorTab("props");
              }}
            />
            {selected ? (
              <path
                d={geometry.path}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeOpacity={0.35}
                strokeWidth={7}
                strokeLinecap="round"
              />
            ) : null}
            <path
              d={geometry.path}
              fill="none"
              stroke={stroke}
              strokeWidth={selected ? 2.4 : 1.8}
              strokeLinecap="round"
              strokeDasharray={connector.dashed ? "6 5" : undefined}
            />
            {connector.arrowEnd !== false ? (
              <path
                d={arrowHeadPath(geometry.to, geometry.endAngle, 9)}
                fill="none"
                stroke={stroke}
                strokeWidth={2}
                strokeLinecap="round"
              />
            ) : null}
            {connector.arrowStart ? (
              <path
                d={arrowHeadPath(geometry.from, geometry.startAngle + Math.PI, 9)}
                fill="none"
                stroke={stroke}
                strokeWidth={2}
                strokeLinecap="round"
              />
            ) : null}
            {showLabels && connector.label ? (
              <g transform={`translate(${geometry.labelPoint.x}, ${geometry.labelPoint.y})`}>
                <rect
                  x={-Math.max(18, connector.label.length * 3.4)}
                  y={-9}
                  width={Math.max(36, connector.label.length * 6.8)}
                  height={18}
                  rx={5}
                  fill="hsl(var(--popover))"
                  stroke="hsl(var(--border))"
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={10}
                  fill="hsl(var(--popover-foreground))"
                  style={{ userSelect: "none" }}
                >
                  {connector.label}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}

      {draft ? (
        <g>
          <path
            d={connectorGeometry(draft.from, draft.to, { kind: "curve" }).path}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            strokeDasharray="5 4"
            strokeLinecap="round"
          />
          <circle cx={draft.to.x} cy={draft.to.y} r={4} fill="hsl(var(--primary))" />
        </g>
      ) : null}
    </svg>
  );
}

export function ConnectorLabelBadge({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cn("rounded bg-popover px-1.5 py-0.5 text-[10px] font-medium shadow-sm", className)}>
      {label}
    </span>
  );
}
