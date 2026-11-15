import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Copy,
  FolderPlus,
  LayoutDashboard,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings,
  Sparkles,
  Sun,
  Trash2,
  Wand2,
} from "lucide-react";
import { useAppStore } from "@/core/store";
import { useBoardTree, useIsSidebarCollapsed } from "@/core/store/selectors";
import { COLOR_DOT_CLASS } from "@/core/domain/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PromptDialog } from "@/components/feedback/PromptDialog";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { openDialogs } from "./dialogActions";
import { SaveIndicator } from "./SaveIndicator";
import type { BoardTreeNode } from "@/core/domain/tree";

const COLOR_DOT = COLOR_DOT_CLASS;

export function Sidebar() {
  const collapsed = useIsSidebarCollapsed();
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const sidebarWidth = useAppStore((state) => state.settings.sidebarWidth);

  if (collapsed) {
    return (
      <aside className="flex w-[56px] shrink-0 flex-col items-center gap-2 border-r border-border bg-[hsl(var(--sidebar))] py-3">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={() => openDialogs.search()} aria-label="Buscar">
              <Search className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Buscar (Ctrl+K)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={() => openDialogs.templates()} aria-label="Modelos">
              <Wand2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Modelos</TooltipContent>
        </Tooltip>
        <div className="flex-1" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={toggleTheme} aria-label="Alternar tema">
              <Sun className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Alternar tema</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={() => openDialogs.settings()} aria-label="Configurações">
              <Settings className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Configurações</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={toggleSidebar} aria-label="Expandir barra lateral">
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Expandir barra lateral (Ctrl+B)</TooltipContent>
        </Tooltip>
      </aside>
    );
  }

  return (
    <aside
      className="relative flex shrink-0 flex-col border-r border-border bg-[hsl(var(--sidebar))]"
      style={{ width: sidebarWidth }}
    >
      <div className="flex items-center gap-2 px-3 pb-2 pt-3">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[13px] font-semibold tracking-tight">EliasNote</p>
          <p className="truncate text-[10px] text-muted-foreground">Canvas local-first</p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={toggleSidebar} aria-label="Recolher barra lateral">
              <ChevronsUpDown className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Recolher (Ctrl+B)</TooltipContent>
        </Tooltip>
      </div>

      <WorkspaceSwitcher />

      <div className="flex items-center gap-1.5 px-3 py-2" data-sidebar-actions>
        <Button
          variant="outline"
          size="sm"
          className="h-8 flex-1 justify-start gap-2 bg-background/70 text-muted-foreground hover:text-foreground"
          onClick={() => openDialogs.search()}
        >
          <Search className="h-3.5 w-3.5" />
          <span className="text-xs">Buscar</span>
          <kbd className="ml-auto rounded border border-border bg-muted px-1 py-0.5 text-[9px] font-medium">
            Ctrl K
          </kbd>
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="icon-sm"
              className="h-8 w-8 shrink-0"
              onClick={() => useAppStore.getState().createBoard({})}
              aria-label="Novo quadro"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Novo quadro (Ctrl+Shift+N)</TooltipContent>
        </Tooltip>
      </div>

      <Separator />

      <ScrollArea className="min-h-0 flex-1 px-2 py-2">
        <ProjectTree />
      </ScrollArea>

      <div className="border-t border-border px-2 py-2">
        <div className="grid grid-cols-2 gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="justify-start gap-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => openDialogs.templates()}
          >
            <Wand2 className="h-3.5 w-3.5" /> Modelos
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start gap-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => openDialogs.settings()}
          >
            <Settings className="h-3.5 w-3.5" /> Ajustes
          </Button>
        </div>
        <SaveIndicator />
      </div>

      <div
        role="separator"
        aria-label="Redimensionar barra lateral"
        className="absolute -right-1 top-0 h-full w-2 cursor-col-resize hover:bg-primary/20"
        onPointerDown={(event) => {
          event.preventDefault();
          const startX = event.clientX;
          const startWidth = sidebarWidth;
          const onMove = (moveEvent: PointerEvent) => {
            const next = Math.min(420, Math.max(220, startWidth + moveEvent.clientX - startX));
            useAppStore.getState().updateSettings({ sidebarWidth: next });
          };
          const onUp = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
          };
          window.addEventListener("pointermove", onMove);
          window.addEventListener("pointerup", onUp);
        }}
      />
    </aside>
  );
}

function WorkspaceSwitcher() {
  const workspaces = useAppStore((state) => state.workspaces);
  const workspaceOrder = useAppStore((state) => state.workspaceOrder);
  const activeWorkspaceId = useAppStore((state) => state.activeWorkspaceId);
  const setActiveWorkspace = useAppStore((state) => state.setActiveWorkspace);
  const createWorkspace = useAppStore((state) => state.createWorkspace);
  const createBoard = useAppStore((state) => state.createBoard);
  const renameWorkspace = useAppStore((state) => state.renameWorkspace);
  const deleteWorkspace = useAppStore((state) => state.deleteWorkspace);

  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const active = workspaces[activeWorkspaceId];

  const createNewWorkspace = () => {
    const name = `Espaço ${workspaceOrder.length + 1}`;
    const id = createWorkspace(name);
    const boardId = createBoard({ workspaceId: id, title: "Primeiro quadro" });
    if (boardId) useAppStore.getState().openBoard(boardId);
  };

  return (
    <div className="px-3 py-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 text-left transition-colors hover:border-border hover:bg-card"
          >
            <span
              className={cn(
                "h-2 w-2 shrink-0 rounded-full",
                COLOR_DOT[active?.color ?? "none"] ?? "bg-primary",
              )}
            />
            <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium">
              {active?.name ?? "Sem espaço"}
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[248px]">
          <DropdownMenuLabel>Espaços de trabalho</DropdownMenuLabel>
          {workspaceOrder.map((id) => (
            <DropdownMenuItem key={id} onClick={() => setActiveWorkspace(id)}>
              <span className={cn("h-2 w-2 rounded-full", COLOR_DOT[workspaces[id]?.color ?? "none"])} />
              <span className="truncate">{workspaces[id]?.name ?? "Espaço"}</span>
              {id === activeWorkspaceId ? <span className="ml-auto text-[10px] text-primary">ativo</span> : null}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={createNewWorkspace}>
            <Plus /> Novo espaço
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setRenaming(true)} disabled={!active}>
            <Pencil /> Renomear espaço
          </DropdownMenuItem>
          <DropdownMenuItem
            destructive
            onClick={() => setDeleting(true)}
            disabled={workspaceOrder.length <= 1}
          >
            <Trash2 /> Excluir espaço
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PromptDialog
        open={renaming}
        onOpenChange={setRenaming}
        title="Renomear espaço"
        label="Nome"
        defaultValue={active?.name ?? ""}
        onSubmit={(value) => active && renameWorkspace(active.id, value)}
      />
      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title="Excluir este espaço?"
        description="Todos os quadros e elementos deste espaço serão removidos. Você pode desfazer com Ctrl+Z."
        confirmLabel="Excluir espaço"
        destructive
        onConfirm={() => active && deleteWorkspace(active.id)}
      />
    </div>
  );
}

function ProjectTree() {
  const workspaceId = useAppStore((state) => state.activeWorkspaceId);
  const tree = useBoardTree(workspaceId);
  const createBoard = useAppStore((state) => state.createBoard);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-2 pb-1 pt-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Quadros
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => createBoard({})}
              aria-label="Novo quadro na raiz"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Novo quadro</TooltipContent>
        </Tooltip>
      </div>

      {tree.length === 0 ? (
        <div className="mx-2 rounded-lg border border-dashed border-border px-3 py-4 text-center">
          <FolderPlus className="mx-auto mb-2 h-4 w-4 text-muted-foreground" />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Nenhum quadro neste espaço ainda.
          </p>
          <Button size="xs" variant="subtle" className="mt-2" onClick={() => createBoard({})}>
            Criar quadro
          </Button>
        </div>
      ) : (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "move";
          }}
          onDrop={(event) => {
            const dragged = event.dataTransfer.getData("application/x-elias-board");
            if (!dragged) return;
            event.preventDefault();
            useAppStore.getState().moveBoard(dragged, null);
          }}
        >
          {tree.map((node) => (
            <TreeRow key={node.board.id} node={node} depth={0} />
          ))}
        </div>
      )}
    </div>
  );
}

function TreeRow({ node, depth }: { node: BoardTreeNode; depth: number }) {
  const activeBoardId = useAppStore(
    (state) => state.tabs.find((tab) => tab.id === state.activeTabId)?.boardId ?? null,
  );
  const openBoard = useAppStore((state) => state.openBoard);
  const toggleExpanded = useAppStore((state) => state.toggleBoardExpanded);
  const expanded = useAppStore((state) => state.expandedBoards[node.board.id] ?? depth < 1);
  const createBoard = useAppStore((state) => state.createBoard);
  const duplicateBoard = useAppStore((state) => state.duplicateBoard);
  const deleteBoard = useAppStore((state) => state.deleteBoard);
  const renameBoard = useAppStore((state) => state.renameBoard);
  const [dragOver, setDragOver] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const children = useMemo(() => node.children.map((child) => child.board), [node.children]);
  const hasChildren = children.length > 0;
  const isActive = activeBoardId === node.board.id;
  const nodeCount = Object.keys(node.board.nodes).length;
  const nodeDropMode = useAppStore((state) =>
    state.nodeDrag?.overBoardId === node.board.id ? state.nodeDrag.mode : null,
  );
  const nodeDropCount = useAppStore((state) =>
    state.nodeDrag?.overBoardId === node.board.id ? state.nodeDrag.nodeIds.length : 0,
  );
  const justReceived = useAppStore((state) => state.dropFlash?.boardId === node.board.id);

  return (
    <div>
      <div
        className="group/tree relative"
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setDragOver(false);
          const dragged = event.dataTransfer.getData("application/x-elias-board");
          if (!dragged || dragged === node.board.id) return;
          useAppStore.getState().moveBoard(dragged, node.board.id);
        }}
      >
        <div
          draggable
          onDragStart={(event) => {
            event.dataTransfer.setData("application/x-elias-board", node.board.id);
            event.dataTransfer.effectAllowed = "move";
          }}
          className={cn(
            "flex min-h-[28px] cursor-pointer items-center gap-1 rounded-none border-l-2 border-transparent pr-1 transition-[background-color,box-shadow,transform] duration-150 ease-out",
            isActive
              ? "border-primary bg-foreground/[0.06] text-foreground"
              : "hover:bg-foreground/[0.04]",
            dragOver && "ring-1 ring-primary/60",
            nodeDropMode && "scale-[1.02] bg-primary/20 text-foreground ring-1 ring-primary/70",
            justReceived && "animate-drop-pop",
          )}
          data-board-drop={node.board.id}
          style={{ paddingLeft: 4 + depth * 12 }}
          onClick={() => openBoard(node.board.id)}
          title={node.board.title}
        >
          <button
            type="button"
            className={cn(
              "grid h-4 w-4 shrink-0 place-items-center rounded text-muted-foreground hover:bg-accent",
              !hasChildren && "invisible",
            )}
            onClick={(event) => {
              event.stopPropagation();
              toggleExpanded(node.board.id);
            }}
            aria-label={expanded ? "Recolher" : "Expandir"}
          >
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>

          {node.board.icon ? (
            <span className="text-[11px]">{node.board.icon}</span>
          ) : (
            <LayoutDashboard className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )}

          <span className={cn("min-w-0 flex-1 truncate text-[12.5px]", isActive && "font-semibold")}>
            {node.board.title}
          </span>

          {nodeCount > 0 ? (
            <span className="shrink-0 rounded bg-muted px-1 text-[9.5px] font-medium tabular-nums text-muted-foreground">
              {nodeCount}
            </span>
          ) : null}

          {nodeDropMode ? (
            <span className="shrink-0 rounded bg-primary px-1 text-[9px] font-semibold uppercase tracking-wide text-primary-foreground">
              soltar {nodeDropCount}
            </span>
          ) : null}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(event) => event.stopPropagation()}
                className="grid h-5 w-5 shrink-0 place-items-center rounded text-muted-foreground opacity-0 hover:bg-accent group-hover/tree:opacity-100"
                aria-label="Ações do quadro"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48" onClick={(event) => event.stopPropagation()}>
              <DropdownMenuItem onClick={() => createBoard({ parentId: node.board.id })}>
                <FolderPlus /> Novo subquadro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRenaming(true)}>
                <Pencil /> Renomear
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => duplicateBoard(node.board.id)}>
                <Copy /> Duplicar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => useAppStore.getState().moveBoard(node.board.id, null)}>
                <LayoutDashboard /> Mover para a raiz
              </DropdownMenuItem>
              <DropdownMenuItem destructive onClick={() => setDeleting(true)}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {expanded
        ? node.children.map((child) => (
            <TreeRow key={child.board.id} node={child} depth={depth + 1} />
          ))
        : null}

      <PromptDialog
        open={renaming}
        onOpenChange={setRenaming}
        title="Renomear quadro"
        label="Título"
        defaultValue={node.board.title}
        onSubmit={(value) => renameBoard(node.board.id, value)}
      />
      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title={`Excluir "${node.board.title}"?`}
        description="O quadro e todos os subquadros serão removidos. Você pode desfazer com Ctrl+Z."
        confirmLabel="Excluir quadro"
        destructive
        onConfirm={() => deleteBoard(node.board.id)}
      />
    </div>
  );
}
