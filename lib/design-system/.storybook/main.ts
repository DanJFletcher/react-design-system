import type { StorybookConfig } from "@storybook/react-vite";

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
