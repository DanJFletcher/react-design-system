import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

const themes = ["acme", "luna", "orchid", "atom", "sublime"] as const;

const meta = {
  title: "Foundations/Borders and Elevation",
  parameters: {
    docs: {
      description: {
        component:
          "Border color and width are separate roles. Use subtle, default, and strong widths for increasing emphasis. Surface, control, and overlay elevation tokens provide complete theme-owned box-shadow values, including none.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ThemeComparison: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 17rem), 1fr))",
        gap: "var(--ds-space-4)",
      }}
    >
      {themes.map((theme) => (
        <section
          key={theme}
          data-ds-theme={theme}
          data-testid={`${theme}-border-elevation`}
          aria-label={`${theme} border and elevation tokens`}
          style={{
            display: "grid",
            gap: "var(--ds-space-4)",
            alignContent: "start",
            minWidth: 0,
            padding: "var(--ds-space-4)",
            background: "var(--ds-color-canvas)",
            color: "var(--ds-color-text-primary)",
            fontFamily: "var(--ds-font-family-sans)",
          }}
        >
          <h2 style={{ margin: 0, textTransform: "capitalize" }}>{theme}</h2>
          <div
            data-testid={`${theme}-subtle-border`}
            style={{
              padding: "var(--ds-space-3)",
              border: "var(--ds-border-width-subtle) solid var(--ds-color-border-control)",
              background: "var(--ds-color-surface-primary)",
            }}
          >
            Subtle border · <code>border.width.subtle</code>
          </div>
          <div
            data-testid={`${theme}-strong-border`}
            style={{
              padding: "var(--ds-space-3)",
              border: "var(--ds-border-width-strong) solid var(--ds-color-border-strong)",
              background: "var(--ds-color-surface-primary)",
            }}
          >
            Strong border · <code>border.width.strong</code>
          </div>
          <div
            data-testid={`${theme}-surface-elevation`}
            style={{
              padding: "var(--ds-space-3)",
              border: "var(--ds-border-width-default) solid var(--ds-color-border-control)",
              background: "var(--ds-color-surface-raised)",
              boxShadow: "var(--ds-shadow-elevation-surface)",
            }}
          >
            Content surface · <code>shadow.elevation.surface</code>
          </div>
          <button
            data-testid={`${theme}-control-elevation`}
            type="button"
            style={{
              justifySelf: "start",
              padding: "var(--ds-space-2) var(--ds-space-3)",
              border: "var(--ds-border-width-default) solid var(--ds-color-border-control)",
              background: "var(--ds-color-action-secondary-bg)",
              color: "var(--ds-color-action-secondary-fg)",
              boxShadow: "var(--ds-shadow-elevation-control)",
              font: "inherit",
            }}
          >
            Interactive control · <code>shadow.elevation.control</code>
          </button>
          <div
            data-testid={`${theme}-overlay-elevation`}
            style={{
              justifySelf: "start",
              padding: "var(--ds-space-3)",
              border: "var(--ds-border-width-default) solid var(--ds-color-border-control)",
              background: "var(--ds-color-surface-overlay)",
              boxShadow: "var(--ds-shadow-elevation-overlay)",
            }}
          >
            Floating overlay · <code>shadow.elevation.overlay</code>
          </div>
        </section>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const lunaSurface = canvas.getByTestId("luna-surface-elevation");
    const atomSurface = canvas.getByTestId("atom-surface-elevation");
    const atomControl = canvas.getByTestId("atom-control-elevation");
    const lunaOverlay = canvas.getByTestId("luna-overlay-elevation");
    const atomSubtleBorder = canvas.getByTestId("atom-subtle-border");
    const atomStrongBorder = canvas.getByTestId("atom-strong-border");

    expect(getComputedStyle(lunaSurface).boxShadow).toBe("none");
    expect(getComputedStyle(atomSurface).boxShadow).not.toBe("none");
    expect(getComputedStyle(atomControl).boxShadow).not.toBe("none");
    expect(getComputedStyle(lunaOverlay).boxShadow).not.toBe("none");
    expect(getComputedStyle(atomSubtleBorder).borderTopWidth).toBe("2px");
    expect(getComputedStyle(atomStrongBorder).borderTopWidth).toBe("4px");
  },
};
