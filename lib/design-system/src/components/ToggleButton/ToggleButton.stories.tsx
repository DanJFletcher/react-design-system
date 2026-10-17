import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { ButtonGroup } from "../ButtonGroup/ButtonGroup";
import { Icon } from "../Icon/Icon";
import { ToggleButton } from "./ToggleButton";

const meta = {
  title: "Components/Actions/Toggle button",
  id: "components-togglebutton",
  component: ToggleButton,
  args: {
    children: "Bold",
    variant: "secondary",
  },
  argTypes: {
    pressed: { control: "boolean" },
    defaultPressed: { control: "boolean" },
    variant: { control: "inline-radio", options: ["primary", "secondary", "ghost", "destructive"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: { control: "inline-radio", options: ["rounded", "square", "pill"] },
    fullWidth: { control: "boolean" },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
    onPressedChange: { control: false },
    onClick: { control: false },
  },
} satisfies Meta<typeof ToggleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    children: "Bold",
    defaultPressed: false,
    onPressedChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Bold" });
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(args.onPressedChange).toHaveBeenCalledWith(true);
    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-pressed", "false");
  },
};

export const Controlled: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Mark complete" });
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(canvas.getByText("Task complete")).toBeInTheDocument();
  },
  render: () => {
    const ControlledExample = () => {
      const [pressed, setPressed] = useState(false);
      return (
        <div style={{ display: "grid", gap: "var(--ds-space-2)", justifyItems: "start" }}>
          <ToggleButton
            aria-label="Mark complete"
            icon={<Icon name="check" />}
            iconOnly
            pressed={pressed}
            onPressedChange={setPressed}
            variant="ghost"
          />
          <span aria-live="polite">Task {pressed ? "complete" : "not complete"}</span>
        </div>
      );
    };
    return <ControlledExample />;
  },
};

export const ToolbarGroup: Story = {
  render: () => (
    <ButtonGroup aria-label="Text formatting" spacing="sm">
      <ToggleButton aria-label="Bold" variant="ghost"><strong>B</strong></ToggleButton>
      <ToggleButton aria-label="Italic" variant="ghost"><em>I</em></ToggleButton>
      <ToggleButton aria-label="Underline" variant="ghost"><u>U</u></ToggleButton>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bold = canvas.getByRole("button", { name: "Bold" });
    const italic = canvas.getByRole("button", { name: "Italic" });
    await userEvent.click(bold);
    await userEvent.click(italic);
    await expect(bold).toHaveAttribute("aria-pressed", "true");
    await expect(italic).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(bold);
    await userEvent.click(italic);
    await expect(bold).toHaveAttribute("aria-pressed", "false");
    await expect(italic).toHaveAttribute("aria-pressed", "false");
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
            display: "flex",
            alignItems: "center",
            gap: "var(--ds-space-3)",
            padding: "var(--ds-space-4)",
            background: "var(--ds-color-canvas)",
            color: "var(--ds-color-text-primary)",
          }}
        >
          <strong>{theme}</strong>
          <ToggleButton defaultPressed>Selected</ToggleButton>
          <ToggleButton variant="ghost">Not selected</ToggleButton>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const selected = within(canvasElement).getAllByRole("button", { name: "Selected" });
    await expect(selected).toHaveLength(5);
    for (const button of selected) {
      await expect(button).toHaveAttribute("aria-pressed", "true");
      await expect(getComputedStyle(button).borderColor).not.toBe("rgba(0, 0, 0, 0)");
    }
  },
};
