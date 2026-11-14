import type { CanvasNode } from "@/core/domain/types";

export interface NodeProps {
  node: CanvasNode;
  editing: boolean;
  selected: boolean;
}
