import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Breadcrumbs } from "./Breadcrumbs";

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  Object.defineProperty(window, "matchMedia", { configurable: true, value: originalMatchMedia });
});

describe("Breadcrumbs", () => {
  it("subscribes to the responsive breakpoint and expands a single hidden level", () => {
    let matches = true;
    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn((query: string) => ({
        matches,
        media: query,
        addEventListener: (_event: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
        removeEventListener: (_event: string, listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener),
      })),
    });
    const { rerender } = render(
      <Breadcrumbs
        collapseAt="640px"
        items={[
          { label: "Home", href: "/" },
          { label: "Garden", href: "/garden" },
          { label: "Plants", href: "/garden/plants" },
          { label: "Current", current: true },
        ]}
      />,
    );
    const list = document.querySelector("ol");
    expect(list).toHaveAttribute("data-collapse-active", "true");
    const button = screen.getByRole("button", { name: "Show 2 hidden breadcrumb levels" });
    fireEvent.click(button);
    expect(screen.getByRole("button", { name: "Hide intermediate breadcrumb levels" })).toHaveAttribute("aria-expanded", "true");
    rerender(
      <Breadcrumbs
        collapseAt="640px"
        items={[
          { label: "Home", href: "/" },
          { label: "Garden", href: "/garden" },
          { label: "Current", current: true },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Hide intermediate breadcrumb levels" }));
    fireEvent.click(screen.getByRole("button", { name: "Show 1 hidden breadcrumb level" }));
    expect(screen.getByRole("button", { name: "Hide intermediate breadcrumb levels" })).toHaveAttribute("aria-expanded", "true");
    matches = false;
    act(() => {
      listeners.forEach((listener) => listener({ matches: false } as MediaQueryListEvent));
    });
    expect(list).toHaveAttribute("data-collapse-active", "false");
  });

  it("renders the default breakpoint behavior for a simple trail", () => {
    render(<Breadcrumbs aria-label="Page trail" items={[{ label: "Start", href: "/start" }, { label: "Current", current: true }]} />);
    expect(screen.getByRole("navigation", { name: "Page trail" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start" })).toHaveAttribute("href", "/start");
    expect(screen.getByText("Current")).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("uses the non-collapsed snapshot during server rendering", () => {
    const html = renderToString(
      <Breadcrumbs
        collapseAt="640px"
        items={[
          { label: "Home", href: "/" },
          { label: "Garden", href: "/garden" },
          { label: "Current", current: true },
        ]}
      />,
    );
    expect(html).toContain('data-collapse-active="false"');
  });

  it("rejects invalid parent and current-page items", () => {
    expect(() => render(<Breadcrumbs items={[]} />)).toThrow(/at least one item/);
    expect(() => render(<Breadcrumbs items={[{ label: " ", href: "/" }, { label: "Current", current: true }]} />)).toThrow(/labels must not be empty/);
    expect(() => render(<Breadcrumbs items={[{ label: "Home", href: "/" } as never]} />)).toThrow(/last item/);
    expect(() => render(<Breadcrumbs items={[{ label: "Current", current: true }, { label: "Next", current: true }]} />)).toThrow(/parent items/);
    expect(() => render(<Breadcrumbs items={[{ label: "Home", href: " " }, { label: "Current", current: true }]} />)).toThrow(/parent items/);
  });
});
