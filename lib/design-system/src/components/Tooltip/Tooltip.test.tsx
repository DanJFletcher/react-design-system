import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Tooltip } from "./Tooltip";

let disconnectObserverCalls: number;

function createRect(left: number, top: number, width: number, height: number): DOMRect {
  return {
    x: left,
    y: top,
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height,
    toJSON: () => ({}),
  };
}

function setRect(element: Element, rect: DOMRect) {
  vi.spyOn(element, "getBoundingClientRect").mockReturnValue(rect);
}

beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, "showPopover", {
    configurable: true,
    value(this: HTMLElement) {
      this.setAttribute("data-native-popover-open", "");
      this.style.display = "block";
    },
  });
  Object.defineProperty(HTMLElement.prototype, "hidePopover", {
    configurable: true,
    value(this: HTMLElement) {
      this.removeAttribute("data-native-popover-open");
      this.style.display = "none";
    },
  });

  const nativeMatches = HTMLElement.prototype.matches;
  vi.spyOn(HTMLElement.prototype, "matches").mockImplementation(function (
    this: HTMLElement,
    selector: string,
  ) {
    if (selector === ":popover-open") return this.hasAttribute("data-native-popover-open");
    return nativeMatches.call(this, selector);
  });

  disconnectObserverCalls = 0;
  class ResizeObserverStub implements ResizeObserver {
    constructor(_callback: ResizeObserverCallback) {}
    observe() {}
    unobserve() {}
    disconnect() {
      disconnectObserverCalls += 1;
    }
  }
  globalThis.ResizeObserver = ResizeObserverStub;

  Object.defineProperty(document.documentElement, "clientWidth", {
    configurable: true,
    value: 320,
  });
  Object.defineProperty(document.documentElement, "clientHeight", {
    configurable: true,
    value: 240,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Tooltip", () => {
  it("keeps its trigger closed initially and merges its description id with the trigger's", () => {
    render(
      <Tooltip content="More details">
        <button aria-describedby="existing-description" type="button">Help</button>
      </Tooltip>,
    );

    const trigger = screen.getByRole("button", { name: "Help" });
    const tooltip = screen.getByRole("tooltip", { hidden: true });

    expect(trigger.getAttribute("aria-describedby")).toContain("existing-description");
    expect(trigger.getAttribute("aria-describedby")).toContain(tooltip.id);
    expect(tooltip).toHaveAttribute("data-open", "false");
    expect(tooltip).toHaveAttribute("hidden");
    expect(tooltip).toHaveTextContent("More details");
  });

  it("forwards an object ref to the trigger wrapper", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <Tooltip content="More details" ref={ref}>
        <button type="button">Help</button>
      </Tooltip>,
    );

    expect(ref.current).toBe(screen.getByRole("button").parentElement);
  });

  it("forwards a callback ref to the trigger wrapper", () => {
    const nodes: Array<HTMLSpanElement | null> = [];
    const ref = (node: HTMLSpanElement | null) => {
      nodes.push(node);
    };
    render(
      <Tooltip content="More details" ref={ref}>
        <button type="button">Help</button>
      </Tooltip>,
    );

    expect(nodes[0]).toBe(screen.getByRole("button").parentElement);
  });

  it("opens on mouse hover, dismisses on Escape, and cleans up its resize observer", () => {
    const { unmount } = render(
      <Tooltip content="Hover help">
        <button type="button">Hover trigger</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button", { name: "Hover trigger" });
    const anchor = trigger.parentElement!;

    fireEvent.pointerEnter(anchor, { pointerType: "mouse" });
    expect(screen.getByRole("tooltip", { hidden: true })).toHaveAttribute("data-open", "true");

    const otherKey = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Enter",
    });
    document.dispatchEvent(otherKey);
    expect(otherKey.defaultPrevented).toBe(false);
    expect(screen.getByRole("tooltip", { hidden: true })).toHaveAttribute("data-open", "true");

    const escape = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Escape",
    });
    act(() => {
      document.dispatchEvent(escape);
    });
    expect(escape.defaultPrevented).toBe(true);
    expect(screen.getByRole("tooltip", { hidden: true })).toHaveAttribute("data-open", "false");

    unmount();
    expect(disconnectObserverCalls).toBeGreaterThan(0);
  });

  it("closes when a pointer press lands outside the trigger", () => {
    render(
      <Tooltip content="Dismissible help">
        <button type="button">Help trigger</button>
      </Tooltip>,
    );
    fireEvent.pointerEnter(screen.getByRole("button").parentElement!, { pointerType: "mouse" });
    expect(screen.getByRole("tooltip", { hidden: true })).toHaveAttribute("data-open", "true");

    fireEvent.pointerDown(document.body, { pointerType: "mouse" });

    expect(screen.getByRole("tooltip", { hidden: true })).toHaveAttribute("data-open", "false");
  });

  it("opens on focus and stays open when focus moves within the tooltip trigger", () => {
    const onFocusCapture = vi.fn();
    const onBlurCapture = vi.fn();
    render(
      <Tooltip
        content="Focus help"
        onBlurCapture={onBlurCapture}
        onFocusCapture={onFocusCapture}
      >
        <button type="button">
          Help
          <span data-testid="nested-trigger-content" tabIndex={0}>nested</span>
        </button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button", { name: "Helpnested" });
    const nested = screen.getByTestId("nested-trigger-content");

    fireEvent.focus(trigger);
    expect(screen.getByRole("tooltip")).toBeVisible();
    expect(onFocusCapture).toHaveBeenCalledOnce();

    fireEvent.blur(trigger, { relatedTarget: nested });
    expect(screen.getByRole("tooltip")).toBeVisible();

    fireEvent.blur(trigger, { relatedTarget: document.body });
    expect(screen.getByRole("tooltip", { hidden: true })).toHaveAttribute("data-open", "false");
    expect(onBlurCapture).toHaveBeenCalledTimes(2);
  });

  it("toggles open on touch and ignores touch hover events", () => {
    render(
      <Tooltip content="Touch help">
        <button type="button">Touch trigger</button>
      </Tooltip>,
    );
    const anchor = screen.getByRole("button").parentElement!;

    fireEvent.pointerEnter(anchor, { pointerType: "touch" });
    expect(screen.getByRole("tooltip", { hidden: true })).toHaveAttribute("data-open", "false");

    fireEvent.pointerDown(anchor, { pointerType: "touch" });
    expect(screen.getByRole("tooltip", { hidden: true })).toHaveAttribute("data-open", "true");

    fireEvent.pointerDown(anchor, { pointerType: "touch" });
    expect(screen.getByRole("tooltip", { hidden: true })).toHaveAttribute("data-open", "false");
  });

  it("keeps a focused tooltip open when the pointer leaves and reports pointer callbacks", () => {
    const onPointerDownCapture = vi.fn();
    const onPointerEnter = vi.fn();
    const onPointerLeave = vi.fn();
    render(
      <Tooltip
        content="Help remains visible while focused"
        onPointerDownCapture={onPointerDownCapture}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      >
        <button type="button">Focused trigger</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button");
    const anchor = trigger.parentElement!;

    fireEvent.focus(trigger);
    fireEvent.pointerEnter(anchor, { pointerType: "mouse" });
    fireEvent.pointerDown(anchor, { pointerType: "mouse" });
    fireEvent.pointerLeave(anchor, { pointerType: "mouse" });

    expect(onPointerDownCapture).toHaveBeenCalledOnce();
    expect(onPointerEnter).toHaveBeenCalledOnce();
    expect(onPointerLeave).toHaveBeenCalledOnce();
    expect(screen.getByRole("tooltip", { hidden: true })).toHaveAttribute("data-open", "true");

    fireEvent.pointerEnter(anchor, { pointerType: "mouse" });
    fireEvent.blur(trigger, { relatedTarget: document.body });
    expect(screen.getByRole("tooltip", { hidden: true })).toHaveAttribute("data-open", "true");

    fireEvent.pointerLeave(anchor, { pointerType: "touch" });
    expect(screen.getByRole("tooltip", { hidden: true })).toHaveAttribute("data-open", "true");

    fireEvent.pointerLeave(anchor, { pointerType: "mouse" });
    expect(onPointerEnter).toHaveBeenCalledTimes(2);
    expect(onPointerLeave).toHaveBeenCalledTimes(3);
    expect(screen.getByRole("tooltip", { hidden: true })).toHaveAttribute("data-open", "false");
  });

  it("retains an open native popover when its content changes", () => {
    const { rerender } = render(
      <Tooltip content="Original content">
        <button type="button">Content trigger</button>
      </Tooltip>,
    );
    const anchor = screen.getByRole("button").parentElement!;

    fireEvent.pointerEnter(anchor, { pointerType: "mouse" });
    expect(screen.getByRole("tooltip", { hidden: true })).toHaveAttribute("data-open", "true");

    rerender(
      <Tooltip content="Updated content">
        <button type="button">Content trigger</button>
      </Tooltip>,
    );

    expect(screen.getByRole("tooltip", { hidden: true })).toHaveTextContent("Updated content");
    expect(screen.getByRole("tooltip", { hidden: true })).toHaveAttribute("data-open", "true");
  });

  it("flips from top to bottom when only the opposite side has room", () => {
    render(
      <Tooltip content="Positioned help" placement="top">
        <button type="button">Position trigger</button>
      </Tooltip>,
    );
    const anchor = screen.getByRole("button").parentElement!;
    const tooltip = screen.getByRole("tooltip", { hidden: true });
    setRect(anchor, createRect(30, 20, 40, 20));
    setRect(tooltip, createRect(0, 0, 100, 30));

    fireEvent.pointerEnter(anchor, { pointerType: "mouse" });

    expect(tooltip).toHaveAttribute("data-side", "bottom");
    expect(tooltip).toHaveAttribute("data-positioned", "true");
    expect(tooltip).toHaveStyle({ left: "58px", top: "48px" });
  });

  it("uses the roomier vertical side when neither requested nor opposite placement fits", () => {
    render(
      <Tooltip content="Positioned help" placement="top">
        <button type="button">Position trigger</button>
      </Tooltip>,
    );
    const anchor = screen.getByRole("button").parentElement!;
    const tooltip = screen.getByRole("tooltip", { hidden: true });
    setRect(anchor, createRect(30, 10, 40, 20));
    setRect(tooltip, createRect(0, 0, 100, 40));
    Object.defineProperty(document.documentElement, "clientHeight", {
      configurable: true,
      value: 50,
    });

    fireEvent.pointerEnter(anchor, { pointerType: "mouse" });

    expect(tooltip).toHaveAttribute("data-side", "bottom");
  });

  it("keeps a top placement when it fits and uses a supplied spacing token", () => {
    render(
      <Tooltip content="Positioned help" placement="top">
        <button type="button">Position trigger</button>
      </Tooltip>,
    );
    const anchor = screen.getByRole("button").parentElement!;
    const tooltip = screen.getByRole("tooltip", { hidden: true });
    anchor.style.setProperty("--ds-space-2", "12px");
    setRect(anchor, createRect(130, 100, 40, 20));
    setRect(tooltip, createRect(0, 0, 100, 30));

    fireEvent.pointerEnter(anchor, { pointerType: "mouse" });

    expect(tooltip).toHaveAttribute("data-side", "top");
    expect(tooltip).toHaveStyle({ left: "150px", top: "88px" });
  });

  it("chooses the top side when neither vertical side fits and the top has more room", () => {
    render(
      <Tooltip content="Positioned help" placement="bottom">
        <button type="button">Position trigger</button>
      </Tooltip>,
    );
    const anchor = screen.getByRole("button").parentElement!;
    const tooltip = screen.getByRole("tooltip", { hidden: true });
    setRect(anchor, createRect(30, 20, 40, 20));
    setRect(tooltip, createRect(0, 0, 100, 40));
    Object.defineProperty(document.documentElement, "clientHeight", {
      configurable: true,
      value: 50,
    });

    fireEvent.pointerEnter(anchor, { pointerType: "mouse" });

    expect(tooltip).toHaveAttribute("data-side", "top");
  });

  it("flips from right to left and clamps the tooltip inside the viewport", () => {
    render(
      <Tooltip content="Positioned help" placement="right">
        <button type="button">Position trigger</button>
      </Tooltip>,
    );
    const anchor = screen.getByRole("button").parentElement!;
    const tooltip = screen.getByRole("tooltip", { hidden: true });
    setRect(anchor, createRect(275, 80, 30, 20));
    setRect(tooltip, createRect(0, 0, 100, 40));

    fireEvent.pointerEnter(anchor, { pointerType: "mouse" });

    expect(tooltip).toHaveAttribute("data-side", "left");
    expect(tooltip).toHaveStyle({ left: "267px", top: "90px" });
  });

  it("uses the roomier horizontal side when neither requested nor opposite placement fits", () => {
    render(
      <Tooltip content="Positioned help" placement="right">
        <button type="button">Position trigger</button>
      </Tooltip>,
    );
    const anchor = screen.getByRole("button").parentElement!;
    const tooltip = screen.getByRole("tooltip", { hidden: true });
    setRect(anchor, createRect(10, 80, 20, 20));
    setRect(tooltip, createRect(0, 0, 90, 40));
    Object.defineProperty(document.documentElement, "clientWidth", {
      configurable: true,
      value: 100,
    });

    fireEvent.pointerEnter(anchor, { pointerType: "mouse" });

    expect(tooltip).toHaveAttribute("data-side", "right");
  });

  it("chooses the left side when neither horizontal side fits and the left has more room", () => {
    render(
      <Tooltip content="Positioned help" placement="right">
        <button type="button">Position trigger</button>
      </Tooltip>,
    );
    const anchor = screen.getByRole("button").parentElement!;
    const tooltip = screen.getByRole("tooltip", { hidden: true });
    setRect(anchor, createRect(80, 80, 10, 20));
    setRect(tooltip, createRect(0, 0, 90, 40));
    Object.defineProperty(document.documentElement, "clientWidth", {
      configurable: true,
      value: 100,
    });

    fireEvent.pointerEnter(anchor, { pointerType: "mouse" });

    expect(tooltip).toHaveAttribute("data-side", "left");
  });
});
