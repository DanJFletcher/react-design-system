import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BottomMenu } from "./BottomMenu";

describe("BottomMenu", () => {
  it("selects enabled links and actions but ignores disabled and prevented selections", () => {
    const onActiveChange = vi.fn();
    const linkClick = vi.fn();
    const linkSelect = vi.fn();
    const actionClick = vi.fn();
    const actionSelect = vi.fn();
    const preventedSelect = vi.fn();
    render(
      <BottomMenu
        alignment="end"
        border={false}
        className="custom-navigation"
        iconOnly={false}
        items={[
          {
            id: "home",
            label: "Home",
            href: "/home",
            target: "_blank",
            rel: "noreferrer",
            icon: <span>H</span>,
            badge: "New",
            onClick: linkClick,
            onSelect: linkSelect,
          },
          { id: "refresh", label: "Refresh", onClick: actionClick, onSelect: actionSelect },
          { id: "cancelled", label: "Cancelled", onSelect: preventedSelect, onClick: (event) => event.preventDefault() },
          { id: "disabled", label: "Unavailable", href: "/unavailable", disabled: true, onSelect: preventedSelect },
        ]}
        navigationLabel="Mobile navigation"
        onActiveChange={onActiveChange}
        presentation="floating"
        size="lg"
      />,
    );
    const navigation = screen.getByRole("navigation", { name: "Mobile navigation" });
    expect(navigation).toHaveAttribute("data-presentation", "floating");
    expect(navigation).toHaveAttribute("data-alignment", "end");
    expect(navigation).toHaveAttribute("data-border", "false");
    const link = screen.getByRole("link", { name: "HomeNew" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
    fireEvent.click(link);
    expect(linkClick).toHaveBeenCalledOnce();
    expect(linkSelect).toHaveBeenCalledOnce();
    expect(onActiveChange).toHaveBeenCalledWith("home", expect.objectContaining({ id: "home" }));
    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    expect(actionClick).toHaveBeenCalledOnce();
    expect(actionSelect).toHaveBeenCalledOnce();
    expect(onActiveChange).toHaveBeenLastCalledWith("refresh", expect.objectContaining({ id: "refresh" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancelled" }));
    fireEvent.click(screen.getByTestId("bottom-menu-item-disabled"));
    expect(preventedSelect).toHaveBeenCalledOnce();
    expect(onActiveChange).toHaveBeenCalledTimes(2);
  });

  it("uses custom item labels, ids, and controlled active state", () => {
    const onActiveChange = vi.fn();
    const { rerender } = render(
      <BottomMenu
        activeId="current"
        items={[
          { id: "current", label: "Current", href: "/current", className: "current-link" },
          { id: "next", label: "Next", href: "/next" },
        ]}
        onActiveChange={onActiveChange}
      />,
    );
    expect(screen.getByRole("link", { name: "Current" })).toHaveAttribute("aria-current", "page");
    fireEvent.click(screen.getByRole("link", { name: "Next" }));
    expect(onActiveChange).toHaveBeenCalledWith("next", expect.objectContaining({ id: "next" }));
    expect(screen.getByRole("link", { name: "Current" })).toHaveAttribute("aria-current", "page");
    rerender(<BottomMenu items={[{ id: "action", label: "Action", icon: <span>A</span> }]} />);
    expect(screen.getByRole("button", { name: "Action" })).toHaveAttribute("aria-pressed", "false");
  });

});
