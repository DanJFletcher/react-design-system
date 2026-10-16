import { resolve } from "node:path";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: ["src/components/**/*.tsx"],
      exclude: ["src/components/**/*.stories.tsx", "src/components/**/*.test.tsx"],
      reportsDirectory: resolve(import.meta.dirname, "../../coverage/design-system"),
      reporter: ["text", "html", "json-summary"],
    },
    projects: [
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: resolve(import.meta.dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          setupFiles: [resolve(import.meta.dirname, ".storybook/vitest.setup.ts")],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
        },
      },
      {
        extends: true,
        test: {
          name: "unit",
          include: ["src/components/**/*.test.{ts,tsx}"],
          environment: "jsdom",
          setupFiles: [resolve(import.meta.dirname, "tests/unit/setup.ts")],
        },
      },
    ],
  },
});
