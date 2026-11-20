import { useMemo } from "react";
import {
  Archive,
  Download,
  FileDown,
  FileJson,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Moon,
  MoreHorizontal,
  PanelRight,
  Plus,
  Search,
  Settings,
  Sun,
  Upload,
  Wand2,
  X,
} from "lucide-react";
import { useAppStore } from "@/core/store";
import { boardPath } from "@/core/domain/tree";
import { cn } from "@/lib/utils";
import { platformLabel } from "@/lib/platform";
import { persistenceService } from "@/core/persistence/persistenceService";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { openDialogs } from "./dialogActions";
import { UpdateButton } from "@/features/update/UpdateButton";

const TAB_DOT: Record<string, string> = {
  none: "bg-muted-foreground/40",
  amber: "bg-amber-400",
  rose: "bg-rose-400",
  sky: "bg-sky-400",
  mint: "bg-emerald-400",
  lilac: "bg-violet-400",
  sand: "bg-orange-300",
  slate: "bg-slate-400",
};

export function TopBar() {
  const tabs = useAppStore((state) => state.tabs);
  const activeTabId = useAppStore((state) => state.activeTabId);
  const boards = useAppStore((state) => state.boards);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const closeTab = useAppStore((state) => state.closeTab);
  const createBoard = useAppStore((state) => state.createBoard);
  const theme = useAppStore((state) => state.settings.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const inspectorOpen = useAppStore((state) => state.settings.inspectorOpen);
  const updateSettings = useAppStore((state) => state.updateSettings);

  const boardOptions = useMemo(
    () =>
      Object.values(boards)
        .sort((a, b) => a.title.localeCompare(b.title))
        .slice(0, 40),
    [boards],
  );

  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");

  return (
    <header className="flex h-11 shrink-0 items-center gap-1 border-b border-border bg-background px-2" data-tauri-drag-region>
      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto scrollbar-thin">
        {tabs.map((tab) => {
          const board = boards[tab.boardId];
          if (!board) return null;
          const active = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              className={cn(
                "group/tab flex h-8 max-w-[220px] shrink-0 items-center gap-1.5 rounded-none border px-2 text-[12px] transition-colors",
                active
                  ? "border-border bg-muted/60 font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:bg-muted/40",
              )}
              role="tab"
              aria-selected={active}
              tabIndex={0}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") setActiveTab(tab.id);
              }}
              onAuxClick={(event) => {
                if (event.button === 1) closeTab(tab.id);
              }}
              title={board.title}
            >
              <span
                className={cn("h-1.5 w-1.5 shrink-0 rounded-full", TAB_DOT[board.color] ?? TAB_DOT.none)}
                aria-hidden
              />
              <span className="truncate">{board.title}</span>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  closeTab(tab.id);
                }}
                className="grid h-4 w-4 shrink-0 place-items-center rounded opacity-0 hover:bg-accent group-hover/tab:opacity-100"
                aria-label={`Fechar ${board.title}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="shrink-0 text-muted-foreground" aria-label="Abrir quadro">
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuItem onClick={() => createBoard({})}>
              <Plus /> Novo quadro
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDialogs.templates()}>
              <Wand2 /> A partir de um modelo
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Abrir quadro</DropdownMenuLabel>
            {boardOptions.length === 0 ? (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">Nenhum quadro ainda</div>
            ) : (
              boardOptions.map((board) => (
                <DropdownMenuItem
                  key={board.id}
                  onClick={() => useAppStore.getState().openBoard(board.id)}
                  className="flex-col items-start gap-0.5"
                >
                  <span className="w-full truncate text-sm">{board.title}</span>
                  <span className="w-full truncate text-[10px] text-muted-foreground">
                    {boardPath(boards, board.id)
                      .slice(0, -1)
                      .map((item) => item.title)
                      .join(" / ") || "raiz"}
                  </span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex shrink-0 items-center gap-0.5" data-tauri-drag-region={undefined}>
        <UpdateButton />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={() => openDialogs.search()} aria-label="Busca global">
              <Search className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Busca global (Ctrl+K)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => updateSettings({ inspectorOpen: !inspectorOpen })}
              aria-label="Alternar inspector"
              className={cn(!inspectorOpen && "text-muted-foreground")}
            >
              <PanelRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Inspector (Ctrl+Shift+I)</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Arquivo e exportação">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Arquivo</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => useAppStore.getState().createBoard({})}>
              <Plus /> Novo quadro
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDialogs.import()}>
              <Upload /> Importar arquivo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDialogs.obsidian()}>
              <FolderOpen /> Cofre do Obsidian
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Exportar</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => openDialogs.export()}>
              <Download /> Exportar quadro
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDialogs.export()}>
              <ImageIcon /> Imagem (PNG)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDialogs.export()}>
              <FileDown /> PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDialogs.export()}>
              <FileText /> Markdown
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDialogs.export()}>
              <FileJson /> JSON
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => void persistenceService.flushNow()}>
              <Archive /> Salvar agora
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDialogs.backups()}>
              <Archive /> Backups
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={toggleTheme} aria-label="Alternar tema">
              {isDark || theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Alternar tema (Ctrl+Shift+L)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" onClick={() => openDialogs.settings()} aria-label="Configurações">
              <Settings className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Configurações — {platformLabel()}</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
