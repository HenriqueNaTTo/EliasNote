import { describe, expect, it } from "vitest";
import {
  AUTO_LANGUAGE,
  MAX_HIGHLIGHT_LENGTH,
  PLAINTEXT_LANGUAGE,
  countLines,
  escapeCode,
  highlightCode,
  languageFromPath,
  languageLabel,
  normalizeLanguage,
  resolveLanguage,
} from "./code";

describe("código: linguagens", () => {
  it("normaliza aliases e ids do highlight.js", () => {
    expect(normalizeLanguage("gd")).toBe("gdscript");
    expect(normalizeLanguage("GDScript")).toBe("gdscript");
    expect(normalizeLanguage("language-cs")).toBe("csharp");
    expect(normalizeLanguage("shader")).toBe("glsl");
    expect(normalizeLanguage("hlsl")).toBe("glsl");
    expect(normalizeLanguage("desconhecida")).toBe(PLAINTEXT_LANGUAGE);
    expect(normalizeLanguage(AUTO_LANGUAGE)).toBe(PLAINTEXT_LANGUAGE);
  });

  it("deduz a linguagem pela extensão do título", () => {
    expect(languageFromPath("player.gd")).toBe("gdscript");
    expect(languageFromPath("Assets/Scripts/Enemy.cs")).toBe("csharp");
    expect(languageFromPath("lighting.hlsl")).toBe("glsl");
    expect(languageFromPath("data/balance.json")).toBe("json");
    expect(languageFromPath("sem-extensao")).toBeNull();
    expect(languageFromPath("")).toBeNull();
  });

  it("resolve a linguagem efetiva do nó", () => {
    expect(resolveLanguage({ language: "gd", title: "" })).toBe("gdscript");
    expect(resolveLanguage({ language: AUTO_LANGUAGE, title: "movement.gd" })).toBe("gdscript");
    expect(resolveLanguage({ language: "auto", title: "notas.md" })).toBe(PLAINTEXT_LANGUAGE);
    expect(resolveLanguage({ title: "data/balance.json" })).toBe("json");
  });

  it("rotula as linguagens para a interface", () => {
    expect(languageLabel("gdscript")).toContain("GDScript");
    expect(languageLabel(AUTO_LANGUAGE)).toBe("Automático");
    expect(languageLabel("inexistente")).toBe("Texto puro");
  });

  it("conta linhas e escapa HTML", () => {
    expect(countLines("a\nb")).toBe(2);
    expect(countLines("")).toBe(1);
    expect(escapeCode('<a href="x">')).toBe("&lt;a href=&quot;x&quot;&gt;");
  });
});

describe("código: realce", () => {
  it("realça GDScript com a gramática própria", async () => {
    const html = await highlightCode("func _ready() -> void:\n\tpass", "gdscript");
    expect(html).toContain("hljs-");
    expect(html).toContain("func");
    expect(html).not.toContain("<script");
  });

  it("realça C# e JSON", async () => {
    expect(await highlightCode("public class Player {}", "csharp")).toContain("hljs-");
    expect(await highlightCode('{"hp": 10}', "json")).toContain("hljs-");
  });

  it("cai em texto puro escapado para linguagem desconhecida", async () => {
    const html = await highlightCode("<script>x</script>", "naoexiste");
    expect(html).toBe("&lt;script&gt;x&lt;/script&gt;");
  });

  it("não realça trechos acima do limite", async () => {
    const huge = "a".repeat(MAX_HIGHLIGHT_LENGTH + 1);
    expect(await highlightCode(huge, "gdscript")).toBe(huge);
  });
});
