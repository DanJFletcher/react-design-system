import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { Button } from "../Button/Button";
import { ToggleButton } from "../ToggleButton/ToggleButton";
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
    appearance: "separated",
    disabled: false,
  },
  argTypes: {
    children: { control: false },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    spacing: { control: "inline-radio", options: ["none", "sm", "md", "lg"] },
    alignment: { control: "inline-radio", options: ["start", "center", "end"] },
    appearance: { control: "inline-radio", options: ["separated", "joined"] },
    variant: { control: "inline-radio", options: ["primary", "secondary", "ghost", "destructive"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
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

export const JoinedActions: Story = {
  args: {
    appearance: "joined",
    variant: "secondary",
    size: "md",
    spacing: "lg",
  },
  render: (args) => (
    <div style={{ width: "32rem", maxWidth: "100%" }}>
      <ButtonGroup {...args}>
        <Button>Copy</Button>
        <Button>Save</Button>
        <Button>Export</Button>
      </ButtonGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("group", { name: "Page actions" });
    const buttons = canvas.getAllByRole("button");
    await expect(group).toHaveAttribute("data-appearance", "joined");
    await expect(getComputedStyle(group).gap).toBe("0px");
    await expect(buttons[0]).toHaveAttribute("data-ds-button-variant", "secondary");
    await expect(buttons[1]).toHaveAttribute("data-ds-button-variant", "secondary");
    await expect(buttons[2]).toHaveAttribute("data-ds-button-variant", "secondary");
    await expect(getComputedStyle(buttons[0]).borderTopRightRadius).toBe("0px");
    await expect(getComputedStyle(buttons[2]).borderTopLeftRadius).toBe("0px");
  },
};

export const GroupDefaults: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      <ButtonGroup
        aria-label="Small actions"
        appearance="joined"
        size="sm"
        variant="secondary"
      >
        <Button>Small</Button>
        <Button>Small</Button>
        <Button>Small</Button>
      </ButtonGroup>
      <ButtonGroup
        aria-label="Large actions"
        appearance="joined"
        size="lg"
        variant="secondary"
      >
        <Button>Large</Button>
        <Button>Large</Button>
        <Button>Large</Button>
      </ButtonGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const smallGroup = within(canvas.getByRole("group", { name: "Small actions" }));
    const largeGroup = within(canvas.getByRole("group", { name: "Large actions" }));
    const smallButtons = smallGroup.getAllByRole("button");
    const largeButtons = largeGroup.getAllByRole("button");
    await expect(smallButtons).toHaveLength(3);
    await expect(largeButtons).toHaveLength(3);
    await expect(smallButtons[0]!.getBoundingClientRect().height)
      .toBeLessThan(largeButtons[0]!.getBoundingClientRect().height);
  },
};

export const JoinedVerticalActions: Story = {
  args: {
    orientation: "vertical",
    appearance: "joined",
    variant: "secondary",
    size: "sm",
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button>Save draft</Button>
      <Button>Preview</Button>
      <Button>Publish</Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("group", { name: "Page actions" });
    const buttons = canvas.getAllByRole("button");
    await expect(getComputedStyle(group).flexDirection).toBe("column");
    await expect(getComputedStyle(group).gap).toBe("0px");
    await expect(getComputedStyle(buttons[0]).borderBottomLeftRadius).toBe("0px");
    await expect(getComputedStyle(buttons[2]).borderTopLeftRadius).toBe("0px");
  },
};

export const DisabledJoinedActions: Story = {
  render: () => (
    <ButtonGroup
      aria-label="Disabled actions"
      appearance="joined"
      disabled
      size="sm"
      variant="secondary"
    >
      <Button>Copy</Button>
      <ToggleButton disabled={false}>Pin</ToggleButton>
      <Button>Export</Button>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const buttons = within(canvasElement).getAllByRole("button");
    await expect(buttons).toHaveLength(3);
    for (const button of buttons) await expect(button).toBeDisabled();
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
          <ButtonGroup
            aria-label={`${theme} grouped actions`}
            appearance="joined"
            spacing="none"
            variant="secondary"
          >
            <Button>Copy</Button>
            <Button>Save</Button>
            <Button>Export</Button>
          </ButtonGroup>
        </div>
      ))}
    </div>
  ),
};
