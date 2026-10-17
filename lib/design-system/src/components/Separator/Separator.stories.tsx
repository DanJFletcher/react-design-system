import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { Separator } from "./Separator";

const meta = {
  title: "Foundations/Layout helpers/Separator",
  id: "components-separator",
  component: Separator,
  args: {
    orientation: "horizontal",
    decorative: true,
    length: "full",
    spacing: "md",
    variant: "solid",
  },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    decorative: { control: "boolean" },
    length: { control: "inline-radio", options: ["full", "inset", "short"] },
    spacing: { control: "inline-radio", options: ["none", "sm", "md", "lg"] },
    variant: { control: "inline-radio", options: ["solid", "dashed", "dotted"] },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <Separator {...args} data-testid="playground-separator" />,
  play: async ({ canvasElement }) => {
    const separator = within(canvasElement).getByTestId("playground-separator");
    await expect(separator).toHaveAttribute("aria-hidden", "true");
    await expect(separator).toHaveAttribute("data-orientation", "horizontal");
  },
};

export const SemanticSeparator: Story = {
  args: {
    decorative: false,
    "aria-label": "Page actions",
    spacing: "sm",
  },
  play: async ({ canvasElement }) => {
    const separator = within(canvasElement).getByRole("separator", { name: "Page actions" });
    await expect(separator).toHaveAttribute("aria-orientation", "horizontal");
    await expect(separator).not.toHaveAttribute("aria-hidden");
  },
};

export const VerticalSeparator: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "stretch",
        blockSize: "10rem",
        gap: "var(--ds-space-3)",
      }}
    >
      <span>Primary navigation</span>
      <Separator
        aria-label="Primary and secondary navigation"
        data-testid="vertical-separator"
        decorative={false}
        orientation="vertical"
        length="inset"
        spacing="sm"
      />
      <span>Secondary navigation</span>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const separator = within(canvasElement).getByRole("separator", {
      name: "Primary and secondary navigation",
    });
    await expect(separator).toHaveAttribute("aria-orientation", "vertical");
    await expect(separator.getBoundingClientRect().height).toBeGreaterThan(0);
  },
};

export const LengthAndStyleOptions: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-3)", inlineSize: "24rem", maxInlineSize: "100%" }}>
      <Separator data-testid="full-separator" length="full" spacing="none" />
      <Separator data-testid="inset-separator" length="inset" spacing="none" />
      <Separator data-testid="short-separator" length="short" spacing="none" />
      <Separator data-testid="dashed-separator" variant="dashed" spacing="none" />
      <Separator data-testid="dotted-separator" variant="dotted" spacing="none" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fullWidth = canvas.getByTestId("full-separator").getBoundingClientRect().width;
    const insetWidth = canvas.getByTestId("inset-separator").getBoundingClientRect().width;
    const shortWidth = canvas.getByTestId("short-separator").getBoundingClientRect().width;
    await expect(fullWidth).toBeGreaterThan(insetWidth);
    await expect(insetWidth).toBeGreaterThan(shortWidth);
    await expect(getComputedStyle(canvas.getByTestId("dashed-separator")).borderBlockStartStyle).toBe("dashed");
    await expect(getComputedStyle(canvas.getByTestId("dotted-separator")).borderBlockStartStyle).toBe("dotted");
  },
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <div
          data-ds-theme={theme}
          key={theme}
          style={{
            display: "grid",
            gap: "var(--ds-space-2)",
            padding: "var(--ds-space-4)",
            background: "var(--ds-color-canvas)",
            color: "var(--ds-color-text-primary)",
          }}
        >
          <strong>{theme}</strong>
          <Separator decorative={false} aria-label={`${theme} section divider`} />
        </div>
      ))}
    </div>
  ),
};
