import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Kbd } from "./Kbd";

describe("Kbd", () => {
  it("renders a native key element with its content and forwards native props and ref", () => {
    const ref = createRef<HTMLElement>();
    render(
      <Kbd data-testid="shortcut-key" id="shortcut-key" ref={ref} title="Control key">
        Ctrl
      </Kbd>,
    );
    const key = screen.getByTestId("shortcut-key");

    expect(key.tagName).toBe("KBD");
    expect(key).toHaveTextContent("Ctrl");
    expect(key).toHaveAttribute("id", "shortcut-key");
    expect(key).toHaveAttribute("title", "Control key");
    expect(ref.current).toBe(key);
  });

  it("defaults to medium size and square shape", () => {
    render(<Kbd>Enter</Kbd>);
    const key = screen.getByText("Enter");

    expect(key).toHaveAttribute("data-size", "md");
    expect(key).toHaveAttribute("data-shape", "square");
  });

  it("supports small rounded keycaps and consumer class names", () => {
    render(
      <Kbd
        className="consumer-key"
        data-testid="rounded-key"
        shape="rounded"
        size="sm"
      >
        Esc
      </Kbd>,
    );
    const key = screen.getByTestId("rounded-key");

    expect(key).toHaveAttribute("data-size", "sm");
    expect(key).toHaveAttribute("data-shape", "rounded");
    expect(key).toHaveClass("consumer-key");
  });

  it("composes key elements for shortcut chords without adding interaction", () => {
    render(
      <p>
        Press <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd> to search.
      </p>,
    );

    expect(screen.getByText("Ctrl").tagName).toBe("KBD");
    expect(screen.getByText("K").tagName).toBe("KBD");
    const instruction = screen.getByText(/to search/);
    expect(instruction.tagName).toBe("P");
    expect(instruction).toHaveTextContent("Press Ctrl + K to search.");
  });
});
