import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("renders a native header and an h1 by default", () => {
    render(<PageHeader data-testid="page-header" title="Content dashboard" />);

    const header = screen.getByTestId("page-header");
    expect(header.tagName).toBe("HEADER");
    expect(screen.getByRole("heading", { level: 1, name: "Content dashboard" })).toBeInTheDocument();
  });

  it("renders breadcrumbs, description, status, and actions in their slots", () => {
    render(
      <PageHeader
        actions={<button type="button">Create page</button>}
        breadcrumbs={<nav aria-label="Breadcrumb"><a href="/">Home</a></nav>}
        description="Review and publish your content."
        headingLevel={2}
        status={<span>Draft</span>}
        title="Pages"
      />,
    );

    expect(screen.getByRole("heading", { level: 2, name: "Pages" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toHaveTextContent("Home");
    expect(screen.getByText("Review and publish your content.")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create page" })).toBeInTheDocument();
  });

  it("forwards native header attributes, className, and refs", () => {
    const ref = createRef<HTMLElement>();
    render(
      <PageHeader
        aria-label="Current page"
        className="consumer-page-header"
        data-testid="custom-header"
        id="current-page"
        ref={ref}
        title="Overview"
      />,
    );
    const header = screen.getByTestId("custom-header");

    expect(header).toHaveAttribute("aria-label", "Current page");
    expect(header).toHaveAttribute("id", "current-page");
    expect(header).toHaveClass("consumer-page-header");
    expect(ref.current).toBe(header);
  });

  it("does not render wrappers for omitted optional slots", () => {
    render(<PageHeader title="Minimal page" />);

    expect(screen.getByRole("heading", { level: 1, name: "Minimal page" })).toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
