import { useEffect, useMemo, useState } from "react";
import {
  Database,
  Download,
  HardDrive,
  Keyboard,
  Palette,
  RotateCcw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/core/store";
import { useActiveBoard } from "@/core/store/selectors";
import { openDialogs } from "@/features/shell/dialogActions";
import { persistenceService } from "@/core/persistence/persistenceService";
import { boardToMarkdown, serializeWorkspace } from "@/core/export/exporter";
import { downloadText } from "@/core/media/attachments";
import { suggestedFilename } from "@/features/export/boardExport";
import { SHORTCUTS, comboFromEvent, findShortcutConflicts, formatCombo } from "@/lib/hotkeys";
import { cn, formatBytes } from "@/lib/utils";
import { checkForUpdates, getUpdateState, resolveAppVersion, useUpdate } from "@/features/update/updateService";
import { openExternal } from "@/lib/platform";
import type { AccentColor, AppSettings, CanvasTexture, ThemeMode } from "@/core/domain/types";
import { AppMark } from "@/components/brand/AppMark";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

type Section = "geral" | "aparencia" | "canvas" | "atalhos" | "dados" | "sobre";

const SECTIONS: { id: Section; label: string; icon: typeof SlidersHorizontal }[] = [
  { id: "geral", label: "Geral", icon: SlidersHorizontal },
  { id: "aparencia", label: "Aparência", icon: Palette },
  { id: "canvas", label: "Canvas", icon: Wand2 },
  { id: "atalhos", label: "Atalhos", icon: Keyboard },
  { id: "dados", label: "Dados", icon: Database },
  { id: "sobre", label: "Sobre", icon: ShieldCheck },
];

const ACCENTS: { id: AccentColor; label: string; color: string }[] = [
  { id: "violet", label: "Violeta", color: "#7c5cff" },
  { id: "blue", label: "Azul", color: "#2f7fe0" },
  { id: "emerald", label: "Esmeralda", color: "#159a6a" },
  { id: "rose", label: "Rosa", color: "#e0436e" },
  { id: "amber", label: "Âmbar", color: "#d98a0b" },
  { id: "slate", label: "Ardósia", color: "#5b6472" },
];

export function SettingsDialog() {
  const open = useAppStore((state) => state.dialog === "settings");
  const close = useAppStore((state) => state.closeDialog);
  const section = useAppStore((state) => state.settingsSection);
  const setSection = useAppStore((state) => state.setSettingsSection);
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const boards = useAppStore((state) => state.boards);
  const workspaces = useAppStore((state) => state.workspaces);
  const activeWorkspaceId = useAppStore((state) => state.activeWorkspaceId);
  const workspaceOrder = useAppStore((state) => state.workspaceOrder);
  const storageKind = useAppStore((state) => state.storageKind);

  const totals = useMemo(() => {
    const boardList = Object.values(boards);
    const nodes = boardList.reduce((sum, board) => sum + Object.keys(board.nodes).length, 0);
    return { boards: boardList.length, nodes, workspaces: workspaceOrder.length };
  }, [boards, workspaceOrder]);

  return (
    <Dialog open={open} onOpenChange={(value) => (value ? undefined : close())}>
      <DialogContent className="max-w-3xl gap-0 p-0">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle>Configurações</DialogTitle>
          <DialogDescription>
            Ajustes salvos localmente. Nenhum dado sai deste dispositivo.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-[420px]">
          <nav className="w-40 shrink-0 border-r border-border p-2">
            {SECTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={cn(
                  "mb-0.5 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors",
                  section === item.id
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            ))}
          </nav>

          <ScrollArea className="h-[min(70vh,520px)] flex-1">
            <div className="space-y-5 p-5">
              {section === "geral" ? <GeneralSection settings={settings} update={updateSettings} /> : null}
              {section === "aparencia" ? <AppearanceSection settings={settings} update={updateSettings} /> : null}
              {section === "canvas" ? <CanvasSection settings={settings} update={updateSettings} /> : null}
              {section === "atalhos" ? <ShortcutsSection /> : null}
              {section === "dados" ? (
                <DataSection
                  storageKind={storageKind}
                  totals={totals}
                  workspaces={workspaces}
                  workspaceOrder={workspaceOrder}
                  activeWorkspaceId={activeWorkspaceId}
                  boards={boards}
                />
              ) : null}
              {section === "sobre" ? <AboutSection totals={totals} /> : null}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SettingsRow({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[12.5px] font-medium">{title}</p>
        {description ? <p className="mt-0.5 text-[10.5px] leading-relaxed text-muted-foreground">{description}</p> : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function GeneralSection({ settings, update }: { settings: AppSettings; update: (patch: Partial<AppSettings>) => void }) {
  return (
    <>
      <div>
        <Label htmlFor="author-name">Seu nome</Label>
        <Input
          id="author-name"
          value={settings.authorName}
          onChange={(event) => update({ authorName: event.target.value })}
          className="mt-1 h-8 max-w-[240px] text-xs"
        />
        <p className="mt-1 text-[10px] text-muted-foreground">Usado em comentários locais e respostas.</p>
      </div>

      <Separator />

      <SettingsRow title="Animações" description="Transições e animações da interface.">
        <Switch checked={settings.animations} onCheckedChange={(animations) => update({ animations })} />
      </SettingsRow>
      <SettingsRow title="Confirmar exclusões" description="Pede confirmação antes de remover quadros.">
        <Switch checked={settings.confirmDelete} onCheckedChange={(confirmDelete) => update({ confirmDelete })} />
      </SettingsRow>

      <Separator />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="autosave">Autosave (ms)</Label>
          <Input
            id="autosave"
            type="number"
            min={200}
            max={5000}
            step={100}
            value={settings.autosaveDelay}
            onChange={(event) => update({ autosaveDelay: Math.max(200, Number(event.target.value) || 700) })}
            className="mt-1 h-8 text-xs"
          />
        </div>
        <div>
          <Label htmlFor="retention">Backups mantidos</Label>
          <Input
            id="retention"
            type="number"
            min={1}
            max={100}
            value={settings.backupRetention}
            onChange={(event) => update({ backupRetention: Math.max(1, Number(event.target.value) || 20) })}
            className="mt-1 h-8 text-xs"
          />
        </div>
      </div>

      <div>
        <Label>Intervalo de backup automático</Label>
        <div className="mt-1 flex flex-wrap gap-1">
          {[0, 10, 20, 30, 60].map((minutes) => (
            <button
              key={minutes}
              type="button"
              onClick={() => update({ backupIntervalMinutes: minutes })}
              className={cn(
                "rounded-md border px-2 py-1 text-[11px] transition-colors",
                settings.backupIntervalMinutes === minutes
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent",
              )}
            >
              {minutes === 0 ? "Desativado" : `${minutes} min`}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function AppearanceSection({ settings, update }: { settings: AppSettings; update: (patch: Partial<AppSettings>) => void }) {
  const themes: { id: ThemeMode; label: string }[] = [
    { id: "light", label: "Claro" },
    { id: "dark", label: "Escuro" },
    { id: "system", label: "Sistema" },
  ];

  return (
    <>
      <div>
        <Label>Tema</Label>
        <div className="mt-1 grid grid-cols-3 gap-1">
          {themes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => update({ theme: theme.id })}
              className={cn(
                "rounded-md border px-2 py-1.5 text-[11px] transition-colors",
                settings.theme === theme.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent",
              )}
            >
              {theme.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Cor de destaque</Label>
        <div className="mt-1 flex flex-wrap gap-2">
          {ACCENTS.map((accent) => (
            <button
              key={accent.id}
              type="button"
              title={accent.label}
              aria-label={accent.label}
              onClick={() => update({ accent: accent.id })}
              className={cn(
                "h-7 w-7 rounded-full border-2 transition-transform hover:scale-105",
                settings.accent === accent.id ? "border-foreground/60 ring-2 ring-primary/40" : "border-transparent",
              )}
              style={{ backgroundColor: accent.color }}
            />
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <Label>Escala da interface · {Math.round(settings.uiScale * 100)}%</Label>
        <input
          type="range"
          min={0.85}
          max={1.25}
          step={0.05}
          value={settings.uiScale}
          onChange={(event) => update({ uiScale: Number(event.target.value) })}
          className="mt-1 w-full accent-[hsl(var(--primary))]"
        />
      </div>

      <div>
        <Label>Tamanho do texto das notas · {settings.noteFontSize}px</Label>
        <input
          type="range"
          min={12}
          max={18}
          step={1}
          value={settings.noteFontSize}
          onChange={(event) => update({ noteFontSize: Number(event.target.value) })}
          className="mt-1 w-full accent-[hsl(var(--primary))]"
        />
      </div>

      <div>
        <Label>Densidade</Label>
        <div className="mt-1 grid grid-cols-2 gap-1">
          {(["comfortable", "compact"] as const).map((density) => (
            <button
              key={density}
              type="button"
              onClick={() => update({ density })}
              className={cn(
                "rounded-md border px-2 py-1.5 text-[11px] transition-colors",
                settings.density === density
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent",
              )}
            >
              {density === "comfortable" ? "Confortável" : "Compacta"}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function CanvasSection({ settings, update }: { settings: AppSettings; update: (patch: Partial<AppSettings>) => void }) {
  const textures: { id: CanvasTexture; label: string }[] = [
    { id: "dots", label: "Pontos" },
    { id: "grid", label: "Grade" },
    { id: "plain", label: "Lisa" },
  ];

  return (
    <>
      <div>
        <Label>Textura do canvas</Label>
        <div className="mt-1 grid grid-cols-3 gap-1">
          {textures.map((texture) => (
            <button
              key={texture.id}
              type="button"
              onClick={() => update({ canvasTexture: texture.id })}
              className={cn(
                "rounded-md border px-2 py-1.5 text-[11px] transition-colors",
                settings.canvasTexture === texture.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent",
              )}
            >
              {texture.label}
            </button>
          ))}
        </div>
      </div>

      <SettingsRow title="Encaixar na grade" description="Alinha elementos arrastados à grade do canvas.">
        <Switch checked={settings.snapToGrid} onCheckedChange={(snapToGrid) => update({ snapToGrid })} />
      </SettingsRow>

      <div>
        <Label>Tamanho da grade</Label>
        <div className="mt-1 flex gap-1">
          {[8, 16, 24, 32].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => update({ gridSize: size })}
              className={cn(
                "rounded-md border px-2 py-1 text-[11px] transition-colors",
                settings.gridSize === size
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent",
              )}
            >
              {size}px
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <SettingsRow title="Minimapa" description="Mostra o mapa geral do quadro no canto inferior direito.">
        <Switch checked={settings.showMinimap} onCheckedChange={(showMinimap) => update({ showMinimap })} />
      </SettingsRow>
      <SettingsRow title="Rótulos de conectores" description="Exibe o texto dos conectores sobre a curva.">
        <Switch
          checked={settings.showConnectorLabels}
          onCheckedChange={(showConnectorLabels) => update({ showConnectorLabels })}
        />
      </SettingsRow>
      <SettingsRow title="Sombras dos elementos" description="Profundidade visual nos cartões e notas.">
        <Switch checked={settings.showNodeShadows} onCheckedChange={(showNodeShadows) => update({ showNodeShadows })} />
      </SettingsRow>

      <div>
        <Label>Modo padrão das notas</Label>
        <div className="mt-1 grid grid-cols-2 gap-1">
          {(["write", "preview"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => update({ defaultNoteMode: mode })}
              className={cn(
                "rounded-md border px-2 py-1.5 text-[11px] transition-colors",
                settings.defaultNoteMode === mode
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent",
              )}
            >
              {mode === "write" ? "Edição" : "Prévia"}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function ShortcutsSection() {
  const shortcuts = useAppStore((state) => state.settings.shortcuts);
  const setShortcut = useAppStore((state) => state.setShortcut);
  const resetShortcuts = useAppStore((state) => state.resetShortcuts);
  const [capturing, setCapturing] = useState<string | null>(null);
  const conflicts = findShortcutConflicts(shortcuts);

  useEffect(() => {
    if (!capturing) return;
    const handler = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.key === "Escape") {
        setCapturing(null);
        return;
      }
      const combo = comboFromEvent(event);
      const isModifierOnly = ["Mod", "Shift", "Alt"].includes(combo.split("+").pop() ?? "");
      if (isModifierOnly) return;
      setShortcut(capturing, combo);
      setCapturing(null);
      toast.success("Atalho atualizado", { description: formatCombo(combo) });
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [capturing, setShortcut]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof SHORTCUTS>();
    for (const shortcut of SHORTCUTS) {
      const list = map.get(shortcut.group) ?? [];
      list.push(shortcut);
      map.set(shortcut.group, list);
    }
    return Array.from(map.entries());
  }, []);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[12.5px] font-medium">Atalhos de teclado</p>
          <p className="text-[10.5px] text-muted-foreground">
            Clique em um atalho e pressione a nova combinação. Esc cancela.
          </p>
        </div>
        <Button variant="outline" size="xs" onClick={resetShortcuts}>
          <RotateCcw className="h-3 w-3" /> Restaurar padrões
        </Button>
      </div>

      {Object.keys(conflicts).length > 0 ? (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-2 text-[10.5px] text-amber-700 dark:text-amber-300">
          Existem combinações duplicadas. O primeiro atalho encontrado tem prioridade.
        </div>
      ) : null}

      <div className="space-y-4">
        {groups.map(([group, items]) => (
          <div key={group}>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{group}</p>
            <div className="divide-y divide-border rounded-lg border border-border">
              {items.map((shortcut) => {
                const combo = shortcuts[shortcut.id] ?? shortcut.combo;
                return (
                  <div key={shortcut.id} className="flex items-center justify-between gap-3 px-2.5 py-1.5">
                    <span className="text-[11.5px]">{shortcut.label}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setCapturing(shortcut.id)}
                        className={cn(
                          "min-w-[54px] rounded border px-1.5 py-0.5 text-center font-mono text-[10px] transition-colors",
                          capturing === shortcut.id
                            ? "animate-pulse border-primary bg-primary/10 text-primary"
                            : "border-border bg-muted/60 text-muted-foreground hover:bg-accent",
                        )}
                      >
                        {capturing === shortcut.id ? "pressione…" : formatCombo(combo)}
                      </button>
                      {shortcuts[shortcut.id] ? (
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => setShortcut(shortcut.id, null)}
                          aria-label="Restaurar atalho"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function DataSection({
  storageKind,
  totals,
  workspaces,
  workspaceOrder,
  activeWorkspaceId,
  boards,
}: {
  storageKind: "sqlite" | "indexeddb" | "memory";
  totals: { boards: number; nodes: number; workspaces: number };
  workspaces: Record<string, { name: string }>;
  workspaceOrder: string[];
  activeWorkspaceId: string;
  boards: Record<string, import("@/core/domain/types").Board>;
}) {
  const [backupCount, setBackupCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const activeBoard = useActiveBoard();

  useEffect(() => {
    void persistenceService.listBackups().then((list) => setBackupCount(list.length));
  }, []);

  const storageLabel =
    storageKind === "sqlite" ? "SQLite (Tauri)" : storageKind === "indexeddb" ? "IndexedDB (navegador)" : "Memória";

  return (
    <>
      <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-3">
        <HardDrive className="mt-0.5 h-4 w-4 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-[12.5px] font-medium">{storageLabel}</p>
          <p className="text-[10.5px] text-muted-foreground">
            {totals.workspaces} espaços · {totals.boards} quadros · {totals.nodes} elementos
          </p>
          <Badge variant="success" className="mt-1">
            local-first
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Button
          size="sm"
          variant="outline"
          onClick={async () => {
            await persistenceService.flushNow();
            toast.success("Tudo salvo", { description: "Dados gravados no armazenamento local." });
          }}
        >
          <Save className="h-3.5 w-3.5" /> Salvar agora
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              const info = await persistenceService.createBackup();
              const list = await persistenceService.listBackups();
              setBackupCount(list.length);
              toast.success("Backup criado", { description: info ? formatBytes(info.size) : undefined });
            } catch (error) {
              toast.error("Falha ao criar backup", { description: String(error) });
            } finally {
              setBusy(false);
            }
          }}
        >
          <HardDrive className="h-3.5 w-3.5" /> Criar backup
        </Button>
        <Button size="sm" variant="outline" onClick={() => openDialogs.backups()}>
          <Database className="h-3.5 w-3.5" /> Backups {backupCount !== null ? `(${backupCount})` : ""}
        </Button>
      </div>

      <Separator />

      <div>
        <p className="text-[12.5px] font-medium">Exportar espaço atual</p>
        <p className="mb-2 text-[10.5px] text-muted-foreground">
          JSON completo com quadros, elementos e conectores. Ideal para arquivar ou migrar.
        </p>
        <div className="flex flex-wrap gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const name = workspaces[activeWorkspaceId]?.name ?? "espaco";
              downloadText(
                suggestedFilename(name, "json"),
                serializeWorkspace(boards, activeWorkspaceId, name),
                "application/json",
              );
            }}
          >
            <Download className="h-3.5 w-3.5" /> Exportar workspace
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (!activeBoard) return;
              downloadText(
                suggestedFilename(activeBoard.title, "md"),
                boardToMarkdown(activeBoard, boards),
                "text/markdown",
              );
            }}
          >
            <Download className="h-3.5 w-3.5" /> Exportar Markdown
          </Button>
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          {workspaceOrder.length} espaços salvos. A importação fica disponível no menu Arquivo.
        </p>
      </div>

      <Separator />

      <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-2.5">
        <Trash2 className="mt-0.5 h-3.5 w-3.5 text-destructive" />
        <p className="text-[10.5px] leading-relaxed text-muted-foreground">
          Para remover todos os dados, apague a pasta de dados do aplicativo com o app fechado. Backups
          rotativos são mantidos pelo próprio EliasNote.
        </p>
      </div>
    </>
  );
}

function AboutSection({ totals }: { totals: { boards: number; nodes: number; workspaces: number } }) {
  const { status, info, currentVersion } = useUpdate();
  const [version, setVersion] = useState<string | null>(currentVersion);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    let active = true;
    void resolveAppVersion().then((value) => {
      if (active) setVersion(value);
    });
    return () => {
      active = false;
    };
  }, []);

  const verify = async () => {
    setChecking(true);
    try {
      await checkForUpdates({ force: true });
      const next = getUpdateState();
      if (next.status === "available" && next.info) {
        toast.success(`Nova versão v${next.info.version} disponível`, {
          description: "Abra a release no GitHub para baixar o instalador.",
          action: { label: "Abrir", onClick: () => void openExternal(next.info?.url ?? "") },
        });
      } else if (next.status === "up-to-date") {
        toast.success("Você está na versão mais recente", {
          description: `v${next.currentVersion ?? version ?? "—"}`,
        });
      } else {
        toast.error("Não foi possível verificar agora", {
          description: next.error ?? "Sem conexão com o GitHub.",
        });
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-card text-foreground">
          <AppMark className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold">EliasNote</p>
          <p className="text-[10.5px] text-muted-foreground">
            {version ? `v${version}` : "—"} · canvas local-first
          </p>
        </div>
        <div className="ml-auto shrink-0">
          {status === "available" && info ? (
            <Button
              size="xs"
              className="gap-1.5"
              onClick={() => void openExternal(info.url)}
            >
              <Download className="h-3 w-3" /> Atualizar para v{info.version}
            </Button>
          ) : (
            <Button size="xs" variant="outline" onClick={() => void verify()} disabled={checking || status === "checking"}>
              <RotateCcw className={cn("h-3 w-3", (checking || status === "checking") && "animate-spin")} />
              {checking || status === "checking" ? "Verificando…" : "Verificar atualizações"}
            </Button>
          )}
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Aplicativo desktop de organização visual inspirado em Milanote, com canvas infinito, quadros
        aninhados e desenho Excalidraw nativo. Funciona 100% offline: sem contas, servidores,
        colaboração ou sincronização.
      </p>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-muted/60 p-2 text-center">
          <p className="text-sm font-semibold tabular-nums">{totals.workspaces}</p>
          <p className="text-[9px] uppercase tracking-wide text-muted-foreground">espaços</p>
        </div>
        <div className="rounded-lg bg-muted/60 p-2 text-center">
          <p className="text-sm font-semibold tabular-nums">{totals.boards}</p>
          <p className="text-[9px] uppercase tracking-wide text-muted-foreground">quadros</p>
        </div>
        <div className="rounded-lg bg-muted/60 p-2 text-center">
          <p className="text-sm font-semibold tabular-nums">{totals.nodes}</p>
          <p className="text-[9px] uppercase tracking-wide text-muted-foreground">elementos</p>
        </div>
      </div>

      <Separator />
      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Bibliotecas open-source
        </p>
        <ul className="space-y-0.5 text-[10.5px] text-muted-foreground">
          <li>Excalidraw — MIT (desenhos, formas e escrita manual)</li>
          <li>React, TypeScript, Vite, Tailwind CSS — MIT</li>
          <li>Radix UI, Lucide, Zustand, Immer, marked, DOMPurify</li>
          <li>html-to-image, jsPDF — MIT</li>
          <li>Tauri 2, SQLite/rusqlite — MIT/Apache-2.0</li>
        </ul>
      </div>
      <p className="text-[10px] text-muted-foreground">
        Nenhum código ou asset proprietário do Milanote foi utilizado. Marca e interface são originais.
      </p>
    </>
  );
}
