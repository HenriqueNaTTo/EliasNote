import { copyFileSync, existsSync, mkdirSync, renameSync } from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Build exclusivo do site público (Vercel, Pages etc.).
 *
 * Diferente do `vite.config.ts` do app, esta configuração gera **somente** a
 * landing promocional, publicada como `index.html`: o shell do app desktop
 * (`index.html`) e o assistente de instalação (`setup.html`) ficam de fora.
 */

/** O site só usa o favicon de `public/`; o resto é do app (Excalidraw etc.). */
function siteEntry(): Plugin {
  return {
    name: "eliasnote-site-entry",
    apply: "build",
    // Vite nomeia o HTML pelo arquivo de origem; o site precisa dele na raiz.
    closeBundle() {
      const outDir = path.resolve(__dirname, "dist-site");
      const html = path.join(outDir, "landing.html");
      mkdirSync(outDir, { recursive: true });
      if (existsSync(html)) renameSync(html, path.join(outDir, "index.html"));
      copyFileSync(path.resolve(__dirname, "public/favicon.png"), path.join(outDir, "favicon.png"));
    },
  };
}

export default defineConfig({
  plugins: [react(), siteEntry()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Evita copiar `public/` inteiro (fontes e dados do Excalidraw, ~MBs).
  publicDir: false,
  clearScreen: false,
  envPrefix: ["VITE_", "TAURI_"],
  define: {
    "process.env.IS_PREACT": JSON.stringify("false"),
  },
  build: {
    target: "chrome110",
    outDir: "dist-site",
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 6000,
    rollupOptions: {
      // A chave define o nome do arquivo final: landing.html → index.html.
      input: { index: path.resolve(__dirname, "landing.html") },
      output: {
        manualChunks(id) {
          if (id.includes("@excalidraw")) return "excalidraw";
          if (id.includes("node_modules/react") || id.includes("node_modules/scheduler")) return "react";
          if (id.includes("@radix-ui") || id.includes("cmdk") || id.includes("sonner")) return "ui-kit";
          return undefined;
        },
      },
    },
  },
});
