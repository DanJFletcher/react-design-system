import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { Icon, iconNames, type IconName } from "../Icon/Icon";
import { Callout, type CalloutProps, type CalloutTone } from "./Callout";

const tones: CalloutTone[] = ["info", "success", "warning", "error", "neutral"];

const meta = {
  title: "Components/Callout",
  component: Callout,
  args: {
    title: "Project created",
    children: "Your workspace is ready.",
    tone: "info",
  },
  argTypes: {
    title: { control: "text" },
    children: { control: "text" },
    tone: { control: "select", options: tones },
    icon: { control: false },
    action: { control: false },
    role: {
      control: "select",
      options: ["note", "status", "alert"],
      description: "No role is set by default. Choose a live-region role only for content that needs to be announced.",
    },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof Callout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const ToneExamples: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-3)" }}>
      {tones.map((tone) => (
        <Callout key={tone} title={`${tone[0].toUpperCase()}${tone.slice(1)} message`} tone={tone}>
          This callout stays in the page until the consumer changes or removes it.
        </Callout>
      ))}
    </div>
  ),
};

export const IconAndAction: Story = {
  render: () => (
    <Callout
      tone="warning"
      title="Review before publishing"
      icon={<Icon name="sparkle" />}
      action={<Button size="sm" variant="secondary">Review changes</Button>}
    >
      Your latest edits have not been checked yet.
    </Callout>
  ),
};

export const AtomHalftone: Story = {
  render: () => (
    <section
      data-ds-theme="atom"
      aria-label="Atom halftone callouts"
      style={{
        display: "grid",
        gap: "var(--ds-space-4)",
        padding: "var(--ds-space-6)",
        backgroundColor: "var(--ds-color-canvas)",
      }}
    >
      {tones.map((tone) => (
        <Callout
          key={tone}
          tone={tone}
          title={`${tone[0].toUpperCase()}${tone.slice(1)} message`}
          icon={<Icon name="sparkle" />}
        >
          A transparent halftone strip echoes this callout's border color.
        </Callout>
      ))}
    </section>
  ),
};

export const IconSelector: StoryObj<IconSelectorArgs> = {
  args: {
    title: "Workspace updated",
    children: "The project settings were saved.",
    tone: "success",
    iconName: "check",
  },
  argTypes: {
    title: { control: "text" },
    children: { control: "text" },
    tone: { control: "select", options: tones },
    iconName: { control: "select", options: iconNames },
  },
  render: ({ iconName, ...args }) => (
    <Callout {...args} icon={<Icon name={iconName} />} />
  ),
};

type IconSelectorArgs = Omit<CalloutProps, "icon"> & { iconName: IconName };

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
          {tones.map((tone) => (
            <Callout key={tone} title={`${tone} callout`} tone={tone}>
              Your workspace is ready to use.
            </Callout>
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
        display: "grid",
        gap: "var(--ds-space-3)",
        padding: "var(--ds-space-4)",
        backgroundColor: "var(--ds-color-canvas)",
      }}
    >
      <Callout tone="success" title="ACME">The account is active.</Callout>
      <section
        data-ds-theme="luna"
        style={{ padding: "var(--ds-space-4)", backgroundColor: "var(--ds-color-canvas)" }}
      >
        <Callout tone="success" title="Luna">The account is active.</Callout>
      </section>
    </div>
  ),
};

export const CustomHooks: Story = {
  args: {
    title: "Scoped callout styling",
    children: "These hook overrides affect this callout only.",
    tone: "info",
    style: {
      "--ds-callout-surface": "var(--ds-color-status-warning-bg)",
      "--ds-callout-text": "var(--ds-color-status-warning-fg)",
      "--ds-callout-border": "var(--ds-color-status-warning-fg)",
      "--ds-callout-accent": "var(--ds-color-status-warning-fg)",
      "--ds-callout-radius": "var(--ds-space-6)",
      "--ds-callout-padding": "var(--ds-space-5)",
      "--ds-callout-gap": "var(--ds-space-4)",
    },
  },
};

export const LongContent: Story = {
  args: {
    title: "Long guidance",
    children: "This longer callout message demonstrates how multi-line content wraps inside a narrow layout without forcing horizontal scrolling or clipping important details.",
    tone: "info",
  },
  render: (args) => (
    <div style={{ inlineSize: "18rem" }}>
      <Callout {...args} />
    </div>
  ),
};

function ActionPlayground() {
  const [message, setMessage] = useState("No action selected.");

  return (
    <div style={{ display: "grid", gap: "var(--ds-space-3)" }}>
      <Callout
        title="Review before publishing"
        tone="warning"
        action={<Button size="sm" variant="secondary" onClick={() => setMessage("Changes reviewed.")}>Review changes</Button>}
      >
        Your latest edits have not been checked yet.
      </Callout>
      <p aria-live="polite" data-testid="callout-action-status" role="status">{message}</p>
    </div>
  );
}

export const Action: Story = {
  render: () => <ActionPlayground />,
};
