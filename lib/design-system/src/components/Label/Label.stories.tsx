import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "./Label";

const meta = {
  title: "Components/Label",
  component: Label,
  args: {
    children: "Company name",
    htmlFor: "label-company-name",
    variant: "field",
  },
  argTypes: {
    children: { control: "text" },
    htmlFor: { control: "text" },
    variant: { control: "inline-radio", options: ["field", "choice"] },
    required: { control: "boolean" },
    disabled: { control: "boolean" },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ display: "grid", inlineSize: "min(100%, 24rem)", gap: "var(--ds-space-2)" }}>
      <Label {...args} />
      <input id={args.htmlFor} type="text" />
    </div>
  ),
};

export const FieldAndChoice: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      <div style={{ display: "grid", gap: "var(--ds-space-2)" }}>
        <Label htmlFor="label-field-example">Project name</Label>
        <input id="label-field-example" type="text" />
      </div>
      <Label htmlFor="label-choice-example" variant="choice">
        <input id="label-choice-example" type="checkbox" />
        Send me occasional project updates
      </Label>
    </div>
  ),
};

export const RequiredAndDisabled: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      <div style={{ display: "grid", gap: "var(--ds-space-2)" }}>
        <Label htmlFor="label-required-example" required>Work email</Label>
        <input id="label-required-example" required type="email" />
      </div>
      <Label disabled htmlFor="label-disabled-example">
        Disabled field
      </Label>
      <input disabled id="label-disabled-example" type="text" />
    </div>
  ),
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-3)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <section
          data-ds-theme={theme}
          key={theme}
          style={{
            display: "grid",
            gap: "var(--ds-space-2)",
            padding: "var(--ds-space-4)",
            backgroundColor: "var(--ds-color-canvas)",
            color: "var(--ds-color-text-primary)",
          }}
        >
          <strong>{theme}</strong>
          <Label htmlFor={`${theme}-label`} required>{theme} contact</Label>
          <input id={`${theme}-label`} type="text" />
          <Label disabled htmlFor={`${theme}-disabled`}>Disabled</Label>
          <input disabled id={`${theme}-disabled`} type="text" />
        </section>
      ))}
    </div>
  ),
};
