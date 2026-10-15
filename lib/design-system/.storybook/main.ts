import type { StorybookConfig } from "@storybook/react-vite";
import { breakpointMediaVitePlugin } from "../src/plugins/breakpoint-media.js";

const config: StorybookConfig = {
  stories: [
    "../src/**/*.stories.@(ts|tsx)",
    "../src/**/*.docs.mdx",
    "../stories/**/*.mdx",
  ],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"],
  core: {
    allowedHosts: true,
  },
  viteFinal: async (config) => ({
    ...config,
    plugins: [...(config.plugins ?? []), breakpointMediaVitePlugin()],
    server: {
      ...config.server,
      allowedHosts: true,
    },
  }),
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
};

export default config;
