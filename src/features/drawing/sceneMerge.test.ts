import { describe, expect, it } from "vitest";
import { mergeExcalidrawScenes, parseExcalidrawSceneData } from "./sceneMerge";
import type { DrawingScene } from "@/core/domain/types";

function incomingScene(): DrawingScene {
  return {
    elements: [
      {
        id: "retangulo",
        type: "rectangle",
        x: 0,
        y: 0,
        width: 100,
        height: 80,
        boundElements: [{ type: "text", id: "texto" }],
      },
      {
        id: "texto",
        type: "text",
        x: 10,
        y: 10,
        width: 60,
        height: 20,
        containerId: "retangulo",
        groupIds: ["grupo-1"],
      },
      {
        id: "seta",
        type: "arrow",
        x: 0,
        y: 120,
        width: 120,
        height: 0,
        startBinding: { elementId: "retangulo", focus: 0, gap: 1 },
        endBinding: { elementId: "texto", focus: 0, gap: 1 },
        boundElements: [],
      },
      {
        id: "imagem",
        type: "image",
        x: 200,
        y: 0,
        width: 80,
        height: 80,
        fileId: "arquivo-1",
        groupIds: ["grupo-1"],
      },
    ],
    appState: { viewBackgroundColor: "#ffffff" },
    files: {
      "arquivo-1": {
        id: "arquivo-1",
        dataURL: "data:image/png;base64,AAAA",
        mimeType: "image/png",
        created: 0,
      },
    },
    thumbnail: null,
    updatedAt: 0,
  };
}

describe("mesclagem de cenas Excalidraw", () => {
  it("remapeia IDs, bindings, grupos e arquivos e desloca a cena", () => {
    const current = {
      elements: [
        { id: "existente", type: "rectangle", x: 0, y: 0, width: 100, height: 100 },
      ],
      files: {},
    };

    const result = mergeExcalidrawScenes(current, incomingScene());
    expect(result.addedCount).toBe(4);
    expect(result.elements).toHaveLength(5);

    const allIds = result.elements.map((element) => element.id);
    expect(new Set(allIds).size).toBe(5);
    expect(allIds).toContain("existente");

    const rectangle = result.elements.find(
      (element) => element.type === "rectangle" && element.id !== "existente",
    );
    const text = result.elements.find((element) => element.type === "text");
    const arrow = result.elements.find((element) => element.type === "arrow");
    const image = result.elements.find((element) => element.type === "image");

    expect(rectangle).toBeDefined();
    expect(text).toBeDefined();
    expect(arrow).toBeDefined();
    expect(image).toBeDefined();

    expect(rectangle?.x).toBe(180);
    expect(text?.containerId).toBe(rectangle?.id);
    expect((rectangle?.boundElements as { id: string }[] | undefined)?.[0]?.id).toBe(text?.id);
    expect((arrow?.startBinding as { elementId: string } | null)?.elementId).toBe(rectangle?.id);
    expect((arrow?.endBinding as { elementId: string } | null)?.elementId).toBe(text?.id);
    expect((text?.groupIds as string[])[0]).toBe((image?.groupIds as string[])[0]);
    expect(text?.groupIds).not.toEqual(["grupo-1"]);

    expect(image?.fileId).not.toBe("arquivo-1");
    expect(result.files[image?.fileId as string]).toEqual({
      id: image?.fileId,
      dataURL: "data:image/png;base64,AAAA",
      mimeType: "image/png",
      created: 0,
    });
    expect(Object.keys(result.addedFiles)).toHaveLength(1);
    expect(result.files["arquivo-1"]).toBeUndefined();
  });

  it("aceita array de elementos ou arquivo completo", () => {
    const scene = incomingScene();
    const fromFile = parseExcalidrawSceneData(JSON.stringify({ type: "excalidraw", ...scene }));
    expect(fromFile?.elements).toHaveLength(4);

    const fromArray = parseExcalidrawSceneData(JSON.stringify(scene.elements));
    expect(fromArray?.elements).toHaveLength(4);

    expect(parseExcalidrawSceneData("não é json")).toBeNull();
    expect(parseExcalidrawSceneData("{}")).toBeNull();
  });

  it("não altera a cena atual quando a entrada está vazia", () => {
    const current = {
      elements: [{ id: "a", type: "rectangle", x: 0, y: 0, width: 10, height: 10 }],
      files: { existente: "data:image/png;base64,BBBB" },
    };
    const empty: DrawingScene = {
      elements: [],
      appState: {},
      files: {},
      thumbnail: null,
      updatedAt: 0,
    };
    const result = mergeExcalidrawScenes(current, empty);
    expect(result.addedCount).toBe(0);
    expect(result.elements).toEqual(current.elements);
    expect(result.files).toEqual(current.files);
  });
});
