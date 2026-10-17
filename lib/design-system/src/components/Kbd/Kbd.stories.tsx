import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { Kbd, type KbdShape, type KbdSize } from "./Kbd";

const sizes: KbdSize[] = ["sm", "md"];
const shapes: KbdShape[] = ["square", "rounded"];

const meta = {
  title: "Components/Identity/Kbd",
  id: "components-kbd",
  component: Kbd,
  args: {
    children: "Ctrl",
    size: "md",
    shape: "square",
  },
  argTypes: {
    children: { control: "text" },
    size: { control: "select", options: sizes },
    shape: { control: "select", options: shapes },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const key = canvas.getByText("Ctrl");

    await expect(key).toHaveAttribute("data-size", "md");
    await expect(key).toHaveAttribute("data-shape", "square");
    await expect(key).toBeVisible();
  },
};

export const ShortcutExamples: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-3)" }}>
      <p>Press <Kbd>⌘</Kbd> + <Kbd>K</Kbd> to search.</p>
      <p>Press <Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>P</Kbd> to open the command menu.</p>
      <p>Press <Kbd>Esc</Kbd> to close the dialog.</p>
    </div>
  ),
};

export const SizeAndShapeExamples: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--ds-space-3)" }}>
      {sizes.map((size) =>
        shapes.map((shape) => (
          <Kbd key={`${size}-${shape}`} size={size} shape={shape}>
            {`${size} ${shape}`}
          </Kbd>
        )),
      )}
    </div>
  ),
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-3)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <section
          aria-label={`${theme} theme`}
          data-ds-theme={theme}
          key={theme}
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "var(--ds-space-2)",
            padding: "var(--ds-space-3)",
            backgroundColor: "var(--ds-color-canvas)",
            color: "var(--ds-color-text-primary)",
          }}
        >
          <strong>{theme}</strong>
          <Kbd>⌘</Kbd>
          <span aria-hidden="true">+</span>
          <Kbd>K</Kbd>
          <Kbd shape="rounded" size="sm">Esc</Kbd>
        </section>
      ))}
    </div>
  ),
};
