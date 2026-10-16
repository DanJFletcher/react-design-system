import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders a named section with an h2 title and compact layout by default", () => {
    render(<EmptyState title="No pages yet" />);

    expect(screen.getByRole("region", { name: "No pages yet" })).toHaveAttribute(
      "data-layout",
      "compact",
    );
    expect(screen.getByRole("heading", { level: 2, name: "No pages yet" })).toBeInTheDocument();
  });

  it("renders its optional icon, description, and action slots", () => {
    render(
      <EmptyState
        actions={<button type="button">Create a page</button>}
        description="Start with a blank page or use a template."
        icon={<span data-testid="empty-state-icon">□</span>}
        title="Your workspace is clear"
      />,
    );

    const region = screen.getByRole("region", { name: "Your workspace is clear" });
    const icon = screen.getByTestId("empty-state-icon");
    expect(region).toBeInTheDocument();
    expect(icon.closest("[aria-hidden='true']")).not.toBeNull();
    expect(screen.getByText("Start with a blank page or use a template.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create a page" })).toBeInTheDocument();
  });

  it("supports a custom heading level and externally labelled section", () => {
    render(
      <>
        <span id="library-empty-label">Media results</span>
        <EmptyState
          aria-labelledby="library-empty-label"
          headingLevel={4}
          title="No matching images"
        />
      </>,
    );

    expect(screen.getByRole("region", { name: "Media results" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 4, name: "No matching images" })).toBeInTheDocument();
  });

  it("forwards section attributes, className, full layout, and ref", () => {
    const ref = createRef<HTMLElement>();
    render(
      <EmptyState
        aria-describedby="empty-help"
        className="consumer-empty-state"
        data-testid="full-empty-state"
        id="empty-results"
        layout="full"
        ref={ref}
        title="No results"
      />,
    );

    const section = screen.getByTestId("full-empty-state");
    expect(section).toHaveAttribute("aria-describedby", "empty-help");
    expect(section).toHaveAttribute("id", "empty-results");
    expect(section).toHaveAttribute("data-layout", "full");
    expect(section).toHaveClass("consumer-empty-state");
    expect(ref.current).toBe(section);
  });
});
