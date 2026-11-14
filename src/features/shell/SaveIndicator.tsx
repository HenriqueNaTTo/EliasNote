import { AlertCircle, CheckCircle2, Database, Loader2 } from "lucide-react";
import { useAppStore } from "@/core/store";
import { cn, timeAgo } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function SaveIndicator() {
  const status = useAppStore((state) => state.status);
  const lastSavedAt = useAppStore((state) => state.lastSavedAt);
  const lastError = useAppStore((state) => state.lastError);
  const storageKind = useAppStore((state) => state.storageKind);

  const label =
    status === "saving"
      ? "Salvando…"
      : status === "error"
        ? "Falha ao salvar"
        : lastSavedAt
          ? `Salvo ${timeAgo(lastSavedAt)}`
          : "Aguardando alterações";

  const storageLabel =
    storageKind === "sqlite" ? "SQLite local" : storageKind === "indexeddb" ? "IndexedDB local" : "Memória (teste)";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="mt-1 flex items-center gap-2 rounded-md px-2 py-1.5 text-[10.5px] text-muted-foreground">
          {status === "error" ? (
            <AlertCircle className="h-3 w-3 text-destructive" />
          ) : status === "saving" ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          )}
          <span className={cn("truncate", status === "error" && "text-destructive")}>{label}</span>
          <span className="ml-auto flex shrink-0 items-center gap-1 opacity-70">
            <Database className="h-3 w-3" />
            {storageKind === "sqlite" ? "SQLite" : storageKind === "indexeddb" ? "Local" : "Memória"}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right">
        {lastError ? `Último erro: ${lastError}` : `Armazenamento: ${storageLabel}. Tudo é gravado no seu dispositivo.`}
      </TooltipContent>
    </Tooltip>
  );
}
