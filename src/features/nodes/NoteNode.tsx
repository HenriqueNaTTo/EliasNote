import { useState } from "react";
import { FileText, PenTool, Play } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/core/store";
import { parseRef, refForNode } from "@/core/domain/refs";
import type { CanvasNode } from "@/core/domain/types";
import { importFiles, useAttachmentUrl } from "@/core/media/attachments";
import { focusNode } from "@/features/canvas/viewportActions";
import { cn } from "@/lib/utils";
import { ImageLightbox } from "./ImageLightbox";
import { MarkdownEditor } from "./MarkdownEditor";
import { MarkdownView } from "./MarkdownView";
import { NodeTypeIcon, nodeColorClass, stopDrag } from "./nodeUi";
import type { NodeProps } from "./types";

const MEDIA_TYPES = new Set(["drawing", "image", "video", "file"]);

export function NoteNode({ node, editing, selected }: NodeProps) {
  const updateNode = useAppStore((state) => state.updateNode);
  const addNode = useAppStore((state) => state.addNode);
  const addReference = useAppStore((state) => state.addReference);
  const openDrawing = useAppStore((state) => state.openDrawing);
  const board = useAppStore((state) => {
    const tab = state.tabs.find((candidate) => candidate.id === state.activeTabId);
    return tab ? state.boards[tab.boardId] : undefined;
  });
  const [dropActive, setDropActive] = useState(false);
  const content = node.content ?? "";
  const words = content.split(/\s+/).filter(Boolean).length;

  const linkedMedia = (node.references ?? [])
    .map((reference) => parseRef(reference))
    .filter((parsed): parsed is { kind: "node"; id: string } => parsed?.kind === "node")
    .map((parsed) => board?.nodes[parsed.id])
    .filter((candidate): candidate is CanvasNode => Boolean(candidate && MEDIA_TYPES.has(candidate.type)))
    .slice(0, 4);

  const createLinkedDrawing = () => {
    const drawingId = addNode("drawing", { x: node.x + node.w + 24, y: node.y }, {
      parentId: node.parentId ?? null,
      title: "Desenho da nota",
    });
    if (!drawingId) return;
    addReference(node.id, refForNode(drawingId));
    openDrawing(drawingId);
  };

  const attachFiles = async (files: File[]) => {
    const store = useAppStore.getState();
    store.beginTransaction("Anexar imagens à nota");
    try {
      const mediaIds = await importFiles(
        files,
        { x: node.x + node.w + 24, y: node.y },
        { boardId: node.boardId },
      );
      for (const mediaId of mediaIds) addReference(node.id, refForNode(mediaId));
      store.endTransaction();
      useAppStore.getState().select([node.id]);
      if (mediaIds.length === 0) {
        toast.error("Nenhum arquivo pôde ser anexado.");
        return;
      }
      toast.success(
        mediaIds.length === 1
          ? "Imagem adicionada à nota"
          : `${mediaIds.length} anexos adicionados à nota`,
        { description: "A miniatura aparece dentro do cartão; o elemento fica ao lado." },
      );
    } catch (error) {
      store.cancelTransaction();
      toast.error("Falha ao anexar imagem", {
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const isFileDrag = (event: React.DragEvent<HTMLDivElement>) =>
    event.dataTransfer.types.includes("Files");

  return (
    <div
      className={cn(
        "node-surface relative flex h-full flex-col overflow-hidden rounded-xl border",
        nodeColorClass(node.color),
        dropActive && "ring-2 ring-primary ring-offset-1",
      )}
      data-drop-target="note"
      onDragOver={(event) => {
        if (!isFileDrag(event)) return;
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = "copy";
        setDropActive(true);
      }}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) return;
        setDropActive(false);
      }}
      onDrop={(event) => {
        if (!isFileDrag(event)) return;
        event.preventDefault();
        event.stopPropagation();
        setDropActive(false);
        const files = Array.from(event.dataTransfer.files);
        if (files.length > 0) void attachFiles(files);
      }}
    >
      <div className="flex items-center gap-1.5 px-3 pb-1 pt-2.5 text-[10px] font-semibold uppercase tracking-[0.09em] opacity-55">
        <NodeTypeIcon type="note" />
        <span>Nota</span>
        {selected && !editing ? (
          <button
            type="button"
            data-no-drag
            onPointerDown={stopDrag}
            onClick={createLinkedDrawing}
            className="ml-1 rounded p-0.5 opacity-70 hover:bg-current/10 hover:opacity-100"
            title="Criar desenho vinculado a esta nota"
            aria-label="Criar desenho vinculado"
          >
            <PenTool className="h-3 w-3" />
          </button>
        ) : null}
        <span className="ml-auto font-normal normal-case tracking-normal opacity-80">
          {words > 0 ? `${words} ${words === 1 ? "palavra" : "palavras"}` : ""}
        </span>
      </div>
      <div className={cn("scrollbar-thin flex min-h-0 flex-1 flex-col overflow-auto px-3 pb-3", editing && "gap-2")}>
        {editing ? (
          <input
            data-no-drag
            value={node.title ?? ""}
            onChange={(event) => updateNode(node.id, { title: event.target.value }, { label: "Editar nota" })}
            onPointerDown={stopDrag}
            placeholder="Título da nota"
            className="node-input shrink-0 border-b border-current/10 pb-1 text-sm font-semibold placeholder:opacity-40"
          />
        ) : (
          node.title?.trim() && <h3 className="mb-0.5 shrink-0 text-sm font-semibold leading-snug">{node.title}</h3>
        )}

        {editing ? (
          <MarkdownEditor
            value={content}
            onChange={(value) => updateNode(node.id, { content: value }, { label: "Editar nota" })}
            autoFocus
            className="min-h-0 flex-1"
            placeholder="Escreva em Markdown… use # título, - lista, - [ ] tarefa"
          />
        ) : (
          <MarkdownView
            source={content}
            className="text-[13px] leading-relaxed opacity-95"
            emptyPlaceholder="Duplo clique para escrever…"
          />
        )}

        {!editing && linkedMedia.length > 0 ? (
          <div className="mt-2 grid shrink-0 grid-cols-2 gap-1.5">
            {linkedMedia.map((media) => (
              <NoteMediaItem key={media.id} media={media} />
            ))}
          </div>
        ) : null}
      </div>

      {dropActive ? (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center rounded-xl bg-primary/10 ring-2 ring-primary/60">
          <span className="rounded-md bg-popover px-2 py-1 text-[10px] font-semibold shadow">
            Solte para anexar à nota
          </span>
        </div>
      ) : null}
    </div>
  );
}

function NoteMediaItem({ media }: { media: CanvasNode }) {
  const openDrawing = useAppStore((state) => state.openDrawing);

  if (media.type === "drawing") {
    return (
      <button
        type="button"
        data-no-drag
        onPointerDown={stopDrag}
        onClick={() => openDrawing(media.id)}
        className="group/link relative h-16 overflow-hidden rounded-lg border border-current/15 bg-white/60 text-left dark:bg-black/20"
        title={`Editar ${media.title || "desenho"}`}
      >
        {media.scene?.thumbnail ? (
          <img
            src={media.scene.thumbnail}
            alt={media.title || "Desenho"}
            className="h-full w-full object-contain p-1"
            draggable={false}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center gap-1 text-[10px] opacity-60">
            <PenTool className="h-3 w-3" />
            {media.title || "Desenho"}
          </span>
        )}
        <span className="absolute inset-x-0 bottom-0 bg-black/55 px-1 py-0.5 text-[9px] font-medium text-white opacity-0 transition-opacity group-hover/link:opacity-100">
          Editar desenho
        </span>
      </button>
    );
  }

  if (media.type === "image") {
    return <NoteImage media={media} />;
  }

  const Icon = media.type === "video" ? Play : FileText;
  return (
    <button
      type="button"
      data-no-drag
      onPointerDown={stopDrag}
      onClick={() => focusNode(media.id)}
      className="flex h-16 items-center gap-1.5 overflow-hidden rounded-lg border border-current/15 bg-white/50 px-2 text-left text-[10px] dark:bg-black/20"
      title={`Selecionar ${media.name || media.title || "anexo"}`}
    >
      <Icon className="h-4 w-4 shrink-0 opacity-60" />
      <span className="min-w-0 flex-1 truncate">{media.name || media.title || "Anexo"}</span>
    </button>
  );
}

function NoteImage({ media }: { media: CanvasNode }) {
  const attachmentUrl = useAttachmentUrl(media.attachmentId);
  const url = attachmentUrl ?? media.src ?? null;
  const [preview, setPreview] = useState(false);
  const label = media.caption || media.name || media.title || "Imagem";

  return (
    <>
      <button
        type="button"
        data-no-drag
        onPointerDown={stopDrag}
        onClick={() => {
          if (url) setPreview(true);
          else focusNode(media.id);
        }}
        className="group/link relative h-16 overflow-hidden rounded-lg border border-current/15 bg-white/60 dark:bg-black/20"
        title={`Ampliar ${label}`}
      >
        {url ? (
          <img src={url} alt={label} className="h-full w-full object-cover" draggable={false} />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[10px] opacity-60">{label}</span>
        )}
        <span className="absolute inset-x-0 bottom-0 truncate bg-black/55 px-1 py-0.5 text-[9px] font-medium text-white opacity-0 transition-opacity group-hover/link:opacity-100">
          {label}
        </span>
      </button>
      {preview && url ? <ImageLightbox src={url} alt={label} onClose={() => setPreview(false)} /> : null}
    </>
  );
}
