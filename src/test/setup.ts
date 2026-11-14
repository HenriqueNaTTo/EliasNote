import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

function createMediaQueryList(query: string): MediaQueryList {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  } as unknown as MediaQueryList;
}

// jsdom não implementa estas APIs, usadas por componentes de canvas.
if (typeof window !== "undefined") {
  if (typeof window.ResizeObserver === "undefined") {
    class ResizeObserverMock {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
  }
  if (typeof window.matchMedia !== "function") {
    window.matchMedia = (query: string) => createMediaQueryList(query);
  }
  if (typeof window.requestAnimationFrame !== "function") {
    window.requestAnimationFrame = ((callback: FrameRequestCallback) =>
      setTimeout(() => callback(Date.now()), 0) as unknown as number) as typeof window.requestAnimationFrame;
  }
  if (typeof URL.createObjectURL !== "function") {
    URL.createObjectURL = () => "blob:mock";
    URL.revokeObjectURL = () => undefined;
  }
}
