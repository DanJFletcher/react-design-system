import react from "@astrojs/react";
import { defineConfig } from "astro/config";

const basePath = (process.env.BASE_PATH ?? "/fletchstack-marketing/")
  .replace(/\/+$/, "") || "/";
const port = Number(process.env.PORT ?? 4321);

export default defineConfig({
  base: basePath,
  integrations: [react()],
  output: "static",
  trailingSlash: "always",
  outDir: "./dist/public",
  devToolbar: {
    enabled: false,
  },
  server: {
    host: "0.0.0.0",
    port,
  },
  preview: {
    host: "0.0.0.0",
    port,
  },
  vite: {
    resolve: {
      dedupe: ["react", "react-dom"],
    },
    server: {
      allowedHosts: true,
    },
    preview: {
      allowedHosts: true,
    },
  },
});
