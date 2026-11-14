import { useEffect, useRef, useState } from "react";
import { AlertCircle, FolderOpen, Loader2, RefreshCw, Upload, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/core/store";
import { saveAttachment, readFileAsText } from "@/core/media/attachments";
import { isTauriRuntime } from "@/core/persistence/adapter";
import {
  isIgnoredVaultPath,
  mimeForVaultPath,
  parseVaultEntries,
  vaultExtension,
} from "@/core/import/obsidianParser";
import { createVaultPlan } from "@/core/import/obsidianPlan";
import {
  importAttachmentFromNativePath,
  pickVaultFolder,
  scanVaultFolder,
  vaultNameFromPath,
} from "@/core/import/vaultPlatform";
import type { VaultEntry, VaultModel } from "@/core/import/vaultTypes";
import { formatBytes, uid } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const MAX_FILES = 20_000;
const MAX_TEXT_BYTES = 8 * 1024 * 1024;
const TEXT_EXTENSIONS = new Set(["md", "markdown", "canvas", "excalidraw"]);

interface Progress {
  done: number;
  total: number;
  label: string;
}

/** Importa um cofre Obsidian (pasta com Markdown, canvas e anexos). */
export function ObsidianImportDialog() {
  const open = useAppStore((state) => state.dialog === "obsidian");
  const close = useAppStore((state) => state.closeDialog);
  const importVault = useAppStore((state) => state.importVault);
  const [model, setModel] = useState<VaultModel | null>(null);
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [vaultName, setVaultName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [includeUnreferenced, setIncludeUnreferenced] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanTruncated, setScanTruncated] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const readToken = useRef(0);

  useEffect(() => {
    if (!open) {
      readToken.current += 1;
      setModel(null);
      setEntries([]);
      setError(null);
      setBusy(false);
      setProgress(null);
      setScanTruncated(false);
      return;
    }
    const input = inputRef.current;
    if (!input) return;
    input.setAttribute("webkitdirectory", "");
    input.setAttribute("directory", "");
    input.setAttribute("mozdirectory", "");
  }, [open]);

  const loadNativeVault = async (root: string) => {
    const token = ++readToken.current;
    setBusy(true);
    setError(null);
    setModel(null);
    setEntries([]);
    setScanTruncated(false);
    try {
      const { entries: scanned, truncated } = await scanVaultFolder(root);
      if (token !== readToken.current) return;
      const rootName = vaultNameFromPath(root);
      const parsed = parseVaultEntries(scanned, rootName);
      if (parsed.notes.length + parsed.canvases.length + parsed.drawings.length === 0) {
        setError(
          "Nenhuma nota, canvas ou desenho encontrado. Confirme se a pasta selecionada é a raiz do cofre (a que contém os arquivos .md).",
        );
        return;
      }
      setEntries(scanned);
      setModel(parsed);
      setVaultName(rootName);
      setWorkspaceName(`Obsidian · ${rootName}`);
      setScanTruncated(truncated);
      if (truncated) {
        toast.warning("Cofre muito grande", {
          description: "Foram lidos os primeiros 20.000 arquivos; importe subpastas separadamente para o restante.",
        });
      }
    } catch (scanError) {
      setError(
        scanError instanceof Error
          ? scanError.message
          : typeof scanError === "string"
            ? scanError
            : "Falha ao ler a pasta do cofre.",
      );
    } finally {
      if (token === readToken.current) {
        setBusy(false);
        setProgress(null);
      }
    }
  };

  const chooseFolder = async () => {
    if (isTauriRuntime()) {
      setError(null);
      try {
        const selected = await pickVaultFolder();
        if (selected) await loadNativeVault(selected);
      } catch (dialogError) {
        setError(
          dialogError instanceof Error
            ? dialogError.message
            : typeof dialogError === "string"
              ? dialogError
              : "Não foi possível abrir o seletor de pastas.",
        );
      }
      return;
    }
    inputRef.current?.click();
  };

  const handleFiles = async (fileList: FileList) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;
    if (files.length > MAX_FILES) {
      setError(`O cofre tem ${files.length} arquivos. Selecione uma pasta menor (limite: ${MAX_FILES}).`);
      return;
    }

    const token = ++readToken.current;
    setBusy(true);
    setError(null);
    setModel(null);
    setEntries([]);
    setScanTruncated(false);

    const rootName = files[0].webkitRelativePath?.split("/")[0] || "Cofre Obsidian";
    const parsedEntries: VaultEntry[] = [];
    let done = 0;

    try {
      for (const file of files) {
        done += 1;
        if (done % 25 === 0) {
          setProgress({ done, total: files.length, label: "Lendo arquivos" });
        }
        if (token !== readToken.current) return;

        const relative = file.webkitRelativePath
          ? file.webkitRelativePath.split("/").slice(1).join("/")
          : file.name;
        if (!relative || isIgnoredVaultPath(relative)) continue;
        if (file.size === 0 && TEXT_EXTENSIONS.has(vaultExtension(relative))) continue;

        let text: string | undefined;
        if (TEXT_EXTENSIONS.has(vaultExtension(relative))) {
          if (file.size > MAX_TEXT_BYTES) continue;
          try {
            text = await readFileAsText(file);
          } catch {
            continue;
          }
        }

        parsedEntries.push({
          path: relative,
          name: file.name,
          size: file.size,
          mime: file.type || mimeForVaultPath(relative),
          text,
          file,
        });
      }
      if (token !== readToken.current) return;

      const parsed = parseVaultEntries(parsedEntries, rootName);
      if (parsed.notes.length + parsed.canvases.length + parsed.drawings.length === 0) {
        setError(
          "Nenhuma nota, canvas ou desenho encontrado. Selecione a pasta raiz do cofre (a que contém os arquivos .md).",
        );
        return;
      }
      setEntries(parsedEntries);
      setModel(parsed);
      setVaultName(rootName);
      setWorkspaceName(`Obsidian · ${rootName}`);
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : "Falha ao ler a pasta selecionada.");
    } finally {
      if (token === readToken.current) {
        setBusy(false);
        setProgress(null);
      }
    }
  };

  const runImport = async () => {
    if (!model) return;
    setBusy(true);
    setError(null);
    try {
      const attachmentPaths = new Set(model.referencedAttachments);
      if (includeUnreferenced) {
        for (const attachment of model.attachments) attachmentPaths.add(attachment.path);
      }
      const byPath = new Map(entries.map((entry) => [entry.path, entry]));
      const attachmentIds: Record<string, string> = {};
      const total = attachmentPaths.size;
      let done = 0;

      for (const path of attachmentPaths) {
        done += 1;
        setProgress({ done, total, label: "Salvando anexos" });
        const entry = byPath.get(path);
        if (!entry) continue;
        if (entry.file) {
          const meta = await saveAttachment(entry.file);
          attachmentIds[path] = meta.id;
        } else if (entry.nativePath) {
          const id = uid("att");
          await importAttachmentFromNativePath({
            id,
            name: entry.name,
            mime: entry.mime,
            sourcePath: entry.nativePath,
          });
          attachmentIds[path] = id;
        }
      }

      const plan = createVaultPlan(model, {
        workspaceName: workspaceName.trim() || `Obsidian · ${vaultName}`,
        rootBoardTitle: vaultName,
        attachmentIds,
        includeUnreferencedAttachments: includeUnreferenced,
      });
      const workspaceId = importVault(plan);
      if (!workspaceId) throw new Error("Não foi possível criar o workspace de importação.");
      useAppStore.getState().bumpAttachments();

      const { stats } = plan;
      toast.success("Cofre Obsidian importado", {
        description: `${stats.notes} notas · ${stats.canvases} canvas · ${stats.drawings} desenhos · ${stats.attachments} anexos`,
      });
      close();
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "Falha ao importar o cofre.");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => (value ? undefined : close())}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" /> Importar cofre do Obsidian
          </DialogTitle>
          <DialogDescription>
            Selecione a pasta raiz do cofre. Pastas viram quadros, notas viram cartões Markdown, anexos ficam
            locais e canvas/desenhos são convertidos.
          </DialogDescription>
        </DialogHeader>

        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(event) => {
            const files = event.target.files;
            event.target.value = "";
            if (files && files.length > 0) void handleFiles(files);
          }}
        />

        {!model ? (
          <button
            type="button"
            onClick={() => void chooseFolder()}
            disabled={busy}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-8 text-center transition-colors hover:bg-accent/40 disabled:opacity-60"
          >
            {busy ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-xs font-medium">
                  {progress ? `${progress.label} ${progress.done}/${progress.total}` : "Lendo cofre…"}
                </p>
              </>
            ) : (
              <>
                <FolderOpen className="h-7 w-7 text-muted-foreground" />
                <p className="text-sm font-medium">Escolher pasta do cofre</p>
                <p className="max-w-sm text-[11px] leading-relaxed text-muted-foreground">
                  {isTauriRuntime()
                    ? "Abrirá o seletor nativo de pastas do sistema. Nada é enviado para servidores."
                    : "No navegador, selecione a pasta do cofre pelo seletor. Nada é enviado para servidores."}
                </p>
                <span className="mt-1 text-[10px] text-muted-foreground">
                  .obsidian, .trash e node_modules são ignorados
                </span>
              </>
            )}
          </button>
        ) : null}

        {model ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
              <Metric label="Notas" value={model.notes.length} />
              <Metric label="Pastas" value={model.folders.length} />
              <Metric label="Canvas" value={model.canvases.length} />
              <Metric label="Desenhos" value={model.drawings.length} />
              <Metric label="Anexos" value={model.attachments.length} />
              <Metric label="Anexos usados" value={model.referencedAttachments.length} />
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium">
                    {vaultName}
                    <span className="ml-2 font-normal text-muted-foreground">
                      {model.skipped.length > 0 ? `${model.skipped.length} arquivos ignorados` : "cofre lido"}
                    </span>
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {entries.length} arquivos catalogados · {formatBytes(
                      entries.reduce((sum, entry) => sum + entry.size, 0),
                    )}{" "}
                    no total
                  </p>
                </div>
                <Button variant="ghost" size="xs" onClick={() => void chooseFolder()} disabled={busy}>
                  <RefreshCw className="h-3 w-3" /> Trocar pasta
                </Button>
              </div>
              {model.unresolvedLinks > 0 ? (
                <p className="mt-2 flex items-center gap-1.5 text-[10.5px] text-amber-700 dark:text-amber-400">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {model.unresolvedLinks} links apontam para arquivos que não estão no cofre; serão mantidos
                  como texto.
                </p>
              ) : null}
              {scanTruncated ? (
                <p className="mt-2 flex items-center gap-1.5 text-[10.5px] text-amber-700 dark:text-amber-400">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  Foram lidos os primeiros 20.000 arquivos. Importe subpastas separadamente para o restante.
                </p>
              ) : null}
              {model.warnings.length > 0 ? (
                <ul className="mt-2 space-y-0.5 text-[10px] text-muted-foreground">
                  {model.warnings.slice(0, 3).map((warning, index) => (
                    <li key={index} className="truncate">
                      {warning}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="obsidian-workspace">Nome do workspace</Label>
                <Input
                  id="obsidian-workspace"
                  value={workspaceName}
                  onChange={(event) => setWorkspaceName(event.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="flex items-end justify-between gap-2 pb-1">
                <div>
                  <p className="text-[11px] font-medium">Anexos não referenciados</p>
                  <p className="text-[10px] text-muted-foreground">Importa imagens/arquivos sem links.</p>
                </div>
                <Switch checked={includeUnreferenced} onCheckedChange={setIncludeUnreferenced} />
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline">pastas → quadros</Badge>
              <Badge variant="outline">wiki-links → links internos</Badge>
              <Badge variant="outline">canvas → conectores</Badge>
              <Badge variant="outline">anexos locais</Badge>
            </div>

            <p className="text-[10px] leading-relaxed text-muted-foreground">
              Plugins, temas e consultas Dataview não são executados; callouts e HTML entram como texto.
              Transclusões viram links para a nota. Grupos de canvas viram colunas (os itens são reorganizados
              verticalmente).
            </p>
          </div>
        ) : null}

        {error ? (
          <p className="flex items-start gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-[11px] text-destructive">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        ) : null}

        {busy && progress ? (
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground">
              {progress.label} {progress.done}/{progress.total}
            </p>
            <div className="h-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${Math.round((progress.done / Math.max(1, progress.total)) * 100)}%` }}
              />
            </div>
          </div>
        ) : null}

        <Separator />

        <DialogFooter className="items-center justify-between gap-2 sm:justify-between">
          <span className="text-[10px] text-muted-foreground">
            {model ? `${model.notes.length + model.canvases.length + model.drawings.length} itens prontos para importar` : "Nenhum cofre selecionado"}
          </span>
          <div className="flex gap-1.5">
            <Button variant="ghost" onClick={close}>
              Cancelar
            </Button>
            <Button onClick={() => void runImport()} disabled={!model || busy}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              Importar cofre
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-muted/60 px-2 py-1.5 text-center">
      <p className="text-[13px] font-semibold tabular-nums">{value}</p>
      <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
