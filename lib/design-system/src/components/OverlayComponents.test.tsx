import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Dialog } from "./Dialog/Dialog";
import { Popover } from "./Popover/Popover";

beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.setAttribute("open", "");
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    },
  });
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
  vi.spyOn(HTMLElement.prototype, "matches").mockImplementation(function (this: HTMLElement, selector: string) {
    if (selector === ":popover-open") return this.hasAttribute("data-native-popover-open");
    return nativeMatches.call(this, selector);
  });
  class ResizeObserverStub implements ResizeObserver {
    constructor(_callback: ResizeObserverCallback) {}
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("ResizeObserver", ResizeObserverStub);
  Object.defineProperty(document.documentElement, "clientWidth", { configurable: true, value: 320 });
  Object.defineProperty(document.documentElement, "clientHeight", { configurable: true, value: 240 });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
  Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
  Reflect.deleteProperty(HTMLElement.prototype, "showPopover");
  Reflect.deleteProperty(HTMLElement.prototype, "hidePopover");
});

describe("Dialog", () => {
  it("opens with accessible heading and description, and closes from its button", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Dialog
        description="Review the changes before saving."
        footer={<button type="button">Save changes</button>}
        heading="Edit page"
        headingLevel={3}
        motion="none"
        onOpenChange={onOpenChange}
        open
        size="lg"
      >
        <p>Editor content</p>
      </Dialog>,
    );
    const dialog = screen.getByRole("dialog", { name: "Edit page" });
    expect(dialog).toHaveAttribute("aria-describedby");
    expect(dialog).toHaveAttribute("data-size", "lg");
    expect(dialog).toHaveAttribute("data-motion-state", "open");
    expect(screen.getByRole("heading", { level: 3, name: "Edit page" })).toBeInTheDocument();
    expect(screen.getByText("Review the changes before saving.")).toBeInTheDocument();
    expect(screen.getByText("Editor content")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    rerender(
      <Dialog
        heading="Edit page"
        onOpenChange={onOpenChange}
        motion="none"
        open={false}
        showCloseButton={false}
      />,
    );
    expect(screen.queryByRole("dialog", { name: "Edit page" })).not.toBeInTheDocument();
  });

  it("handles cancel and backdrop events, including caller cancellation", () => {
    const onOpenChange = vi.fn();
    const onCancel = vi.fn((event: React.SyntheticEvent<HTMLDialogElement>) => event.preventDefault());
    const onClick = vi.fn();
    render(
      <Dialog
        closeOnBackdropClick
        heading="Confirm"
        onCancel={onCancel}
        onClick={onClick}
        onOpenChange={onOpenChange}
        open
      />,
    );
    const dialog = screen.getByRole("dialog", { name: "Confirm" });
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onOpenChange).not.toHaveBeenCalled();
    fireEvent.click(dialog);
    expect(onClick).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("respects escape and backdrop options and accepts caller-provided accessible ids", () => {
    const onOpenChange = vi.fn();
    const onCancel = vi.fn();
    render(
      <Dialog
        aria-describedby="external-help"
        aria-labelledby="external-title"
        closeOnBackdropClick={false}
        closeOnEscape={false}
        heading="Fallback heading"
        onCancel={onCancel}
        onOpenChange={onOpenChange}
        open
        showCloseButton={false}
      />,
    );
    const dialog = document.querySelector("dialog") as HTMLDialogElement;
    expect(dialog).toHaveAttribute("aria-describedby", "external-help");
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    fireEvent.click(dialog);
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("forwards close events, honors prevented clicks, and exposes the dialog ref", () => {
    const onOpenChange = vi.fn();
    const onClose = vi.fn();
    const onClick = vi.fn((event: React.MouseEvent<HTMLDialogElement>) => event.preventDefault());
    const ref = createRef<HTMLDialogElement>();
    render(
      <Dialog
        closeOnBackdropClick
        motion="none"
        onClick={onClick}
        onClose={onClose}
        onOpenChange={onOpenChange}
        open
        ref={ref}
        showCloseButton={false}
      />,
    );
    const dialog = document.querySelector("dialog") as HTMLDialogElement;
    expect(ref.current).toBe(dialog);
    expect(dialog.querySelector("header")).toBeNull();
    fireEvent.click(dialog);
    expect(onClick).toHaveBeenCalledOnce();
    expect(onOpenChange).not.toHaveBeenCalled();
    fireEvent(dialog, new Event("close"));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("runs opening and closing motion frames and clears a pending close when reopened", () => {
    vi.useFakeTimers();
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    const onOpenChange = vi.fn();
    const { rerender } = render(<Dialog heading="Animated" motion="fade" onOpenChange={onOpenChange} open />);
    const dialog = document.querySelector("dialog") as HTMLDialogElement;
    expect(dialog).toHaveAttribute("data-motion-state", "entering");
    act(() => frames.shift()?.(0));
    act(() => frames.shift()?.(0));
    expect(dialog).toHaveAttribute("data-motion-state", "open");
    rerender(<Dialog heading="Animated" motion="fade" onOpenChange={onOpenChange} open={false} />);
    expect(dialog).toHaveAttribute("data-motion-state", "exiting");
    rerender(<Dialog heading="Animated" motion="fade" onOpenChange={onOpenChange} open />);
    act(() => vi.advanceTimersByTime(1000));
    expect(dialog).toHaveAttribute("open");
    expect(dialog).toHaveAttribute("data-motion-state", "open");
  });

  it("handles an unprevented native cancel and cancels a pending entrance frame", () => {
    const frames: FrameRequestCallback[] = [];
    const cancelAnimationFrame = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Dialog heading="Cancel me" motion="fade" onOpenChange={onOpenChange} open />,
    );
    const dialog = document.querySelector("dialog")!;
    expect(dialog).toHaveAttribute("data-motion-state", "entering");
    const cancel = new Event("cancel", { cancelable: true });
    fireEvent(dialog, cancel);
    expect(cancel.defaultPrevented).toBe(true);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    rerender(<Dialog heading="Cancel me" motion="fade" onOpenChange={onOpenChange} open={false} />);
    expect(cancelAnimationFrame).toHaveBeenCalled();
    expect(dialog).toHaveAttribute("data-motion-state", "exiting");
  });

  it("finishes the exit timer and keeps an initially closed dialog closed", () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <Dialog heading="Delayed close" motion="fade" onOpenChange={vi.fn()} open />,
    );
    const dialog = document.querySelector("dialog")!;
    rerender(<Dialog heading="Delayed close" motion="fade" onOpenChange={vi.fn()} open={false} />);
    expect(dialog).toHaveAttribute("data-motion-state", "exiting");
    act(() => vi.runAllTimers());
    expect(dialog).not.toHaveAttribute("open");
    expect(dialog).toHaveAttribute("data-motion-state", "closed");
    rerender(<Dialog heading="Initially closed" motion="none" onOpenChange={vi.fn()} open={false} />);
    expect(dialog).not.toHaveAttribute("open");
    expect(dialog).toHaveAttribute("data-motion-state", "closed");
  });
});

describe("Popover", () => {
  it("opens with content, heading, description, and close button, then dismisses on Escape", () => {
    const onOpenChange = vi.fn();
    render(
      <Popover
        autoFocus
        description="Choose a view."
        heading="View options"
        motion="none"
        onOpenChange={onOpenChange}
        panelLabel="Preferences"
        placement="right"
        returnFocusOnClose={false}
        showCloseButton
        triggerLabel="Open options"
      >
        <button type="button">Compact view</button>
      </Popover>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open options" }));
    const panel = screen.getByRole("dialog", { name: "View options" });
    expect(panel).toHaveAttribute("data-side", "right");
    expect(panel).toHaveAttribute("aria-describedby");
    expect(screen.getByRole("heading", { name: "View options" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close popover" })).toHaveFocus();
    fireEvent.keyDown(panel, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes on outside pointer and focus, and reports controlled state", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <>
        <Popover defaultOpen closeOnOutsideClick closeOnFocusOutside motion="none" onOpenChange={onOpenChange} triggerLabel="Details">
          <button type="button">Inside panel</button>
        </Popover>
        <button type="button">Outside page</button>
      </>,
    );
    expect(screen.getByRole("dialog", { name: "Details" })).toBeInTheDocument();
    fireEvent.pointerDown(screen.getByRole("button", { name: "Outside page" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    rerender(
      <>
        <Popover open closeOnEscape={false} closeOnFocusOutside={false} motion="none" triggerLabel="Controlled details" onOpenChange={onOpenChange}>
          <button type="button">Controlled content</button>
        </Popover>
        <button type="button">Another outside</button>
      </>,
    );
    fireEvent.blur(screen.getByRole("dialog", { name: "Controlled details" }), { relatedTarget: screen.getByRole("button", { name: "Another outside" }) });
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByRole("dialog", { name: "Controlled details" })).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenCalledTimes(1);
  });

  it("supports disabled triggers, custom panel labels and styles, and validates configuration", () => {
    const { rerender } = render(
      <Popover
        defaultOpen
        disabled
        matchTriggerWidth
        panelClassName="custom-panel"
        panelLabel="Custom settings"
        panelMaxWidth={360}
        panelStyle={{ color: "rebeccapurple" }}
        trigger="Settings"
        triggerLabel="Settings trigger"
      >
        <p>Panel text</p>
      </Popover>,
    );
    expect(screen.getByRole("button", { name: "Settings trigger" })).toBeDisabled();
    expect(screen.queryByRole("dialog", { name: "Custom settings" })).not.toBeInTheDocument();
    rerender(<Popover triggerLabel="Custom panel" open motion="none"><p>Text</p></Popover>);
    expect(screen.getByRole("dialog", { name: "Custom panel" })).toHaveAttribute("data-motion-state", "open");
    expect(() => render(<Popover triggerLabel=" " />)).toThrow(/non-empty triggerLabel/);
    expect(() => render(<Popover headingLevel={1 as 2} triggerLabel="Invalid level" />)).toThrow(/headingLevel/);
    expect(() => render(<Popover offset={-1} triggerLabel="Invalid offset" />)).toThrow(/offset/);
    expect(() => render(<Popover collisionPadding={Number.NaN} triggerLabel="Invalid padding" />)).toThrow(/collisionPadding/);
  });

  it("positions against viewport collisions, honors alignment and dimensions, and restores trigger focus", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      if (this.tagName === "BUTTON") {
        return { x: 280, y: 180, left: 280, top: 180, right: 300, bottom: 200, width: 20, height: 20, toJSON: () => ({}) } as DOMRect;
      }
      if (this.getAttribute("role") === "dialog") {
        return { x: 0, y: 0, left: 0, top: 0, right: 120, bottom: 100, width: 120, height: 100, toJSON: () => ({}) } as DOMRect;
      }
      return { x: 0, y: 0, left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, toJSON: () => ({}) } as DOMRect;
    });
    render(
      <Popover
        align="end"
        collisionPadding={16}
        defaultOpen
        matchTriggerWidth
        motion="none"
        offset={8}
        panelMaxWidth={240}
        placement="bottom"
        showCloseButton
        triggerLabel="Positioned options"
      >
        <button type="button">First option</button>
      </Popover>,
    );
    const trigger = screen.getByRole("button", { name: "Positioned options" });
    const panel = screen.getByRole("dialog", { name: "Positioned options" });
    fireEvent.pointerDown(trigger);
    fireEvent.keyDown(panel, { key: "Enter" });
    expect(panel).toHaveAttribute("data-side", "top");
    expect(panel.style.left).toBe("180px");
    expect(panel.style.top).toBe("72px");
    expect(panel.style.minWidth).toBe("20px");
    expect(panel.style.maxWidth).toBe("240px");
    screen.getByRole("button", { name: "First option" }).focus();
    expect(screen.getByRole("button", { name: "First option" })).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "Close popover" }));
    expect(trigger).toHaveFocus();
  });

  it("supports preferred placements and safely skips positioning without ResizeObserver", () => {
    vi.stubGlobal("ResizeObserver", undefined);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      if (this.tagName === "BUTTON") {
        return { x: 120, y: 100, left: 120, top: 100, right: 160, bottom: 120, width: 40, height: 20, toJSON: () => ({}) } as DOMRect;
      }
      if (this.getAttribute("role") === "dialog") {
        return { x: 0, y: 0, left: 0, top: 0, right: 80, bottom: 60, width: 80, height: 60, toJSON: () => ({}) } as DOMRect;
      }
      return { x: 0, y: 0, left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, toJSON: () => ({}) } as DOMRect;
    });
    render(
      <Popover align="center" defaultOpen motion="none" placement="left" showCloseButton={false} triggerLabel="Left panel">
        <p>Position content</p>
      </Popover>,
    );
    const panel = screen.getByRole("dialog", { name: "Left panel" });
    expect(panel).toHaveAttribute("data-side", "left");
    expect(panel.style.left).toBe("32px");
    expect(panel.style.top).toBe("80px");
    expect(screen.queryByRole("button", { name: "Close popover" })).not.toBeInTheDocument();
  });

  it("runs animated open and close frames, restores focus, and autofocuses the panel when needed", () => {
    vi.useFakeTimers();
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Popover autoFocus heading="Animated panel" motion="fade" onOpenChange={onOpenChange} open triggerLabel="Animated trigger">
        <p>Non-interactive content</p>
      </Popover>,
    );
    const panel = screen.getByRole("dialog", { name: "Animated panel" });
    const trigger = screen.getByRole("button", { name: "Animated trigger" });
    expect(panel).toHaveAttribute("data-motion-state", "entering");
    act(() => frames.shift()?.(0));
    act(() => frames.shift()?.(0));
    expect(panel).toHaveAttribute("data-motion-state", "open");
    expect(panel).toHaveFocus();
    rerender(
      <Popover autoFocus heading="Animated panel" motion="fade" onOpenChange={onOpenChange} open={false} triggerLabel="Animated trigger">
        <p>Non-interactive content</p>
      </Popover>,
    );
    expect(panel).toHaveAttribute("data-motion-state", "exiting");
    expect(trigger).toHaveFocus();
    act(() => vi.runAllTimers());
    expect(panel).toHaveAttribute("data-motion-state", "closed");
    expect(panel).not.toHaveAttribute("data-native-popover-open");
  });

  it("keeps focus inside when configured and closes for a focus event without a related target", () => {
    const onOpenChange = vi.fn();
    render(
      <Popover closeOnFocusOutside motion="none" onOpenChange={onOpenChange} open triggerLabel="Focus panel">
        <button type="button">Inside focus</button>
      </Popover>,
    );
    const panel = screen.getByRole("dialog", { name: "Focus panel" });
    fireEvent.blur(panel, { relatedTarget: screen.getByRole("button", { name: "Inside focus" }) });
    expect(onOpenChange).not.toHaveBeenCalled();
    fireEvent.blur(panel, { relatedTarget: null });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("forwards popover refs and respects prevented, outside, and closed focus events", () => {
    const callbackRef = vi.fn();
    const objectRef = createRef<HTMLDivElement>();
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Popover
        closeOnEscape
        closeOnFocusOutside
        closeOnOutsideClick={false}
        defaultOpen
        motion="none"
        onOpenChange={onOpenChange}
        ref={callbackRef}
        returnFocusOnClose={false}
        triggerLabel="Ref panel"
      >
        <button type="button">Panel action</button>
      </Popover>,
    );
    const trigger = screen.getByRole("button", { name: "Ref panel" });
    const root = trigger.parentElement!;
    const panel = screen.getByRole("dialog", { name: "Ref panel" });
    expect(callbackRef).toHaveBeenCalledWith(root);
    fireEvent.pointerDown(document.body);
    fireEvent.pointerDown(trigger);
    const preventedEscape = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
    preventedEscape.preventDefault();
    fireEvent(document, preventedEscape);
    expect(onOpenChange).not.toHaveBeenCalled();
    fireEvent.keyDown(panel, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);

    rerender(
      <Popover
        closeOnFocusOutside
        motion="none"
        onOpenChange={onOpenChange}
        open={false}
        ref={objectRef}
        triggerLabel="Closed ref panel"
      >
        <p>Closed content</p>
      </Popover>,
    );
    const closedTrigger = screen.getByRole("button", { name: "Closed ref panel" });
    expect(objectRef.current).toBe(closedTrigger.parentElement);
    fireEvent.blur(closedTrigger, { relatedTarget: document.body });
    expect(onOpenChange).toHaveBeenCalledOnce();
  });

  it("does not hide an already closed native popover when its exit timer finishes", () => {
    vi.useFakeTimers();
    render(
      <Popover defaultOpen motion="fade" triggerLabel="Native popover">
        <p>Temporary panel</p>
      </Popover>,
    );
    const trigger = screen.getByRole("button", { name: "Native popover" });
    const panel = screen.getByRole("dialog", { name: "Native popover" });
    fireEvent.click(trigger);
    expect(panel).toHaveAttribute("data-motion-state", "exiting");
    panel.hidePopover();
    act(() => vi.advanceTimersByTime(1000));
    expect(panel).toHaveAttribute("data-motion-state", "closed");
    vi.useRealTimers();
  });

  it("chooses the roomier side when neither preferred placement fits", () => {
    const widthDescriptor = Object.getOwnPropertyDescriptor(document.documentElement, "clientWidth");
    const heightDescriptor = Object.getOwnPropertyDescriptor(document.documentElement, "clientHeight");
    Object.defineProperty(document.documentElement, "clientWidth", { configurable: true, value: 200 });
    Object.defineProperty(document.documentElement, "clientHeight", { configurable: true, value: 200 });
    let anchorTop = 100;
    const rectSpy = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      if (this.tagName === "BUTTON") {
        return { x: 50, y: anchorTop, left: 50, top: anchorTop, right: 70, bottom: anchorTop + 20, width: 20, height: 20, toJSON: () => ({}) } as DOMRect;
      }
      if (this.getAttribute("role") === "dialog") {
        return { x: 0, y: 0, left: 0, top: 0, right: 100, bottom: 400, width: 100, height: 400, toJSON: () => ({}) } as DOMRect;
      }
      return { x: 0, y: 0, left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, toJSON: () => ({}) } as DOMRect;
    });
    const { rerender, unmount } = render(
      <Popover
        align="start"
        collisionPadding={8}
        defaultOpen
        motion="none"
        placement="top"
        triggerLabel="Limited space"
      >
        <p>Positioned content</p>
      </Popover>,
    );
    const panel = screen.getByRole("dialog", { name: "Limited space" });
    screen.getByRole("button", { name: "Limited space" }).parentElement!.style.setProperty("--ds-space-2", "4px");
    fireEvent.resize(window);
    expect(panel).toHaveAttribute("data-side", "top");
    expect(panel.style.left).toBe("50px");
    anchorTop = 40;
    rerender(
      <Popover
        align="end"
        collisionPadding={8}
        defaultOpen
        motion="none"
        placement="top"
        triggerLabel="Limited space"
      >
        <p>Positioned content</p>
      </Popover>,
    );
    expect(panel).toHaveAttribute("data-side", "bottom");
    anchorTop = 100;
    rerender(
      <Popover
        align="center"
        collisionPadding={8}
        defaultOpen
        motion="none"
        placement="top"
        triggerLabel="Limited space"
      >
        <p>Positioned content</p>
      </Popover>,
    );
    expect(panel).toHaveAttribute("data-side", "top");
    rerender(
      <Popover
        align="end"
        collisionPadding={8}
        defaultOpen
        motion="none"
        placement="right"
        triggerLabel="Limited space"
      >
        <p>Positioned content</p>
      </Popover>,
    );
    expect(panel).toHaveAttribute("data-side", "right");
    unmount();
    rectSpy.mockRestore();
    if (widthDescriptor) Object.defineProperty(document.documentElement, "clientWidth", widthDescriptor);
    else Reflect.deleteProperty(document.documentElement, "clientWidth");
    if (heightDescriptor) Object.defineProperty(document.documentElement, "clientHeight", heightDescriptor);
    else Reflect.deleteProperty(document.documentElement, "clientHeight");
  });

  it("closes on an unprevented document Escape and ignores unrelated key presses", () => {
    const onOpenChange = vi.fn();
    render(
      <Popover defaultOpen motion="none" onOpenChange={onOpenChange} triggerLabel="Escape document">
        <p>Menu content</p>
      </Popover>,
    );
    fireEvent.keyDown(document, { key: "Enter" });
    expect(onOpenChange).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
