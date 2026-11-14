import { useState } from "react";
import {
  Download,
  FileDown,
  FileJson,
  FileText,
  Image as ImageIcon,
  Loader2,
  PenTool,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/core/store";
import { useActiveBoard, useSelectedNodes } from "@/core/store/selectors";
import { boardToMarkdown, serializeBoard } from "@/core/export/exporter";
import { downloadBlob, downloadText } from "@/core/media/attachments";
import { suggestedFilename, exportActiveBoardPdf, exportActiveBoardPng } from "@/features/export/boardExport";
import {
  sceneToPdfBlob,
  sceneToPngBlob,
  sceneToSvgString,
} from "@/features/drawing/drawingExport";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

type Format = "png" | "pdf" | "markdown" | "json";

const FORMATS: { id: Format; label: string; description: string; icon: typeof FileText }[] = [
  { id: "png", label: "Imagem PNG", description: "Quadro inteiro em imagem de alta resolução.", icon: ImageIcon },
  { id: "pdf", label: "PDF", description: "Documento de página única pronto para imprimir.", icon: FileDown },
  { id: "markdown", label: "Markdown", description: "Texto estruturado com colunas, tarefas e notas.", icon: FileText },
  { id: "json", label: "JSON", description: "Backup completo do quadro para reimportar.", icon: FileJson },
];

export function ExportDialog() {
  const open = useAppStore((state) => state.dialog === "export");
  const close = useAppStore((state) => state.closeDialog);
  const board = useActiveBoard();
  const selectedNodes = useSelectedNodes();
  const boards = useAppStore((state) => state.boards);
  const [format, setFormat] = useState<Format>("png");
  const [scale, setScale] = useState(2);
  const [background, setBackground] = useState(true);
  const [busy, setBusy] = useState(false);

  const drawingNodes = selectedNodes.filter((node) => node.type === "drawing" && node.scene);
  const firstDrawing = drawingNodes[0];

  const run = async () => {
    if (!board) return;
    setBusy(true);
    try {
      if (format === "json") {
        downloadText(suggestedFilename(board.title, "json"), serializeBoard(board), "application/json");
      } else if (format === "markdown") {
        downloadText(suggestedFilename(board.title, "md"), boardToMarkdown(board, boards), "text/markdown");
      } else if (format === "png") {
        downloadBlob(suggestedFilename(board.title, "png"), await exportActiveBoardPng({ scale, background }));
      } else {
        downloadBlob(suggestedFilename(board.title, "pdf"), await exportActiveBoardPdf({ scale }));
      }
      toast.success("Exportação concluída");
      close();
    } catch (error) {
      toast.error("Falha ao exportar", { description: error instanceof Error ? error.message : String(error) });
    } finally {
      setBusy(false);
    }
  };

  const exportDrawing = async (mode: "png" | "svg" | "pdf") => {
    if (!firstDrawing?.scene) return;
    setBusy(true);
    try {
      const base = suggestedFilename(firstDrawing.title || "desenho", mode);
      if (mode === "png") downloadBlob(base, await sceneToPngBlob(firstDrawing.scene));
      else if (mode === "pdf") downloadBlob(base, await sceneToPdfBlob(firstDrawing.scene));
      else
        downloadBlob(
          base,
          new Blob([await sceneToSvgString(firstDrawing.scene)], { type: "image/svg+xml" }),
        );
      toast.success(`Desenho exportado em ${mode.toUpperCase()}`);
    } catch (error) {
      toast.error("Falha ao exportar desenho", { description: String(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => (value ? undefined : close())}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-4 w-4 text-primary" /> Exportar
          </DialogTitle>
          <DialogDescription>
            {board ? `Quadro: ${board.title}` : "Nenhum quadro ativo"} · tudo é gerado no seu dispositivo.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2">
          {FORMATS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFormat(item.id)}
              className={cn(
                "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors",
                format === item.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-accent/50",
              )}
            >
              <span className="flex items-center gap-1.5 text-[12px] font-medium">
                <item.icon className="h-3.5 w-3.5 text-muted-foreground" /> {item.label}
              </span>
              <span className="text-[10.5px] leading-relaxed text-muted-foreground">{item.description}</span>
            </button>
          ))}
        </div>

        {format === "png" || format === "pdf" ? (
          <>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label>Resolução</Label>
                <div className="mt-1 flex gap-1">
                  {[1, 2, 3].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setScale(value)}
                      className={cn(
                        "rounded-md border px-2 py-1 text-[11px]",
                        scale === value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:bg-accent",
                      )}
                    >
                      {value}x
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">Fundo do canvas</span>
                <Switch checked={background} onCheckedChange={setBackground} />
              </div>
            </div>
          </>
        ) : null}

        {firstDrawing ? (
          <>
            <Separator />
            <div className="rounded-xl border border-border bg-muted/40 p-3">
              <p className="flex items-center gap-1.5 text-[11.5px] font-medium">
                <PenTool className="h-3.5 w-3.5 text-primary" /> Desenho selecionado:{" "}
                {firstDrawing.title || "Desenho"}
              </p>
              <p className="mt-0.5 text-[10.5px] text-muted-foreground">
                {(firstDrawing.scene?.elements.length ?? 0)} elementos · exporte o desenho isolado com fundo
                transparente ou branco.
              </p>
              <div className="mt-2 flex gap-1.5">
                <Button size="xs" variant="outline" onClick={() => void exportDrawing("png")} disabled={busy}>
                  PNG
                </Button>
                <Button size="xs" variant="outline" onClick={() => void exportDrawing("svg")} disabled={busy}>
                  SVG
                </Button>
                <Button size="xs" variant="outline" onClick={() => void exportDrawing("pdf")} disabled={busy}>
                  PDF
                </Button>
              </div>
            </div>
          </>
        ) : null}

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            <Sparkles className="mr-1 inline h-3 w-3" />
            A exportação enquadra o quadro e restaura seu zoom.
          </span>
          <div className="flex gap-1.5">
            <Button variant="ghost" onClick={close}>
              Cancelar
            </Button>
            <Button onClick={() => void run()} disabled={busy || !board}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              {busy ? "Exportando…" : "Exportar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
