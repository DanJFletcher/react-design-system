import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import { SideNavigation, type SideNavigationEntry } from "./SideNavigation";

const sampleItems: readonly SideNavigationEntry[] = [
  { type: "link", id: "overview", label: "Overview", href: "#overview", icon: <Icon name="grid" />, onClick: (event) => event.preventDefault() },
  {
    type: "group", id: "content", label: "Content", icon: <Icon name="folder" />, badge: "4",
    items: [
      { type: "link", id: "pages", label: "Pages", href: "#pages", icon: <Icon name="book" />, onClick: (event) => event.preventDefault() },
      {
        type: "group", id: "library", label: "Library", icon: <Icon name="list" />,
        items: [{ type: "link", id: "media", label: "Media library", href: "#media", icon: <Icon name="grid" />, onClick: (event) => event.preventDefault() }],
      },
    ],
  },
  { type: "divider", id: "main-divider" },
  { type: "link", id: "appointments", label: "Appointments", href: "#appointments", icon: <Icon name="book" />, badge: "3", onClick: (event) => event.preventDefault() },
  { type: "action", id: "help", label: "Help & support", icon: <Icon name="circle-info" />, onClick: fn() },
  { type: "link", id: "billing", label: "Billing", href: "#billing", icon: <Icon name="settings" />, onClick: (event) => event.preventDefault() },
];

function ControlledNavigation() {
  const [active, setActive] = useState("overview");
  const [expanded, setExpanded] = useState<string[]>([]);
  return (
    <div style={{ display: "flex", gap: "var(--ds-space-6)", minBlockSize: "32rem" }}>
      <SideNavigation
        activeId={active}
        expandedIds={expanded}
        items={sampleItems}
        onActiveChange={(id) => setActive(id)}
        onExpandedIdsChange={(ids) => setExpanded([...ids])}
      />
      <output aria-live="polite" data-testid="side-navigation-state">Current destination: {active}</output>
    </div>
  );
}

const meta = {
  title: "Components/SideNavigation",
  component: SideNavigation,
  args: {
    items: sampleItems,
    defaultActiveId: "overview",
    navigationLabel: "Business workspace",
    size: "md",
    groupMotion: "expand",
    side: "left",
    position: "static",
    onActiveChange: fn(),
  },
  argTypes: {
    items: { control: false },
    activeId: { control: false },
    defaultActiveId: { control: "text" },
    expandedIds: { control: false },
    defaultExpandedIds: { control: false },
    groupMotion: { control: "inline-radio", options: ["expand", "none"] },
    header: { control: false },
    footer: { control: false },
    action: { control: false },
    className: { control: false },
    style: { control: false },
  },
  parameters: {
    docs: { description: { component: "A persistent, hierarchical destination tree for business sites and CMS workspaces. It uses ordinary links and buttons, leaving route ownership to the host application." } },
  },
} satisfies Meta<typeof SideNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    header: <strong style={{ fontSize: "var(--ds-font-size-md)" }}>Northstar Studio</strong>,
    action: <Button size="sm" onClick={fn()}>Create page</Button>,
    footer: <span style={{ color: "var(--ds-color-text-muted)", fontSize: "var(--ds-font-size-sm)" }}>Workspace settings</span>,
  },
  render: (args) => <div style={{ minBlockSize: "34rem", padding: "var(--ds-space-4)" }}><SideNavigation {...args} /></div>,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("link", { name: "Overview" }));
    await expect(args.onActiveChange).toHaveBeenCalledWith("overview", expect.objectContaining({ id: "overview" }));
  },
};

export const NestedGroups: Story = {
  args: { defaultActiveId: "media" },
  render: (args) => <div style={{ minBlockSize: "30rem" }}><SideNavigation {...args} /></div>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "Media library" })).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: /Content/ })).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("button", { name: /Library/ })).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("link", { name: "Media library" })).toHaveAttribute("aria-current", "page");
  },
};

export const DefaultGroupMotion: Story = {
  render: () => <SideNavigation items={sampleItems} />,
  globals: { motion: "full" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /Content/ });
    const panelId = trigger.getAttribute("aria-controls");
    const panel = panelId
      ? canvasElement.querySelector<HTMLElement>(`[id="${panelId}"]`)
      : null;
    if (!panel) throw new Error("Expected the collapsed group contents.");

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(panel).toHaveAttribute("aria-hidden", "true");
    await expect(panel).toHaveAttribute("inert");
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(panel).toHaveAttribute("data-open", "true");
    await expect(panel).not.toHaveAttribute("aria-hidden", "true");
    await expect(panel).not.toHaveAttribute("inert");
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    await expect(canvas.getByRole("link", { name: "Pages" })).toBeVisible();

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(panel).toHaveAttribute("aria-hidden", "true");
    await expect(panel).toHaveAttribute("inert");
  },
};

export const ReducedMotion: Story = {
  render: () => <SideNavigation items={sampleItems} />,
  globals: { motion: "reduced" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /Content/ });
    const panelId = trigger.getAttribute("aria-controls");
    const panel = panelId
      ? canvasElement.querySelector<HTMLElement>(`[id="${panelId}"]`)
      : null;
    if (!panel) throw new Error("Expected the group contents.");

    await userEvent.click(trigger);
    await expect(document.documentElement).toHaveAttribute("data-ds-motion-preference", "reduced");
    const durations = getComputedStyle(panel).transitionDuration;
    await expect(durations.split(",").every((duration) => Number.parseFloat(duration) === 0)).toBe(true);
    await expect(canvas.getByRole("link", { name: "Pages" })).toBeVisible();
  },
};

export const CollapsedRail: Story = {
  args: { defaultCollapsed: true, defaultActiveId: "overview" },
  render: (args) => <div style={{ minBlockSize: "30rem" }}><SideNavigation {...args} /></div>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "Overview" })).toBeInTheDocument();
    await expect(canvas.getByTestId("side-navigation-link-overview").querySelector("span")).toBeTruthy();
    await userEvent.click(canvas.getByRole("button", { name: "Expand navigation" }));
    await expect(canvas.getByRole("button", { name: "Collapse navigation" })).toBeInTheDocument();
  },
};

export const ControlledSelectionAndExpansion: Story = {
  render: () => <ControlledNavigation />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /Content/ }));
    await expect(canvas.getByRole("button", { name: /Content/ })).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(canvas.getByRole("link", { name: "Pages" }));
    await expect(canvas.getByTestId("side-navigation-state")).toHaveTextContent("Current destination: pages");
  },
};

export const DisabledItems: Story = {
  args: {
    items: [
      { type: "link", id: "home", label: "Home", href: "#home", icon: <Icon name="grid" /> },
      { type: "link", id: "locked", label: "Reports (unavailable)", href: "#reports", disabled: true, icon: <Icon name="book" /> },
    ],
    defaultActiveId: "home",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByTestId("side-navigation-link-locked");
    await expect(link).toHaveAttribute("aria-disabled", "true");
    await expect(link).not.toHaveAttribute("href");
    await userEvent.click(link);
    await expect(link).not.toHaveAttribute("aria-current");
  },
};

export const MobileResponsive: Story = {
  args: { defaultCollapsed: true },
  globals: { motion: "full", viewport: "mobile1" },
  render: (args) => (
    <div style={{ inlineSize: "min(100%, 24rem)", minBlockSize: "35rem", marginInline: "auto", padding: "var(--ds-space-3)" }}>
      <p style={{ color: "var(--ds-color-text-muted)" }}>Navigation expands in the page flow, above this content.</p>
      <SideNavigation {...args} />
      <main style={{ padding: "var(--ds-space-4)", border: "var(--ds-border-width-default) solid var(--ds-color-border-control)", borderRadius: "var(--ds-radius-surface)" }}>Page content stays in view.</main>
    </div>
  ),
  parameters: { viewport: { defaultViewport: "mobile1" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByTestId("side-navigation-mobile-toggle");
    await new Promise((resolve) => window.setTimeout(resolve, 50));
    const panelId = toggle.getAttribute("aria-controls");
    const panel = panelId
      ? canvasElement.querySelector<HTMLElement>(`[id="${panelId}"]`)
      : null;
    if (!panel) throw new Error("Expected the mobile navigation panel.");

    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(panel).toHaveAttribute("aria-hidden", "true");
    await expect(panel).toHaveAttribute("inert");
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(panel).toHaveAttribute("data-open", "true");
    await expect(panel).not.toHaveAttribute("aria-hidden", "true");
    await expect(panel).not.toHaveAttribute("inert");
    await expect(getComputedStyle(panel).transitionDuration.split(",").some((duration) => Number.parseFloat(duration) > 0)).toBe(true);
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    await expect(canvas.getByRole("link", { name: "Overview" })).toBeVisible();
    await expect(getComputedStyle(canvas.getByTestId("side-navigation-collapse-toggle")).display).toBe("none");
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(panel).toHaveAttribute("aria-hidden", "true");
    await expect(panel).toHaveAttribute("inert");
  },
};

export const MobileResponsiveReducedMotion: Story = {
  args: { defaultCollapsed: true },
  globals: { motion: "reduced", viewport: "mobile1" },
  render: (args) => (
    <div style={{ inlineSize: "min(100%, 24rem)", minBlockSize: "35rem", marginInline: "auto", padding: "var(--ds-space-3)" }}>
      <SideNavigation {...args} />
    </div>
  ),
  parameters: { viewport: { defaultViewport: "mobile1" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByTestId("side-navigation-mobile-toggle");
    await new Promise((resolve) => window.setTimeout(resolve, 50));
    const panelId = toggle.getAttribute("aria-controls");
    const panel = panelId
      ? canvasElement.querySelector<HTMLElement>(`[id="${panelId}"]`)
      : null;
    if (!panel) throw new Error("Expected the mobile navigation panel.");

    await expect(panel).toHaveAttribute("inert");
    await expect(document.documentElement).toHaveAttribute("data-ds-motion-preference", "reduced");
    const durations = getComputedStyle(panel).transitionDuration;
    await expect(durations.split(",").every((duration) => Number.parseFloat(duration) === 0)).toBe(true);
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("link", { name: "Overview" })).toBeVisible();
  },
};

export const KeyboardFocus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Collapse navigation" })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("link", { name: "Overview" })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: /Content/ })).toHaveFocus();
  },
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <section aria-label={`${theme} theme`} data-ds-theme={theme} key={theme} style={{ display: "flex", minBlockSize: "18rem", padding: "var(--ds-space-3)", background: "var(--ds-color-canvas)" }}>
          <SideNavigation navigationLabel={`${theme} navigation`} items={sampleItems} defaultActiveId="overview" />
          <h2 style={{ marginInlineStart: "var(--ds-space-4)", color: "var(--ds-color-text-primary)" }}>{theme.toUpperCase()}</h2>
        </section>
      ))}
    </div>
  ),
  parameters: { layout: "padded" },
};
