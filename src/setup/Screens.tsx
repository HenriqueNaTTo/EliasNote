import {
  AlertTriangle,
  CheckCircle2,
  FolderOpen,
  HardDriveDownload,
  LayoutGrid,
  Lock,
  PenTool,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { InstallOptions, SetupEnvironment } from "@/setup/api";
import {
  FeatureCard,
  FieldLabel,
  NoteRow,
  ScreenHeader,
  StageList,
  ToggleRow,
} from "@/setup/parts";
import type { SetupStage } from "@/setup/stages";
import { formatBytes } from "@/lib/utils";

export function WelcomeScreen({ env }: { env: SetupEnvironment }) {
  const updating = Boolean(env.installed);

  return (
    <div className="space-y-4">
      <ScreenHeader
        eyebrow={updating ? "Atualização" : "Instalação"}
        title={updating ? "Atualizar o EliasNote" : "Instalar o EliasNote"}
        description="Canvas infinito para notas, quadros, tarefas e desenhos — 100% offline."
      />

      <section className="rounded-xl border border-border bg-card p-5 shadow-node">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">Versão {env.version} pronta para instalar</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {updating && env.installed
                ? `Instalação atual: ${env.installed.version} em ${env.installed.location}`
                : "Nenhuma instalação anterior encontrada neste usuário do Windows."}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatBytes(env.payloadBytes)} serão copiados para a pasta escolhida na próxima etapa.
            </p>
          </div>
          <span className="rounded-md border border-primary/25 bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
            {updating ? "Atualização" : "Novo"}
          </span>
        </div>

        <div className="my-4 h-px bg-border" />

        <div className="grid gap-3 sm:grid-cols-2">
          <FeatureCard
            icon={LayoutGrid}
            title="Notas e quadros"
            description="Markdown, tarefas, checklists, colunas e quadros aninhados no mesmo canvas."
          />
          <FeatureCard
            icon={Lock}
            title="Local-first"
            description="Quadros em SQLite na sua máquina, com exportação para JSON e Markdown."
          />
          <FeatureCard
            icon={PenTool}
            title="Completo"
            description="Desenho Excalidraw nativo, importação de cofre Obsidian e exportação em PDF."
          />
          <FeatureCard
            icon={RefreshCw}
            title="Fácil de atualizar"
            description="Rode este instalador de novo quando quiser; seus dados continuam onde estão."
          />
        </div>
      </section>

      <NoteRow icon={ShieldCheck}>
        A instalação roda só para o seu usuário: não pede administrador, conta nem dados pessoais.
      </NoteRow>
      <NoteRow icon={HardDriveDownload}>
        Seus quadros ficam em <code className="rounded bg-background/70 px-1 py-px text-[11px]">{env.dataPath}</code> e
        continuam intactos ao desinstalar.
      </NoteRow>
    </div>
  );
}

export function OptionsScreen({
  options,
  onChange,
  onChooseFolder,
}: {
  options: InstallOptions;
  onChange: (next: InstallOptions) => void;
  onChooseFolder: () => void;
}) {
  const update = <Key extends keyof InstallOptions>(key: Key, value: InstallOptions[Key]) =>
    onChange({ ...options, [key]: value });

  return (
    <div className="space-y-4">
      <ScreenHeader
        eyebrow="Opções"
        title="Onde instalar"
        description="A pasta do programa e os atalhos criados no Windows."
      />

      <section className="rounded-xl border border-border bg-card p-5 shadow-node">
        <FieldLabel hint="sem necessidade de administrador">Pasta do programa</FieldLabel>
        <div className="flex gap-2">
          <Input
            aria-label="Pasta do programa"
            value={options.target}
            onChange={(event) => update("target", event.target.value)}
            spellCheck={false}
            className="font-mono text-[12px]"
          />
          <Button variant="outline" onClick={onChooseFolder}>
            <FolderOpen />
            Escolher pasta
          </Button>
        </div>

        <div className="my-4 h-px bg-border" />

        <div className="divide-y divide-border">
          <ToggleRow
            label="Criar atalho na área de trabalho"
            description="Um ícone do EliasNote na área de trabalho."
            checked={options.desktopShortcut}
            onCheckedChange={(checked) => update("desktopShortcut", checked)}
          />
          <ToggleRow
            label="Criar atalho no Menu Iniciar"
            description="O app aparece em Iniciar → Programas → EliasNote."
            checked={options.startMenuShortcut}
            onCheckedChange={(checked) => update("startMenuShortcut", checked)}
          />
          <ToggleRow
            label="Abrir o EliasNote ao concluir"
            description="Abre o app assim que a instalação terminar."
            checked={options.launchAfter}
            onCheckedChange={(checked) => update("launchAfter", checked)}
          />
        </div>
      </section>

      <NoteRow icon={ShieldCheck}>
        O desinstalador fica na mesma pasta e aparece em Configurações → Aplicativos.
      </NoteRow>
    </div>
  );
}

export function ProgressScreen({
  title,
  description,
  stages,
  stage,
  percent,
  detail,
  done,
}: {
  title: string;
  description: string;
  stages: SetupStage[];
  stage: string;
  percent: number;
  detail: string;
  done: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));

  return (
    <div className="space-y-4">
      <ScreenHeader eyebrow={done ? "Concluído" : "Em andamento"} title={title} description={description} />

      <section className="rounded-xl border border-border bg-card p-5 shadow-node">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">{detail}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {done ? "Etapas finalizadas" : "Não feche esta janela durante o processo"}
            </p>
          </div>
          <span className="text-2xl font-semibold tabular-nums">{clamped}%</span>
        </div>

        <div
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso"
          className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted"
        >
          <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${clamped}%` }} />
        </div>

        <div className="my-4 h-px bg-border" />
        <StageList stages={stages} currentStage={stage} done={done} />
      </section>
    </div>
  );
}

export function DoneScreen({
  env,
  target,
  mode,
  onLaunch,
  onReveal,
}: {
  env: SetupEnvironment;
  target: string;
  mode: "install" | "uninstall";
  onLaunch: () => void;
  onReveal: () => void;
}) {
  const removed = mode === "uninstall";

  return (
    <div className="space-y-4">
      <ScreenHeader
        eyebrow="Concluído"
        title={removed ? "EliasNote removido" : "Tudo pronto"}
        description={
          removed
            ? "Os arquivos do programa saíram deste computador."
            : "O EliasNote está instalado e pronto para abrir."
        }
      />

      <section className="rounded-xl border border-border bg-card p-5 shadow-node">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">
              {removed ? "Remoção concluída" : `EliasNote ${env.version} instalado`}
            </h2>
            <p className="mt-1 break-all text-xs leading-relaxed text-muted-foreground">{target}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {removed
                ? "Seus quadros e anexos continuam em " + env.dataPath + "."
                : "Seus quadros ficam em " + env.dataPath + " e o app abre sem internet."}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {removed ? null : (
            <Button onClick={onLaunch}>
              <CheckCircle2 />
              Abrir o EliasNote
            </Button>
          )}
          <Button variant="outline" onClick={onReveal}>
            <FolderOpen />
            Abrir pasta
          </Button>
        </div>
      </section>
    </div>
  );
}

export function UninstallScreen({
  env,
  removeData,
  onChange,
}: {
  env: SetupEnvironment;
  removeData: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      <ScreenHeader
        eyebrow="Remoção"
        title="Remover o EliasNote"
        description="Os arquivos do programa e os atalhos serão apagados deste usuário."
      />

      <section className="rounded-xl border border-border bg-card p-5 shadow-node">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">
              {env.installed ? `Versão instalada: ${env.installed.version}` : "Instalação encontrada"}
            </h2>
            <p className="mt-1 break-all text-xs leading-relaxed text-muted-foreground">{env.defaultTarget}</p>
          </div>
          <span className="rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-muted-foreground">
            {formatBytes(env.payloadBytes)}
          </span>
        </div>

        <div className="my-4 h-px bg-border" />

        <ToggleRow
          label="Remover também quadros, anexos e configurações"
          description={`Apaga ${env.dataPath} e não pode ser desfeito. Deixe desligado para reinstalar depois com seus dados.`}
          checked={removeData}
          onCheckedChange={onChange}
        />
      </section>

      <NoteRow icon={removeData ? AlertTriangle : Trash2}>
        {removeData
          ? "Atenção: seus quadros e anexos serão apagados junto com o programa."
          : "Seus quadros e anexos serão mantidos no disco."}
      </NoteRow>
    </div>
  );
}
