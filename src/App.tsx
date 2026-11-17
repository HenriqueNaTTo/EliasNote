import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Toaster } from "sonner";
import { bootstrapApplication } from "@/core/bootstrap";
import { useAppStore } from "@/core/store";
import { AppMark } from "@/components/brand/AppMark";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/features/shell/Sidebar";
import { TopBar } from "@/features/shell/TopBar";
import { Dialogs } from "@/features/shell/Dialogs";
import { Canvas } from "@/features/canvas/Canvas";
import { Inspector } from "@/features/inspector/Inspector";
import { useTheme } from "@/features/theme/useTheme";
import { useAppHotkeys } from "@/features/hotkeys/useAppHotkeys";
import { Button } from "@/components/ui/button";

let bootstrapped = false;

export default function App() {
  const hydrated = useAppStore((state) => state.hydrated);
  const [bootError, setBootError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useTheme();
  useAppHotkeys();

  useEffect(() => {
    if (bootstrapped) return;
    bootstrapped = true;
    void bootstrapApplication().catch((error: unknown) => {
      console.error(error);
      setBootError(error instanceof Error ? error.message : "Falha ao iniciar o EliasNote");
    });
  }, [attempt]);

  if (!hydrated) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-background">
        <div className="grid h-14 w-14 place-items-center rounded-2xl border border-border bg-card text-foreground shadow-lg">
          <AppMark className="h-7 w-7" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold tracking-tight">EliasNote</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Organização visual local-first · 100% offline
          </p>
        </div>
        {bootError ? (
          <div className="flex max-w-sm flex-col items-center gap-2">
            <p className="text-center text-[11px] text-destructive">{bootError}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                bootstrapped = false;
                setBootError(null);
                setAttempt((value) => value + 1);
              }}
            >
              <RefreshCw className="h-3.5 w-3.5" /> Tentar novamente
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Carregando dados locais…
          </div>
        )}
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={260}>
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <div className="relative min-h-0 flex-1">
            <Canvas />
          </div>
        </main>
        <Inspector />
      </div>
      <Dialogs />
      <Toaster position="bottom-right" closeButton richColors theme="system" />
    </TooltipProvider>
  );
}
