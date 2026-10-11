import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/visual",
  outputDir: "./test-results/visual",
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:6007",
    browserName: "chromium",
    viewport: { width: 1280, height: 900 },
  },
  webServer: {
    command: "pnpm storybook --ci --host 127.0.0.1 --port 6007",
    port: 6007,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
