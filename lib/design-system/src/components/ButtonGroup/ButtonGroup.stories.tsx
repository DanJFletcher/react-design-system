import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { Button } from "../Button/Button";
import { ButtonGroup } from "./ButtonGroup";

const meta = {
  title: "Components/Button group",
  component: ButtonGroup,
  args: {
    "aria-label": "Page actions",
    orientation: "horizontal",
    spacing: "sm",
    alignment: "start",
    fullWidth: false,
    equalWidth: false,
    wrap: false,
  },
  argTypes: {
    children: { control: false },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    spacing: { control: "inline-radio", options: ["none", "sm", "md", "lg"] },
    alignment: { control: "inline-radio", options: ["start", "center", "end"] },
    fullWidth: { control: "boolean" },
    equalWidth: { control: "boolean" },
    wrap: { control: "boolean" },
    className: { control: false },
    style: { control: false },
  },
  render: (args) => (
    <div style={{ width: "32rem", maxWidth: "100%" }}>
      <ButtonGroup {...args}>
        <Button>Save draft</Button>
        <Button variant="secondary">Preview</Button>
        <Button variant="ghost">Publish</Button>
      </ButtonGroup>
    </div>
  ),
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("group", { name: "Page actions" });
    await expect(group).toBeVisible();
    await expect(getComputedStyle(group).flexDirection).toBe("row");
    await expect(canvas.getAllByRole("button")).toHaveLength(3);
  },
};

export const VerticalActions: Story = {
  args: {
    orientation: "vertical",
    alignment: "start",
    spacing: "md",
  },
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole("group", { name: "Page actions" });
    await expect(getComputedStyle(group).flexDirection).toBe("column");
  },
};

export const EqualWidthActions: Story = {
  args: {
    fullWidth: true,
    equalWidth: true,
    spacing: "sm",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole("button");
    const widths = buttons.map((button) => button.getBoundingClientRect().width);
    await expect(widths.every((width) => Math.abs(width - widths[0]!) < 1)).toBe(true);
  },
};

export const CenteredAndWrapped: Story = {
  args: {
    alignment: "center",
    fullWidth: true,
    wrap: true,
    spacing: "md",
  },
  render: (args) => (
    <div style={{ width: "18rem", maxWidth: "100%" }}>
      <ButtonGroup {...args}>
        <Button>Save draft</Button>
        <Button variant="secondary">Preview changes</Button>
        <Button variant="ghost">Publish page</Button>
      </ButtonGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole("group", { name: "Page actions" });
    await expect(getComputedStyle(group).flexWrap).toBe("wrap");
    await expect(getComputedStyle(group).justifyContent).toBe("center");
  },
};

export const LabelledBy: Story = {
  render: () => (
    <div>
      <span id="toolbar-label">Document actions</span>
      <ButtonGroup aria-labelledby="toolbar-label" spacing="none">
        <Button variant="ghost">Back</Button>
        <Button variant="ghost">Forward</Button>
      </ButtonGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("group", { name: "Document actions" })).toBeVisible();
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
            padding: "var(--ds-space-4)",
            background: "var(--ds-color-canvas)",
            color: "var(--ds-color-text-primary)",
          }}
        >
          <ButtonGroup aria-label={`${theme} page actions`} spacing="sm">
            <Button>Save draft</Button>
            <Button variant="secondary">Preview</Button>
            <Button variant="ghost">Publish</Button>
          </ButtonGroup>
        </div>
      ))}
    </div>
  ),
};
