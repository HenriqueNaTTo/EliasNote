import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { open } from "@tauri-apps/plugin-dialog";

/**
 * Contrato entre o assistente e o backend Rust do instalador.
 *
 * A interface permite trocar a implementação nos testes (sem Tauri/jsdom).
 */

export interface InstalledInfo {
  version: string;
  location: string;
}

export interface SetupEnvironment {
  version: string;
  mode: "install" | "uninstall";
  installed: InstalledInfo | null;
  defaultTarget: string;
  dataPath: string;
  payloadBytes: number;
}

export interface SetupProgress {
  stage: string;
  percent: number;
  detail: string;
}

export interface InstallOptions {
  target: string;
  desktopShortcut: boolean;
  startMenuShortcut: boolean;
  launchAfter: boolean;
}

export interface UninstallOptions {
  target: string;
  removeData: boolean;
}

export interface SetupApi {
  environment(): Promise<SetupEnvironment>;
  install(options: InstallOptions): Promise<void>;
  uninstall(options: UninstallOptions): Promise<void>;
  launch(target: string): Promise<void>;
  reveal(target: string): Promise<void>;
  chooseDirectory(current: string): Promise<string | null>;
  close(): Promise<void>;
  onProgress(handler: (progress: SetupProgress) => void): Promise<() => void>;
}

export const tauriSetupApi: SetupApi = {
  environment: () => invoke<SetupEnvironment>("setup_environment"),
  install: (options) =>
    invoke("setup_install", {
      target: options.target,
      desktopShortcut: options.desktopShortcut,
      startMenuShortcut: options.startMenuShortcut,
      launchAfter: options.launchAfter,
    }),
  uninstall: (options) =>
    invoke("setup_uninstall", { target: options.target, removeData: options.removeData }),
  launch: (target) => invoke("setup_launch", { target }),
  reveal: (target) => invoke("setup_reveal", { target }),
  chooseDirectory: async (current) => {
    const selected = await open({
      directory: true,
      multiple: false,
      defaultPath: current,
      title: "Escolha a pasta do EliasNote",
    });
    return typeof selected === "string" ? selected : null;
  },
  close: () => getCurrentWindow().close(),
  onProgress: (handler) => listen<SetupProgress>("setup:progress", (event) => handler(event.payload)),
};
