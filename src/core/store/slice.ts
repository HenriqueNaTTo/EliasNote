import type { StateCreator } from "zustand";
import type { AppState } from "./types";

/** Criador de slice com o middleware immer aplicado ao store principal. */
export type AppStoreCreator<T> = StateCreator<AppState, [["zustand/immer", never]], [], T>;
