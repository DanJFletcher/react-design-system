import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { ToggleGroup, type ToggleGroupItem } from "./ToggleGroup";

const layoutItems: ToggleGroupItem[] = [
  { value: "grid", label: "Grid" },
  { value: "list", label: "List" },
  { value: "map", label: "Map" },
];

const meta = {
  title: "Components/Actions/Toggle group",
  id: "components-toggle-group",
  component: ToggleGroup,
  args: {
    "aria-label": "View mode",
    items: layoutItems,
    selectionMode: "single",
    defaultValue: "grid",
    spacing: "none",
    appearance: "joined",
    variant: "secondary",
    size: "md",
    onValueChange: fn(),
  },
  argTypes: {
    items: { control: false },
    selectionMode: { control: "inline-radio", options: ["single", "multiple"] },
    value: { control: false },
    defaultValue: { control: false },
    onValueChange: { control: false },
    allowEmpty: { control: "boolean" },
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
      <ToggleGroup {...args} />
    </div>
  ),
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("group", { name: "View mode" });
    const grid = canvas.getByRole("button", { name: "Grid" });
    const list = canvas.getByRole("button", { name: "List" });

    await expect(group).toHaveAttribute("data-selection-mode", "single");
    await expect(grid).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(list);
    await expect(list).toHaveAttribute("aria-pressed", "true");
    await expect(grid).toHaveAttribute("aria-pressed", "false");
    await expect(args.onValueChange).toHaveBeenCalledWith("list");
  },
};

export const MultipleSelection: Story = {
  args: {
    "aria-label": "Text formatting",
    items: [
      { value: "bold", label: <strong>Bold</strong> },
      { value: "italic", label: <em>Italic</em> },
      { value: "underline", label: <u>Underline</u> },
    ],
    selectionMode: "multiple",
    defaultValue: ["bold"],
    spacing: "sm",
    appearance: "separated",
    onValueChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const bold = canvas.getByRole("button", { name: "Bold" });
    const italic = canvas.getByRole("button", { name: "Italic" });

    await expect(bold).toHaveAttribute("aria-pressed", "true");
    await expect(italic).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(italic);
    await expect(italic).toHaveAttribute("aria-pressed", "true");
    await expect(args.onValueChange).toHaveBeenCalledWith(["bold", "italic"]);
    await userEvent.click(bold);
    await expect(bold).toHaveAttribute("aria-pressed", "false");
    await expect(italic).toHaveAttribute("aria-pressed", "true");
  },
};

export const ControlledSingleSelection: Story = {
  args: {
    "aria-label": "Calendar range",
    items: [
      { value: "week", label: "Week" },
      { value: "month", label: "Month" },
      { value: "year", label: "Year" },
    ],
    selectionMode: "single",
    defaultValue: undefined,
    value: "week",
    onValueChange: undefined,
  },
  render: () => {
    const ControlledExample = () => {
      const [value, setValue] = useState<string | null>("week");
      return (
        <div style={{ display: "grid", gap: "var(--ds-space-2)", justifyItems: "start" }}>
          <ToggleGroup
            aria-label="Calendar range"
            items={[
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
              { value: "year", label: "Year" },
            ]}
            selectionMode="single"
            value={value}
            onValueChange={setValue}
            appearance="joined"
            variant="secondary"
          />
          <span aria-live="polite">Selected range: {value ?? "none"}</span>
        </div>
      );
    };
    return <ControlledExample />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const month = canvas.getByRole("button", { name: "Month" });
    await userEvent.click(month);
    await expect(month).toHaveAttribute("aria-pressed", "true");
    await expect(canvas.getByText("Selected range: month")).toBeInTheDocument();
  },
};

export const RequiredSingleSelection: Story = {
  args: {
    "aria-label": "View mode",
    allowEmpty: false,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const grid = canvas.getByRole("button", { name: "Grid" });
    await userEvent.click(grid);
    await expect(grid).toHaveAttribute("aria-pressed", "true");
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const DisabledOption: Story = {
  args: {
    "aria-label": "Project status",
    items: [
      { value: "draft", label: "Draft" },
      { value: "review", label: "In review", disabled: true },
      { value: "published", label: "Published" },
    ],
    defaultValue: "draft",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const review = canvas.getByRole("button", { name: "In review" });
    await expect(review).toBeDisabled();
    await expect(canvas.getByRole("button", { name: "Draft" })).toHaveAttribute("aria-pressed", "true");
  },
};

export const DisabledGroup: Story = {
  args: {
    "aria-label": "Disabled view mode",
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const buttons = within(canvasElement).getAllByRole("button");
    await expect(buttons).toHaveLength(3);
    for (const button of buttons) await expect(button).toBeDisabled();
  },
};

export const LabelledBy: Story = {
  args: {
    "aria-label": undefined,
    "aria-labelledby": "toggle-group-label",
  },
  render: (args) => (
    <div>
      <span id="toggle-group-label">Display as</span>
      <ToggleGroup {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("group", { name: "Display as" })).toBeVisible();
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
          <ToggleGroup
            aria-label={`${theme} display mode`}
            items={layoutItems}
            defaultValue="grid"
            variant="secondary"
            appearance="joined"
          />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const selected = within(canvasElement).getAllByRole("button", { name: "Grid" });
    await expect(selected).toHaveLength(5);
    for (const button of selected) await expect(button).toHaveAttribute("aria-pressed", "true");
  },
};
