import { describe, expect, it } from "vitest";
import { boardToMarkdown, serializeBoard, serializeWorkspace } from "./exporter";
import { markdownToNoteSeed, parseExcalidrawScene, parseImportJson } from "./importer";
import { makePayload, addNodeToPayload } from "@/test/fixtures";
import { instantiateTemplate } from "@/core/domain/templates";
import { TEMPLATE_PAYLOAD } from "@/test/fixtures";
import { refForBoard } from "@/core/domain/refs";

function preparedBoard() {
  const test = makePayload();
  const board = test.payload.boards[test.boardId];
  const { nodes } = instantiateTemplate(board, TEMPLATE_PAYLOAD, { x: 0, y: 0 });
  for (const node of nodes) board.nodes[node.id] = node;
  const task = addNodeToPayload(test, { type: "task", x: 0, y: 500, title: "Publicar release" });
  board.nodes[task.id].references = [refForBoard("board-x")];
  board.nodes[task.id].tags = ["entrega", "urgente"];
  return { test, board, task };
}

describe("exportação", () => {
  it("serializa o quadro em JSON reimportável", () => {
    const { board } = preparedBoard();
    const json = serializeBoard(board);
    const parsed = JSON.parse(json);
    expect(parsed.kind).toBe("eliasnote.board");
    const imported = parseImportJson(json);
    expect(imported.nodes.length).toBe(Object.keys(board.nodes).length);
    expect(imported.boards[0].title).toBe(board.title);
    expect(imported.connectors.length).toBe(Object.keys(board.connectors).length);
  });

  it("exporta workspace com todos os quadros", () => {
    const { test } = preparedBoard();
    const json = serializeWorkspace(test.payload.boards, test.workspaceId, "Espaço");
    const parsed = JSON.parse(json);
    expect(parsed.kind).toBe("eliasnote.workspace");
    expect(parsed.workspaceName).toBe("Espaço");
    const imported = parseImportJson(json);
    expect(imported.source).toBe("workspace");
    expect(imported.boards.length).toBe(1);
  });

  it("gera markdown com tarefas, colunas e etiquetas", () => {
    const { test, board } = preparedBoard();
    const markdown = boardToMarkdown(board, test.payload.boards);
    expect(markdown).toContain(`# ${board.title}`);
    expect(markdown).toContain("## Coluna");
    expect(markdown).toContain("- [ ] Tarefa 1");
    expect(markdown).toContain("## Tarefas");
    expect(markdown).toContain("Publicar release");
  });

  it("interpreta fragmentos de elementos e arquivos markdown", () => {
    const fragment = JSON.stringify({
      nodes: [
        { id: "a", type: "note", x: 0, y: 0, w: 200, h: 100, content: "olá" },
        { id: "b", type: "task", x: 0, y: 120, w: 200, h: 60, title: "tarefa" },
      ],
      connectors: [],
    });
    const result = parseImportJson(fragment);
    expect(result.nodes).toHaveLength(2);
    expect(result.source).toBe("fragment");

    const note = markdownToNoteSeed("# Reunião\n\nConteúdo do arquivo", { filename: "nota.md" });
    expect(note.title).toBe("Reunião");
    expect(note.content).toContain("Conteúdo");

    expect(() => parseImportJson("não é json")).toThrow();
  });

  it("reconhece cenas .excalidraw", () => {
    const scene = parseExcalidrawScene(
      JSON.stringify({ type: "excalidraw", elements: [{ id: "r1", type: "rectangle" }], appState: { zoom: 1 } }),
    );
    expect(scene?.elements).toHaveLength(1);
    expect(scene?.appState.zoom).toBe(1);
    expect(parseExcalidrawScene("{}")).toBeNull();
  });
});
