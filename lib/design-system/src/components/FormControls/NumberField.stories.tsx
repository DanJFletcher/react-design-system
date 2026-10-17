import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { NumberField } from "./NumberField";

const meta = {
  title: "Components/Number field",
  component: NumberField,
  args: {
    label: "Quantity",
    min: 1,
    max: 20,
    step: 1,
    defaultValue: 4,
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    error: { control: "text" },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    showSteppers: { control: "boolean" },
    value: { control: false },
    defaultValue: { control: "number" },
    decrementLabel: { control: "text" },
    incrementLabel: { control: "text" },
    onChange: { control: false },
    className: { control: false },
  },
  render: (args) => (
    <div style={{ width: "32rem", maxWidth: "100%" }}>
      <NumberField {...args} />
    </div>
  ),
} satisfies Meta<typeof NumberField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton", { name: "Quantity" });
    await expect(input).toHaveAttribute("min", "1");
    await expect(input).toHaveAttribute("max", "20");
    await expect(input).toHaveAttribute("step", "1");
    await expect(input).toHaveValue(4);
  },
};

export const WithStepControls: Story = {
  args: {
    label: "Guests",
    min: 0,
    max: 12,
    step: 2,
    defaultValue: 4,
    showSteppers: true,
    description: "Choose an even number of guests.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton", { name: "Guests" });
    const decrease = canvas.getByRole("button", { name: "Guests Decrease" });
    const increase = canvas.getByRole("button", { name: "Guests Increase" });

    await expect(input).toHaveAttribute("aria-describedby", expect.stringContaining("description"));
    await userEvent.tab();
    await userEvent.tab();
    await expect(decrease).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(input).toHaveValue(2);
    await userEvent.tab();
    await expect(increase).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(input).toHaveValue(4);
  },
};

export const FractionalStepControls: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)", width: "32rem", maxWidth: "100%" }}>
      <NumberField
        label="Fractional amount"
        min={0.1}
        max={0.65}
        step={0.2}
        defaultValue={0.3}
        showSteppers
      />
      <NumberField
        label="Fractional range"
        min={0.15}
        max={0.85}
        step={0.3}
        defaultValue={0.45}
        showSteppers
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const amount = canvas.getByRole("spinbutton", { name: "Fractional amount" }) as HTMLInputElement;
    const amountIncrease = canvas.getByRole("button", { name: "Fractional amount Increase" });
    const amountDecrease = canvas.getByRole("button", { name: "Fractional amount Decrease" });

    await userEvent.click(amountIncrease);
    await expect(amount).toHaveValue(0.5);
    await expect(amount.validity.valid).toBe(true);

    // The next valid step, 0.7, would exceed max=0.65.
    await userEvent.click(amountIncrease);
    await expect(amount).toHaveValue(0.5);
    await expect(amount.validity.rangeOverflow).toBe(false);
    await expect(amount.validity.stepMismatch).toBe(false);

    await userEvent.click(amountDecrease);
    await expect(amount).toHaveValue(0.3);
    await userEvent.click(amountDecrease);
    await expect(amount).toHaveValue(0.1);
    await expect(amount.validity.rangeUnderflow).toBe(false);

    const range = canvas.getByRole("spinbutton", { name: "Fractional range" }) as HTMLInputElement;
    const rangeIncrease = canvas.getByRole("button", { name: "Fractional range Increase" });
    const rangeDecrease = canvas.getByRole("button", { name: "Fractional range Decrease" });

    await userEvent.click(rangeIncrease);
    await expect(range).toHaveValue(0.75);
    await expect(range.validity.valid).toBe(true);

    // The next valid step, 1.05, is above max=0.85 and must not be applied.
    await userEvent.click(rangeIncrease);
    await expect(range).toHaveValue(0.75);
    await expect(range.validity.rangeOverflow).toBe(false);

    await userEvent.click(rangeDecrease);
    await expect(range).toHaveValue(0.45);
    await userEvent.click(rangeDecrease);
    await expect(range).toHaveValue(0.15);
    await expect(range.validity.rangeUnderflow).toBe(false);
    await expect(range.validity.stepMismatch).toBe(false);
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
          <NumberField
            label={`${theme} quantity`}
            min={0}
            max={10}
            defaultValue={3}
            showSteppers
          />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const inputs = within(canvasElement).getAllByRole("spinbutton");
    await expect(inputs).toHaveLength(themes.length);
    for (const input of inputs) await expect(input).toBeVisible();
  },
};

export const InvalidAndDisabled: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-5)", maxWidth: "32rem" }}>
      <NumberField
        label="Seats requested"
        min={1}
        max={8}
        value={9}
        error="Choose no more than 8 seats."
        showSteppers
        readOnly
      />
      <NumberField
        label="Available inventory"
        defaultValue={3}
        disabled
        description="Inventory updates when a shipment arrives."
        showSteppers
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("spinbutton", { name: "Seats requested" })).toHaveAttribute("aria-invalid", "true");
    await expect(canvas.getByRole("button", { name: "Seats requested Decrease" })).toBeDisabled();
    await expect(canvas.getByRole("spinbutton", { name: "Available inventory" })).toBeDisabled();
  },
};
