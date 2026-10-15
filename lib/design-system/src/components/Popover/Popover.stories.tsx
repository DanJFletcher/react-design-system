import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Popover } from "./Popover";

const meta = {
  title: "Components/Popover",
  component: Popover,
  args: {
    triggerLabel: "Project details",
    trigger: "Project details",
    heading: "Project details",
    description: "A quick view of the current workspace.",
    children: <p>Three drafts are ready for review.</p>,
    showCloseButton: true,
  },
  argTypes: {
    trigger: { control: "text" },
    children: { control: false },
    heading: { control: "text" },
    description: { control: "text" },
    panelStyle: { control: false },
    style: { control: false },
    onOpenChange: { control: false },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const KeyboardDismissal: Story = {
  args: {
    heading: "Keyboard access",
    description: "Open with a button and close with Escape.",
    motion: "none",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Project details" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("dialog", { name: "Keyboard access" })).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toHaveFocus();
  },
};

export const FocusAndCloseButton: Story = {
  args: {
    heading: "Edit workspace",
    description: "Update the name shown to your team.",
    autoFocus: true,
    showCloseButton: true,
    motion: "none",
    children: (
      <label>
        Workspace name
        <input aria-label="Workspace name" defaultValue="Northstar" />
      </label>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Project details" });
    await userEvent.click(trigger);
    const closeButton = canvas.getByRole("button", { name: "Close popover" });
    await expect(closeButton).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(trigger).toHaveFocus();
  },
};

export const AutofocusContent: Story = {
  args: {
    heading: "Edit workspace",
    autoFocus: true,
    showCloseButton: false,
    motion: "none",
    children: (
      <label>
        Workspace name
        <input aria-label="Workspace name" defaultValue="Northstar" />
      </label>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Project details" });
    await userEvent.click(trigger);
    await expect(canvas.getByRole("textbox", { name: "Workspace name" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveFocus();
  },
};

export const OutsideDismissal: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-4)" }}>
      <Popover
        description="This panel closes when focus or pointer moves outside."
        heading="Quick actions"
        motion="none"
        triggerLabel="Quick actions"
        trigger="Quick actions"
      >
        <p>Manage your workspace settings.</p>
      </Popover>
      <Button variant="secondary">Outside action</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Quick actions" });
    await userEvent.click(trigger);
    await expect(canvas.getByRole("dialog", { name: "Quick actions" })).toBeVisible();
    const outsideButton = canvas.getByRole("button", { name: "Outside action" });
    await userEvent.click(outsideButton);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(outsideButton).toHaveFocus();
  },
};

export const FocusOutsideDismissal: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-4)" }}>
      <Popover
        motion="none"
        triggerLabel="Panel controls"
        trigger="Panel controls"
      >
        <Button variant="ghost">Inside panel</Button>
      </Popover>
      <Button variant="secondary">Next page control</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Panel controls" });
    await userEvent.click(trigger);
    await userEvent.tab();
    const inside = canvas.getByRole("button", { name: "Inside panel" });
    await expect(inside).toHaveFocus();
    await expect(canvas.getByRole("dialog", { name: "Panel controls" })).toBeVisible();
    await userEvent.tab();
    const outside = canvas.getByRole("button", { name: "Next page control" });
    await expect(outside).toHaveFocus();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};

export const ControlledOpenState: Story = {
  render: () => (
    <ControlledPopoverExample />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Controlled panel" });
    await userEvent.click(trigger);
    await expect(canvas.getByText("Popover is open.")).toBeVisible();
    await userEvent.click(trigger);
    await expect(canvas.getByText("Popover is closed.")).toBeVisible();
  },
};

function ControlledPopoverExample() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: "grid", justifyItems: "start", gap: "var(--ds-space-3)" }}>
      <Popover
        description="The parent owns this popover's open state."
        heading="Controlled panel"
        motion="none"
        onOpenChange={setOpen}
        open={open}
        triggerLabel="Controlled panel"
        trigger="Controlled panel"
      >
        <p>Use the trigger or outside button to update the parent state.</p>
      </Popover>
      <output aria-live="polite">Popover is {open ? "open" : "closed"}.</output>
    </div>
  );
}

export const AllPlacements: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "var(--ds-space-5)", padding: "var(--ds-space-8)" }}>
      {(["top", "right", "bottom", "left"] as const).map((placement) =>
        (["start", "center", "end"] as const).map((align) => (
          <Popover
            align={align}
            key={`${placement}-${align}`}
            placement={placement}
            triggerLabel={`${placement} ${align}`}
            trigger={`${placement} ${align}`}
          >
            <p>Placement flips and stays within the viewport.</p>
          </Popover>
        )),
      )}
    </div>
  ),
};

export const PositioningAtViewportEdge: Story = {
  render: () => (
    <div style={{ minBlockSize: "calc(100vh - var(--ds-space-8))" }}>
      <Popover
        align="end"
        defaultOpen
        heading="Edge-aware content"
        motion="none"
        placement="top"
        triggerLabel="Edge preview"
        trigger="Edge preview"
      >
        <p style={{ maxInlineSize: "18rem" }}>
          The panel flips below the trigger when there is not enough room above it, and its
          position remains inside the visible viewport.
        </p>
      </Popover>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const panel = canvas.getByRole("dialog", { name: "Edge-aware content" });
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute("data-side", "bottom");
    const bounds = panel.getBoundingClientRect();
    expect(bounds.left).toBeGreaterThanOrEqual(0);
    expect(bounds.top).toBeGreaterThanOrEqual(0);
    expect(bounds.right).toBeLessThanOrEqual(window.innerWidth);
    expect(bounds.bottom).toBeLessThanOrEqual(window.innerHeight);
  },
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-3)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <div
          data-ds-theme={theme}
          key={theme}
          style={{ display: "grid", gap: "var(--ds-space-2)", padding: "var(--ds-space-4)" }}
        >
          <strong>{theme}</strong>
          <Popover
            heading={`${theme} details`}
            triggerLabel={`${theme} details`}
            trigger={`${theme} details`}
          >
            <p>Popover surfaces inherit this theme.</p>
          </Popover>
        </div>
      ))}
    </div>
  ),
};

export const NestedThemeBoundary: Story = {
  render: () => (
    <div data-ds-theme="atom" style={{ padding: "var(--ds-space-6)" }}>
      <div data-ds-theme="luna" style={{ padding: "var(--ds-space-6)" }}>
        <Popover
          defaultOpen
          heading="Luna within Atom"
          motion="none"
          triggerLabel="Nested theme preview"
          trigger="Nested theme preview"
        >
          <p>The popover stays in the theme boundary where it was authored.</p>
        </Popover>
      </div>
    </div>
  ),
};

export const ScopedPanelStyle: Story = {
  args: {
    heading: "Custom panel",
    panelStyle: {
      backgroundColor: "var(--ds-color-surface-inverse)",
      color: "var(--ds-color-text-inverse)",
      borderRadius: "var(--ds-radius-surface)",
    },
    triggerLabel: "Custom panel",
    trigger: "Custom panel",
    children: <p>Style the panel with semantic token overrides.</p>,
  },
};
