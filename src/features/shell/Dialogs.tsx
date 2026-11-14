import { lazy, Suspense } from "react";
import { useAppStore } from "@/core/store";
import { GlobalSearchDialog } from "@/features/search/GlobalSearchDialog";
import { SettingsDialog } from "@/features/settings/SettingsDialog";
import { TemplatesDialog } from "@/features/templates/TemplatesDialog";
import { BackupsDialog } from "@/features/backups/BackupsDialog";
import { ExportDialog } from "@/features/export/ExportDialog";
import { ImportDialog } from "@/features/export/ImportDialog";
import { ObsidianImportDialog } from "@/features/import/ObsidianImportDialog";

const DrawingDialog = lazy(() =>
  import("@/features/drawing/DrawingDialog").then((module) => ({ default: module.DrawingDialog })),
);

export function Dialogs() {
  const dialog = useAppStore((state) => state.dialog);
  return (
    <>
      <GlobalSearchDialog />
      <SettingsDialog />
      <TemplatesDialog />
      <BackupsDialog />
      <ExportDialog />
      <ImportDialog />
      <ObsidianImportDialog />
      {dialog === "drawing" ? (
        <Suspense fallback={null}>
          <DrawingDialog />
        </Suspense>
      ) : null}
    </>
  );
}
