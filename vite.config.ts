import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host ? { protocol: "ws", host, port: 1421 } : undefined,
    watch: { ignored: ["**/src-tauri/**"] },
  },
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    target: "chrome110",
    sourcemap: false,
    chunkSizeWarningLimit: 6000,
    rollupOptions: {
      // Duas entradas: o app desktop (index.html) e a landing page de divulgação.
      input: {
        main: path.resolve(__dirname, "index.html"),
        landing: path.resolve(__dirname, "landing.html"),
        setup: path.resolve(__dirname, "setup.html"),
      },
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
  define: {
    "process.env.IS_PREACT": JSON.stringify("false"),
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: false,
    restoreMocks: true,
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
