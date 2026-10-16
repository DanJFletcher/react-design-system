import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Label } from "./Label";

describe("Label", () => {
  it("renders a native label associated with a control and forwards attributes and refs", () => {
    const ref = createRef<HTMLLabelElement>();
    render(
      <>
        <Label data-testid="company-label" htmlFor="company" id="name-label" ref={ref}>
          Company name
        </Label>
        <input id="company" />
      </>,
    );
    const label = screen.getByTestId("company-label");

    expect(label.tagName).toBe("LABEL");
    expect(label).toHaveAttribute("for", "company");
    expect(label).toHaveAttribute("id", "name-label");
    expect(label).toHaveAttribute("data-variant", "field");
    expect(screen.getByLabelText("Company name")).toHaveAttribute("id", "company");
    expect(ref.current).toBe(label);
  });

  it("adds a decorative required marker without adding validation attributes", () => {
    render(
      <>
        <Label htmlFor="email" required>
          Email address
        </Label>
        <input id="email" />
      </>,
    );
    const input = screen.getByRole("textbox", { name: "Email address" });
    const marker = screen.getByText("*");

    expect(input).not.toBeRequired();
    expect(marker).toHaveAttribute("aria-hidden", "true");
  });

  it("supports choice layout and a visual disabled state without changing control state", () => {
    render(
      <>
        <Label data-testid="choice-label" disabled htmlFor="updates" variant="choice">
          <input id="updates" type="checkbox" />
          Send updates
        </Label>
      </>,
    );
    const label = screen.getByTestId("choice-label");
    const checkbox = screen.getByRole("checkbox", { name: "Send updates" });

    expect(label).toHaveAttribute("data-variant", "choice");
    expect(label).toHaveAttribute("data-disabled", "true");
    expect(label).not.toHaveAttribute("aria-disabled");
    expect(checkbox).not.toBeDisabled();
  });

  it("omits optional state attributes and markers by default", () => {
    render(<Label data-testid="plain-label">Notes</Label>);
    const label = screen.getByTestId("plain-label");

    expect(label).not.toHaveAttribute("data-disabled");
    expect(label).not.toHaveTextContent("*");
    expect(label).not.toHaveAttribute("required");
  });
});
