import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

// El sitio se sirve desde la raíz del dominio (ver src/config/site.ts).
export default defineConfig(({ isSsrBuild }) => ({
  base: "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  build: {
    outDir: isSsrBuild ? "dist-ssr" : "dist",
    emptyOutDir: true,
    rollupOptions: {
      // Separa librerías grandes para aprovechar mejor la caché del navegador
      // (no aplica al build de prerender, que corre en Node).
      output: isSsrBuild
        ? {}
        : {
            manualChunks(id: string) {
              if (/[\\/]node_modules[\\/](react|react-dom|scheduler|wouter)[\\/]/.test(id)) return "react";
              if (/[\\/]node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/.test(id)) return "motion";
            },
          },
    },
  },
  server: {
    port: 3000,
    strictPort: false,
  },
}));
