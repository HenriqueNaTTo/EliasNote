import { afterEach, describe, expect, it, vi } from "vitest";
import { checkForUpdates, getUpdateState, resolveAppVersion } from "./updateService";

function mockRelease(payload: unknown, ok = true, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok,
      status,
      json: async () => payload,
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("verificação de atualizações", () => {
  it("detecta uma release mais nova que a versão instalada", async () => {
    mockRelease({
      tag_name: "v99.0.0",
      name: "EliasNote v99.0.0",
      html_url: "https://github.com/HenriqueNaTTo/EliasNote/releases/tag/v99.0.0",
      published_at: "2026-01-01T00:00:00Z",
    });

    await checkForUpdates({ force: true });
    const state = getUpdateState();

    expect(state.status).toBe("available");
    expect(state.info?.version).toBe("99.0.0");
    expect(state.info?.url).toContain("/releases/tag/v99.0.0");
    expect(state.currentVersion).toBe(await resolveAppVersion());
  });

  it("mantém o estado de atualizado quando a release é igual ou anterior", async () => {
    mockRelease({ tag_name: "v0.0.0", html_url: "https://github.com/HenriqueNaTTo/EliasNote/releases" });

    await checkForUpdates({ force: true });
    expect(getUpdateState().status).toBe("up-to-date");
    expect(getUpdateState().info).toBeNull();
  });

  it("ignora rascunhos", async () => {
    mockRelease({ tag_name: "v99.0.0", draft: true });

    await checkForUpdates({ force: true });
    expect(getUpdateState().status).toBe("up-to-date");
  });

  it("registra erro sem quebrar quando o GitHub falha", async () => {
    mockRelease({}, false, 500);

    await checkForUpdates({ force: true });
    const state = getUpdateState();
    expect(state.status).toBe("error");
    expect(state.error).toContain("500");
    expect(state.info).toBeNull();
  });
});
