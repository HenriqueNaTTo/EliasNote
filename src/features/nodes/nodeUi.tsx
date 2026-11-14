import type { LucideIcon } from "lucide-react";
import {
  CheckSquare,
  Columns3,
  FileText,
  Globe,
  Image as ImageIcon,
  LayoutDashboard,
  ListChecks,
  MessageCircle,
  PenTool,
  Square,
  StickyNote,
  Video,
} from "lucide-react";
import type { NodeColor, NodeType } from "@/core/domain/types";
import { cn } from "@/lib/utils";

export const NODE_ICONS: Record<NodeType, LucideIcon> = {
  note: StickyNote,
  card: Square,
  task: CheckSquare,
  checklist: ListChecks,
  image: ImageIcon,
  video: Video,
  file: FileText,
  link: Globe,
  board: LayoutDashboard,
  column: Columns3,
  drawing: PenTool,
  comment: MessageCircle,
};

export function nodeColorClass(color: NodeColor): string {
  return `node-color-${color}`;
}

export function NodeTypeIcon({
  type,
  className,
}: {
  type: NodeType;
  className?: string;
}) {
  const Icon = NODE_ICONS[type] ?? Square;
  return <Icon className={cn("h-3.5 w-3.5", className)} />;
}

export function stopDrag(event: React.SyntheticEvent): void {
  event.stopPropagation();
}

export function priorityDotClass(priority: string | undefined): string {
  switch (priority) {
    case "high":
      return "bg-rose-500";
    case "low":
      return "bg-sky-500";
    default:
      return "bg-amber-500";
  }
}

export function nodeDisplayName(type: NodeType): string {
  switch (type) {
    case "note":
      return "Nota";
    case "card":
      return "Cartão";
    case "task":
      return "Tarefa";
    case "checklist":
      return "Checklist";
    case "image":
      return "Imagem";
    case "video":
      return "Vídeo";
    case "file":
      return "Arquivo";
    case "link":
      return "Link";
    case "board":
      return "Quadro";
    case "column":
      return "Coluna";
    case "drawing":
      return "Desenho";
    case "comment":
      return "Comentário";
    default:
      return "Elemento";
  }
}
