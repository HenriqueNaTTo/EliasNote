import { useRef, useState } from "react";
import {
  Download,
  ExternalLink,
  FileText,
  Globe,
  Maximize2,
  Upload,
  Video,
} from "lucide-react";
import { useAppStore } from "@/core/store";
import { cn, formatBytes, truncate } from "@/lib/utils";
import { hostnameOf, openExternal } from "@/lib/platform";
import { saveAttachment, useAttachmentUrl } from "@/core/media/attachments";
import { Button } from "@/components/ui/button";
import { ImageLightbox } from "./ImageLightbox";
import { nodeColorClass, stopDrag } from "./nodeUi";
import type { NodeProps } from "./types";

function useFilePicker(nodeId: string, kind: "image" | "video" | "file") {
  const inputRef = useRef<HTMLInputElement>(null);
  const element = (
    <input
      ref={inputRef}
      type="file"
      className="hidden"
      accept={kind === "image" ? "image/*" : kind === "video" ? "video/*" : undefined}
      onChange={async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        const meta = await saveAttachment(file);
        const state = useAppStore.getState();
        state.updateNode(
          nodeId,
          {
            attachmentId: meta.id,
            name: meta.name,
            mime: meta.mime,
            size: meta.size,
            src: undefined,
          },
          { label: "Anexar arquivo" },
        );
        state.bumpAttachments();
      }}
    />
  );
  return { open: () => inputRef.current?.click(), element };
}

export function ImageNode({ node }: NodeProps) {
  const url = useAttachmentUrl(node.attachmentId);
  const [lightbox, setLightbox] = useState(false);
  const picker = useFilePicker(node.id, "image");
  const source = url ?? node.src ?? "";

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-none border border-[var(--node-border)] bg-card">
      <div className="group/image relative min-h-0 flex-1 overflow-hidden bg-muted">
        {source ? (
          <img
            src={source}
            alt={node.caption || node.name || "Imagem"}
            draggable={false}
            className={cn("h-full w-full", node.fit === "contain" ? "object-contain" : "object-cover")}
            onDoubleClick={() => setLightbox(true)}
          />
        ) : (
          <button
            type="button"
            data-no-drag
            onPointerDown={stopDrag}
            onClick={picker.open}
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/70"
          >
            <Upload className="h-5 w-5" />
            <span className="text-xs font-medium">Escolher imagem</span>
          </button>
        )}

        {source ? (
          <Button
            data-no-drag
            onPointerDown={stopDrag}
            size="icon-xs"
            variant="secondary"
            className="absolute right-2 top-2 h-6 w-6 rounded-none bg-black/45 text-white opacity-0 transition-opacity hover:bg-black/65 group-hover/image:opacity-100"
            onClick={() => setLightbox(true)}
            aria-label="Ampliar imagem"
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
        ) : null}
      </div>

      {node.caption ? (
        <div className="shrink-0 truncate border-t border-border px-2.5 py-1.5 text-[10.5px] text-muted-foreground">
          {node.caption}
        </div>
      ) : null}

      {lightbox && source ? (
        <ImageLightbox
          src={source}
          alt={node.caption || node.name || "Imagem"}
          onClose={() => setLightbox(false)}
        />
      ) : null}
      {picker.element}
    </div>
  );
}

export function VideoNode({ node }: NodeProps) {
  const url = useAttachmentUrl(node.attachmentId);
  const picker = useFilePicker(node.id, "video");
  const source = url ?? node.src ?? "";

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-none border border-[var(--node-border)] bg-card">
      <div className="relative min-h-0 flex-1 overflow-hidden bg-black">
        {source ? (
          <video src={source} controls className="h-full w-full bg-black object-contain" preload="metadata" />
        ) : (
          <button
            type="button"
            data-no-drag
            onPointerDown={stopDrag}
            onClick={picker.open}
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-white/70 hover:text-white"
          >
            <Video className="h-5 w-5" />
            <span className="text-xs font-medium">Escolher vídeo</span>
          </button>
        )}
      </div>
      {node.caption ? (
        <div className="shrink-0 truncate border-t border-border px-2.5 py-1.5 text-[10.5px] text-muted-foreground">
          {node.caption}
        </div>
      ) : null}
      {picker.element}
    </div>
  );
}

export function FileNode({ node }: NodeProps) {
  const url = useAttachmentUrl(node.attachmentId);
  const picker = useFilePicker(node.id, "file");

  return (
    <div
      className={cn(
        "node-surface flex h-full items-center gap-3 overflow-hidden rounded-none border px-3.5",
        nodeColorClass(node.color),
      )}
    >
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-none bg-current/10">
        <FileText className="h-5 w-5 opacity-70" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12.5px] font-semibold">{node.name ?? node.title ?? "Arquivo"}</p>
        <p className="text-[10.5px] opacity-55">
          {node.mime || "arquivo"} · {formatBytes(node.size)}
        </p>
      </div>
      {url ? (
        <div className="flex shrink-0 items-center gap-1" data-no-drag>
          <a
            href={url}
            download={node.name ?? "arquivo"}
            target="_blank"
            rel="noreferrer"
            onPointerDown={stopDrag}
            className="grid h-7 w-7 place-items-center rounded-none bg-current/10 hover:bg-current/20"
            aria-label="Baixar arquivo"
          >
            <Download className="h-3.5 w-3.5" />
          </a>
        </div>
      ) : (
        <Button
          data-no-drag
          onPointerDown={stopDrag}
          variant="subtle"
          size="xs"
          onClick={picker.open}
          className="shrink-0"
        >
          <Upload className="h-3 w-3" /> Anexar
        </Button>
      )}
      {picker.element}
    </div>
  );
}

export function LinkNode({ node, editing }: NodeProps) {
  const updateNode = useAppStore((state) => state.updateNode);
  const host = node.url ? hostnameOf(node.url) : "sem link";

  return (
    <div
      className={cn(
        "node-surface flex h-full flex-col gap-2 overflow-hidden rounded-none border px-3.5 py-3.5",
        nodeColorClass(node.color),
      )}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] opacity-55">
        <Globe className="h-3 w-3" />
        <span className="truncate normal-case tracking-normal">{host}</span>
      </div>
      {editing ? (
        <>
          <input
            data-no-drag
            autoFocus
            value={node.title ?? ""}
            onChange={(event) => updateNode(node.id, { title: event.target.value }, { label: "Editar link" })}
            onPointerDown={stopDrag}
            placeholder="Título do link"
            className="node-input text-sm font-semibold placeholder:opacity-40"
          />
          <input
            data-no-drag
            value={node.url ?? ""}
            onChange={(event) => updateNode(node.id, { url: event.target.value }, { label: "Editar link" })}
            onPointerDown={stopDrag}
            placeholder="https://…"
            className="node-input text-[11px] opacity-70 placeholder:opacity-40"
          />
        </>
      ) : (
        <>
          <h3 className="line-clamp-2 text-[14px] font-semibold leading-snug">
            {node.title?.trim() || truncate(node.url ?? "Novo link", 60)}
          </h3>
          <p className="line-clamp-2 text-[11.5px] leading-relaxed opacity-65">
            {node.description?.trim() || node.url || "Sem descrição"}
          </p>
        </>
      )}
      <div className="mt-auto flex items-center justify-between gap-2">
        <span className="truncate text-[10px] opacity-45">{host}</span>
        <Button
          data-no-drag
          onPointerDown={stopDrag}
          size="xs"
          variant="subtle"
          onClick={() => void openExternal(node.url ?? "")}
          disabled={!node.url}
        >
          <ExternalLink className="h-3 w-3" /> Abrir
        </Button>
      </div>
    </div>
  );
}
