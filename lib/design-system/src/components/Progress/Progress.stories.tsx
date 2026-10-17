import type { Meta, StoryObj } from "@storybook/react";
import { Progress, type ProgressProps } from "./Progress";

const meta = {
  title: "Components/Feedback/Progress",
  id: "components-progress",
  component: Progress,
  args: {
    label: "Uploading project assets",
    value: 62,
    max: 100,
    showValue: true,
  },
  argTypes: {
    label: { control: "text" },
    value: { control: "number", min: 0, max: 100, description: "Omit to show indeterminate progress." },
    max: { control: "number", min: 1 },
    valueText: { control: "text", description: "Optional visible and accessible value override." },
    showValue: { control: "boolean" },
    className: { control: false },
    style: { control: false },
    "aria-describedby": { control: false },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Indeterminate: Story = {
  args: {
    label: "Saving changes",
    value: undefined,
    valueText: "Working…",
  },
};

export const CustomScale: Story = {
  args: {
    label: "Deployment stages",
    value: 3,
    max: 8,
    valueText: "3 of 8 completed",
  },
};

export const ClampedValues: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      <Progress label="Below range" value={-15} />
      <Progress label="Above range" value={130} />
    </div>
  ),
};

export const HiddenValue: Story = {
  args: {
    label: "Processing records",
    value: 46,
    showValue: false,
  },
};

export const DescribedBy: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-2)" }}>
      <Progress
        aria-describedby="upload-help"
        label="Uploading archive"
        value={35}
      />
      <p id="upload-help">Keep this page open while the upload completes.</p>
    </div>
  ),
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <section
          key={theme}
          data-ds-theme={theme}
          style={{
            display: "grid",
            gap: "var(--ds-space-3)",
            padding: "var(--ds-space-4)",
            borderRadius: "var(--ds-radius-shape-rounded)",
            backgroundColor: "var(--ds-color-canvas)",
            color: "var(--ds-color-text-primary)",
          }}
        >
          <strong>{theme}</strong>
          <Progress label={`${theme} upload`} value={61} />
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
        display: "grid",
        gap: "var(--ds-space-4)",
        padding: "var(--ds-space-4)",
        backgroundColor: "var(--ds-color-canvas)",
      }}
    >
      <Progress label="ACME upload" value={40} />
      <section
        data-ds-theme="luna"
        style={{ padding: "var(--ds-space-4)", backgroundColor: "var(--ds-color-canvas)" }}
      >
        <Progress label="Luna upload" value={40} />
      </section>
    </div>
  ),
};

export const CustomHooks: Story = {
  args: {
    label: "Custom themed progress",
    value: 72,
    max: 100,
    style: {
      "--ds-progress-track": "var(--ds-color-status-warning-bg)",
      "--ds-progress-indicator": "var(--ds-color-status-warning-fg)",
      "--ds-progress-label": "var(--ds-color-text-primary)",
      "--ds-progress-value": "var(--ds-color-text-muted)",
      "--ds-progress-height": "var(--ds-space-3)",
      "--ds-progress-radius": "var(--ds-radius-full)",
      "--ds-progress-gap": "var(--ds-space-3)",
    },
  },
};

export const LongLabel: Story = {
  args: {
    label: "Preparing a complete archive of all project assets and verifying every selected item",
    value: 44,
    max: 100,
  },
  render: (args: ProgressProps) => (
    <div style={{ inlineSize: "18rem" }}>
      <Progress {...args} />
    </div>
  ),
};
