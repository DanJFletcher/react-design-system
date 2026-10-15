import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Rating } from "./Rating";
import type { RatingInputProps } from "./Rating";

const meta = {
  title: "Components/Rating",
  component: Rating,
  args: {
    mode: "display",
    label: "Customer rating",
    value: 4.5,
    max: 5,
    size: "md",
    showValue: true,
  },
  argTypes: {
    mode: { control: "inline-radio", options: ["display", "input"] },
    label: { control: "text" },
    value: { control: "number" },
    defaultValue: { control: "number" },
    max: { control: "inline-radio", options: [3, 5, 10] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    showValue: { control: "boolean" },
    getRatingLabel: { control: false },
    formatValue: { control: false },
    onValueChange: { control: false },
    onChange: { control: false },
    description: { control: "text" },
    error: { control: "text" },
    required: { control: "boolean" },
    disabled: { control: "boolean" },
    className: { control: false },
    style: { control: false },
  },
  render: (args) => (
    <div style={{ maxWidth: "32rem" }}>
      <Rating {...args} />
    </div>
  ),
} satisfies Meta<typeof Rating>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ReadOnlyDisplay: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("img", { name: "4.5 out of 5 stars" })).toBeVisible();
    await expect(canvas.getByText("4.5/5", { exact: true })).toBeVisible();
  },
};

export const SelectableInput: Story = {
  args: {
    mode: "input",
    label: "Service rating",
    name: "service-rating",
    defaultValue: 3,
    value: undefined,
    showValue: true,
    onValueChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole("group", { name: "Service rating" });
    const three = canvas.getByRole("radio", { name: "3 out of 5 stars" });
    const four = canvas.getByRole("radio", { name: "4 out of 5 stars" });

    await expect(group).toBeVisible();
    await expect(three).toBeChecked();
    three.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(four).toBeChecked();
    await expect((args as RatingInputProps).onValueChange).toHaveBeenCalledWith(4);
    await expect(canvas.getByText("4/5", { exact: true })).toBeVisible();
  },
};

function ControlledRatingExample() {
  const [value, setValue] = useState<number | null>(2);

  return (
    <div style={{ display: "grid", gap: "var(--ds-space-3)" }}>
      <Rating
        mode="input"
        label="How was the move?"
        name="move-rating"
        max={5}
        value={value}
        onValueChange={setValue}
        required
        showValue
        description="Choose a score from one to five stars."
      />
      <span aria-live="polite">Current response: {value ?? "not rated"}</span>
    </div>
  );
}

export const ControlledInput: Story = {
  render: () => <ControlledRatingExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const five = canvas.getByRole("radio", { name: "5 out of 5 stars" });
    await userEvent.click(five);
    await expect(five).toBeChecked();
    await expect(canvas.getByText("Current response: 5")).toBeVisible();
  },
};

export const RequiredAndDisabled: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      <Rating mode="input" label="Required rating" required max={5} />
      <Rating mode="input" label="Closed survey" disabled defaultValue={4} max={5} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const requiredGroup = canvas.getByRole("group", { name: "Required rating" });
    const disabledGroup = canvas.getByRole("group", { name: "Closed survey" });
    await expect(within(requiredGroup).getByRole("radio", { name: "1 out of 5 stars" })).toBeRequired();
    await expect(within(disabledGroup).getByRole("radio", { name: "4 out of 5 stars" })).toBeDisabled();
  },
};

export const LocalizedLabels: Story = {
  args: {
    mode: "input",
    label: "Avis sur le service",
    defaultValue: 4,
    value: undefined,
    getRatingLabel: (rating, max) => `${rating} étoiles sur ${max}`,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("group", { name: "Avis sur le service" })).toBeVisible();
    await expect(canvas.getByRole("radio", { name: "4 étoiles sur 5" })).toBeChecked();
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
          <Rating
            mode="display"
            label={`${theme} customer rating`}
            value={4.5}
            max={5}
            showValue
          />
          <Rating
            mode="input"
            label={`${theme} service rating`}
            defaultValue={4}
            max={5}
          />
        </div>
      ))}
    </div>
  ),
};

export const CustomScaleAndSize: Story = {
  args: {
    label: "Product quality",
    value: 8,
    max: 10,
    size: "lg",
    formatValue: (value, max) => `${value} of ${max}`,
  },
};
