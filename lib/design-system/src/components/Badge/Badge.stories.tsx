import type { Meta, StoryObj } from "@storybook/react";
import { Badge, type BadgeSize, type BadgeTone } from "./Badge";
import { Icon, iconNames, type IconName } from "../Icon/Icon";

const tones: BadgeTone[] = ["neutral", "accent", "success", "warning", "error"];
const sizes: BadgeSize[] = ["sm", "md", "lg"];

const meta = {
  title: "Components/Badge",
  component: Badge,
  args: {
    children: "Published",
    tone: "success",
    size: "md",
    dot: false,
  },
  argTypes: {
    children: { control: "text" },
    tone: { control: "select", options: tones },
    size: { control: "select", options: sizes },
    shape: {
      control: "select",
      options: ["rounded", "square", "pill"],
    },
    icon: { control: false },
    iconPosition: {
      control: "inline-radio",
      options: ["left", "right"],
    },
    dot: { control: "boolean" },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const ToneExamples: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--ds-space-3)" }}>
      {tones.map((tone) => (
        <Badge key={tone} tone={tone}>{tone[0].toUpperCase() + tone.slice(1)}</Badge>
      ))}
    </div>
  ),
};

export const SizeAndShapeExamples: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      {sizes.map((size) => (
        <div key={size} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--ds-space-3)" }}>
          <Badge size={size} shape="rounded">Rounded · {size}</Badge>
          <Badge size={size} shape="square" tone="accent">Square · {size}</Badge>
          <Badge size={size} shape="pill" tone="success">Pill · {size}</Badge>
        </div>
      ))}
    </div>
  ),
};

export const IconAndDotIndicators: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--ds-space-3)" }}>
      <Badge tone="accent" icon={<Icon name="sparkle" size="sm" />}>New</Badge>
      <Badge tone="success" icon={<Icon name="check" size="sm" />} iconPosition="right">Complete</Badge>
      <Badge tone="warning" dot>Review needed</Badge>
      <Badge tone="error" dot icon={<Icon name="close" size="sm" />}>Failed</Badge>
    </div>
  ),
};

type IconSelectorArgs = {
  children: string;
  tone: BadgeTone;
  size: BadgeSize;
  shape?: "rounded" | "square" | "pill";
  iconName: IconName;
  iconPosition?: "left" | "right";
  dot?: boolean;
};

export const IconSelector: StoryObj<IconSelectorArgs> = {
  args: {
    children: "Choose an icon",
    tone: "accent",
    size: "md",
    iconName: "sparkle",
    iconPosition: "left",
  },
  argTypes: {
    iconName: { control: "select", options: iconNames },
    tone: { control: "select", options: tones },
    size: { control: "select", options: sizes },
    shape: { control: "select", options: ["rounded", "square", "pill"] },
    iconPosition: { control: "inline-radio", options: ["left", "right"] },
    dot: { control: "boolean" },
  },
  render: ({ iconName, ...args }) => (
    <Badge {...args} icon={<Icon name={iconName} size="sm" />} />
  ),
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      {(["acme", "luna", "orchid"] as const).map((theme) => (
        <section
          key={theme}
          data-ds-theme={theme}
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
          {tones.map((tone) => (
            <Badge key={tone} tone={tone}>{tone}</Badge>
          ))}
        </section>
      ))}
    </div>
  ),
};

export const NestedThemeBoundary: Story = {
  render: () => (
    <div
      data-ds-theme="acme"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--ds-space-3)",
        padding: "var(--ds-space-4)",
        backgroundColor: "var(--ds-color-canvas)",
        color: "var(--ds-color-text-primary)",
      }}
    >
      <Badge tone="success">ACME status</Badge>
      <div
        data-ds-theme="luna"
        style={{
          padding: "var(--ds-space-3)",
          borderRadius: "var(--ds-radius-shape-rounded)",
          backgroundColor: "var(--ds-color-canvas)",
          color: "var(--ds-color-text-primary)",
        }}
      >
        <Badge tone="success">Luna status</Badge>
      </div>
    </div>
  ),
};

export const LongLabel: Story = {
  args: {
    children: "A long status label that can wrap without overflowing its container",
    tone: "warning",
    shape: "rounded",
  },
  render: (args) => (
    <div style={{ inlineSize: "12rem" }}>
      <Badge {...args} />
    </div>
  ),
};
