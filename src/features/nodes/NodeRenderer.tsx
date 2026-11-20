import type { CanvasNode } from "@/core/domain/types";
import { CardNode } from "./CardNode";
import { ChecklistNode } from "./ChecklistNode";
import { CodeNode } from "./CodeNode";
import { DrawingNode } from "./DrawingNode";
import { FileNode, ImageNode, LinkNode, VideoNode } from "./MediaNodes";
import { NoteNode } from "./NoteNode";
import { TextNode } from "./TextNode";
import { BoardNode, ColumnNode, CommentNode } from "./StructureNodes";
import { TaskNode } from "./TaskNode";

interface NodeRendererProps {
  node: CanvasNode;
  editing: boolean;
  selected: boolean;
}

/** Ponto único de renderização por tipo de elemento (extensível). */
export function NodeRenderer({ node, editing, selected }: NodeRendererProps) {
  const props = { node, editing, selected };
  switch (node.type) {
    case "note":
      return <NoteNode {...props} />;
    case "text":
      return <TextNode {...props} />;
    case "code":
      return <CodeNode {...props} />;
    case "card":
      return <CardNode {...props} />;
    case "task":
      return <TaskNode {...props} />;
    case "checklist":
      return <ChecklistNode {...props} />;
    case "image":
      return <ImageNode {...props} />;
    case "video":
      return <VideoNode {...props} />;
    case "file":
      return <FileNode {...props} />;
    case "link":
      return <LinkNode {...props} />;
    case "board":
      return <BoardNode {...props} />;
    case "column":
      return <ColumnNode {...props} />;
    case "comment":
      return <CommentNode {...props} />;
    case "drawing":
      return <DrawingNode {...props} />;
    default:
      return (
        <div className="grid h-full place-items-center rounded-xl border border-dashed bg-muted text-xs text-muted-foreground">
          Elemento desconhecido
        </div>
      );
  }
}
