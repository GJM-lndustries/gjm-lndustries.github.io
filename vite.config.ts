import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

// Sitio de usuario de GitHub Pages (https://gjm-lndustries.github.io/): se sirve desde la raíz.
export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Separa librerías grandes para aprovechar mejor la caché del navegador
        manualChunks: {
          react: ["react", "react-dom", "wouter"],
          motion: ["framer-motion"],
        },
      },
    },
  },
  server: {
    port: 3000,
    strictPort: false,
  },
});
