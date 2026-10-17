import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { NumberField } from "./NumberField";

const meta = {
  title: "Components/Forms/Number field",
  id: "components-number-field",
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

export const LiveConstraints: Story = {
  render: () => {
    const [constraints, setConstraints] = useState({ min: 0, max: 10, step: 1 });
    const [controlledValue, setControlledValue] = useState(4);

    return (
      <div style={{ display: "grid", gap: "var(--ds-space-4)", width: "32rem", maxWidth: "100%" }}>
        <button
          onClick={() => setConstraints({ min: 2, max: 8, step: 2 })}
          type="button"
        >
          Use updated constraints
        </button>
        <NumberField
          defaultValue={4}
          label="Uncontrolled changing quantity"
          {...constraints}
          showSteppers
        />
        <NumberField
          label="Controlled changing quantity"
          onChange={(event) => setControlledValue(Number(event.currentTarget.value))}
          value={controlledValue}
          {...constraints}
          showSteppers
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const labels = ["Uncontrolled changing quantity", "Controlled changing quantity"];

    await userEvent.click(canvas.getByRole("button", { name: "Use updated constraints" }));

    for (const label of labels) {
      const input = canvas.getByRole("spinbutton", { name: label }) as HTMLInputElement;
      const decrease = canvas.getByRole("button", { name: `${label} Decrease` });
      const increase = canvas.getByRole("button", { name: `${label} Increase` });

      await expect(input).toHaveAttribute("min", "2");
      await expect(input).toHaveAttribute("max", "8");
      await expect(input).toHaveAttribute("step", "2");
      await expect(input.validity.valid).toBe(true);

      await userEvent.click(decrease);
      await expect(input).toHaveValue(2);
      await expect(input.validity.valid).toBe(true);
      await expect(decrease).toBeDisabled();

      await userEvent.click(increase);
      await expect(input).toHaveValue(4);
      await userEvent.click(increase);
      await expect(input).toHaveValue(6);
      await userEvent.click(increase);
      await expect(input).toHaveValue(8);
      await expect(input.validity.valid).toBe(true);
      await expect(increase).toBeDisabled();
    }
  },
};

export const ControlledParentUpdates: Story = {
  render: () => {
    const [value, setValue] = useState(4);

    return (
      <div style={{ display: "grid", gap: "var(--ds-space-4)", width: "32rem", maxWidth: "100%" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--ds-space-2)" }}>
          <button onClick={() => setValue(0)} type="button">Set minimum</button>
          <button onClick={() => setValue(10)} type="button">Set maximum</button>
          <button onClick={() => setValue(12)} type="button">Set above maximum</button>
        </div>
        <NumberField
          label="Parent-updated quantity"
          max={10}
          min={0}
          onChange={(event) => setValue(Number(event.currentTarget.value))}
          showSteppers
          step={2}
          value={value}
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton", { name: "Parent-updated quantity" }) as HTMLInputElement;
    const decrease = canvas.getByRole("button", { name: "Parent-updated quantity Decrease" });
    const increase = canvas.getByRole("button", { name: "Parent-updated quantity Increase" });

    await expect(input).toHaveValue(4);
    await expect(input.validity.valid).toBe(true);
    await expect(decrease).toBeEnabled();
    await expect(increase).toBeEnabled();

    await userEvent.click(canvas.getByRole("button", { name: "Set minimum" }));
    await expect(input).toHaveValue(0);
    await expect(input.validity.valid).toBe(true);
    await expect(decrease).toBeDisabled();
    await expect(increase).toBeEnabled();

    await userEvent.click(canvas.getByRole("button", { name: "Set maximum" }));
    await expect(input).toHaveValue(10);
    await expect(input.validity.valid).toBe(true);
    await expect(decrease).toBeEnabled();
    await expect(increase).toBeDisabled();

    await userEvent.click(canvas.getByRole("button", { name: "Set above maximum" }));
    await expect(input).toHaveValue(12);
    await expect(input.validity.rangeOverflow).toBe(true);
    await expect(input.validity.stepMismatch).toBe(false);
    await expect(decrease).toBeEnabled();
    await expect(increase).toBeDisabled();
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
