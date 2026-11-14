import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { parseVaultEntries, vaultExtension } from "./obsidianParser";
import { createVaultPlan } from "./obsidianPlan";
import type { VaultEntry } from "./vaultTypes";

const SAMPLE_ROOT = resolve(process.cwd(), "examples/obsidian-vault");
const TEXT_EXTENSIONS = new Set(["md", "markdown", "canvas", "excalidraw"]);

function readExampleVault(): VaultEntry[] {
  const entries: VaultEntry[] = [];
  const walk = (directory: string) => {
    for (const name of readdirSync(directory)) {
      const fullPath = join(directory, name);
      const stats = statSync(fullPath);
      if (stats.isDirectory()) {
        walk(fullPath);
        continue;
      }
      const path = relative(SAMPLE_ROOT, fullPath).split("\\").join("/");
      const extension = vaultExtension(path);
      entries.push({
        path,
        name,
        size: stats.size,
        mime: extension === "svg" ? "image/svg+xml" : "application/octet-stream",
        text: TEXT_EXTENSIONS.has(extension) ? readFileSync(fullPath, "utf8") : undefined,
      });
    }
  };
  walk(SAMPLE_ROOT);
  return entries;
}

describe("cofre de exemplo", () => {
  it("importa notas, canvas, desenho e SVG do exemplo", () => {
    const model = parseVaultEntries(readExampleVault(), "obsidian-vault");
    expect(model.notes.map((note) => note.title)).toEqual(
      expect.arrayContaining(["Cofre de exemplo", "Nota A", "Nota B"]),
    );
    expect(model.canvases).toHaveLength(1);
    expect(model.drawings).toHaveLength(1);
    expect(model.attachments.map((attachment) => attachment.path)).toContain("Projeto/imagens/ideia.svg");
    expect(model.referencedAttachments).toContain("Projeto/imagens/ideia.svg");
    expect(model.unresolvedLinks).toBe(0);

    const plan = createVaultPlan(model, {
      workspaceName: "Obsidian · exemplo",
      rootBoardTitle: "Cofre de exemplo",
      attachmentIds: { "Projeto/imagens/ideia.svg": "att_svg" },
    });

    expect(plan.boards.map((board) => board.title)).toEqual(
      expect.arrayContaining(["Cofre de exemplo", "Projeto", "Quadro", "imagens"]),
    );
    expect(plan.stats.notes).toBe(3);
    expect(plan.stats.attachments).toBe(1);

    const project = plan.boards.find((board) => board.title === "Projeto");
    const canvasBoard = plan.boards.find((board) => board.title === "Quadro");
    expect(canvasBoard?.connectors).toHaveLength(2);
    expect(canvasBoard?.nodes.some((node) => node.type === "column")).toBe(true);
    expect(canvasBoard?.nodes.some((node) => node.type === "image" && node.fields?.attachmentId === "att_svg")).toBe(true);
    expect(project?.nodes.some((node) => node.type === "drawing")).toBe(true);
    expect(plan.warnings.some((warning) => warning.includes("não encontrado"))).toBe(false);
  });
});
