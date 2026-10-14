import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Icon } from "../Icon/Icon";
import { Menu, type MenuEntry } from "./Menu";

const createProject = fn();
const showList = fn();

const menuItems: MenuEntry[] = [
  { type: "item", id: "new-project", label: "New project", icon: "Folder", onSelect: createProject },
  { type: "divider", id: "project-divider" },
  {
    type: "submenu",
    id: "view",
    label: "View",
    icon: "Grid",
    items: [
      { type: "item", id: "grid-view", label: "Grid view", icon: "Grid" },
      { type: "item", id: "list-view", label: "List view", icon: "List", onSelect: showList },
    ],
  },
  { type: "divider", id: "link-divider" },
  {
    type: "item",
    id: "documentation",
    label: "Documentation",
    icon: "Book",
    href: "#menu-documentation",
  },
  { type: "item", id: "archived", label: "Archived projects", disabled: true },
];

const iconChoices = {
  Folder: <Icon name="folder" size="sm" />,
  Grid: <Icon name="grid" size="sm" />,
  List: <Icon name="list" size="sm" />,
  Book: <Icon name="book" size="sm" />,
  Sparkle: <Icon name="sparkle" size="sm" />,
};
type StoryIconName = keyof typeof iconChoices;

const meta = {
  title: "Components/Menu",
  component: Menu,
  args: {
    triggerLabel: "Workspace",
    menuLabel: "Workspace actions",
    items: menuItems,
    triggerVariant: "secondary",
    size: "md",
    placement: "bottom-start",
    submenuMotion: "none",
    closeOnSelect: true,
    disabled: false,
    defaultOpen: false,
    emptyMessage: "No actions available",
  },
  argTypes: {
    triggerLabel: { control: "text" },
    menuLabel: { control: "text" },
    items: { control: "object" },
    trigger: { control: false },
    triggerIcon: { control: false },
    triggerAriaLabel: { control: "text" },
    triggerVariant: { control: "inline-radio", options: ["primary", "secondary", "ghost"] },
    triggerShape: { control: "inline-radio", options: ["rounded", "square", "pill"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    placement: {
      control: "inline-radio",
      options: ["bottom-start", "bottom-end", "top-start", "top-end"],
    },
    submenuMotion: { control: "inline-radio", options: ["none", "fade-slide"] },
    emptyMessage: { control: "text" },
    disabled: { control: "boolean" },
    closeOnSelect: { control: "boolean" },
    defaultOpen: { control: "boolean" },
    open: { control: false },
    onOpenChange: { control: false },
    menuClassName: { control: "text" },
    itemClassName: { control: "text" },
    triggerClassName: { control: "text" },
    style: { control: false },
  },
  render: (args) => <Menu {...args} items={resolveItems(args.items)} />,
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Workspace" });
    await expect(trigger.querySelector('[data-icon="chevron-down"]')).toBeInTheDocument();
    await userEvent.click(trigger);

    const menu = canvas.getByRole("menu", { name: "Workspace actions" });
    await expect(menu).toBeVisible();
    await expect(within(menu).getAllByRole("separator")).toHaveLength(2);
    await expect(within(menu).getByRole("menuitem", { name: "Archived projects" })).toBeDisabled();
    await expect(within(menu).getByRole("menuitem", { name: "New project" })
      .querySelector('[aria-hidden="true"] svg')).toBeInTheDocument();

    await userEvent.click(within(menu).getByRole("menuitem", { name: "View" }));
    const submenu = canvas.getByRole("menu", { name: "View" });
    await expect(submenu).toBeVisible();
    await expect(within(menu).getByRole("menuitem", { name: "View" })
      .querySelector('[data-icon="chevron-right"]')).toBeInTheDocument();
    await userEvent.click(within(submenu).getByRole("menuitem", { name: "List view" }));
    await expect(showList).toHaveBeenCalledOnce();
    await expect(canvas.queryByRole("menu", { name: "Workspace actions" })).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();
  },
};

export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Workspace" });
    await userEvent.click(trigger);

    const firstItem = canvas.getByRole("menuitem", { name: "New project" });
    const submenuTrigger = canvas.getByRole("menuitem", { name: "View" });
    await expect(firstItem).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(submenuTrigger).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");

    const firstSubmenuItem = canvas.getByRole("menuitem", { name: "Grid view" });
    await expect(firstSubmenuItem).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(submenuTrigger).toHaveFocus();
    await userEvent.keyboard("d");
    await expect(canvas.getByRole("menuitem", { name: "Documentation" })).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(submenuTrigger).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveFocus();
    await expect(canvas.queryByRole("menu", { name: "Workspace actions" })).not.toBeInTheDocument();
  },
};

export const SizeAndPlacementExamples: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-6)", paddingBlock: "var(--ds-space-8)" }}>
      {(["sm", "md", "lg"] as const).map((size, index) => (
        <Menu
          key={size}
          triggerLabel={`${size.toUpperCase()} menu`}
          menuLabel={`${size.toUpperCase()} example actions`}
          items={resolveItems(menuItems)}
          size={size}
          placement={index === 2 ? "top-end" : "bottom-start"}
        />
      ))}
    </div>
  ),
};

export const OpenPreview: Story = {
  args: {
    defaultOpen: true,
  },
};

export const SubmenuMotion: Story = {
  args: {
    submenuMotion: "fade-slide",
    defaultOpen: true,
  },
  globals: { motion: "full" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submenuTrigger = canvas.getByRole("menuitem", { name: "View" });
    const submenuId = submenuTrigger.getAttribute("aria-controls");
    const submenu = submenuId
      ? canvasElement.querySelector<HTMLElement>(`[id="${submenuId}"]`)
      : null;
    const submenuLayer = submenu?.parentElement;
    if (!submenu || !submenuLayer) {
      throw new Error("Expected the animated submenu to be rendered.");
    }

    await expect(submenuTrigger).toHaveAttribute("aria-expanded", "false");
    await expect(submenuLayer).toHaveAttribute("aria-hidden", "true");
    await expect(submenuLayer).toHaveAttribute("inert");
    await userEvent.click(submenuTrigger);
    await expect(submenuTrigger).toHaveAttribute("aria-expanded", "true");
    await expect(submenuLayer).not.toHaveAttribute("aria-hidden", "true");
    await expect(submenuLayer).not.toHaveAttribute("inert");
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    await expect(canvas.getByRole("menu", { name: "View" })).toBeVisible();
    await expect(canvas.getByRole("menuitem", { name: "Grid view" })).toHaveFocus();

    await userEvent.click(submenuTrigger);
    await expect(submenuTrigger).toHaveAttribute("aria-expanded", "false");
    await expect(submenuLayer).toHaveAttribute("aria-hidden", "true");
    await expect(submenuLayer).toHaveAttribute("inert");
  },
};

export const ReducedMotion: Story = {
  args: {
    submenuMotion: "fade-slide",
    defaultOpen: true,
  },
  globals: { motion: "reduced" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submenuTrigger = canvas.getByRole("menuitem", { name: "View" });
    await userEvent.click(submenuTrigger);
    const submenu = canvas.getByRole("menu", { name: "View" });
    const submenuLayer = submenu.parentElement;
    if (!submenuLayer) throw new Error("Expected the submenu animation wrapper.");
    await expect(document.documentElement).toHaveAttribute("data-ds-motion-preference", "reduced");
    const transitionDurations = getComputedStyle(submenuLayer).transitionDuration;
    await expect(
      transitionDurations.split(",").every((duration) => Number.parseFloat(duration) === 0),
    ).toBe(true);
    await expect(submenu).toBeVisible();
  },
};

export const LunaOpenPreview: Story = {
  render: () => (
    <div data-ds-theme="luna" style={{ padding: "var(--ds-space-8)" }}>
      <Menu
        triggerLabel="Workspace"
        menuLabel="Workspace actions"
        items={resolveItems(menuItems)}
        defaultOpen
      />
    </div>
  ),
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-6)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <section key={theme} data-ds-theme={theme} style={{ padding: "var(--ds-space-4)" }}>
          <h2>{theme.toUpperCase()}</h2>
          <Menu
            triggerLabel={`${theme} actions`}
            menuLabel={`${theme} workspace actions`}
            items={resolveItems(menuItems)}
            placement="bottom-start"
          />
        </section>
      ))}
    </div>
  ),
};

export const ScopedHookOverrides: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }} data-ds-theme="acme">
      <Menu
        triggerLabel="Default menu"
        menuLabel="Default actions"
        items={resolveItems(menuItems)}
      />
      <Menu
        triggerLabel="Rounded custom menu"
        menuLabel="Custom actions"
        items={resolveItems(menuItems)}
        style={{
          "--ds-menu-radius": "var(--ds-space-5)",
          "--ds-menu-item-hover-bg": "var(--ds-color-accent-bg)",
        }}
      />
      <div data-ds-theme="luna" style={{ padding: "var(--ds-space-4)" }}>
        <Menu
          triggerLabel="Nested Luna menu"
          menuLabel="Luna workspace actions"
          items={resolveItems(menuItems)}
        />
      </div>
    </div>
  ),
};

export const ControlledOpenState: Story = {
  render: () => <ControlledMenu />,
};

export const EmptyAndDisabledStates: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--ds-space-4)" }}>
      <Menu triggerLabel="Empty menu" menuLabel="Empty actions" items={[]} />
      <Menu
        triggerLabel="Disabled menu"
        menuLabel="Unavailable actions"
        items={resolveItems(menuItems)}
        disabled
      />
    </div>
  ),
};

function ControlledMenu() {
  const [open, setOpen] = useState(false);
  return (
    <Menu
      triggerLabel="Controlled menu"
      menuLabel="Controlled actions"
      items={resolveItems(menuItems)}
      open={open}
      onOpenChange={setOpen}
    />
  );
}

function resolveItems(items: readonly MenuEntry[]): MenuEntry[] {
  return items.map((item) => {
    if (item.type === "divider") return item;
    const iconName = typeof item.icon === "string" && item.icon in iconChoices
      ? item.icon as StoryIconName
      : undefined;
    const icon = iconName ? iconChoices[iconName] : item.icon;
    if (item.type === "submenu") return { ...item, icon, items: resolveItems(item.items) };
    return { ...item, icon };
  });
}

