import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Accordion } from "./Accordion";

describe("Accordion", () => {
  it("normalizes open ids, closes open items, and keeps disabled items inert", () => {
    const onOpenItemsChange = vi.fn();
    render(
      <Accordion
        defaultOpenItems={["first", "first", "missing"]}
        headingLevel={2}
        items={[
          { id: "first", title: "First", content: <p>First content</p> },
          { id: "second", title: "Second", content: <p>Second content</p> },
          { id: "disabled", title: "Disabled", content: <p>Disabled content</p>, disabled: true },
        ]}
        label="Single-open sections"
        onOpenItemsChange={onOpenItemsChange}
        panelMotion="expand"
      />,
    );
    const first = screen.getByRole("button", { name: "First" });
    expect(screen.getByRole("group", { name: "Single-open sections" })).toBeInTheDocument();
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("First content")).toBeVisible();
    const closedPanel = document.getElementById(
      screen.getByRole("button", { name: "Second" }).getAttribute("aria-controls")!,
    )!;
    expect(closedPanel).toHaveAttribute("aria-hidden", "true");
    expect(closedPanel).toHaveAttribute("inert");
    fireEvent.click(first);
    expect(onOpenItemsChange).toHaveBeenLastCalledWith([]);
    fireEvent.click(screen.getByRole("button", { name: "Second" }));
    expect(onOpenItemsChange).toHaveBeenLastCalledWith(["second"]);
    fireEvent.click(screen.getByRole("button", { name: "Disabled" }));
    expect(onOpenItemsChange).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("button", { name: "Disabled" })).toBeDisabled();
  });

  it("allows multiple open items, supports controlled state, and omits an unnamed group role", () => {
    const onOpenItemsChange = vi.fn();
    const { rerender } = render(
      <Accordion
        defaultOpenItems={["first"]}
        items={[
          { id: "first", title: "First", content: "First content" },
          { id: "second", title: "Second", content: "Second content" },
        ]}
        multiple
        onOpenItemsChange={onOpenItemsChange}
        panelMotion="none"
      />,
    );
    expect(screen.queryByRole("group")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Second" }));
    expect(onOpenItemsChange).toHaveBeenCalledWith(["first", "second"]);
    rerender(
      <Accordion
        items={[
          { id: "first", title: "First", content: "First content" },
          { id: "second", title: "Second", content: "Second content" },
        ]}
        openItems={["second", "missing"]}
        onOpenItemsChange={onOpenItemsChange}
        panelMotion="expand"
      />,
    );
    expect(screen.getByRole("button", { name: "First" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "Second" })).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(screen.getByRole("button", { name: "Second" }));
    expect(onOpenItemsChange).toHaveBeenCalledWith([]);
  });
});
