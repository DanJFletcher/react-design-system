import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { Chip, type ChipSize } from "./Chip";

const sizes: ChipSize[] = ["sm", "md", "lg"];

const meta = {
  title: "Components/Chip",
  component: Chip,
  args: {
    children: "Design systems",
    size: "md",
  },
  argTypes: {
    children: { control: "text" },
    size: { control: "select", options: sizes },
    selected: { control: false },
    onSelect: { control: false },
    onRemove: { control: false },
    removeLabel: { control: false },
    disabled: { control: "boolean" },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const SizeExamples: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--ds-space-3)" }}>
      {sizes.map((size) => (
        <Chip key={size} size={size}>{`Design · ${size}`}</Chip>
      ))}
    </div>
  ),
};

export const SelectableAndRemovable: Story = {
  render: () => {
    const [selected, setSelected] = useState(false);
    const [showTag, setShowTag] = useState(true);

    return (
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--ds-space-3)" }}>
        <Chip selected={selected} onSelect={setSelected}>Design systems</Chip>
        {showTag && (
          <Chip onRemove={() => setShowTag(false)} removeLabel="Remove Drafts">
            Drafts
          </Chip>
        )}
        <Chip selected={false} onSelect={() => {}} disabled>
          Disabled filter
        </Chip>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selectable = canvas.getByRole("button", { name: "Design systems" });
    const remove = canvas.getByRole("button", { name: "Remove Drafts" });

    await expect(selectable).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(selectable);
    await expect(selectable).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(selectable);
    await expect(selectable).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(remove);
    await expect(canvas.queryByText("Drafts")).not.toBeInTheDocument();
  },
};

export const KeyboardSelection: Story = {
  render: () => {
    const [selected, setSelected] = useState(false);

    return (
      <Chip selected={selected} onSelect={setSelected}>
        Keyboard filter
      </Chip>
    );
  },
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <section
          key={theme}
          data-ds-theme={theme}
          aria-label={`${theme} theme`}
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "var(--ds-space-3)",
            padding: "var(--ds-space-4)",
            borderRadius: "var(--ds-radius-shape-rounded)",
            backgroundColor: "var(--ds-color-canvas)",
            color: "var(--ds-color-text-primary)",
          }}
        >
          <strong>{theme}</strong>
          <Chip>Content tag</Chip>
          <Chip selected={false} onSelect={() => {}}>Filter</Chip>
          <Chip selected={true} onSelect={() => {}}>Selected</Chip>
        </section>
      ))}
    </div>
  ),
};

export const LongLabel: Story = {
  args: {
    children: "A long content tag that wraps instead of overflowing its container",
  },
  render: (args) => (
    <div style={{ inlineSize: "12rem" }}>
      <Chip {...args} />
    </div>
  ),
};
