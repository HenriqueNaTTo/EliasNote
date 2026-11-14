import { useRef, useState } from "react";
import { AlertCircle, CheckCircle2, FileUp, FolderOpen, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/core/store";
import { useActiveBoard } from "@/core/store/selectors";
import { importFiles, readFileAsText } from "@/core/media/attachments";
import { markdownToNoteSeed, parseExcalidrawScene, parseImportJson } from "@/core/export/importer";
import { viewportCenter } from "@/features/canvas/viewportActions";
import { openDialogs } from "@/features/shell/dialogActions";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImportLog {
  file: string;
  ok: boolean;
  message: string;
}

export function ImportDialog() {
  const open = useAppStore((state) => state.dialog === "import");
  const close = useAppStore((state) => state.closeDialog);
  const board = useActiveBoard();
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | File[]) => {
    setFiles((current) => [...current, ...Array.from(incoming)]);
    setLogs([]);
  };

  const run = async () => {
    if (!board || files.length === 0) return;
    setBusy(true);
    const results: ImportLog[] = [];
    const center = viewportCenter();
    try {
      for (const file of files) {
        try {
          const name = file.name.toLowerCase();
          if (name.endsWith(".md") || name.endsWith(".markdown") || name.endsWith(".txt")) {
            const seed = markdownToNoteSeed(await readFileAsText(file), { filename: file.name });
            useAppStore.getState().addNode("note", center, {
              title: seed.title,
              content: seed.content,
              w: seed.w,
              h: seed.h,
            });
            results.push({ file: file.name, ok: true, message: `Nota "${seed.title}" criada` });
          } else if (name.endsWith(".excalidraw")) {
            const scene = parseExcalidrawScene(await readFileAsText(file));
            if (!scene) throw new Error("Cena Excalidraw inválida");
            const id = useAppStore.getState().addNode("drawing", center, { fields: { scene } });
            if (id) useAppStore.getState().openDrawing(id);
            results.push({ file: file.name, ok: true, message: `${scene.elements.length} elementos de desenho` });
          } else if (name.endsWith(".json")) {
            const result = parseImportJson(await readFileAsText(file));
            useAppStore.getState().importNodes(result.nodes, result.connectors);
            results.push({
              file: file.name,
              ok: true,
              message: `${result.nodes.length} elementos e ${result.connectors.length} conectores importados`,
            });
          } else {
            await importFiles([file], center);
            results.push({ file: file.name, ok: true, message: "Anexo importado" });
          }
        } catch (error) {
          results.push({
            file: file.name,
            ok: false,
            message: error instanceof Error ? error.message : "Falha ao importar",
          });
        }
        setLogs([...results]);
      }
      const okCount = results.filter((item) => item.ok).length;
      if (okCount > 0) {
        toast.success(`${okCount} ${okCount === 1 ? "arquivo importado" : "arquivos importados"}`);
      }
      if (results.some((item) => !item.ok)) toast.error("Alguns arquivos não puderam ser importados");
      setFiles([]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => (value ? undefined : close())}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileUp className="h-4 w-4 text-primary" /> Importar
          </DialogTitle>
          <DialogDescription>
            JSON (EliasNote), Markdown, cenas .excalidraw, imagens, vídeos e arquivos. Tudo é adicionado ao quadro
            atual{board ? ` “${board.title}”` : ""}.
          </DialogDescription>
        </DialogHeader>

        <button
          type="button"
          onClick={() => openDialogs.obsidian()}
          className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-left transition-colors hover:bg-accent/60"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <FolderOpen className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[12px] font-medium">Importar cofre do Obsidian</span>
            <span className="block text-[10px] text-muted-foreground">
              Pastas, notas, wiki-links, canvas, desenhos e anexos em um workspace novo.
            </span>
          </span>
        </button>

        <div
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
            dragging ? "border-primary bg-primary/5" : "border-border hover:bg-accent/40",
          )}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            addFiles(event.dataTransfer.files);
          }}
        >
          <Upload className="h-6 w-6 text-muted-foreground" />
          <p className="text-xs font-medium">Arraste arquivos ou clique para escolher</p>
          <p className="text-[10px] text-muted-foreground">
            .json · .md · .txt · .excalidraw · imagens · vídeos · qualquer anexo
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(event) => {
              if (event.target.files) addFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </div>

        {files.length > 0 ? (
          <div className="max-h-32 space-y-1 overflow-y-auto scrollbar-thin">
            {files.map((file, index) => (
              <div key={`${file.name}:${index}`} className="flex items-center justify-between rounded-md bg-muted/60 px-2 py-1 text-[11px]">
                <span className="truncate">{file.name}</span>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                >
                  remover
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {logs.length > 0 ? (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="flex items-start gap-1.5 text-[11px]">
                {log.ok ? (
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                ) : (
                  <AlertCircle className="mt-0.5 h-3 w-3 shrink-0 text-destructive" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="font-medium">{log.file}</span> — {log.message}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="ghost" onClick={close}>
            Fechar
          </Button>
          <Button onClick={() => void run()} disabled={busy || files.length === 0 || !board}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            Importar {files.length > 0 ? `(${files.length})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
