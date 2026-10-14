import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const packageRoot = import.meta.dirname;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(packageRoot, "src"),
    },
  },
  build: {
    lib: {
      entry: {
        index: resolve(packageRoot, "src/index.ts"),
        theme: resolve(packageRoot, "src/theme/index.ts"),
        styles: resolve(packageRoot, "src/styles.ts"),
        tokens: resolve(packageRoot, "src/tokens-entry.ts"),
        "themes/acme": resolve(packageRoot, "src/theme-css/acme.ts"),
        "themes/luna": resolve(packageRoot, "src/theme-css/luna.ts"),
        "themes/orchid": resolve(packageRoot, "src/theme-css/orchid.ts"),
        "themes/atom": resolve(packageRoot, "src/theme-css/atom.ts"),
      },
      formats: ["es"],
    },
    cssCodeSplit: true,
    rollupOptions: {
      external: ["react", "react/jsx-runtime"],
      output: {
        entryFileNames: "[name].js",
        assetFileNames: (asset) => {
          if (!asset.name?.endsWith(".css")) return "assets/[name]-[hash][extname]";
          if (asset.name === "index.css") return "styles.css";
          if (["acme", "luna", "orchid", "atom"].some((theme) => asset.name?.includes(theme))) {
            return "themes/[name][extname]";
          }
          return "[name][extname]";
        },
      },
    },
  },
});
