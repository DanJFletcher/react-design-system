import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { Spinner } from "./Spinner";

const meta = {
  title: "Components/Feedback/Spinner",
  id: "components-spinner",
  component: Spinner,
  args: {
    label: "Loading search results",
    size: "md",
  },
  argTypes: {
    label: { control: "text", description: "Accessible status name; defaults to Loading." },
    decorative: { control: "boolean", description: "Hide the indicator from assistive technology." },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status", { name: "Loading search results" })).toBeVisible();
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-5)" }}>
      <Spinner size="sm" label="Small loading indicator" />
      <Spinner size="md" label="Medium loading indicator" />
      <Spinner size="lg" label="Large loading indicator" />
    </div>
  ),
};

export const Decorative: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)" }}>
      <Spinner decorative data-testid="decorative-spinner" size="sm" />
      <span>Loading preview…</span>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("status")).toBeNull();
    await expect(canvasElement.querySelector('[data-testid="decorative-spinner"]'))
      .toHaveAttribute("aria-hidden", "true");
  },
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-3)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <section
          key={theme}
          data-ds-theme={theme}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--ds-space-3)",
            padding: "var(--ds-space-4)",
            borderRadius: "var(--ds-radius-surface)",
            backgroundColor: "var(--ds-color-canvas)",
            color: "var(--ds-color-text-primary)",
          }}
        >
          <strong>{theme}</strong>
          <Spinner label={`${theme} loading`} />
        </section>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const atomSpinner = canvasElement.querySelector<HTMLElement>(
      '[data-ds-theme="atom"] [data-ds-spinner]',
    );
    if (!atomSpinner) {
      throw new Error("Atom theme Spinner was not rendered.");
    }
    await expect(atomSpinner).toHaveStyle({ boxShadow: "none" });
  },
};
