import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { tauriSetupApi } from "@/setup/api";
import type { InstallOptions, SetupApi, SetupEnvironment, SetupProgress } from "@/setup/api";
import { LocalNote, ScreenHeader, Sidebar, TopBar } from "@/setup/parts";
import type { StepDescriptor, SetupStep } from "@/setup/parts";
import { DoneScreen, OptionsScreen, ProgressScreen, UninstallScreen, WelcomeScreen } from "@/setup/Screens";
import { INSTALL_STAGES, UNINSTALL_STAGES, initialProgress } from "@/setup/stages";

type Phase =
  | "loading"
  | "welcome"
  | "options"
  | "installing"
  | "done"
  | "confirm-uninstall"
  | "uninstalling"
  | "error";

const THEME_KEY = "eliasnote-setup-theme";

const INSTALL_STEPS: StepDescriptor[] = [
  { id: "welcome", label: "Bem-vindo" },
  { id: "options", label: "Opções" },
  { id: "installation", label: "Instalação" },
  { id: "done", label: "Concluído" },
];

const UNINSTALL_STEPS: StepDescriptor[] = [
  { id: "welcome", label: "Remover" },
  { id: "done", label: "Concluído" },
];

const describeError = (cause: unknown): string => {
  if (typeof cause === "string") return cause;
  if (cause instanceof Error) return cause.message;
  return "Falha inesperada durante a instalação.";
};

export function SetupApp({ api = tauriSetupApi }: { api?: SetupApi }) {
  const [env, setEnv] = useState<SetupEnvironment | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) === "dark";
    } catch {
      return false;
    }
  });
  const [progress, setProgress] = useState<SetupProgress>(initialProgress);
  const [options, setOptions] = useState<InstallOptions>({
    target: "",
    desktopShortcut: true,
    startMenuShortcut: true,
    launchAfter: true,
  });
  const [removeData, setRemoveData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
    } catch {
      /* preferência só vale nesta sessão */
    }
  }, [dark]);

  useEffect(() => {
    let cancelled = false;
    api
      .environment()
      .then((environment) => {
        if (cancelled) return;
        setEnv(environment);
        setOptions((current) => ({ ...current, target: environment.defaultTarget }));
        setPhase(environment.mode === "uninstall" ? "confirm-uninstall" : "welcome");
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setError(describeError(cause));
        setPhase("error");
      });
    return () => {
      cancelled = true;
    };
  }, [api]);

  useEffect(() => {
    let active = true;
    let stop: (() => void) | undefined;
    api
      .onProgress((payload) => {
        if (active) setProgress(payload);
      })
      .then((unlisten) => {
        if (active) stop = unlisten;
        else unlisten();
      })
      .catch(() => undefined);
    return () => {
      active = false;
      stop?.();
    };
  }, [api]);

  const mode = env?.mode ?? "install";
  const uninstallMode = mode === "uninstall";

  const closeWindow = useCallback(() => {
    void api.close().catch(() => undefined);
  }, [api]);

  const startInstall = useCallback(async () => {
    setError(null);
    setPhase("installing");
    setProgress({ stage: "prepare", percent: 0, detail: "Iniciando a instalação" });
    try {
      await api.install(options);
      setProgress((current) => ({ ...current, stage: "finish", percent: 100, detail: "Instalação concluída" }));
      setPhase("done");
    } catch (cause) {
      setError(describeError(cause));
      setPhase("error");
    }
  }, [api, options]);

  const startUninstall = useCallback(async () => {
    if (!env) return;
    setError(null);
    setPhase("uninstalling");
    setProgress({ stage: "shortcuts", percent: 0, detail: "Iniciando a remoção" });
    try {
      await api.uninstall({ target: env.defaultTarget, removeData });
      setProgress((current) => ({ ...current, stage: "finish", percent: 100, detail: "Remoção concluída" }));
      setPhase("done");
    } catch (cause) {
      setError(describeError(cause));
      setPhase("error");
    }
  }, [api, env, removeData]);

  const chooseFolder = useCallback(async () => {
    try {
      const selected = await api.chooseDirectory(options.target);
      if (selected) setOptions((current) => ({ ...current, target: selected }));
    } catch {
      /* usuário cancelou */
    }
  }, [api, options.target]);

  const currentStep: SetupStep =
    phase === "done"
      ? "done"
      : phase === "options"
        ? "options"
        : phase === "installing"
          ? "installation"
          : phase === "uninstalling"
            ? uninstallMode
              ? "welcome"
              : "installation"
            : phase === "error" && !uninstallMode
              ? "options"
              : "welcome";

  const steps = uninstallMode ? UNINSTALL_STEPS : INSTALL_STEPS;

  const canInstall = options.target.trim().length > 0;

  const content = () => {
    if (phase === "loading" || !env) {
      return (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 size-4 animate-spin" />
          Preparando o assistente…
        </div>
      );
    }

    if (phase === "installing" || phase === "uninstalling") {
      return (
        <ProgressScreen
          title={uninstallMode ? "Removendo o EliasNote" : "Instalando o EliasNote"}
          description={
            uninstallMode
              ? "Removendo arquivos, atalhos e o registro do programa."
              : "Copiando o aplicativo, criando atalhos e registrando no Windows."
          }
          stages={uninstallMode ? UNINSTALL_STAGES : INSTALL_STAGES}
          stage={progress.stage}
          percent={progress.percent}
          detail={progress.detail}
          done={progress.percent >= 100}
        />
      );
    }

    if (phase === "done") {
      return (
        <DoneScreen
          env={env}
          target={uninstallMode ? env.installed?.location ?? env.defaultTarget : options.target}
          mode={mode}
          onLaunch={() => void api.launch(options.target).catch(() => undefined)}
          onReveal={() =>
            void api.reveal(uninstallMode ? env.defaultTarget : options.target).catch(() => undefined)
          }
        />
      );
    }

    if (phase === "confirm-uninstall") {
      return <UninstallScreen env={env} removeData={removeData} onChange={setRemoveData} />;
    }

    if (phase === "welcome") {
      return <WelcomeScreen env={env} />;
    }

    if (phase === "options") {
      return <OptionsScreen options={options} onChange={setOptions} onChooseFolder={() => void chooseFolder()} />;
    }

    return (
      <div className="space-y-4">
        <ScreenHeader
          eyebrow="Algo deu errado"
          title="Não foi possível concluir"
          description="Nada foi alterado além do necessário. Confira a mensagem abaixo."
        />
        <section className="rounded-xl border border-destructive/30 bg-card p-5 shadow-node">
          <p className="text-sm font-medium text-destructive">{error ?? "Falha inesperada."}</p>
        </section>
      </div>
    );
  };

  const footer = () => {
    if (phase === "loading" || phase === "installing" || phase === "uninstalling") {
      return (
        <>
          <p className="text-xs text-muted-foreground">
            {phase === "loading" ? "Lendo a instalação atual" : "Não feche esta janela durante o processo"}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={closeWindow} disabled={phase !== "loading"}>
              Cancelar
            </Button>
            <Button disabled>
              <Loader2 className="animate-spin" />
              {uninstallMode ? "Removendo" : "Instalando"}
            </Button>
          </div>
        </>
      );
    }

    if (phase === "done") {
      return (
        <>
          <p className="text-xs text-muted-foreground">
            {uninstallMode ? "O desinstalador também sai da pasta" : "Atalhos criados conforme as opções escolhidas"}
          </p>
          <Button onClick={closeWindow}>Fechar</Button>
        </>
      );
    }

    if (phase === "confirm-uninstall") {
      return (
        <>
          <p className="text-xs text-muted-foreground">Esta ação remove o programa deste usuário do Windows.</p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={closeWindow}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => void startUninstall()}>
              Remover o EliasNote
            </Button>
          </div>
        </>
      );
    }

    if (phase === "error") {
      return (
        <>
          <p className="text-xs text-muted-foreground">Você pode voltar e tentar de novo.</p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={closeWindow}>
              Fechar
            </Button>
            <Button onClick={() => setPhase(uninstallMode ? "confirm-uninstall" : "options")}>Voltar</Button>
          </div>
        </>
      );
    }

    if (phase === "options") {
      return (
        <>
          <p className="text-xs text-muted-foreground">A instalação não pede privilégios de administrador.</p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setPhase("welcome")}>
              Voltar
            </Button>
            <Button onClick={() => void startInstall()} disabled={!canInstall}>
              Instalar o EliasNote
            </Button>
          </div>
        </>
      );
    }

    return (
      <>
        <p className="text-xs text-muted-foreground">Ao continuar, você escolhe onde instalar.</p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={closeWindow}>
            Cancelar
          </Button>
          <Button onClick={() => setPhase("options")}>Continuar</Button>
        </div>
      </>
    );
  };

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <TopBar
        version={env?.version ?? "0.2.0"}
        dark={dark}
        onToggleTheme={() => setDark((current) => !current)}
        onClose={closeWindow}
      />
      <div className="flex min-h-0 flex-1">
        <Sidebar steps={steps} current={currentStep} footer={<LocalNote />} />
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6">
            <div className="mx-auto w-full max-w-[660px]">{content()}</div>
          </div>
          <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-border bg-background px-8 py-3.5">
            {footer()}
          </footer>
        </main>
      </div>
    </div>
  );
}
