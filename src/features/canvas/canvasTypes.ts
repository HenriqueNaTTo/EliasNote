import type { Point } from "@/lib/geometry";
import type { ID } from "@/core/domain/types";

export interface ConnectorDraft {
  fromNodeId: ID | null;
  from: Point;
  to: Point;
}

export function toolToNodeType(tool: string): string | null {
  switch (tool) {
    case "note":
    case "text":
    case "card":
    case "task":
    case "checklist":
    case "column":
    case "drawing":
    case "comment":
      return tool;
    case "board":
      return "board";
    default:
      return null;
  }
}
