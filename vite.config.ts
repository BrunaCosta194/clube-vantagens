import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Bibliotecas em arquivos separados: mudam pouco, então o celular
        // guarda no cache e não baixa de novo a cada deploy do site.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (/[\/](react|react-dom|react-router|react-router-dom|scheduler)[\/]/.test(id)) return "react";
          if (/[\/](framer-motion|motion-dom|motion-utils)[\/]/.test(id)) return "motion";
          if (id.includes("@supabase")) return "supabase";
        },
      },
    },
  },
});
