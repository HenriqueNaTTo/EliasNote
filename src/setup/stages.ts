import type { SetupProgress } from "@/setup/api";

/** Etapas reportadas pelo backend Rust durante a cópia e o registro. */

export interface SetupStage {
  id: string;
  label: string;
}

export const INSTALL_STAGES: SetupStage[] = [
  { id: "prepare", label: "Preparando a pasta de instalação" },
  { id: "files", label: "Copiando o aplicativo e o desinstalador" },
  { id: "shortcuts", label: "Criando atalhos" },
  { id: "registry", label: "Registrando no Windows" },
  { id: "finish", label: "Finalizando" },
];

export const UNINSTALL_STAGES: SetupStage[] = [
  { id: "shortcuts", label: "Removendo atalhos" },
  { id: "registry", label: "Limpando o registro do Windows" },
  { id: "files", label: "Removendo os arquivos do programa" },
  { id: "data", label: "Apagando quadros e anexos" },
  { id: "finish", label: "Finalizando" },
];

export const initialProgress = (): SetupProgress => ({
  stage: "",
  percent: 0,
  detail: "Aguardando o início",
});
