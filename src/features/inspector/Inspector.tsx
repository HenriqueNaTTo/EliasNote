import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlignCenter,
  AlignHorizontalDistributeCenter,
  AlignLeft,
  AlignRight,
  AlignVerticalDistributeCenter,
  ArrowDownToLine,
  ArrowUpToLine,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Link2,
  Lock,
  MessageCircle,
  PanelRightClose,
  PenTool,
  Plus,
  Trash2,
  Unlock,
  X,
} from "lucide-react";
import { useAppStore } from "@/core/store";
import { useActiveBoard, useBacklinks, useSelectedNodes } from "@/core/store/selectors";
import { activeBoard, locateNode } from "@/core/store/helpers";
import type {
  CanvasNode,
  Connector,
  EntityRef,
  ID,
  NodeColor,
  Priority,
} from "@/core/domain/types";
import { COLOR_OPTIONS, CONNECTOR_COLORS, DEFAULT_SETTINGS, NODE_LABELS, PRIORITY_LABELS, nodeTexts } from "@/core/domain/constants";
import { parseRef, refForBoard, refForNode } from "@/core/domain/refs";
import { boardStats } from "@/core/domain/tree";
import { nodeDisplayTitle } from "@/core/search/search";
import { cn, formatBytes, formatDate, timeAgo } from "@/lib/utils";
import { openExternal } from "@/lib/platform";
import { downloadBlob, saveAttachment } from "@/core/media/attachments";
import { suggestedFilename } from "@/features/export/boardExport";
import { sceneToPdfBlob, sceneToPngBlob, sceneToSvgString } from "@/features/drawing/drawingExport";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NodeTypeIcon } from "@/features/nodes/nodeUi";
import { openDialogs } from "@/features/shell/dialogActions";

/** Limites do arraste de largura do inspector (espelham a barra lateral). */
const INSPECTOR_MIN_WIDTH = 260;
const INSPECTOR_MAX_WIDTH = 560;
const INSPECTOR_DEFAULT_WIDTH = DEFAULT_SETTINGS.inspectorWidth;

function clampWidth(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return INSPECTOR_DEFAULT_WIDTH;
  return Math.min(INSPECTOR_MAX_WIDTH, Math.max(INSPECTOR_MIN_WIDTH, value));
}

export function Inspector() {
  const open = useAppStore((state) => state.settings.inspectorOpen);
  const width = useAppStore((state) => clampWidth(state.settings.inspectorWidth));
  const tab = useAppStore((state) => state.inspectorTab);
  const setTab = useAppStore((state) => state.setInspectorTab);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const board = useActiveBoard();
  const selectedNodes = useSelectedNodes();
  const selectedConnectors = useAppStore((state) => state.selectedConnectors);

  if (!open) return null;

  const connector = board && selectedConnectors[0] ? board.connectors[selectedConnectors[0]] : undefined;

  return (
    <aside
      className="relative flex shrink-0 flex-col border-l border-border bg-background"
      style={{ width }}
    >
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-3">
        <span className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Inspector
        </span>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}>
            <TabsList className="h-7 rounded-none bg-muted/60 p-0.5">
              <TabsTrigger value="props" className="px-2 py-0.5 text-[10px]">
                Propriedades
              </TabsTrigger>
              <TabsTrigger value="references" className="px-2 py-0.5 text-[10px]">
                Refs
              </TabsTrigger>
              <TabsTrigger value="comments" className="px-2 py-0.5 text-[10px]">
                Comentários
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => updateSettings({ inspectorOpen: false })}
            aria-label="Fechar inspector"
          >
            <PanelRightClose className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="p-3">
          {tab === "props" ? (
            connector ? (
              <ConnectorPanel connector={connector} />
            ) : selectedNodes.length === 0 ? (
              <BoardPanel />
            ) : selectedNodes.length === 1 ? (
              <NodePanel node={selectedNodes[0]} />
            ) : (
              <MultiSelectionPanel nodes={selectedNodes} />
            )
          ) : tab === "references" ? (
            <ReferencesPanel node={selectedNodes.length === 1 ? selectedNodes[0] : null} />
          ) : (
            <CommentsPanel />
          )}
        </div>
      </ScrollArea>

      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Redimensionar inspector"
        className="absolute left-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-primary/20"
        onPointerDown={(event) => {
          event.preventDefault();
          const startX = event.clientX;
          const startWidth = width;
          const onMove = (moveEvent: PointerEvent) => {
            const next = Math.min(
              INSPECTOR_MAX_WIDTH,
              Math.max(INSPECTOR_MIN_WIDTH, startWidth - (moveEvent.clientX - startX)),
            );
            useAppStore.getState().updateSettings({ inspectorWidth: next });
          };
          const onUp = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
          };
          window.addEventListener("pointermove", onMove);
          window.addEventListener("pointerup", onUp);
        }}
        onDoubleClick={() => useAppStore.getState().updateSettings({ inspectorWidth: INSPECTOR_DEFAULT_WIDTH })}
      />
    </aside>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 mt-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground first:mt-0">
      {children}
    </p>
  );
}

function BoardPanel() {
  const board = useActiveBoard();
  const updateBoard = useAppStore((state) => state.updateBoard);
  const saveBoardAsTemplate = useAppStore((state) => state.saveBoardAsTemplate);
  const deleteBoard = useAppStore((state) => state.deleteBoard);
  const [description, setDescription] = useState(board?.description ?? "");
  const [templateName, setTemplateName] = useState("");
  const confirmDelete = useAppStore((state) => state.settings.confirmDelete);
  const stats = board ? boardStats(board) : { nodes: 0, tasks: 0, tasksDone: 0, boards: 0 };

  useEffect(() => {
    setDescription(board?.description ?? "");
  }, [board?.id, board?.description]);

  if (!board) return <p className="text-xs text-muted-foreground">Nenhum quadro selecionado.</p>;

  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <NodeTypeIcon type="board" className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold">{board.title}</p>
          <p className="text-[10.5px] text-muted-foreground">Quadro atual</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <Stat label="Elementos" value={stats.nodes} />
        <Stat label="Tarefas" value={`${stats.tasksDone}/${stats.tasks}`} />
        <Stat label="Subquadros" value={stats.boards} />
      </div>

      <SectionTitle>Descrição</SectionTitle>
      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        onBlur={() => {
          if (description !== (board.description ?? "")) updateBoard(board.id, { description });
        }}
        placeholder="Contexto e objetivo deste quadro…"
        className="min-h-[74px] w-full resize-none rounded-lg border border-input bg-background px-2.5 py-2 text-xs leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
      />

      <SectionTitle>Cor do quadro</SectionTitle>
      <ColorRow value={board.color} onChange={(color) => updateBoard(board.id, { color })} />

      <SectionTitle>Ações</SectionTitle>
      <div className="flex flex-col gap-1.5">
        <Button variant="outline" size="sm" className="justify-start" onClick={() => openDialogs.export()}>
          <ExternalLink className="h-3.5 w-3.5" /> Exportar quadro
        </Button>
        <Button variant="outline" size="sm" className="justify-start" onClick={() => openDialogs.import()}>
          <Plus className="h-3.5 w-3.5" /> Importar conteúdo
        </Button>
      </div>

      <SectionTitle>Salvar como modelo</SectionTitle>
      <div className="flex gap-1.5">
        <Input
          value={templateName}
          onChange={(event) => setTemplateName(event.target.value)}
          placeholder="Nome do modelo"
          className="h-8 text-xs"
        />
        <Button
          size="sm"
          className="shrink-0"
          disabled={!templateName.trim()}
          onClick={() => {
            saveBoardAsTemplate(templateName);
            setTemplateName("");
          }}
        >
          Salvar
        </Button>
      </div>

      <Separator className="my-4" />
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => {
          if (!confirmDelete || window.confirm("Excluir este quadro e todos os subquadros?")) deleteBoard(board.id);
        }}
      >
        <Trash2 className="h-3.5 w-3.5" /> Excluir quadro
      </Button>
    </div>
  );
}

function NodePanel({ node }: { node: CanvasNode }) {
  const updateNode = useAppStore((state) => state.updateNode);
  const duplicateNodes = useAppStore((state) => state.duplicateNodes);
  const removeNodes = useAppStore((state) => state.removeNodes);
  const bringToFront = useAppStore((state) => state.bringToFront);
  const sendToBack = useAppStore((state) => state.sendToBack);
  const openDrawing = useAppStore((state) => state.openDrawing);
  const openBoard = useAppStore((state) => state.openBoard);
  const [tags, setTags] = useState((node.tags ?? []).join(", "));
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTags((node.tags ?? []).join(", "));
  }, [node.id, node.tags]);

  const commitTags = () => {
    const parsed = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    updateNode(node.id, { tags: parsed.length ? parsed : undefined }, { label: "Editar etiquetas" });
  };

  const replaceMedia = async (file: File | undefined) => {
    if (!file) return;
    const meta = await saveAttachment(file);
    updateNode(node.id, {
      attachmentId: meta.id,
      name: meta.name,
      mime: meta.mime,
      size: meta.size,
      src: undefined,
    }, { label: "Substituir anexo" });
    useAppStore.getState().bumpAttachments();
  };

  const exportDrawing = async (format: "png" | "svg" | "pdf") => {
    if (!node.scene) return;
    const name = suggestedFilename(node.title || "desenho", format);
    if (format === "png") downloadBlob(name, await sceneToPngBlob(node.scene));
    else if (format === "pdf") downloadBlob(name, await sceneToPdfBlob(node.scene));
    else downloadBlob(suggestedFilename(node.title || "desenho", "svg"), new Blob([await sceneToSvgString(node.scene)], { type: "image/svg+xml" }));
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-foreground">
          <NodeTypeIcon type={node.type} className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold">{nodeDisplayTitle(node)}</p>
          <p className="text-[10.5px] text-muted-foreground">
            {NODE_LABELS[node.type]} · {node.w}×{node.h}
          </p>
        </div>
        {node.locked ? <Badge variant="outline">Bloqueado</Badge> : null}
      </div>

      <div className="mt-2 flex items-center gap-1">
        <IconAction label="Duplicar" onClick={() => duplicateNodes([node.id])}>
          <Copy />
        </IconAction>
        <IconAction label="Trazer para frente" onClick={() => bringToFront([node.id])}>
          <ArrowUpToLine />
        </IconAction>
        <IconAction label="Enviar para trás" onClick={() => sendToBack([node.id])}>
          <ArrowDownToLine />
        </IconAction>
        <IconAction
          label={node.locked ? "Desbloquear" : "Bloquear"}
          onClick={() => updateNode(node.id, { locked: !node.locked }, { label: "Bloquear" })}
        >
          {node.locked ? <Unlock /> : <Lock />}
        </IconAction>
        <IconAction
          label={node.hidden ? "Mostrar" : "Ocultar"}
          onClick={() => updateNode(node.id, { hidden: !node.hidden }, { label: "Ocultar" })}
        >
          {node.hidden ? <Eye /> : <EyeOff />}
        </IconAction>
        <IconAction label="Excluir" destructive onClick={() => removeNodes([node.id])}>
          <Trash2 />
        </IconAction>
      </div>

      {node.type !== "image" && node.type !== "video" && node.type !== "file" && node.type !== "drawing" && node.type !== "text" ? (
        <>
          {node.type !== "column" ? (
            <>
              <SectionTitle>Título</SectionTitle>
              <Input
                value={node.title ?? ""}
                onChange={(event) => updateNode(node.id, { title: event.target.value }, { label: "Editar título" })}
                placeholder="Título"
                className="h-8 text-xs"
              />
            </>
          ) : null}
        </>
      ) : null}

      <SectionTitle>Cor</SectionTitle>
      <ColorRow value={node.color} onChange={(color) => updateNode(node.id, { color }, { label: "Alterar cor" })} />

      <NodeSpecificPanel node={node} onOpenBoard={openBoard} onOpenDrawing={openDrawing} />

      {node.type === "image" || node.type === "video" || node.type === "file" ? (
        <>
          <SectionTitle>Anexo</SectionTitle>
          <div className="rounded-lg border border-border bg-card p-2.5 text-[11px]">
            <p className="truncate font-medium">{node.name ?? "Sem arquivo"}</p>
            <p className="text-muted-foreground">
              {node.mime ?? "—"} · {formatBytes(node.size)}
            </p>
            <Button variant="subtle" size="xs" className="mt-2" onClick={() => fileRef.current?.click()}>
              Substituir arquivo
            </Button>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept={node.type === "image" ? "image/*" : node.type === "video" ? "video/*" : undefined}
              onChange={(event) => void replaceMedia(event.target.files?.[0])}
            />
          </div>
        </>
      ) : null}

      {node.type === "drawing" ? (
        <>
          <SectionTitle>Desenho Excalidraw</SectionTitle>
          <div className="flex flex-col gap-1.5">
            <Button variant="subtle" size="sm" className="justify-start" onClick={() => openDrawing(node.id)}>
              <PenTool className="h-3.5 w-3.5" /> Abrir editor
            </Button>
            <div className="grid grid-cols-3 gap-1">
              <Button variant="outline" size="xs" onClick={() => void exportDrawing("png")}>
                PNG
              </Button>
              <Button variant="outline" size="xs" onClick={() => void exportDrawing("svg")}>
                SVG
              </Button>
              <Button variant="outline" size="xs" onClick={() => void exportDrawing("pdf")}>
                PDF
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {node.scene?.elements.length ?? 0} elementos · atualizado {timeAgo(node.scene?.updatedAt ?? node.updatedAt)}
            </p>
          </div>
        </>
      ) : null}

      <SectionTitle>Posição e tamanho</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        <NumberField label="X" value={node.x} onCommit={(value) => updateNode(node.id, { x: value }, { label: "Posicionar" })} />
        <NumberField label="Y" value={node.y} onCommit={(value) => updateNode(node.id, { y: value }, { label: "Posicionar" })} />
        <NumberField label="Largura" value={node.w} min={80} onCommit={(value) => updateNode(node.id, { w: value }, { label: "Redimensionar" })} />
        <NumberField label="Altura" value={node.h} min={40} onCommit={(value) => updateNode(node.id, { h: value }, { label: "Redimensionar" })} />
      </div>

      <SectionTitle>Etiquetas</SectionTitle>
      <Input
        value={tags}
        onChange={(event) => setTags(event.target.value)}
        onBlur={commitTags}
        onKeyDown={(event) => {
          if (event.key === "Enter") commitTags();
        }}
        placeholder="ideias, referência, urgente"
        className="h-8 text-xs"
      />
      <p className="mt-1 text-[10px] text-muted-foreground">Separe etiquetas por vírgula.</p>

      {node.type === "comment" ? <CommentControls node={node} /> : null}
    </div>
  );
}

function NodeSpecificPanel({
  node,
  onOpenBoard,
  onOpenDrawing,
}: {
  node: CanvasNode;
  onOpenBoard: (id: ID) => void;
  onOpenDrawing: (id: ID) => void;
}) {
  const updateNode = useAppStore((state) => state.updateNode);
  const toggleTask = useAppStore((state) => state.toggleTask);

  switch (node.type) {
    case "text":
      return (
        <>
          <SectionTitle>Texto</SectionTitle>
          <Textarea
            value={node.content ?? ""}
            onChange={(event) =>
              updateNode(node.id, { content: event.target.value }, { label: "Editar texto" })
            }
            placeholder="Escreva algo…"
            className="min-h-[96px] text-xs leading-relaxed"
          />
          <p className="mt-1 text-[10px] text-muted-foreground">
            Texto livre sobre o canvas, sem moldura de cartão. Duplo clique no elemento para editar.
          </p>
        </>
      );
    case "task":
      return (
        <>
          <SectionTitle>Tarefa</SectionTitle>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs">Concluída</span>
              <Switch checked={Boolean(node.done)} onCheckedChange={() => toggleTask(node.id)} />
            </div>
            <div>
              <Label className="text-[10px]">Prioridade</Label>
              <div className="mt-1 grid grid-cols-3 gap-1">
                {(["low", "medium", "high"] as Priority[]).map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => updateNode(node.id, { priority }, { label: "Prioridade" })}
                    className={cn(
                      "rounded-md border px-1.5 py-1 text-[10.5px] font-medium transition-colors",
                      (node.priority ?? "medium") === priority
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-accent",
                    )}
                  >
                    {PRIORITY_LABELS[priority]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-[10px]" htmlFor="due-date">
                Prazo
              </Label>
              <Input
                id="due-date"
                type="date"
                value={node.due ?? ""}
                onChange={(event) => updateNode(node.id, { due: event.target.value || undefined }, { label: "Prazo" })}
                className="mt-1 h-8 text-xs"
              />
            </div>
            {node.due ? (
              <p className="text-[10px] text-muted-foreground">
                {formatDate(new Date(`${node.due}T12:00:00`).getTime())}
              </p>
            ) : null}
          </div>
        </>
      );
    case "checklist":
      return (
        <>
          <SectionTitle>Checklist</SectionTitle>
          <div className="rounded-lg border border-border bg-card p-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <span>
                {(node.items ?? []).filter((item) => item.done).length} de {(node.items ?? []).length} concluídos
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => useAppStore.getState().addChecklistItem(node.id, "Novo item")}
                aria-label="Adicionar item"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{
                  width: `${((node.items ?? []).filter((item) => item.done).length / Math.max(1, (node.items ?? []).length)) * 100}%`,
                }}
              />
            </div>
          </div>
        </>
      );
    case "link":
      return (
        <>
          <SectionTitle>Link</SectionTitle>
          <div className="space-y-1.5">
            <Input
              value={node.url ?? ""}
              onChange={(event) => updateNode(node.id, { url: event.target.value }, { label: "Editar link" })}
              placeholder="https://…"
              className="h-8 text-xs"
            />
            <Input
              value={node.description ?? ""}
              onChange={(event) => updateNode(node.id, { description: event.target.value }, { label: "Editar link" })}
              placeholder="Descrição"
              className="h-8 text-xs"
            />
            <Button
              variant="outline"
              size="xs"
              className="w-full"
              onClick={() => void openExternal(node.url ?? "")}
            >
              <ExternalLink className="h-3 w-3" /> Abrir no navegador
            </Button>
          </div>
        </>
      );
    case "image":
    case "video":
      return (
        <>
          <SectionTitle>Mídia</SectionTitle>
          <div className="space-y-1.5">
            <Input
              value={node.caption ?? ""}
              onChange={(event) => updateNode(node.id, { caption: event.target.value }, { label: "Legenda" })}
              placeholder="Legenda"
              className="h-8 text-xs"
            />
            <div className="grid grid-cols-2 gap-1">
              {(["cover", "contain"] as const).map((fit) => (
                <button
                  key={fit}
                  type="button"
                  onClick={() => updateNode(node.id, { fit }, { label: "Ajuste da mídia" })}
                  className={cn(
                    "rounded-md border px-1.5 py-1 text-[10.5px] capitalize transition-colors",
                    (node.fit ?? "cover") === fit
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-accent",
                  )}
                >
                  {fit === "cover" ? "Preencher" : "Conter"}
                </button>
              ))}
            </div>
          </div>
        </>
      );
    case "board":
      return (
        <>
          <SectionTitle>Quadro aninhado</SectionTitle>
          <Button
            variant="subtle"
            size="sm"
            className="w-full justify-start"
            disabled={!node.childBoardId}
            onClick={() => node.childBoardId && onOpenBoard(node.childBoardId)}
          >
            <ExternalLink className="h-3.5 w-3.5" /> Abrir quadro
          </Button>
        </>
      );
    case "drawing":
      return (
        <div className="mt-2">
          <Button variant="subtle" size="sm" className="w-full justify-start" onClick={() => onOpenDrawing(node.id)}>
            <PenTool className="h-3.5 w-3.5" /> Abrir editor
          </Button>
        </div>
      );
    case "column":
      return (
        <>
          <SectionTitle>Coluna</SectionTitle>
          <div className="flex items-center justify-between">
            <span className="text-xs">Recolhida</span>
            <Switch
              checked={Boolean(node.collapsed)}
              onCheckedChange={(collapsed) => updateNode(node.id, { collapsed }, { label: "Recolher coluna" })}
            />
          </div>
        </>
      );
    default:
      return null;
  }
}

function CommentControls({ node }: { node: CanvasNode }) {
  const toggleResolved = useAppStore((state) => state.toggleCommentResolved);
  const addReply = useAppStore((state) => state.addCommentReply);
  const [reply, setReply] = useState("");

  return (
    <>
      <SectionTitle>Comentário</SectionTitle>
      <div className="flex items-center justify-between">
        <span className="text-xs">Resolvido</span>
        <Switch checked={Boolean(node.resolved)} onCheckedChange={() => toggleResolved(node.id)} />
      </div>
      <div className="mt-2 space-y-1.5">
        {(node.replies ?? []).map((item) => (
          <div key={item.id} className="rounded-md bg-muted px-2 py-1.5 text-[11px]">
            <p className="font-semibold">{item.author}</p>
            <p className="mt-0.5 whitespace-pre-wrap text-muted-foreground">{item.content}</p>
          </div>
        ))}
        <div className="flex gap-1">
          <Input
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            placeholder="Responder…"
            className="h-8 text-xs"
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              addReply(node.id, reply);
              setReply("");
            }}
          />
          <Button
            size="sm"
            className="shrink-0"
            disabled={!reply.trim()}
            onClick={() => {
              addReply(node.id, reply);
              setReply("");
            }}
          >
            Enviar
          </Button>
        </div>
      </div>
    </>
  );
}

function ColorRow({ value, onChange }: { value: NodeColor; onChange: (color: NodeColor) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {COLOR_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          title={option.label}
          onClick={() => onChange(option.value)}
          className={cn(
            "grid h-6 w-6 place-items-center rounded-full border transition-transform hover:scale-105",
            value === option.value ? "border-primary ring-2 ring-primary/40" : "border-border",
          )}
          style={{ backgroundColor: option.hex }}
          aria-label={option.label}
        >
          {value === option.value ? <span className="h-1.5 w-1.5 rounded-full bg-foreground/70" /> : null}
        </button>
      ))}
    </div>
  );
}

function NumberField({
  label,
  value,
  onCommit,
  min,
}: {
  label: string;
  value: number;
  onCommit: (value: number) => void;
  min?: number;
}) {
  const [draft, setDraft] = useState(String(Math.round(value)));

  useEffect(() => {
    setDraft(String(Math.round(value)));
  }, [value]);

  const commit = () => {
    const parsed = Number(draft);
    if (!Number.isFinite(parsed)) {
      setDraft(String(Math.round(value)));
      return;
    }
    onCommit(Math.max(min ?? -100000, Math.round(parsed)));
  };

  return (
    <label className="flex items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1 text-[10px] text-muted-foreground">
      <span className="shrink-0">{label}</span>
      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
        className="min-w-0 flex-1 bg-transparent text-right text-[11px] font-medium tabular-nums text-foreground outline-none"
        inputMode="numeric"
      />
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-muted/60 px-2 py-1.5 text-center">
      <p className="text-[13px] font-semibold tabular-nums">{value}</p>
      <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

function IconAction({
  label,
  onClick,
  destructive,
  children,
}: {
  label: string;
  onClick: () => void;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn("text-muted-foreground", destructive && "hover:bg-destructive/10 hover:text-destructive")}
    >
      {children}
    </Button>
  );
}

function MultiSelectionPanel({ nodes }: { nodes: CanvasNode[] }) {
  const updateNodes = useAppStore((state) => state.updateNodes);
  const duplicateNodes = useAppStore((state) => state.duplicateNodes);
  const removeNodes = useAppStore((state) => state.removeNodes);
  const bringToFront = useAppStore((state) => state.bringToFront);
  const sendToBack = useAppStore((state) => state.sendToBack);
  const ids = useMemo(() => nodes.map((node) => node.id), [nodes]);

  const applyAlign = (mode: "left" | "center" | "right" | "top" | "middle" | "bottom" | "distribute-x" | "distribute-y") => {
    const state = useAppStore.getState();
    const board = activeBoard(state);
    if (!board) return;
    const selected = state.selection
      .map((id) => board.nodes[id])
      .filter((node): node is CanvasNode => Boolean(node));
    if (selected.length < 2) return;
    const patches: Record<ID, Partial<CanvasNode>> = {};
    const minX = Math.min(...selected.map((node) => node.x));
    const maxX = Math.max(...selected.map((node) => node.x + node.w));
    const minY = Math.min(...selected.map((node) => node.y));
    const maxY = Math.max(...selected.map((node) => node.y + node.h));

    if (mode === "left") selected.forEach((node) => (patches[node.id] = { x: minX }));
    if (mode === "right") selected.forEach((node) => (patches[node.id] = { x: maxX - node.w }));
    if (mode === "center") {
      const center = (minX + maxX) / 2;
      selected.forEach((node) => (patches[node.id] = { x: Math.round(center - node.w / 2) }));
    }
    if (mode === "top") selected.forEach((node) => (patches[node.id] = { y: minY }));
    if (mode === "bottom") selected.forEach((node) => (patches[node.id] = { y: maxY - node.h }));
    if (mode === "middle") {
      const center = (minY + maxY) / 2;
      selected.forEach((node) => (patches[node.id] = { y: Math.round(center - node.h / 2) }));
    }
    if (mode === "distribute-x" && selected.length > 2) {
      const sorted = [...selected].sort((a, b) => a.x - b.x);
      const gap = (maxX - minX - sorted.reduce((sum, node) => sum + node.w, 0)) / (sorted.length - 1);
      let cursor = minX;
      sorted.forEach((node) => {
        patches[node.id] = { x: Math.round(cursor) };
        cursor += node.w + gap;
      });
    }
    if (mode === "distribute-y" && selected.length > 2) {
      const sorted = [...selected].sort((a, b) => a.y - b.y);
      const gap = (maxY - minY - sorted.reduce((sum, node) => sum + node.h, 0)) / (sorted.length - 1);
      let cursor = minY;
      sorted.forEach((node) => {
        patches[node.id] = { y: Math.round(cursor) };
        cursor += node.h + gap;
      });
    }

    state.commit("Alinhar elementos", (draft) => {
      for (const [id, patch] of Object.entries(patches)) {
        const target = draft.boards[board.id]?.nodes[id];
        if (target) {
          Object.assign(target, patch, { updatedAt: Date.now() });
        }
      }
    });
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <Copy className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[13px] font-semibold">{nodes.length} elementos</p>
          <p className="text-[10.5px] text-muted-foreground">Seleção múltipla</p>
        </div>
      </div>

      <SectionTitle>Cor</SectionTitle>
      <ColorRow value={nodes[0]?.color ?? "none"} onChange={(color) => updateNodes(ids, { color }, { label: "Alterar cor" })} />

      <SectionTitle>Alinhar</SectionTitle>
      <div className="grid grid-cols-4 gap-1">
        <IconAction label="Alinhar à esquerda" onClick={() => applyAlign("left")}>
          <AlignLeft />
        </IconAction>
        <IconAction label="Centralizar horizontalmente" onClick={() => applyAlign("center")}>
          <AlignCenter />
        </IconAction>
        <IconAction label="Alinhar à direita" onClick={() => applyAlign("right")}>
          <AlignRight />
        </IconAction>
        <IconAction label="Distribuir horizontalmente" onClick={() => applyAlign("distribute-x")}>
          <AlignHorizontalDistributeCenter />
        </IconAction>
        <IconAction label="Alinhar ao topo" onClick={() => applyAlign("top")}>
          <AlignLeft className="rotate-90" />
        </IconAction>
        <IconAction label="Centralizar verticalmente" onClick={() => applyAlign("middle")}>
          <AlignCenter className="rotate-90" />
        </IconAction>
        <IconAction label="Alinhar à base" onClick={() => applyAlign("bottom")}>
          <AlignRight className="rotate-90" />
        </IconAction>
        <IconAction label="Distribuir verticalmente" onClick={() => applyAlign("distribute-y")}>
          <AlignVerticalDistributeCenter />
        </IconAction>
      </div>

      <SectionTitle>Ações</SectionTitle>
      <div className="flex flex-col gap-1.5">
        <Button variant="outline" size="sm" className="justify-start" onClick={() => duplicateNodes(ids)}>
          <Copy className="h-3.5 w-3.5" /> Duplicar seleção
        </Button>
        <Button variant="outline" size="sm" className="justify-start" onClick={() => bringToFront(ids)}>
          <ArrowUpToLine className="h-3.5 w-3.5" /> Trazer para frente
        </Button>
        <Button variant="outline" size="sm" className="justify-start" onClick={() => sendToBack(ids)}>
          <ArrowDownToLine className="h-3.5 w-3.5" /> Enviar para trás
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => removeNodes(ids)}
        >
          <Trash2 className="h-3.5 w-3.5" /> Excluir seleção
        </Button>
      </div>
    </div>
  );
}

function ConnectorPanel({ connector }: { connector: Connector }) {
  const updateConnector = useAppStore((state) => state.updateConnector);
  const removeConnector = useAppStore((state) => state.removeConnector);

  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <Link2 className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[13px] font-semibold">Conector</p>
          <p className="text-[10.5px] text-muted-foreground">
            {connector.from.nodeId ? "origem vinculada" : "origem livre"} →{" "}
            {connector.to.nodeId ? "destino vinculado" : "destino livre"}
          </p>
        </div>
      </div>

      <SectionTitle>Rótulo</SectionTitle>
      <Input
        value={connector.label ?? ""}
        onChange={(event) => updateConnector(connector.id, { label: event.target.value || undefined })}
        placeholder="Ex.: depende de"
        className="h-8 text-xs"
      />

      <SectionTitle>Forma</SectionTitle>
      <div className="grid grid-cols-3 gap-1">
        {(["curve", "straight", "elbow"] as const).map((kind) => (
          <button
            key={kind}
            type="button"
            onClick={() => updateConnector(connector.id, { kind })}
            className={cn(
              "rounded-md border px-1.5 py-1 text-[10.5px] transition-colors",
              connector.kind === kind
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-accent",
            )}
          >
            {kind === "curve" ? "Curva" : kind === "straight" ? "Reta" : "Cotovelo"}
          </button>
        ))}
      </div>

      <SectionTitle>Cor</SectionTitle>
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(CONNECTOR_COLORS) as NodeColor[]).map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => updateConnector(connector.id, { color })}
            className={cn(
              "h-6 w-6 rounded-full border",
              connector.color === color ? "border-primary ring-2 ring-primary/40" : "border-border",
            )}
            style={{ backgroundColor: CONNECTOR_COLORS[color] }}
            aria-label={`Cor ${color}`}
          />
        ))}
      </div>

      <SectionTitle>Estilo</SectionTitle>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs">Tracejado</span>
          <Switch checked={Boolean(connector.dashed)} onCheckedChange={(dashed) => updateConnector(connector.id, { dashed })} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs">Seta no início</span>
          <Switch
            checked={Boolean(connector.arrowStart)}
            onCheckedChange={(arrowStart) => updateConnector(connector.id, { arrowStart })}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs">Seta no fim</span>
          <Switch
            checked={connector.arrowEnd !== false}
            onCheckedChange={(arrowEnd) => updateConnector(connector.id, { arrowEnd })}
          />
        </div>
      </div>

      <Separator className="my-4" />
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => removeConnector(connector.id)}
      >
        <Trash2 className="h-3.5 w-3.5" /> Excluir conector
      </Button>
    </div>
  );
}

function ReferencesPanel({ node }: { node: CanvasNode | null }) {
  const board = useActiveBoard();
  const boards = useAppStore((state) => state.boards);
  const addReference = useAppStore((state) => state.addReference);
  const removeReference = useAppStore((state) => state.removeReference);
  const openBoard = useAppStore((state) => state.openBoard);
  const targetRef = node ? refForNode(node.id) : board ? refForBoard(board.id) : null;
  const backlinks = useBacklinks(targetRef);
  const references = node?.references ?? [];

  const resolveRef = (ref: EntityRef): { title: string; boardId: ID | null; exists: boolean } => {
    const parsed = parseRef(ref);
    if (!parsed) return { title: ref, boardId: null, exists: false };
    if (parsed.kind === "board") {
      const target = boards[parsed.id];
      return { title: target?.title ?? "Quadro removido", boardId: target?.id ?? null, exists: Boolean(target) };
    }
    const located = locateNode({ boards }, parsed.id);
    return {
      title: located ? nodeDisplayTitle(located.node) : "Elemento removido",
      boardId: located?.board.id ?? null,
      exists: Boolean(located),
    };
  };

  if (!node && !board) return <p className="text-xs text-muted-foreground">Selecione um elemento.</p>;

  return (
    <div>
      <p className="text-[11px] font-medium">
        {node ? "Referências deste elemento" : "Referências deste quadro"}
      </p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">
        Links bidirecionais são indexados automaticamente entre quadros e elementos.
      </p>

      {node ? (
        <>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {references.length === 0 ? (
              <p className="text-[11px] text-muted-foreground">Nenhuma referência ainda.</p>
            ) : (
              references.map((ref) => {
                const resolved = resolveRef(ref);
                return (
                  <span
                    key={ref}
                    className="flex max-w-full items-center gap-1 rounded-md border border-border bg-card px-1.5 py-0.5 text-[10.5px]"
                  >
                    <button
                      type="button"
                      className="truncate hover:underline"
                      onClick={() => resolved.boardId && openBoard(resolved.boardId)}
                    >
                      {resolved.title}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeReference(node.id, ref)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Remover referência"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                );
              })
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="mt-2 w-full justify-start">
                <Plus className="h-3.5 w-3.5" /> Adicionar referência
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-[320px] w-[260px] overflow-auto">
              <DropdownMenuLabel>Quadros</DropdownMenuLabel>
              {Object.values(boards)
                .filter((candidate) => candidate.id !== node.boardId)
                .slice(0, 30)
                .map((candidate) => (
                  <DropdownMenuItem
                    key={candidate.id}
                    onClick={() => addReference(node.id, refForBoard(candidate.id))}
                  >
                    <NodeTypeIcon type="board" /> {candidate.title}
                  </DropdownMenuItem>
                ))}
              {board ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Elementos deste quadro</DropdownMenuLabel>
                  {Object.values(board.nodes)
                    .filter((candidate) => candidate.id !== node.id)
                    .slice(0, 40)
                    .map((candidate) => (
                      <DropdownMenuItem
                        key={candidate.id}
                        onClick={() => addReference(node.id, refForNode(candidate.id))}
                      >
                        <NodeTypeIcon type={candidate.type} /> {nodeDisplayTitle(candidate)}
                      </DropdownMenuItem>
                    ))}
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : null}

      <SectionTitle>Backlinks</SectionTitle>
      {backlinks.length === 0 ? (
        <p className="text-[11px] text-muted-foreground">Nenhum elemento aponta para cá.</p>
      ) : (
        <div className="space-y-1">
          {backlinks.map((source) => (
            <button
              key={`${source.board.id}:${source.node.id}`}
              type="button"
              onClick={() => {
                openBoard(source.board.id);
                useAppStore.getState().select([source.node.id]);
              }}
              className="flex w-full items-center gap-2 rounded-md border border-border bg-card px-2 py-1.5 text-left text-[11px] hover:bg-accent"
            >
              <NodeTypeIcon type={source.node.type} className="shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{nodeDisplayTitle(source.node)}</span>
              <span className="max-w-[90px] truncate text-[9.5px] text-muted-foreground">{source.board.title}</span>
            </button>
          ))}
        </div>
      )}

      {node ? (
        <>
          <SectionTitle>Resumo</SectionTitle>
          <p className="rounded-lg bg-muted/60 p-2 text-[10.5px] leading-relaxed text-muted-foreground">
            {nodeTexts(node).join(" ").slice(0, 240) || "Sem conteúdo textual."}
          </p>
        </>
      ) : null}
    </div>
  );
}

function CommentsPanel() {
  const board = useActiveBoard();
  const addReply = useAppStore((state) => state.addCommentReply);
  const toggleResolved = useAppStore((state) => state.toggleCommentResolved);
  const [drafts, setDrafts] = useState<Record<ID, string>>({});

  const comments = useMemo(
    () =>
      Object.values(board?.nodes ?? {})
        .filter((node) => node.type === "comment")
        .sort((a, b) => Number(a.resolved) - Number(b.resolved) || b.updatedAt - a.updatedAt),
    [board?.nodes],
  );

  if (!board) return <p className="text-xs text-muted-foreground">Nenhum quadro ativo.</p>;

  return (
    <div>
      <p className="text-[11px] font-medium">Comentários locais</p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">
        {comments.filter((comment) => !comment.resolved).length} em aberto · {comments.length} no total
      </p>

      <Button
        variant="outline"
        size="sm"
        className="mt-2 w-full justify-start"
        onClick={() => {
          const state = useAppStore.getState();
          const vp = state.viewports[board.id] ?? { x: 120, y: 100, zoom: 1 };
          const world = {
            x: (state.canvasSize.width / 2 - vp.x) / vp.zoom,
            y: (state.canvasSize.height / 2 - vp.y) / vp.zoom,
          };
          state.addNode("comment", { x: Math.round(world.x - 130), y: Math.round(world.y - 80) });
        }}
      >
        <MessageCircle className="h-3.5 w-3.5" /> Novo comentário
      </Button>

      <div className="mt-3 space-y-2">
        {comments.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">Nenhum comentário neste quadro.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className={cn("rounded-lg border border-border bg-card p-2", comment.resolved && "opacity-70")}>
              <div className="flex items-center gap-1.5">
                <span className="text-[10.5px] font-semibold">{comment.author ?? "Você"}</span>
                <span className="text-[9.5px] text-muted-foreground">{timeAgo(comment.updatedAt)}</span>
                {comment.resolved ? <Badge variant="success" className="ml-auto">Resolvido</Badge> : null}
              </div>
              <p className="mt-1 whitespace-pre-wrap text-[11px] leading-relaxed">{comment.content}</p>
              {(comment.replies ?? []).map((reply) => (
                <div key={reply.id} className="mt-1 rounded bg-muted px-2 py-1 text-[10.5px]">
                  <span className="font-semibold">{reply.author}</span>: {reply.content}
                </div>
              ))}
              <div className="mt-1.5 flex items-center gap-1">
                <Input
                  value={drafts[comment.id] ?? ""}
                  onChange={(event) => setDrafts((current) => ({ ...current, [comment.id]: event.target.value }))}
                  placeholder="Responder…"
                  className="h-7 text-[11px]"
                  onKeyDown={(event) => {
                    if (event.key !== "Enter") return;
                    addReply(comment.id, drafts[comment.id] ?? "");
                    setDrafts((current) => ({ ...current, [comment.id]: "" }));
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={comment.resolved ? "Reabrir" : "Resolver"}
                  onClick={() => toggleResolved(comment.id)}
                >
                  {comment.resolved ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
