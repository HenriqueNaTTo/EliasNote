import { describe, expect, it } from "vitest";
import { compareVersions, isNewerVersion, parseVersion } from "./version";

describe("versões do app", () => {
  it("interpreta tags com e sem prefixo v", () => {
    expect(parseVersion("v0.2.0")).toEqual({ major: 0, minor: 2, patch: 0, prerelease: [] });
    expect(parseVersion("1.10.3")).toEqual({ major: 1, minor: 10, patch: 3, prerelease: [] });
    expect(parseVersion("v0.3.0-beta.1")?.prerelease).toEqual(["beta", "1"]);
    expect(parseVersion("abc")).toBeNull();
    expect(parseVersion("1.2")).toBeNull();
  });

  it("compara versões numéricas", () => {
    expect(compareVersions("0.2.0", "0.1.9")).toBe(1);
    expect(compareVersions("v0.3.0", "0.3.0")).toBe(0);
    expect(compareVersions("1.0.0", "1.0.1")).toBe(-1);
    expect(compareVersions("0.10.0", "0.9.9")).toBe(1);
  });

  it("trata pré-releases como anteriores à versão final", () => {
    expect(compareVersions("0.3.0-beta.1", "0.3.0")).toBe(-1);
    expect(compareVersions("0.3.0", "0.3.0-beta.1")).toBe(1);
    expect(compareVersions("0.3.0-beta.2", "0.3.0-beta.10")).toBe(-1);
    expect(compareVersions("0.3.0-alpha", "0.3.0-beta")).toBe(-1);
  });

  it("só considera atualização quando a versão é realmente maior", () => {
    expect(isNewerVersion("v0.2.0", "0.1.0")).toBe(true);
    expect(isNewerVersion("v0.1.0", "0.1.0")).toBe(false);
    expect(isNewerVersion("0.0.9", "0.1.0")).toBe(false);
    expect(isNewerVersion("invalida", "0.1.0")).toBe(false);
    expect(isNewerVersion("0.3.0-beta.1", "0.3.0")).toBe(false);
  });
});
