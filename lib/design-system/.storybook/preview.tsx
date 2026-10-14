import type { Decorator, Preview } from "@storybook/react";
import { useLayoutEffect } from "react";
import "../src/generated/tokens.css";
import "../src/components/Button/Button.module.css";
import "../src/generated/themes/acme.css";
import "../src/generated/themes/luna.css";
import "../src/generated/themes/orchid.css";
import "../src/generated/themes/atom.css";
import "../src/theme-css/sublime";
import "../src/theme-css/atom.css";
import "./preview.css";

type MotionPreference = "system" | "reduced" | "full";

function MotionPreferenceBridge({ preference }: { preference: MotionPreference }) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const previousPreference = root.getAttribute("data-ds-motion-preference");

    if (preference === "system") {
      root.removeAttribute("data-ds-motion-preference");
    } else {
      root.setAttribute("data-ds-motion-preference", preference);
    }

    return () => {
      if (previousPreference === null) {
        root.removeAttribute("data-ds-motion-preference");
      } else {
        root.setAttribute("data-ds-motion-preference", previousPreference);
      }
    };
  }, [preference]);

  return null;
}

const withTheme: Decorator = (Story, context) => {
  const activeTheme = context.globals.theme;
  const theme =
    activeTheme === "luna" || activeTheme === "orchid" || activeTheme === "atom" || activeTheme === "sublime"
      ? activeTheme
      : "acme";
  const activeMotion = context.globals.motion;
  const motionPreference: MotionPreference =
    activeMotion === "reduced" || activeMotion === "full" ? activeMotion : "system";
  return (
    <div className="storybook-canvas" data-ds-theme={theme}>
      <MotionPreferenceBridge preference={motionPreference} />
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
          { value: "sublime", title: "Sublime" },
        ],
        dynamicTitle: true,
      },
    },
    motion: {
      description: "Preview motion using the operating-system preference or a Storybook-only override.",
      defaultValue: "system",
      toolbar: {
        title: "Motion",
        icon: "play",
        items: [
          { value: "system", title: "System preference" },
          { value: "reduced", title: "Reduced motion" },
          { value: "full", title: "Full motion" },
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
