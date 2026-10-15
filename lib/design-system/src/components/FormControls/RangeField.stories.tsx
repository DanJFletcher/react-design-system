import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, fireEvent, fn, within } from "storybook/test";
import { RangeField } from "./RangeField";

const meta = {
  title: "Components/Range field",
  component: RangeField,
  args: {
    label: "Project budget",
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 50,
    onValueChange: fn(),
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    error: { control: "text" },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    value: { control: false },
    defaultValue: { control: "number" },
    formatValue: { control: false },
    getAriaValueText: { control: false },
    onValueChange: { control: false },
    onChange: { control: false },
    className: { control: false },
    style: { control: false },
  },
  render: (args) => (
    <div style={{ width: "32rem", maxWidth: "100%" }}>
      <RangeField {...args} />
    </div>
  ),
} satisfies Meta<typeof RangeField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole("slider", { name: "Project budget" });
    await expect(slider).toHaveAttribute("min", "0");
    await expect(slider).toHaveAttribute("max", "100");
    await expect(slider).toHaveAttribute("step", "5");
    await expect(slider).toHaveValue("50");
    await expect(canvas.getByText("50", { exact: true })).toBeVisible();

    fireEvent.change(slider, { target: { value: "55" } });
    await expect(slider).toHaveValue("55");
    await expect(canvas.getByText("55", { exact: true })).toBeVisible();
    await expect(args.onValueChange).toHaveBeenCalledWith(55);
  },
};

export const KeyboardNative: Story = {
  args: {
    label: "Keyboard adjustable budget",
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 50,
  },
};

function ControlledBudgetExample() {
  const [value, setValue] = useState(250);

  return (
    <div style={{ display: "grid", gap: "var(--ds-space-3)", maxWidth: "32rem" }}>
      <RangeField
        label="Moving budget"
        min={0}
        max={1000}
        step={50}
        name="movingBudget"
        value={value}
        onValueChange={setValue}
        formatValue={(nextValue) => `$${nextValue.toLocaleString("en-CA")}`}
        getAriaValueText={(nextValue) => `${nextValue} Canadian dollars`}
        description="Adjust the estimate in $50 increments."
      />
      <span aria-live="polite">Current estimate: ${value.toLocaleString("en-CA")}</span>
    </div>
  );
}

export const ControlledAndFormatted: Story = {
  render: () => <ControlledBudgetExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole("slider", { name: "Moving budget" });
    await expect(slider).toHaveValue("250");
    await expect(slider).toHaveAttribute("aria-valuetext", "250 Canadian dollars");
    await expect(canvas.getByText("$250", { exact: true })).toBeVisible();

    fireEvent.change(slider, { target: { value: "300" } });
    await expect(slider).toHaveValue("300");
    await expect(slider).toHaveAttribute("aria-valuetext", "300 Canadian dollars");
    await expect(canvas.getByText("$300", { exact: true })).toBeVisible();
    await expect(canvas.getByText("Current estimate: $300")).toBeVisible();
  },
};

export const DisabledAndInvalid: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-5)", maxWidth: "32rem" }}>
      <RangeField
        label="Delivery radius"
        min={0}
        max={100}
        step={5}
        defaultValue={25}
        disabled
        description="This option is unavailable for the selected service."
      />
      <RangeField
        label="Minimum service fee"
        min={0}
        max={500}
        step={25}
        defaultValue={100}
        error="Choose a fee that meets the minimum."
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("slider", { name: "Delivery radius" })).toBeDisabled();

    const fee = canvas.getByRole("slider", { name: "Minimum service fee" });
    await expect(fee).toHaveAttribute("aria-invalid", "true");
    await expect(fee).toHaveAttribute("aria-describedby", expect.stringContaining("error"));
  },
};

const themes = ["acme", "luna", "orchid", "atom", "sublime"] as const;

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      {themes.map((theme) => (
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
          <RangeField
            label={`${theme} service budget`}
            min={0}
            max={100}
            step={10}
            defaultValue={60}
          />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const sliders = within(canvasElement).getAllByRole("slider");
    await expect(sliders).toHaveLength(themes.length);
    for (const slider of sliders) await expect(slider).toBeVisible();
  },
};

export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl" style={{ width: "32rem", maxWidth: "100%" }}>
      <RangeField
        label="ميزانية النقل"
        description="اختر ميزانية تقريبية."
        min={0}
        max={1000}
        step={50}
        defaultValue={500}
        formatValue={(value) => `${value} $`}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("slider", { name: "ميزانية النقل" })).toHaveValue("500");
  },
};
