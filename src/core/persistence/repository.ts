import type { AppSettings, Board, ID, TemplateDefinition } from "@/core/domain/types";
import { DEFAULT_SETTINGS } from "@/core/domain/constants";
import type { HydratePayload } from "@/core/store/types";
import type { AppState } from "@/core/store/types";
import { migrateBoard, migrateSettings, migrateTabs, migrateTemplates, migrateWorkspace } from "./migrations";
import { DOC_KINDS } from "./types";
import type { AppDocument, BackupSnapshot, SerializedTemplate, StorageAdapter } from "./types";

export type PersistableState = Pick<
  AppState,
  | "workspaces"
  | "workspaceOrder"
  | "activeWorkspaceId"
  | "boards"
  | "tabs"
  | "activeTabId"
  | "viewports"
  | "settings"
  | "customTemplates"
>;

export function serializeTemplate(template: TemplateDefinition): SerializedTemplate {
  const payload = template.payload ?? template.build();
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    category: template.category,
    accent: template.accent,
    payload,
  };
}

export function rebuildTemplate(serialized: SerializedTemplate): TemplateDefinition {
  return {
    id: serialized.id,
    name: serialized.name,
    description: serialized.description,
    category: serialized.category,
    accent: serialized.accent as TemplateDefinition["accent"],
    payload: serialized.payload,
    custom: true,
    build: () => serialized.payload,
  };
}

export function buildAppDocument(state: PersistableState): AppDocument {
  return {
    version: 3,
    workspaces: state.workspaces,
    workspaceOrder: state.workspaceOrder,
    activeWorkspaceId: state.activeWorkspaceId,
    tabs: state.tabs,
    activeTabId: state.activeTabId,
    viewports: state.viewports,
    customTemplates: state.customTemplates.map(serializeTemplate),
  };
}

export async function loadPersisted(adapter: StorageAdapter): Promise<HydratePayload | null> {
  const app = await adapter.readDoc<AppDocument>(DOC_KINDS.app, "main");
  if (!app) return null;

  const settings = await adapter.readDoc<unknown>(DOC_KINDS.settings, "main");
  const boardDocs = await adapter.listDocs<unknown>(DOC_KINDS.board);
  const boards: Record<ID, Board> = {};
  for (const doc of boardDocs) {
    const board = migrateBoard(doc.data);
    if (board) boards[board.id] = board;
  }
  const workspaces: Record<ID, import("@/core/domain/types").Workspace> = {};
  for (const raw of Object.values(app.workspaces ?? {})) {
    const workspace = migrateWorkspace(raw);
    if (workspace) workspaces[workspace.id] = workspace;
  }
  const workspaceOrder = Array.isArray(app.workspaceOrder)
    ? app.workspaceOrder.filter((id): id is string => typeof id === "string" && Boolean(workspaces[id]))
    : Object.keys(workspaces);

  return {
    workspaces,
    workspaceOrder,
    activeWorkspaceId:
      typeof app.activeWorkspaceId === "string" && workspaces[app.activeWorkspaceId]
        ? app.activeWorkspaceId
        : (workspaceOrder[0] ?? ""),
    boards,
    tabs: migrateTabs(app.tabs),
    activeTabId: typeof app.activeTabId === "string" ? app.activeTabId : null,
    settings: migrateSettings(settings),
    customTemplates: migrateTemplates(app.customTemplates).map(rebuildTemplate),
    viewports: app.viewports ?? {},
    storageKind: adapter.kind,
  };
}

export async function writeAppDocument(adapter: StorageAdapter, state: PersistableState): Promise<void> {
  await adapter.writeDoc(DOC_KINDS.app, "main", buildAppDocument(state));
}

export async function writeSettings(adapter: StorageAdapter, settings: AppSettings): Promise<void> {
  await adapter.writeDoc(DOC_KINDS.settings, "main", settings);
}

export async function writeBoard(adapter: StorageAdapter, board: Board): Promise<void> {
  await adapter.writeDoc(DOC_KINDS.board, board.id, board);
}

export async function deleteBoardDoc(adapter: StorageAdapter, boardId: ID): Promise<void> {
  await adapter.deleteDoc(DOC_KINDS.board, boardId);
}

export async function buildBackupSnapshot(
  state: PersistableState,
  adapterKind: StorageAdapter["kind"] = "sqlite",
): Promise<BackupSnapshot> {
  void adapterKind;
  return {
    version: 3,
    createdAt: Date.now(),
    app: buildAppDocument(state),
    settings: state.settings,
    boards: Object.values(state.boards),
  };
}

export async function restoreBackup(adapter: StorageAdapter, id: string): Promise<HydratePayload | null> {
  const snapshot = await adapter.readBackup(id);
  if (!snapshot) return null;
  const boards: Record<ID, Board> = {};
  for (const raw of snapshot.boards ?? []) {
    const board = migrateBoard(raw);
    if (board) boards[board.id] = board;
  }
  const workspaces: Record<ID, import("@/core/domain/types").Workspace> = {};
  for (const raw of Object.values(snapshot.app?.workspaces ?? {})) {
    const workspace = migrateWorkspace(raw);
    if (workspace) workspaces[workspace.id] = workspace;
  }
  return {
    workspaces,
    workspaceOrder: snapshot.app?.workspaceOrder ?? Object.keys(workspaces),
    activeWorkspaceId: snapshot.app?.activeWorkspaceId ?? Object.keys(workspaces)[0] ?? "",
    boards,
    tabs: migrateTabs(snapshot.app?.tabs),
    activeTabId: snapshot.app?.activeTabId ?? null,
    settings: migrateSettings(snapshot.settings ?? DEFAULT_SETTINGS),
    customTemplates: migrateTemplates(snapshot.app?.customTemplates).map(rebuildTemplate),
    viewports: snapshot.app?.viewports ?? {},
    storageKind: adapter.kind,
  };
}
