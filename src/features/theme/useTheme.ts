import { useEffect } from "react";
import { useAppStore } from "@/core/store";

/** Aplica tema, cor de destaque, escala e densidade no documento. */
export function useTheme(): void {
  const theme = useAppStore((state) => state.settings.theme);
  const accent = useAppStore((state) => state.settings.accent);
  const density = useAppStore((state) => state.settings.density);
  const uiScale = useAppStore((state) => state.settings.uiScale);
  const animations = useAppStore((state) => state.settings.animations);

  useEffect(() => {
    const root = document.documentElement;
    const query =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;

    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && Boolean(query?.matches));
      root.classList.toggle("dark", dark);
      root.dataset.accent = accent;
      root.dataset.density = density;
      root.dataset.animations = animations ? "on" : "off";
      root.style.fontSize = `${Math.round(16 * uiScale)}px`;
      const meta = document.querySelector('meta[name="color-scheme"]');
      if (meta) meta.setAttribute("content", dark ? "dark" : "light");
    };

    apply();
    if (!query) return;
    const listener = () => {
      if (theme === "system") apply();
    };
    if (typeof query.addEventListener === "function") query.addEventListener("change", listener);
    else query.addListener(listener);
    return () => {
      if (typeof query.removeEventListener === "function") query.removeEventListener("change", listener);
      else query.removeListener(listener);
    };
  }, [theme, accent, density, uiScale, animations]);
}
