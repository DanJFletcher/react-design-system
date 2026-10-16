import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Menu, type MenuEntry } from "./Menu";

describe("Menu", () => {
  it("opens actions, supports roving keyboard navigation and typeahead, then dismisses", () => {
    const onOpenChange = vi.fn();
    const onSelect = vi.fn();
    const items: MenuEntry[] = [
      { type: "item", id: "alpha", label: "Alpha", onSelect },
      { type: "divider", id: "divider" },
      { type: "item", id: "disabled", label: "Disabled item", disabled: true },
      { type: "item", id: "beta", label: "Beta" },
    ];
    render(
      <Menu
        defaultOpen={false}
        items={items}
        menuLabel="Workspace actions"
        menuMotion="none"
        onOpenChange={onOpenChange}
        triggerLabel="Open actions"
      />,
    );
    const trigger = screen.getByRole("button", { name: "Open actions" });
    fireEvent.click(trigger);
    const menu = screen.getByRole("menu", { name: "Workspace actions" });
    const alpha = within(menu).getByRole("menuitem", { name: "Alpha" });
    const beta = within(menu).getByRole("menuitem", { name: "Beta" });
    expect(alpha).toHaveFocus();
    fireEvent.keyDown(menu, { key: "b" });
    expect(beta).toHaveFocus();
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(alpha).toHaveFocus();
    fireEvent.click(alpha);
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("supports submenu navigation, back keys, nested selection, and custom close behavior", () => {
    const onSelect = vi.fn();
    const items: MenuEntry[] = [
      {
        type: "submenu",
        id: "export",
        label: "Export",
        items: [
          { type: "item", id: "pdf", label: "PDF", onSelect },
          { type: "item", id: "csv", label: "CSV" },
        ],
      },
    ];
    render(
      <Menu
        closeOnSelect={false}
        defaultOpen
        items={items}
        menuLabel="Document actions"
        menuMotion="none"
        submenuMotion="none"
        triggerLabel="Document actions"
      />,
    );
    const parentMenu = screen.getByRole("menu", { name: "Document actions" });
    const submenuTrigger = within(parentMenu).getByRole("menuitem", { name: "Export" });
    fireEvent.keyDown(submenuTrigger, { key: "Enter" });
    fireEvent.keyDown(submenuTrigger, { key: "ArrowRight" });
    const submenu = screen.getByRole("menu", { name: "Export" });
    expect(within(submenu).getByRole("menuitem", { name: "PDF" })).toHaveFocus();
    fireEvent.keyDown(submenu, { key: "ArrowLeft" });
    expect(submenuTrigger).toHaveFocus();
    fireEvent.click(submenuTrigger);
    fireEvent.click(screen.getByRole("menuitem", { name: "CSV" }));
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Document actions" })).toHaveAttribute("aria-expanded", "true");
  });

  it("renders empty and disabled states and supports controlled open and outside dismissal", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Menu defaultOpen emptyMessage="Nothing to do yet." items={[]} menuLabel="Empty actions" menuMotion="none" triggerLabel="Empty menu" />,
    );
    fireEvent.keyDown(screen.getByRole("menu", { name: "Empty actions" }), { key: "ArrowDown" });
    expect(screen.getByRole("menuitem", { name: "Nothing to do yet." })).toHaveAttribute("aria-disabled", "true");
    rerender(
      <Menu
        disabled
        items={[{ type: "item", id: "one", label: "One" }]}
        menuLabel="Disabled actions"
        open
        onOpenChange={onOpenChange}
        triggerLabel="Disabled menu"
      />,
    );
    expect(screen.getByRole("button", { name: "Disabled menu" })).toBeDisabled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
    rerender(
      <Menu
        items={[{ type: "item", id: "one", label: "One" }]}
        menuLabel="Controlled actions"
        open
        onOpenChange={onOpenChange}
        triggerLabel="Controlled menu"
      />,
    );
    fireEvent.pointerDown(screen.getByRole("button", { name: "Controlled menu" }));
    fireEvent.pointerDown(document.body);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("dismisses a root menu from Escape and exposes a menu-mode trigger", () => {
    const onOpenChange = vi.fn();
    render(
      <Menu
        defaultOpen
        items={[{ type: "item", id: "one", label: "One" }]}
        menuLabel="Root escape menu"
        menuMotion="none"
        mode="menu"
        onOpenChange={onOpenChange}
        triggerLabel="Open root menu"
      />,
    );
    const trigger = screen.getByRole("button", { name: "Open root menu" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    fireEvent.keyDown(screen.getByRole("menu", { name: "Root escape menu" }), { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders navigation entries, separator, footer, and respects prevented selection", () => {
    const onSelect = vi.fn((event: React.MouseEvent<HTMLAnchorElement>) => event.preventDefault());
    render(
      <Menu
        desktopInline
        items={[
          { type: "item", id: "home", label: "Home", href: "/", onSelect },
          { type: "divider", id: "rule" },
          { type: "item", id: "about", label: "About", href: "/about" },
        ]}
        mode="navigation"
        navigationFooter={<a href="/account">Account</a>}
        menuLabel="Main menu"
        triggerLabel="Main menu"
      />,
    );
    const navigation = screen.getByRole("navigation", { name: "Main menu" });
    expect(navigation).toHaveAttribute("data-desktop-inline", "true");
    expect(within(navigation).getByRole("separator")).toBeInTheDocument();
    expect(within(navigation).getByRole("link", { name: "Account" })).toHaveAttribute("href", "/account");
    fireEvent.click(within(navigation).getByRole("link", { name: "Home" }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Main menu" })).toHaveAttribute("aria-expanded", "false");
  });

  it("does not advertise a menu popup on a navigation-mode trigger", () => {
    render(
      <Menu
        items={[{ type: "item", id: "home", label: "Home", href: "/" }]}
        menuLabel="Section links"
        mode="navigation"
        triggerLabel="Open section links"
      />,
    );
    expect(screen.getByRole("button", { name: "Open section links" })).not.toHaveAttribute("aria-haspopup");
  });

  it("uses the explicit trigger label when a custom trigger node is supplied", () => {
    render(
      <Menu
        items={[{ type: "item", id: "edit", label: "Edit" }]}
        trigger={<span>Custom content</span>}
        triggerLabel="Edit actions"
      />,
    );
    expect(screen.getByRole("button", { name: "Edit actions" })).toHaveTextContent("Custom content");
  });

  it("supports keyboard wrapping, Home and End, and Tab dismissal", () => {
    const onOpenChange = vi.fn();
    const onKeyDown = vi.fn();
    render(
      <Menu
        defaultOpen
        items={[
          { type: "item", id: "first", label: "First" },
          { type: "divider", id: "rule" },
          { type: "item", id: "disabled", label: "Disabled", disabled: true },
          { type: "item", id: "last", label: "Last" },
        ]}
        menuLabel="Keyboard menu"
        menuMotion="none"
        onKeyDown={onKeyDown}
        onOpenChange={onOpenChange}
        triggerLabel="Keyboard menu"
      />,
    );
    const menu = screen.getByRole("menu", { name: "Keyboard menu" });
    const first = screen.getByRole("menuitem", { name: "First" });
    const last = screen.getByRole("menuitem", { name: "Last" });
    fireEvent.keyDown(menu, { key: "ArrowUp" });
    expect(last).toHaveFocus();
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(first).toHaveFocus();
    fireEvent.keyDown(menu, { key: "End" });
    expect(last).toHaveFocus();
    fireEvent.keyDown(menu, { key: "Home" });
    expect(first).toHaveFocus();
    fireEvent.keyDown(menu, { key: "Tab" });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(onKeyDown).toHaveBeenCalledTimes(5);
  });

  it("handles navigation Escape and outside blur unless the caller prevents them", () => {
    const onOpenChange = vi.fn();
    const onKeyDown = vi.fn((event: React.KeyboardEvent<HTMLDivElement>) => event.preventDefault());
    const props = {
      defaultOpen: true,
      desktopInline: true,
      items: [{ type: "item", id: "home", label: "Home", href: "/" }] satisfies MenuEntry[],
      mode: "navigation" as const,
      menuLabel: "Keyboard navigation",
      menuMotion: "none" as const,
      onOpenChange,
      triggerLabel: "Keyboard navigation",
    };
    const { rerender } = render(
      <div>
        <Menu {...props} onKeyDown={onKeyDown} />
        <button type="button">Outside navigation</button>
      </div>,
    );
    const trigger = screen.getByRole("button", { name: "Keyboard navigation" });
    const root = trigger.parentElement!;
    fireEvent.keyDown(root, { key: "Escape" });
    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(onOpenChange).not.toHaveBeenCalled();
    rerender(
      <div>
        <Menu {...props} />
        <button type="button">Outside navigation</button>
      </div>,
    );
    vi.spyOn(trigger, "getClientRects").mockReturnValue([{} as DOMRect] as unknown as DOMRectList);
    fireEvent.keyDown(root, { key: "Escape" });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(trigger).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "Keyboard navigation" }));
    fireEvent.blur(root, { relatedTarget: screen.getByRole("button", { name: "Outside navigation" }) });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("opens and closes nested submenus with pointer and Escape interactions", () => {
    render(
      <Menu
        defaultOpen
        items={[
          {
            type: "submenu",
            id: "more",
            label: "More actions",
            items: [{ type: "item", id: "rename", label: "Rename" }],
          },
          { type: "item", id: "settings", label: "Settings" },
        ]}
        menuLabel="Nested actions"
        menuMotion="fade-slide"
        submenuMotion="fade-slide"
        triggerLabel="Nested actions"
      />,
    );
    const parentMenu = screen.getByRole("menu", { name: "Nested actions" });
    const submenuTrigger = within(parentMenu).getByRole("menuitem", { name: "More actions" });
    expect(submenuTrigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.mouseEnter(submenuTrigger);
    fireEvent.keyDown(submenuTrigger, { key: "ArrowRight" });
    const submenu = screen.getByRole("menu", { name: "More actions" });
    expect(submenuTrigger).toHaveAttribute("aria-expanded", "true");
    expect(within(submenu).getByRole("menuitem", { name: "Rename" })).toHaveFocus();
    fireEvent.keyDown(submenu, { key: "Escape" });
    expect(submenuTrigger).toHaveAttribute("aria-expanded", "false");
    expect(submenuTrigger).toHaveFocus();
    fireEvent.click(submenuTrigger);
    expect(submenuTrigger).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(submenuTrigger, { key: "ArrowRight" });
    expect(submenuTrigger).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(submenuTrigger);
    expect(submenuTrigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(submenuTrigger);
    fireEvent.focus(screen.getByRole("menuitem", { name: "Settings" }));
    expect(submenuTrigger).toHaveAttribute("aria-expanded", "false");
  });

  it("supports action links, pointer focus, typeahead reset, and ref forwarding", () => {
    vi.useFakeTimers();
    const callbackRef = vi.fn();
    const objectRef = createRef<HTMLDivElement>();
    const { rerender, unmount } = render(
      <Menu
        defaultOpen
        items={[
          { type: "item", id: "docs", label: "Documentation", href: "/docs" },
          { type: "item", id: "other", label: "Other action" },
        ]}
        menuLabel="Linked actions"
        menuMotion="none"
        ref={callbackRef}
        trigger={<span>Icon trigger</span>}
        triggerAriaLabel="Open linked actions"
        triggerLabel="Open menu"
      />,
    );
    const trigger = screen.getByRole("button", { name: "Open linked actions" });
    const root = trigger.parentElement!;
    expect(callbackRef).toHaveBeenCalledWith(root);
    const menu = screen.getByRole("menu", { name: "Linked actions" });
    const documentation = screen.getByRole("menuitem", { name: "Documentation" });
    fireEvent.focus(documentation);
    fireEvent.mouseEnter(documentation);
    fireEvent.keyDown(menu, { key: "x" });
    fireEvent.keyDown(menu, { key: "d" });
    fireEvent.keyDown(menu, { key: "o" });
    act(() => vi.advanceTimersByTime(601));
    fireEvent.keyDown(menu, { key: "o" });
    const other = screen.getByRole("menuitem", { name: "Other action" });
    expect(other).toHaveFocus();
    fireEvent.focus(other);
    fireEvent.mouseEnter(other);
    rerender(
      <Menu
        defaultOpen
        items={[{ type: "item", id: "one", label: "One" }]}
        menuLabel="Object ref"
        menuMotion="none"
        ref={objectRef}
        triggerLabel="Object ref"
      />,
    );
    expect(objectRef.current).toBe(screen.getByRole("button", { name: "Object ref" }).parentElement);
    unmount();
    vi.useRealTimers();
  });

  it("keeps an animated navigation panel hidden until opened and no-ops on inline selection", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Menu
        items={[{ type: "item", id: "home", label: "Home", href: "/" }]}
        menuLabel="Animated navigation"
        menuMotion="fade-slide"
        mode="navigation"
        onOpenChange={onOpenChange}
        triggerLabel="Navigation"
      />,
    );
    const navigation = document.querySelector('nav[aria-label="Animated navigation"]')!;
    expect(navigation).toHaveAttribute("aria-hidden", "true");
    expect(navigation).toHaveAttribute("inert");
    rerender(
      <Menu
        items={[{ type: "item", id: "one", label: "One" }]}
        menuLabel="Animated menu"
        menuMotion="fade-slide"
        mode="menu"
        triggerLabel="Menu trigger"
      />,
    );
    const menu = document.querySelector('ul[role="menu"][aria-label="Animated menu"]')!;
    expect(menu).toHaveAttribute("aria-hidden", "true");
    expect(menu).toHaveAttribute("inert");
    rerender(
      <Menu
        desktopInline
        items={[{ type: "item", id: "home", label: "Home", href: "/" }]}
        menuLabel="Inline navigation"
        mode="navigation"
        onOpenChange={onOpenChange}
        triggerLabel="Inline navigation"
      />,
    );
    fireEvent.click(screen.getByRole("link", { name: "Home" }));
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
