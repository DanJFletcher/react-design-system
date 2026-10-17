import type { Meta, StoryObj } from "@storybook/react";
import { Icon, iconNames } from "./Icon";

const meta = {
  title: "Components/Identity/Icon",
  id: "components-icon",
  component: Icon,
  args: {
    name: "sparkle",
    size: "md",
  },
  argTypes: {
    name: { control: "select", options: iconNames },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    decorative: { control: false },
    label: { control: false },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Catalog: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(8rem, 1fr))",
        gap: "var(--ds-space-4)",
      }}
    >
      {iconNames.map((name) => (
        <div
          key={name}
          style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)" }}
        >
          <Icon name={name} />
          <code>{name}</code>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="button-story-row">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <div
          key={size}
          style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-2)" }}
        >
          <Icon name="sparkle" size={size} />
          <code>{size}</code>
        </div>
      ))}
    </div>
  ),
};

export const Accessibility: Story = {
  render: () => (
    <div className="button-story-row">
      <span>
        <Icon name="sparkle" /> Decorative icon
      </span>
      <span>
        <Icon name="search" decorative={false} label="Search" /> Accessible icon
      </span>
    </div>
  ),
};

export const ThemeCoverage: Story = {
  render: () => (
    <div className="theme-story-stack">
      <div
        className="theme-story-stack"
        data-ds-theme="acme"
        style={{
          color: "var(--ds-color-text-primary)",
          backgroundColor: "var(--ds-color-canvas)",
          padding: "var(--ds-space-2)",
        }}
      >
        <Icon name="sparkle" />
        <span>ACME</span>
      </div>
      <div
        className="theme-story-stack"
        data-ds-theme="luna"
        style={{
          color: "var(--ds-color-text-primary)",
          backgroundColor: "var(--ds-color-canvas)",
          padding: "var(--ds-space-2)",
        }}
      >
        <Icon name="sparkle" />
        <span>Luna</span>
      </div>
      <div
        className="theme-story-stack"
        data-ds-theme="orchid"
        style={{
          color: "var(--ds-color-text-primary)",
          backgroundColor: "var(--ds-color-canvas)",
          padding: "var(--ds-space-2)",
        }}
      >
        <Icon name="sparkle" />
        <span>Orchid</span>
      </div>
    </div>
  ),
};

export const NestedThemeBoundary: Story = {
  render: () => (
    <div
      className="theme-story-stack"
      data-ds-theme="acme"
      style={{
        color: "var(--ds-color-text-primary)",
        backgroundColor: "var(--ds-color-canvas)",
        padding: "var(--ds-space-2)",
      }}
    >
      <Icon name="moon" />
      <div
        className="theme-story-stack"
        data-ds-theme="luna"
        style={{
          color: "var(--ds-color-text-primary)",
          backgroundColor: "var(--ds-color-canvas)",
          padding: "var(--ds-space-2)",
        }}
      >
        <Icon name="moon" />
      </div>
    </div>
  ),
};
