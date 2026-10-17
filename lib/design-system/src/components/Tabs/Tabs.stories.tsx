import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Tabs, type TabsItem } from "./Tabs";

const sampleItems: TabsItem[] = [
  {
    id: "overview",
    label: "Overview",
    content: <p>Review the main details for this workspace.</p>,
  },
  {
    id: "activity",
    label: "Activity",
    content: <p>Recent changes and updates appear here.</p>,
  },
  {
    id: "settings",
    label: "Settings",
    content: <p>Manage preferences for this workspace.</p>,
  },
];

function ControlledTabsExample() {
  const [value, setValue] = useState("overview");

  return (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      <Tabs
        items={sampleItems}
        label="Controlled workspace sections"
        onValueChange={setValue}
        value={value}
      />
      <output aria-live="polite" data-testid="controlled-tab-value">
        Selected section: {value}
      </output>
    </div>
  );
}

const meta = {
  title: "Components/Navigation/Tabs",
  id: "components-tabs",
  component: Tabs,
  args: {
    items: sampleItems,
    label: "Workspace sections",
    defaultValue: "overview",
    orientation: "horizontal",
    activationMode: "automatic",
    variant: "line",
    size: "md",
    fullWidth: false,
  },
  argTypes: {
    items: { control: "object" },
    label: { control: "text" },
    value: { control: false },
    defaultValue: { control: "text" },
    onValueChange: { control: false },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    activationMode: { control: "inline-radio", options: ["automatic", "manual"] },
    variant: { control: "inline-radio", options: ["line", "pills"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    fullWidth: { control: "boolean" },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
    variant: "pills",
  },
};

export const ManualActivation: Story = {
  args: {
    activationMode: "manual",
  },
};

export const DisabledTab: Story = {
  args: {
    items: [
      sampleItems[0],
      { ...sampleItems[1], disabled: true },
      sampleItems[2],
    ],
  },
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
  },
};

export const Controlled: Story = {
  render: () => <ControlledTabsExample />,
};

export const VariantAndSizeExamples: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-6)" }}>
      {(["line", "pills"] as const).map((variant) => (
        <section key={variant} aria-label={`${variant} tab style`}>
          <h2>{variant}</h2>
          <Tabs
            defaultValue="overview"
            items={sampleItems}
            label={`${variant} example`}
            size="lg"
            variant={variant}
          />
        </section>
      ))}
    </div>
  ),
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-6)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <section
          aria-label={`${theme} theme`}
          data-ds-theme={theme}
          key={theme}
          style={{
            padding: "var(--ds-space-4)",
            backgroundColor: "var(--ds-color-canvas)",
          }}
        >
          <h2 style={{ color: "var(--ds-color-text-primary)" }}>
            {theme.toUpperCase()}
          </h2>
          <Tabs
            defaultValue="overview"
            items={sampleItems}
            label={`${theme} workspace sections`}
            variant="pills"
          />
        </section>
      ))}
    </div>
  ),
};

export const NestedThemeBoundary: Story = {
  render: () => (
    <section
      aria-label="ACME theme"
      data-ds-theme="acme"
      style={{
        padding: "var(--ds-space-4)",
        backgroundColor: "var(--ds-color-canvas)",
      }}
    >
      <h2 style={{ color: "var(--ds-color-text-primary)" }}>ACME</h2>
      <Tabs defaultValue="overview" items={sampleItems} label="Outer sections" />
      <section
        aria-label="Nested Luna theme"
        data-ds-theme="luna"
        style={{
          padding: "var(--ds-space-4)",
          backgroundColor: "var(--ds-color-canvas)",
        }}
      >
        <h2 style={{ color: "var(--ds-color-text-primary)" }}>Luna</h2>
        <Tabs
          defaultValue="activity"
          items={sampleItems}
          label="Nested sections"
          variant="pills"
        />
      </section>
    </section>
  ),
};

export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl">
      <Tabs defaultValue="overview" items={sampleItems} label="Workspace sections" />
    </div>
  ),
};

export const ScrollableOnMobile: Story = {
  args: {
    items: [
      { id: "overview", label: "Workspace overview", content: "Overview details." },
      { id: "activity", label: "Recent activity", content: "Activity details." },
      { id: "members", label: "Team members", content: "Team details." },
      { id: "integrations", label: "Connected integrations", content: "Integration details." },
      { id: "settings", label: "Workspace settings", content: "Settings details." },
    ],
  },
};

export const AutomaticKeyboard: Story = {
  args: {
    items: [
      sampleItems[0],
      { ...sampleItems[1], disabled: true },
      sampleItems[2],
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole("tab", { name: "Overview" });
    const settings = canvas.getByRole("tab", { name: "Settings" });

    await userEvent.click(overview);
    await userEvent.keyboard("{ArrowRight}");
    await expect(settings).toHaveFocus();
    await expect(settings).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByRole("tabpanel", { name: "Settings" })).toBeVisible();

    await userEvent.keyboard("{Home}");
    await expect(overview).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{End}");
    await expect(settings).toHaveAttribute("aria-selected", "true");
  },
};

export const ManualKeyboard: Story = {
  args: {
    activationMode: "manual",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole("tab", { name: "Overview" });
    const activity = canvas.getByRole("tab", { name: "Activity" });

    await userEvent.click(overview);
    await userEvent.keyboard("{ArrowRight}");
    await expect(activity).toHaveFocus();
    await expect(overview).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{Enter}");
    await expect(activity).toHaveAttribute("aria-selected", "true");
  },
};

export const VerticalKeyboard: Story = {
  args: {
    orientation: "vertical",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overview = canvas.getByRole("tab", { name: "Overview" });
    const activity = canvas.getByRole("tab", { name: "Activity" });

    await userEvent.click(overview);
    await userEvent.keyboard("{ArrowDown}");
    await expect(activity).toHaveFocus();
    await expect(activity).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{ArrowUp}");
    await expect(overview).toHaveAttribute("aria-selected", "true");
  },
};
