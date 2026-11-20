import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { openExternal } from "@/lib/platform";
import { useUpdate, useUpdateCheck } from "./updateService";

/**
 * Botão do topo direito que só aparece quando existe uma versão mais nova
 * publicada no GitHub. O clique abre a página da release no navegador.
 */
export function UpdateButton() {
  useUpdateCheck();
  const { status, info } = useUpdate();

  if (status !== "available" || !info) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void openExternal(info.url)}
          className="h-7 shrink-0 gap-1.5 border-primary/40 bg-primary/10 px-2 text-[11px] font-medium text-primary hover:bg-primary/20 hover:text-primary"
          aria-label={`Atualizar para a versão ${info.version}`}
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Atualizar</span>
          <span className="rounded bg-primary/15 px-1 text-[10px] font-semibold tabular-nums">
            v{info.version}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        Nova versão v{info.version} disponível no GitHub — clique para abrir a release
      </TooltipContent>
    </Tooltip>
  );
}
