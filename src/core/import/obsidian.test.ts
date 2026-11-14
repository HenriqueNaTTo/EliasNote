import { describe, expect, it } from "vitest";
import {
  attachmentKindForPath,
  extractInlineTags,
  isIgnoredVaultPath,
  mimeForVaultPath,
  parseFrontmatter,
  parseObsidianCanvas,
  parseVaultEntries,
  vaultDirname,
  vaultStem,
} from "./obsidianParser";
import { createVaultPlan } from "./obsidianPlan";
import type { VaultEntry } from "./vaultTypes";
import { refForBoard, refForNode } from "@/core/domain/refs";

const NOTE_A = `---
title: Nota A
tags: [projeto, ideias]
aliases: [Plano A]
---

# Nota A

Veja [[Nota B|a outra nota]] e a [[Nota B#Detalhes]].

![[foto.png]]

#urgente

- [ ] tarefa pendente
`;

const NOTE_B = `# Nota B

## Detalhes

Conteúdo da nota B. Volta para [[Nota A]].
`;

const CANVAS = JSON.stringify({
  nodes: [
    {
      id: "text-1",
      type: "text",
      x: 0,
      y: 0,
      width: 260,
      height: 140,
      color: "3",
      text: "# Ideia do canvas\nTexto de apoio do cartão.",
    },
    {
      id: "group-1",
      type: "group",
      x: -30,
      y: -30,
      width: 700,
      height: 600,
      color: "5",
      label: "Grupo A",
    },
    {
      id: "file-1",
      type: "file",
      x: 0,
      y: 180,
      width: 300,
      height: 200,
      file: "Projeto/foto.png",
    },
    {
      id: "link-1",
      type: "link",
      x: 800,
      y: 0,
      width: 260,
      height: 140,
      url: "https://example.com",
      label: "Exemplo",
    },
  ],
  edges: [
    {
      id: "edge-1",
      fromNode: "text-1",
      toNode: "link-1",
      label: "liga",
      color: "5",
      toEnd: "arrow",
    },
  ],
});

const EXCALIDRAW = JSON.stringify({
  type: "excalidraw",
  elements: [{ id: "r1", type: "rectangle", x: 0, y: 0, width: 120, height: 60 }],
  appState: { viewBackgroundColor: "#ffffff" },
  files: {},
});

function entries(): VaultEntry[] {
  return [
    { path: ".obsidian/app.json", name: "app.json", size: 10, mime: "application/json", text: "{}" },
    { path: "Projeto/Nota A.md", name: "Nota A.md", size: NOTE_A.length, mime: "text/markdown", text: NOTE_A },
    { path: "Projeto/Nota B.md", name: "Nota B.md", size: NOTE_B.length, mime: "text/markdown", text: NOTE_B },
    { path: "Projeto/Sub/Nota C.md", name: "Nota C.md", size: 30, mime: "text/markdown", text: "# Nota C\n" },
    { path: "Projeto/foto.png", name: "foto.png", size: 2048, mime: "image/png" },
    { path: "Projeto/nao-referenciado.pdf", name: "nao-referenciado.pdf", size: 4096, mime: "application/pdf" },
    { path: "Projeto/Quadro.canvas", name: "Quadro.canvas", size: CANVAS.length, mime: "application/json", text: CANVAS },
    {
      path: "Projeto/esboco.excalidraw",
      name: "esboco.excalidraw",
      size: EXCALIDRAW.length,
      mime: "application/json",
      text: EXCALIDRAW,
    },
  ];
}

function buildPlan(includeUnreferencedAttachments = false) {
  const model = parseVaultEntries(entries(), "Cofre");
  const plan = createVaultPlan(model, {
    workspaceName: "Obsidian · Cofre",
    rootBoardTitle: "Cofre",
    attachmentIds: {
      "Projeto/foto.png": "att_foto",
      "Projeto/nao-referenciado.pdf": "att_pdf",
    },
    includeUnreferencedAttachments,
  });
  return { model, plan };
}

describe("parser do cofre Obsidian", () => {
  it("normaliza caminhos, tipos e tags", () => {
    expect(vaultDirname("A/B/Nota.md")).toBe("A/B");
    expect(vaultStem("A/Nota.md")).toBe("Nota");
    expect(isIgnoredVaultPath(".obsidian/app.json")).toBe(true);
    expect(isIgnoredVaultPath("Projeto/.hidden/nota.md")).toBe(true);
    expect(isIgnoredVaultPath("Projeto/Nota.md")).toBe(false);
    expect(attachmentKindForPath("img/foto.PNG")).toBe("image");
    expect(attachmentKindForPath("videos/a.mp4")).toBe("video");
    expect(attachmentKindForPath("docs/a.pdf")).toBe("file");
    expect(mimeForVaultPath("nota.md")).toBe("text/markdown");
    expect(extractInlineTags("# Título\n\n#urgente e #projeto/2026\n`#nao-conta`")).toEqual([
      "urgente",
      "projeto/2026",
    ]);
  });

  it("lê frontmatter com listas e corpo", () => {
    const parsed = parseFrontmatter("---\ntags:\n  - a\n  - b\naliases: x, y\ntitle: Meu\n---\n\nCorpo");
    expect(parsed.data.tags).toEqual(["a", "b"]);
    expect(parsed.data.aliases).toBe("x, y");
    expect(parsed.data.title).toBe("Meu");
    expect(parsed.body.trim()).toBe("Corpo");
  });

  it("resolve links Markdown relativos e imagens", () => {
    const model = parseVaultEntries(
      [
        {
          path: "A.md",
          name: "A.md",
          size: 100,
          mime: "text/markdown",
          text: "# A\n\n[Vai para B](B.md) e ![Foto](img/foto.png) e [site](https://example.com).",
        },
        { path: "B.md", name: "B.md", size: 20, mime: "text/markdown", text: "# B\n" },
        { path: "img/foto.png", name: "foto.png", size: 1024, mime: "image/png" },
      ],
      "Cofre",
    );
    const note = model.notes.find((item) => item.path === "A.md");
    expect(note?.links).toHaveLength(2);
    expect(note?.links[0].resolution).toBe("note");
    expect(note?.links[0].resolvedPath).toBe("B.md");
    expect(note?.links[1].resolution).toBe("attachment");
    expect(note?.links[1].resolvedPath).toBe("img/foto.png");
    expect(model.referencedAttachments).toEqual(["img/foto.png"]);
    expect(note?.content).toContain("https://example.com");
  });

  it("valida canvas e ignora arquivos internos", () => {
    const canvas = parseObsidianCanvas(CANVAS);
    expect(canvas?.nodes).toHaveLength(4);
    expect(canvas?.edges[0].toNode).toBe("link-1");
    expect(parseObsidianCanvas("{}")).toBeNull();
    expect(parseObsidianCanvas("não é json")).toBeNull();
  });

  it("cataloga notas, pastas, anexos, links e desenhos", () => {
    const model = parseVaultEntries(entries(), "Cofre");
    expect(model.notes).toHaveLength(3);
    expect(model.canvases).toHaveLength(1);
    expect(model.drawings).toHaveLength(1);
    expect(model.attachments).toHaveLength(2);
    expect(model.folders.map((folder) => folder.path)).toEqual(["Projeto", "Projeto/Sub"]);
    expect(model.referencedAttachments).toEqual(["Projeto/foto.png"]);
    expect(model.unresolvedLinks).toBe(0);

    const noteA = model.notes.find((note) => note.path === "Projeto/Nota A.md");
    expect(noteA?.title).toBe("Nota A");
    expect(noteA?.tags).toEqual(expect.arrayContaining(["projeto", "ideias", "urgente"]));
    expect(noteA?.aliases).toEqual(["Plano A"]);
    expect(noteA?.content).not.toContain("[[");
    expect(noteA?.links).toHaveLength(3);
    expect(noteA?.links[0].resolution).toBe("note");
    expect(noteA?.links[0].resolvedPath).toBe("Projeto/Nota B.md");
    expect(noteA?.links[1].heading).toBe("Detalhes");
    expect(noteA?.links[2].resolution).toBe("attachment");

    const canvas = model.canvases[0];
    const fileNode = canvas.nodes.find((node) => node.id === "file-1");
    expect(fileNode?.resolvedKind).toBe("attachment");
    expect(fileNode?.resolvedPath).toBe("Projeto/foto.png");
  });
});

describe("plano de importação Obsidian", () => {
  it("cria a hierarquia de quadros, notas e referências", () => {
    const { plan } = buildPlan();
    expect(plan.workspaceName).toBe("Obsidian · Cofre");
    expect(plan.boards).toHaveLength(4);
    const root = plan.boards.find((board) => board.id === plan.openBoardId);
    expect(root?.title).toBe("Cofre");
    expect(root?.parentId).toBeNull();

    const project = plan.boards.find((board) => board.title === "Projeto");
    expect(project?.parentId).toBe(root?.id);
    expect(root?.childBoardIds).toContain(project?.id);
    const boardNode = root?.nodes.find((node) => node.type === "board");
    expect(boardNode?.fields?.childBoardId).toBe(project?.id);

    const noteA = project?.nodes.find((node) => node.type === "note" && node.fields?.title === "Nota A");
    const noteB = project?.nodes.find((node) => node.type === "note" && node.fields?.title === "Nota B");
    expect(noteA).toBeDefined();
    expect(noteB).toBeDefined();
    expect(noteA?.fields?.content).toContain(`eliasnote://node/${noteB?.id}`);
    expect(noteA?.fields?.content).not.toContain("[[");
    expect(noteA?.references).toContain(refForNode(noteB?.id ?? ""));
    expect(noteA?.fields?.tags).toEqual(expect.arrayContaining(["projeto", "urgente"]));

    const image = project?.nodes.find((node) => node.type === "image");
    expect(image?.fields?.attachmentId).toBe("att_foto");
    expect(noteA?.references).toContain(refForNode(image?.id ?? ""));

    const drawing = project?.nodes.find((node) => node.type === "drawing");
    expect(drawing?.fields?.title).toBe("esboco");
    expect(drawing?.fields?.scene?.elements).toHaveLength(1);

    const sub = plan.boards.find((board) => board.title === "Sub");
    expect(sub?.parentId).toBe(project?.id);

    const canvasBoard = plan.boards.find((board) => board.title === "Quadro");
    expect(canvasBoard?.parentId).toBe(project?.id);
    expect(canvasBoard?.connectors).toHaveLength(1);
    expect(canvasBoard?.connectors[0].label).toBe("liga");
    expect(canvasBoard?.nodes.some((node) => node.type === "column" && node.fields?.title === "Grupo A")).toBe(true);
    const column = canvasBoard?.nodes.find((node) => node.type === "column");
    const groupedChild = canvasBoard?.nodes.find((node) => node.parentId === column?.id);
    expect(groupedChild).toBeDefined();
    expect(canvasBoard?.nodes.some((node) => node.type === "link")).toBe(true);
  });

  it("inclui anexos não referenciados somente quando solicitado", () => {
    const without = buildPlan(false).plan;
    const withAll = buildPlan(true).plan;
    const projectWithout = without.boards.find((board) => board.title === "Projeto");
    const projectWith = withAll.boards.find((board) => board.title === "Projeto");
    expect(projectWithout?.nodes.some((node) => node.fields?.name === "nao-referenciado.pdf")).toBe(false);
    expect(projectWith?.nodes.some((node) => node.fields?.name === "nao-referenciado.pdf")).toBe(true);
    expect(withAll.stats.attachments).toBe(2);
  });

  it("mantém IDs únicos e estatísticas coerentes", () => {
    const { plan } = buildPlan();
    const boardIds = plan.boards.map((board) => board.id);
    const nodeIds = plan.boards.flatMap((board) => board.nodes.map((node) => node.id));
    expect(new Set(boardIds).size).toBe(boardIds.length);
    expect(new Set(nodeIds).size).toBe(nodeIds.length);
    expect(plan.stats.notes).toBe(3);
    expect(plan.stats.canvases).toBe(1);
    expect(plan.stats.drawings).toBe(1);
    expect(plan.stats.folders).toBe(2);
    expect(plan.stats.links).toBeGreaterThan(0);
  });

  it("liga notas a quadros e canvas via links internos", () => {
    const { plan } = buildPlan();
    const project = plan.boards.find((board) => board.title === "Projeto");
    const noteB = project?.nodes.find((node) => node.fields?.title === "Nota B");
    expect(noteB?.references?.some((reference) => reference === refForBoard(plan.openBoardId))).toBe(false);
    expect(noteB?.fields?.content).toContain("eliasnote://node/");
  });
});
