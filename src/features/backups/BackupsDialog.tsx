import { useCallback, useEffect, useState } from "react";
import { Archive, Database, HardDrive, RefreshCw, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/core/store";
import { persistenceService } from "@/core/persistence/persistenceService";
import { formatBytes, formatDateTime, timeAgo } from "@/lib/utils";
import type { BackupInfo } from "@/core/domain/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";

export function BackupsDialog() {
  const open = useAppStore((state) => state.dialog === "backups");
  const close = useAppStore((state) => state.closeDialog);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const storageKind = useAppStore((state) => state.storageKind);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setBackups(await persistenceService.listBackups());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) void refresh();
  }, [open, refresh]);

  const create = async () => {
    setCreating(true);
    try {
      const info = await persistenceService.createBackup();
      if (info) {
        toast.success("Backup criado", { description: `${formatBytes(info.size)} · ${formatDateTime(info.createdAt)}` });
        await refresh();
      }
    } catch (error) {
      toast.error("Não foi possível criar o backup", { description: String(error) });
    } finally {
      setCreating(false);
    }
  };

  const restore = async () => {
    if (!restoreId) return;
    try {
      const ok = await persistenceService.restoreFromBackup(restoreId);
      if (ok) {
        toast.success("Backup restaurado", { description: "Os dados foram recarregados do snapshot." });
        await refresh();
      } else {
        toast.error("Backup inválido ou não encontrado.");
      }
    } finally {
      setRestoreId(null);
    }
  };

  const remove = async () => {
    if (!deleteId) return;
    await persistenceService.deleteBackup(deleteId);
    setDeleteId(null);
    await refresh();
    toast.success("Backup excluído.");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(value) => (value ? undefined : close())}>
        <DialogContent className="max-w-2xl gap-0 p-0">
          <DialogHeader className="border-b border-border px-5 py-4">
            <DialogTitle className="flex items-center gap-2">
              <Archive className="h-4 w-4 text-primary" /> Backups locais
            </DialogTitle>
            <DialogDescription>
              Snapshots completos de quadros e configurações. O app mantém os mais recentes conforme a retenção
              configurada. Armazenamento: {storageKind === "sqlite" ? "SQLite" : storageKind === "indexeddb" ? "IndexedDB" : "memória"}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-1.5 border-b border-border px-4 py-2">
            <Button size="sm" onClick={() => void create()} disabled={creating}>
              <HardDrive className="h-3.5 w-3.5" /> {creating ? "Criando…" : "Criar backup agora"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => void refresh()} disabled={loading}>
              <RefreshCw className="h-3.5 w-3.5" /> Atualizar
            </Button>
            <span className="ml-auto text-[10px] text-muted-foreground">{backups.length} snapshots</span>
          </div>

          <div className="scrollbar-thin max-h-[52vh] overflow-y-auto p-3">
            {backups.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <Database className="h-6 w-6 text-muted-foreground/60" />
                <p className="text-xs text-muted-foreground">Nenhum backup ainda.</p>
                <Button size="xs" variant="subtle" onClick={() => void create()}>
                  Criar o primeiro backup
                </Button>
              </div>
            ) : (
              <div className="space-y-1.5">
                {backups.map((backup, index) => (
                  <div
                    key={backup.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                      <Archive className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-[12px] font-medium">{backup.label}</p>
                        {index === 0 ? <Badge variant="success">mais recente</Badge> : null}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDateTime(backup.createdAt)} · {timeAgo(backup.createdAt)} · {formatBytes(backup.size)}
                      </p>
                    </div>
                    <Button size="xs" variant="outline" onClick={() => setRestoreId(backup.id)}>
                      <RotateCcw className="h-3 w-3" /> Restaurar
                    </Button>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Excluir backup"
                      onClick={() => setDeleteId(backup.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(restoreId)}
        onOpenChange={(value) => (value ? undefined : setRestoreId(null))}
        title="Restaurar este backup?"
        description="O estado atual será substituído pelo snapshot. Um backup do estado atual não é criado automaticamente — você pode desfazer a restauração pelo histórico se ainda estiver na sessão."
        confirmLabel="Restaurar"
        onConfirm={() => void restore()}
      />
      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(value) => (value ? undefined : setDeleteId(null))}
        title="Excluir este backup?"
        description="O snapshot será removido permanentemente."
        confirmLabel="Excluir"
        destructive
        onConfirm={() => void remove()}
      />
    </>
  );
}
