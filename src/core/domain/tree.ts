import type { Board } from "./types";

export interface BoardTreeNode {
  board: Board;
  depth: number;
  children: BoardTreeNode[];
}

export function boardChildren(boards: Record<string, Board>, parentId: string | null): Board[] {
  return Object.values(boards)
    .filter((board) => board.parentId === parentId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function orderedChildren(boards: Record<string, Board>, parent: Board): Board[] {
  const known = parent.childOrder
    .map((id) => boards[id])
    .filter((board): board is Board => Boolean(board));
  const extras = Object.values(boards)
    .filter((board) => board.parentId === parent.id && !parent.childOrder.includes(board.id))
    .sort((a, b) => a.createdAt - b.createdAt);
  return [...known, ...extras];
}

export function buildBoardTree(boards: Record<string, Board>, workspaceId: string): BoardTreeNode[] {
  const build = (parentId: string | null, depth: number, guard: Set<string>): BoardTreeNode[] => {
    const parent = parentId ? boards[parentId] : undefined;
    const items = parent
      ? orderedChildren(boards, parent)
      : boardChildren(boards, null).sort((a, b) => a.createdAt - b.createdAt);
    return items
      .filter((board) => board.workspaceId === workspaceId && !guard.has(board.id))
      .map((board) => {
        const nextGuard = new Set(guard).add(board.id);
        return { board, depth, children: build(board.id, depth + 1, nextGuard) };
      });
  };
  return build(null, 0, new Set());
}

/** Achata a árvore em pré-ordem (pai antes dos filhos). */
export function flattenBoardTree(nodes: BoardTreeNode[]): Board[] {
  const result: Board[] = [];
  const visit = (items: BoardTreeNode[]) => {
    for (const item of items) {
      result.push(item.board);
      visit(item.children);
    }
  };
  visit(nodes);
  return result;
}

/** Sequência de quadros de um workspace para o modo apresentação. */
export function presentationBoardIds(boards: Record<string, Board>, workspaceId: string): string[] {
  return flattenBoardTree(buildBoardTree(boards, workspaceId)).map((board) => board.id);
}

export function boardPath(boards: Record<string, Board>, boardId: string): Board[] {
  const path: Board[] = [];
  let current: Board | undefined = boards[boardId];
  const guard = new Set<string>();
  while (current && !guard.has(current.id)) {
    guard.add(current.id);
    path.unshift(current);
    current = current.parentId ? boards[current.parentId] : undefined;
  }
  return path;
}

export function descendantBoardIds(boards: Record<string, Board>, boardId: string): string[] {
  const result: string[] = [];
  const visit = (id: string, guard: Set<string>) => {
    const board = boards[id];
    if (!board) return;
    for (const child of orderedChildren(boards, board)) {
      if (guard.has(child.id)) continue;
      guard.add(child.id);
      result.push(child.id);
      visit(child.id, guard);
    }
  };
  visit(boardId, new Set([boardId]));
  return result;
}

export function isDescendantOf(boards: Record<string, Board>, candidateId: string, ancestorId: string): boolean {
  let current: Board | undefined = boards[candidateId];
  const guard = new Set<string>();
  while (current?.parentId && !guard.has(current.parentId)) {
    guard.add(current.parentId);
    if (current.parentId === ancestorId) return true;
    current = boards[current.parentId];
  }
  return false;
}

export function workspaceBoards(boards: Record<string, Board>, workspaceId: string): Board[] {
  return Object.values(boards).filter((board) => board.workspaceId === workspaceId);
}

export function boardStats(board: Board): { nodes: number; tasks: number; tasksDone: number; boards: number } {
  const nodes = Object.values(board.nodes);
  const tasks = nodes.filter((node) => node.type === "task");
  const checklistItems = nodes.flatMap((node) => node.items ?? []);
  return {
    nodes: nodes.length,
    boards: nodes.filter((node) => node.type === "board" && node.childBoardId).length,
    tasks: tasks.length + checklistItems.length,
    tasksDone:
      tasks.filter((node) => node.done).length + checklistItems.filter((item) => item.done).length,
  };
}

/** Reordena a lista de filhos de um quadro sem mutar o array original. */
export function reorderList(list: string[], id: string, toIndex: number): string[] {
  const from = list.indexOf(id);
  const next = [...list];
  if (from === -1) return next;
  const [item] = next.splice(from, 1);
  next.splice(Math.max(0, Math.min(toIndex, next.length)), 0, item);
  return next;
}
