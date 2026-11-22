import { lazy, Suspense } from "react";
import { useAppStore } from "@/core/store";
import { GlobalSearchDialog } from "@/features/search/GlobalSearchDialog";
import { TasksDialog } from "@/features/tasks/TasksDialog";
import { SettingsDialog } from "@/features/settings/SettingsDialog";
import { TemplatesDialog } from "@/features/templates/TemplatesDialog";
import { BackupsDialog } from "@/features/backups/BackupsDialog";
import { ExportDialog } from "@/features/export/ExportDialog";
import { ImportDialog } from "@/features/export/ImportDialog";
import { ObsidianImportDialog } from "@/features/import/ObsidianImportDialog";
import { NodeTransferDialog } from "@/features/canvas/NodeTransferDialog";
import { NoteDialog } from "@/features/nodes/NoteDialog";

const DrawingDialog = lazy(() =>
  import("@/features/drawing/DrawingDialog").then((module) => ({ default: module.DrawingDialog })),
);

export function Dialogs() {
  const dialog = useAppStore((state) => state.dialog);
  return (
    <>
      <GlobalSearchDialog />
      <TasksDialog />
      <SettingsDialog />
      <TemplatesDialog />
      <BackupsDialog />
      <ExportDialog />
      <ImportDialog />
      <ObsidianImportDialog />
      <NodeTransferDialog />
      <NoteDialog />
      {dialog === "drawing" ? (
        <Suspense fallback={null}>
          <DrawingDialog />
        </Suspense>
      ) : null}
    </>
  );
}
