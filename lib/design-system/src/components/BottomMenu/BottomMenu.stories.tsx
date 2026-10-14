import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import { BottomMenu, type BottomMenuItem } from "./BottomMenu";

const sampleItems: readonly BottomMenuItem[] = [
  { id: "overview", label: "Overview", href: "#overview", icon: <Icon name="grid" /> },
  { id: "appointments", label: "Appointments", onClick: fn(), icon: <Icon name="book" />, badge: "3" },
  { id: "services", label: "Services", href: "#services", icon: <Icon name="list" /> },
  { id: "settings", label: "Settings", onClick: fn(), icon: <Icon name="settings" /> },
];

function ControlledMenu() {
  const [active, setActive] = useState("overview");
  return (
    <div>
      <BottomMenu
        activeId={active}
        items={sampleItems}
        onActiveChange={setActive}
        presentation="floating"
      />
      <output aria-live="polite" data-testid="selected-menu-item">
        Selected: {active}
      </output>
    </div>
  );
}

const meta = {
  title: "Components/BottomMenu",
  component: BottomMenu,
  args: {
    items: sampleItems,
    defaultActiveId: "overview",
    navigationLabel: "Business navigation",
    size: "md",
    presentation: "full-width",
    alignment: "center",
    onActiveChange: fn(),
  },
  argTypes: {
    items: { control: false },
    activeId: { control: false },
    defaultActiveId: { control: "text" },
    onActiveChange: { control: false },
    action: { control: false },
    className: { control: false },
    style: { control: false },
  },
  parameters: {
    layout: "fullscreen",
    docs: { description: { component: "A persistent viewport-level navigation bar. Add bottom spacing to your page content so the fixed bar does not obscure it." } },
  },
} satisfies Meta<typeof BottomMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    action: <Button size="sm" onClick={fn()}>Book now</Button>,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /^Appointments/ }));
    await expect(args.onActiveChange).toHaveBeenCalledWith("appointments", expect.anything());
  },
};

export const Controlled: Story = {
  render: () => <ControlledMenu />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /^Appointments/ }));
    await expect(canvas.getByTestId("selected-menu-item")).toHaveTextContent("Selected: appointments");
  },
};

export const IconOnly: Story = {
  args: { iconOnly: true, presentation: "floating" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "Overview" })).toBeInTheDocument();
  },
};

export const DisabledItems: Story = {
  args: {
    items: [
      { id: "home", label: "Home", href: "#home", icon: <Icon name="grid" /> },
      { id: "billing", label: "Billing", href: "#billing", disabled: true, icon: <Icon name="book" /> },
      { id: "help", label: "Help", onClick: fn(), icon: <Icon name="circle-info" /> },
    ],
    defaultActiveId: "home",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const disabledLink = canvas.getByTestId("bottom-menu-item-billing");
    await expect(disabledLink).toHaveAttribute("aria-disabled", "true");
    await expect(disabledLink).not.toHaveAttribute("href");
  },
};

export const LinkNavigation: Story = {
  args: {
    items: [
      { id: "home", label: "Home", href: "/dashboard", icon: <Icon name="grid" /> },
      { id: "reports", label: "Reports", href: "/reports", icon: <Icon name="book" /> },
      { id: "settings", label: "Settings", href: "/settings", icon: <Icon name="settings" /> },
    ],
    activeId: "reports",
  },
};

export const KeyboardFocus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole("link", { name: "Overview" })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: /^Appointments/ })).toHaveFocus();
  },
};

export const NarrowViewport: Story = {
  render: () => (
    <div style={{ inlineSize: "320px", minBlockSize: "22rem", marginInline: "auto", background: "var(--ds-color-canvas)" }}>
      <p style={{ padding: "var(--ds-space-4)", color: "var(--ds-color-text-primary)" }}>
        At narrow widths the destinations stay usable and the row can scroll horizontally.
      </p>
      <BottomMenu
        defaultActiveId="overview"
        items={[
          ...sampleItems,
          { id: "messages", label: "Messages", href: "#messages", icon: <Icon name="circle-info" /> },
          { id: "saved", label: "Saved", href: "#saved", icon: <Icon name="heart" /> },
        ]}
        presentation="floating"
      />
    </div>
  ),
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)", paddingBlock: "var(--ds-space-4)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <section
          aria-label={`${theme} theme`}
          data-ds-theme={theme}
          key={theme}
          style={{ minBlockSize: "6rem", padding: "var(--ds-space-3)", background: "var(--ds-color-canvas)" }}
        >
          <h2 style={{ color: "var(--ds-color-text-primary)", margin: 0 }}>{theme.toUpperCase()}</h2>
          <BottomMenu
            navigationLabel={`${theme} business navigation`}
            defaultActiveId="overview"
            items={sampleItems}
            presentation="floating"
          />
        </section>
      ))}
    </div>
  ),
  parameters: { layout: "padded" },
};
