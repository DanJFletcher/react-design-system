import type { Decorator, Preview } from "@storybook/react";
import "../src/generated/tokens.css";
import "../src/components/Button/Button.module.css";
import "../src/generated/themes/acme.css";
import "../src/generated/themes/luna.css";
import "../src/generated/themes/orchid.css";
import "../src/theme-css/atom";
import "./preview.css";

const withTheme: Decorator = (Story, context) => {
  const activeTheme = context.globals.theme;
  const theme =
    activeTheme === "luna" || activeTheme === "orchid" || activeTheme === "atom"
      ? activeTheme
      : "acme";
  return (
    <div className="storybook-canvas" data-ds-theme={theme}>
      <Story />
    </div>
  );
};

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Choose a design-system theme",
      defaultValue: "acme",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: [
          { value: "acme", title: "ACME" },
          { value: "luna", title: "Luna" },
          { value: "orchid", title: "Orchid" },
          { value: "atom", title: "Atom" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withTheme],
  parameters: {
    a11y: {
      test: "error",
    },
    controls: {
      expanded: true,
    },
    options: {
      storySort: {
        order: ["Foundations", "Components"],
      },
    },
  },
};

export default preview;
