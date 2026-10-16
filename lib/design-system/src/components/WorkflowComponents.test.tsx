import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Header, type HeaderMobileNavigationRenderProps } from "./Header/Header";
import { PublishingWorkflow } from "./PublishingWorkflow/PublishingWorkflow";
import { SideNavigation, type SideNavigationEntry } from "./SideNavigation/SideNavigation";
import { clearToastDismissalTimer, Toast, ToastProvider, useToast } from "./Toast/Toast";

describe("PublishingWorkflow", () => {
  it("shows draft actions, schedule controls, save state, and busy state", () => {
    const onScheduleAtChange = vi.fn();
    const onSubmitForReview = vi.fn();
    const onPublishNow = vi.fn();
    const onSchedule = vi.fn();
    const { rerender } = render(
      <PublishingWorkflow
        busyAction="submit-for-review"
        lastSavedText="Changes saved"
        onPublishNow={onPublishNow}
        onSchedule={onSchedule}
        onScheduleAtChange={onScheduleAtChange}
        onSubmitForReview={onSubmitForReview}
        scheduleAt="2026-11-01T10:30"
        status="draft"
      />,
    );
    expect(screen.getByRole("region", { name: "Publishing" })).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Changes saved")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit for review" })).toBeDisabled();
    expect(screen.getByLabelText("Publish date and time")).toBeDisabled();
    rerender(
      <PublishingWorkflow
        lastSavedText="Changes saved"
        onPublishNow={onPublishNow}
        onSchedule={onSchedule}
        onScheduleAtChange={onScheduleAtChange}
        onSubmitForReview={onSubmitForReview}
        scheduleAt="2026-11-01T10:30"
        status="draft"
      />,
    );
    fireEvent.change(screen.getByLabelText("Publish date and time"), { target: { value: "2026-11-05T12:00" } });
    expect(onScheduleAtChange).toHaveBeenCalledWith("2026-11-05T12:00");
    fireEvent.click(screen.getByRole("button", { name: "Publish now" }));
    expect(onPublishNow).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Schedule publish" }));
    expect(onSchedule).toHaveBeenCalledWith("2026-11-01T10:30");
  });

  it("gates publishing on review status and enables resubmission after requested changes", () => {
    const onPublish = vi.fn();
    const { rerender } = render(
      <PublishingWorkflow
        onApprove={() => {}}
        onPublish={onPublish}
        onRequestChanges={() => {}}
        reviewSteps={[
          { id: "editorial", label: "Editorial", status: "pending", assignee: "Ari", detail: "Check copy" },
          { id: "brand", label: "Brand", status: "approved" },
        ]}
        status="in-review"
      />,
    );
    expect(screen.getByRole("group", { name: /Review steps/ })).toBeInTheDocument();
    expect(screen.getByText("1 of 2 approved")).toBeInTheDocument();
    expect(screen.getByText("Ari")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Publish" })).toBeDisabled();
    expect(screen.getByText("Approve all review steps before publishing.")).toBeInTheDocument();
    rerender(
      <PublishingWorkflow
        onPublish={onPublish}
        onSubmitForReview={() => {}}
        reviewSteps={[{ id: "brand", label: "Brand", status: "changes-requested" }]}
        status="in-review"
      />,
    );
    expect(screen.getByRole("button", { name: "Resubmit for review" })).toBeEnabled();
    expect(screen.getByText("Resolve requested changes and resubmit before publishing.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Publish" })).toBeDisabled();
  });

  it("renders scheduled, published, and archived actions for their respective states", () => {
    const actions = {
      cancel: vi.fn(),
      publish: vi.fn(),
      unpublish: vi.fn(),
      draft: vi.fn(),
      restore: vi.fn(),
    };
    const { rerender } = render(
      <PublishingWorkflow onCancelSchedule={actions.cancel} onPublishNow={actions.publish} status="scheduled" />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel schedule" }));
    fireEvent.click(screen.getByRole("button", { name: "Publish now" }));
    expect(actions.cancel).toHaveBeenCalledOnce();
    expect(actions.publish).toHaveBeenCalledOnce();
    rerender(
      <PublishingWorkflow onReturnToDraft={actions.draft} onUnpublish={actions.unpublish} status="published" />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Unpublish" }));
    fireEvent.click(screen.getByRole("button", { name: "Return to draft" }));
    expect(actions.unpublish).toHaveBeenCalledOnce();
    expect(actions.draft).toHaveBeenCalledOnce();
    rerender(<PublishingWorkflow onRestoreDraft={actions.restore} status="archived" />);
    fireEvent.click(screen.getByRole("button", { name: "Restore draft" }));
    expect(actions.restore).toHaveBeenCalledOnce();
    expect(screen.getByText("Archived")).toBeInTheDocument();
  });

  it("selects approval, publication, and schedule actions across edge states", () => {
    const onApprove = vi.fn();
    const onPublish = vi.fn();
    const onSchedule = vi.fn();
    const { rerender } = render(
      <PublishingWorkflow
        onApprove={onApprove}
        onPublish={onPublish}
        onSchedule={onSchedule}
        scheduleAt=""
        status="in-review"
      />,
    );
    expect(screen.queryByRole("button", { name: "Approve review" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Publish" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Schedule publish" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Publish" }));
    expect(onPublish).toHaveBeenCalledOnce();

    rerender(<PublishingWorkflow onApprove={onApprove} status="in-review" />);
    fireEvent.click(screen.getByRole("button", { name: "Approve review" }));
    expect(onApprove).toHaveBeenCalledOnce();

    rerender(
      <PublishingWorkflow
        onSchedule={onSchedule}
        scheduleAt="2026-12-01T09:00"
        status="scheduled"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Update schedule" }));
    expect(onSchedule).toHaveBeenCalledWith("2026-12-01T09:00");
    rerender(<PublishingWorkflow onSchedule={onSchedule} status="archived" />);
    expect(screen.queryByRole("button", { name: /schedule/i })).not.toBeInTheDocument();
  });

  it("omits workflow actions when their callbacks are not provided", () => {
    const { rerender } = render(<PublishingWorkflow onPublishNow={vi.fn()} status="draft" />);
    expect(screen.queryByRole("button", { name: "Submit for review" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Publish now" })).toBeInTheDocument();
    rerender(<PublishingWorkflow status="draft" />);
    expect(screen.queryByRole("button", { name: "Publish now" })).not.toBeInTheDocument();
    rerender(<PublishingWorkflow status="published" />);
    expect(screen.queryByRole("button", { name: "Unpublish" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Return to draft" })).not.toBeInTheDocument();
  });
});

describe("Header", () => {
  it("renders logo, responsive menu navigation, current links, icons, and CTA", () => {
    const onClick = vi.fn();
    render(
      <Header
        borderBottom={false}
        cta={<button type="button">Start a project</button>}
        logo={<span>Meadow &amp; Mill</span>}
        logoHref="/home"
        navItems={[
          { label: "Services", href: "/services", current: true, icon: <span>S</span> },
          { label: "About", href: "/about", onClick },
        ]}
        size="lg"
        sticky
      />,
    );
    expect(screen.getByRole("banner")).toHaveAttribute("data-size", "lg");
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/home");
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Services/ })).toHaveAttribute("aria-current", "page");
    const aboutLink = screen.getByRole("link", { name: "About" });
    aboutLink.addEventListener("click", (event) => event.preventDefault(), { once: true });
    fireEvent.click(aboutLink);
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Start a project" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: /Services/ }));
    expect(screen.getByRole("button", { name: "Open navigation" })).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(screen.getByRole("button", { name: "Open navigation" }));
    const logo = screen.getByRole("link", { name: "Home" });
    logo.addEventListener("click", (event) => event.preventDefault(), { once: true });
    fireEvent.click(logo);
    expect(document.querySelector("[data-menu-open]")).toHaveAttribute("data-menu-open", "false");
  });

  it("renders the desktop links when a custom mobile renderer is provided", () => {
    const onClick = vi.fn();
    render(
      <Header
        navItems={[
          { label: "Current page", href: "/current", current: true, icon: <span>Current icon</span>, onClick },
          { label: "Other page", href: "/other" },
        ]}
        renderMobileNavigation={() => <div>Custom mobile menu</div>}
      />,
    );
    const navigation = screen.getByRole("navigation", { name: "Primary navigation" });
    const currentLink = within(navigation).getByRole("link", { name: "Current page" });
    expect(currentLink).toHaveAttribute("aria-current", "page");
    fireEvent.click(currentLink);
    expect(onClick).toHaveBeenCalledOnce();
    expect(within(navigation).getByRole("link", { name: "Other page" })).not.toHaveAttribute("aria-current");
  });

  it("passes controlled mobile-navigation state and closes after a non-cancelled item click", () => {
    let lastProps: HeaderMobileNavigationRenderProps | undefined;
    render(
      <Header
        cta={<button type="button">Contact team</button>}
        navItems={[{ label: "Work", href: "/work" }]}
        renderMobileNavigation={(props) => {
          lastProps = props;
          return (
            <div>
              <button onClick={() => props.onOpenChange(true)} type="button">Open custom menu</button>
              <a
                href="/work"
                onClick={(event) => {
                  event.preventDefault();
                  props.navItems[0].onClick?.(event);
                }}
              >
                Keep menu open
              </a>
              <a href="/work" onClick={props.navItems[0].onClick}>Work</a>
              <output>{String(props.open)}</output>
            </div>
          );
        }}
      />,
    );
    expect(lastProps).toMatchObject({ navigationLabel: "Primary navigation", open: false });
    fireEvent.click(screen.getByRole("button", { name: "Open custom menu" }));
    expect(screen.getByText("true")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: "Keep menu open" }));
    expect(screen.getByText("true")).toBeInTheDocument();
    fireEvent.click(
      within(document.querySelector("[data-header-mobile-navigation]")!).getByRole("link", { name: "Work" }),
    );
    expect(screen.getByText("false")).toBeInTheDocument();
  });

  it("renders a branded header without a navigation area", () => {
    render(<Header logo={<span>Standalone brand</span>} />);
    expect(screen.getByRole("banner").querySelector("[data-has-navigation]")).toHaveAttribute("data-has-navigation", "false");
    expect(screen.getByRole("banner").querySelector("[data-custom-mobile-navigation]")).toHaveAttribute("data-custom-mobile-navigation", "false");
    expect(screen.getByRole("link", { name: "Home" })).toHaveTextContent("Standalone brand");
  });
});

const navigationItems: SideNavigationEntry[] = [
  {
    type: "group",
    id: "content",
    label: "Content",
    items: [
      { type: "link", id: "articles", label: "Articles", href: "/articles", onClick: (event) => event.preventDefault() },
      { type: "action", id: "refresh", label: "Refresh", onSelect: vi.fn() },
    ],
  },
  { type: "divider", id: "separator" },
  { type: "link", id: "settings", label: "Settings", href: "/settings" },
];

describe("SideNavigation", () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    Object.defineProperty(window, "matchMedia", { configurable: true, value: originalMatchMedia });
  });

  it("selects links and actions, expands groups, and reports collapse changes", () => {
    Object.defineProperty(window, "matchMedia", { configurable: true, value: () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }) });
    const onActiveChange = vi.fn();
    const onCollapsedChange = vi.fn();
    const onExpandedIdsChange = vi.fn();
    render(
      <SideNavigation
        action={<button type="button">Add item</button>}
        defaultActiveId="articles"
        footer={<span>Workspace</span>}
        header={<strong>Library</strong>}
        items={navigationItems}
        onActiveChange={onActiveChange}
        onCollapsedChange={onCollapsedChange}
        onExpandedIdsChange={onExpandedIdsChange}
        side="right"
      />,
    );
    expect(screen.getByRole("navigation", { name: "Side navigation" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Articles" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Content" })).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(screen.getByRole("button", { name: "Collapse navigation" }));
    expect(onCollapsedChange).toHaveBeenCalledWith(true);
    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    fireEvent.click(screen.getByTestId("side-navigation-group-content"));
    expect(onExpandedIdsChange).toHaveBeenCalledWith([]);
    fireEvent.click(screen.getByRole("button", { name: "Expand navigation" }));
    expect(screen.getByText("Workspace")).toBeInTheDocument();
  });

  it("supports controlled active and expanded state and disabled entries", () => {
    Object.defineProperty(window, "matchMedia", { configurable: true, value: () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }) });
    const onActiveChange = vi.fn();
    const { rerender } = render(
      <SideNavigation
        activeId="settings"
        collapsed
        expandedIds={[]}
        items={[
          { type: "link", id: "settings", label: "Settings", href: "/settings" },
          { type: "link", id: "disabled", label: "Unavailable", href: "/unavailable", disabled: true },
          { type: "action", id: "disabled-action", label: "Locked", disabled: true },
        ]}
        onActiveChange={onActiveChange}
        position="sticky"
      />,
    );
    expect(screen.getByTestId("side-navigation-link-disabled")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("button", { name: "Locked" })).toBeDisabled();
    const settings = screen.getByTestId("side-navigation-link-settings");
    settings.addEventListener("click", (event) => event.preventDefault(), { once: true });
    fireEvent.click(settings);
    expect(onActiveChange).toHaveBeenCalledWith("settings", expect.objectContaining({ id: "settings" }));
    rerender(<SideNavigation collapsed={false} items={[]} side="left" />);
    expect(screen.getByTestId("side-navigation-mobile-toggle")).toBeInTheDocument();
  });

  it("opens the mobile navigation, restores focus on Escape, and closes after selection", () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: () => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    });
    const onActiveChange = vi.fn();
    render(
      <SideNavigation
        items={[
          { type: "link", id: "home", label: "Home", href: "/home", onClick: (event) => event.preventDefault() },
          { type: "action", id: "refresh", label: "Refresh", onSelect: vi.fn() },
        ]}
        onActiveChange={onActiveChange}
      />,
    );
    const toggle = screen.getByTestId("side-navigation-mobile-toggle");
    const mobilePanel = document.getElementById(toggle.getAttribute("aria-controls")!);
    expect(mobilePanel).toHaveAttribute("aria-hidden", "true");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(mobilePanel).not.toHaveAttribute("aria-hidden");
    fireEvent.keyDown(document, { key: "ArrowDown" });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveFocus();
    fireEvent.click(toggle);
    fireEvent.click(screen.getByTestId("side-navigation-mobile-scrim"));
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    fireEvent.click(screen.getByTestId("side-navigation-link-home"));
    expect(onActiveChange).toHaveBeenCalledWith("home", expect.objectContaining({ id: "home" }));
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("expands nested active ancestors and reports controlled group and collapse changes", () => {
    Object.defineProperty(window, "matchMedia", { configurable: true, value: () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }) });
    const nestedItems: SideNavigationEntry[] = [
      {
        type: "group",
        id: "root",
        label: "Root",
        icon: <span>Root icon</span>,
        badge: "3",
        items: [
          {
            type: "group",
            id: "unselected",
            label: "Unselected",
            items: [{ type: "link", id: "other", label: "Other", href: "/other" }],
          },
          {
            type: "group",
            id: "nested",
            label: "Nested",
            items: [
              { type: "link", id: "leaf", label: "Leaf", href: "/leaf", icon: <span>Leaf icon</span>, badge: "New" },
              { type: "link", id: "locked", label: "Locked", href: "/locked", disabled: true },
            ],
          },
        ],
      },
    ];
    const onExpandedIdsChange = vi.fn();
    const onCollapsedChange = vi.fn();
    const onActiveChange = vi.fn();
    const { rerender } = render(
      <SideNavigation defaultActiveId="leaf" groupMotion="none" items={nestedItems} />,
    );
    expect(screen.getByRole("button", { name: /Root/ })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: /Nested/ })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: /Leaf/ })).toHaveAttribute("aria-current", "page");
    fireEvent.click(screen.getByRole("button", { name: /Root/ }));
    expect(screen.getByRole("button", { name: /Root/ })).toHaveAttribute("aria-expanded", "false");

    rerender(
      <SideNavigation
        activeId="leaf"
        collapsed
        expandedIds={[]}
        groupMotion="expand"
        items={nestedItems}
        onActiveChange={onActiveChange}
        onCollapsedChange={onCollapsedChange}
        onExpandedIdsChange={onExpandedIdsChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Root/ }));
    expect(onExpandedIdsChange).toHaveBeenCalledWith(["root"]);
    expect(screen.getByRole("button", { name: "Expand navigation" })).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(screen.getByRole("button", { name: "Expand navigation" }));
    expect(onCollapsedChange).toHaveBeenCalledWith(false);
    fireEvent.click(screen.getByTestId("side-navigation-link-locked"));
    expect(onActiveChange).not.toHaveBeenCalled();
  });
});

describe("Toast", () => {
  it("clears only a pending dismissal timeout", () => {
    const clearTimeout = vi.spyOn(window, "clearTimeout");
    const timerRef: { current: number | null } = { current: null };
    clearToastDismissalTimer(timerRef);
    expect(clearTimeout).not.toHaveBeenCalled();

    const timer = window.setTimeout(() => {}, 1000);
    timerRef.current = timer;
    clearToastDismissalTimer(timerRef);
    expect(clearTimeout).toHaveBeenCalledWith(timer);
    expect(timerRef.current).toBeNull();
    clearTimeout.mockRestore();
  });

  it("renders an error alert and invokes its action and dismiss callbacks", () => {
    const onDismiss = vi.fn();
    const onAction = vi.fn();
    render(
      <Toast
        action={{ label: "Retry", onClick: onAction }}
        description="The connection was interrupted."
        duration={0}
        motion="none"
        onDismiss={onDismiss}
        title="Upload failed"
        variant="error"
      />,
    );
    expect(screen.getByRole("alert")).toHaveAttribute("data-variant", "error");
    expect(screen.getByText("The connection was interrupted.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onAction).toHaveBeenCalledOnce();
    expect(onDismiss).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("pauses dismissal while hovered or focused and forwards pointer and focus events", () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    const onPointerEnter = vi.fn();
    const onPointerLeave = vi.fn();
    const onFocusCapture = vi.fn();
    const onBlurCapture = vi.fn();
    render(
      <>
        <Toast
          duration={100}
          motion="none"
          onBlurCapture={onBlurCapture}
          onDismiss={onDismiss}
          onFocusCapture={onFocusCapture}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          title="Saved"
          variant="success"
        />
        <button type="button">Outside toast</button>
      </>,
    );
    const toast = screen.getByRole("status");
    fireEvent.pointerEnter(toast);
    act(() => vi.advanceTimersByTime(100));
    expect(onDismiss).not.toHaveBeenCalled();
    fireEvent.pointerLeave(toast);
    fireEvent.focus(toast);
    expect(onPointerEnter).toHaveBeenCalledOnce();
    expect(onPointerLeave).toHaveBeenCalledOnce();
    expect(onFocusCapture).toHaveBeenCalledOnce();
    act(() => vi.advanceTimersByTime(100));
    expect(onDismiss).not.toHaveBeenCalled();
    fireEvent.blur(toast, { relatedTarget: screen.getByRole("button", { name: "Outside toast" }) });
    expect(onBlurCapture).toHaveBeenCalledOnce();
    act(() => vi.advanceTimersByTime(100));
    expect(onDismiss).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it("dismisses after an animated exit", () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(<Toast duration={0} motion="fade" onDismiss={onDismiss} title="Working" />);
    const toast = screen.getByRole("status");
    expect(toast).toHaveAttribute("data-motion-state", "entering");
    fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
    expect(toast).toHaveAttribute("data-motion-state", "exiting");
    act(() => vi.advanceTimersByTime(1000));
    expect(onDismiss).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it("keeps an animated exit pending instead of immediately dismissing it", () => {
    const onDismiss = vi.fn();
    const { unmount } = render(<Toast duration={0} motion="fade" onDismiss={onDismiss} title="Animated exit" />);
    const toast = screen.getByRole("status");
    fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
    expect(toast).toHaveAttribute("data-motion-state", "exiting");
    expect(onDismiss).not.toHaveBeenCalled();
    unmount();
  });

  it("renders all toast variants and invokes an action before immediate dismissal", () => {
    const onAction = vi.fn();
    const onDismiss = vi.fn();
    render(
      <>
        <Toast
          action={{ label: "Undo", onClick: onAction }}
          description="The changes are saved."
          duration={0}
          motion="none"
          onDismiss={onDismiss}
          title="Saved"
          variant="success"
        />
        <Toast duration={0} motion="none" onDismiss={vi.fn()} title="Check this" variant="warning" />
        <Toast duration={0} motion="none" onDismiss={vi.fn()} title="Failed" variant="error" />
      </>,
    );
    expect(screen.getAllByRole("status")[0]).toHaveTextContent("The changes are saved.");
    expect(screen.getByRole("alert")).toHaveTextContent("Failed");
    expect(Array.from(document.querySelectorAll("[data-icon]"), (icon) => icon.getAttribute("data-icon"))).toEqual(
      expect.arrayContaining(["circle-check", "triangle-alert", "circle-close"]),
    );
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(onAction).toHaveBeenCalledOnce();
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("runs entrance frames before an animated toast exits", () => {
    vi.useFakeTimers();
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    const onDismiss = vi.fn();
    render(<Toast duration={0} motion="fade" onDismiss={onDismiss} title="Entrance" />);
    const toast = screen.getByRole("status");
    expect(toast).toHaveAttribute("data-motion-state", "entering");
    act(() => frames.shift()?.(0));
    act(() => frames.shift()?.(0));
    expect(toast).toHaveAttribute("data-motion-state", "open");
    fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
    expect(toast).toHaveAttribute("data-motion-state", "exiting");
    act(() => vi.advanceTimersByTime(1000));
    expect(onDismiss).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it("switches an active exit to immediate dismissal and clears its timer on unmount", () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    const { rerender, unmount } = render(
      <Toast duration={0} motion="fade" onDismiss={onDismiss} title="Changing motion" />,
    );
    const toast = screen.getByRole("status");
    fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
    expect(toast).toHaveAttribute("data-motion-state", "exiting");
    rerender(<Toast duration={0} motion="none" onDismiss={onDismiss} title="Changing motion" />);
    expect(onDismiss).toHaveBeenCalledOnce();
    act(() => vi.advanceTimersByTime(1000));
    expect(onDismiss).toHaveBeenCalledOnce();
    unmount();
    vi.useRealTimers();
  });

  it("finishes an entrance immediately when motion is disabled while it is starting", () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    const cancelAnimationFrame = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    const onDismiss = vi.fn();
    const { rerender } = render(<Toast duration={0} motion="fade" onDismiss={onDismiss} title="Motion change" />);
    const toast = screen.getByRole("status");
    expect(toast).toHaveAttribute("data-motion-state", "entering");
    rerender(<Toast duration={0} motion="none" onDismiss={onDismiss} title="Motion change" />);
    expect(toast).toHaveAttribute("data-motion-state", "open");
    expect(cancelAnimationFrame).toHaveBeenCalled();
  });

  it("clears a pending animated dismissal when the toast unmounts", () => {
    vi.useFakeTimers();
    const clearTimeout = vi.spyOn(window, "clearTimeout");
    const { unmount } = render(<Toast duration={0} motion="fade" onDismiss={vi.fn()} title="Pending dismissal" />);
    fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
    unmount();
    expect(clearTimeout).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("dismisses immediately for reduced-motion users and keeps internal focus paused", () => {
    const previousPreference = document.documentElement.getAttribute("data-ds-motion-preference");
    document.documentElement.setAttribute("data-ds-motion-preference", "reduced");
    const onDismiss = vi.fn();
    const onBlurCapture = vi.fn();
    render(
      <Toast
        action={{ label: "Undo", onClick: vi.fn() }}
        duration={0}
        motion="fade"
        onBlurCapture={onBlurCapture}
        onDismiss={onDismiss}
        title="Reduced motion"
      />,
    );
    const toast = screen.getByRole("status");
    expect(toast).toHaveAttribute("data-motion-state", "open");
    fireEvent.blur(toast, { relatedTarget: screen.getByRole("button", { name: "Undo" }) });
    expect(onBlurCapture).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
    expect(onDismiss).toHaveBeenCalledOnce();
    if (previousPreference === null) document.documentElement.removeAttribute("data-ds-motion-preference");
    else document.documentElement.setAttribute("data-ds-motion-preference", previousPreference);
  });

  it("manages queued notifications, maximum visible count, and dismiss-all actions", () => {
    function Controls() {
      const { dismissAll, dismissToast, showToast } = useToast();
      const [id, setId] = useState("");
      return (
        <>
          <button onClick={() => setId(showToast({ title: "First update", duration: 0, motion: "none" }))} type="button">Show first</button>
          <button onClick={() => showToast({ title: "Second update", duration: 0, motion: "none", variant: "success" })} type="button">Show second</button>
          <button onClick={() => dismissToast(id)} type="button">Dismiss first</button>
          <button onClick={dismissAll} type="button">Dismiss all</button>
        </>
      );
    }
    render(
      <ToastProvider defaultDuration={0} label="Alerts" maxVisible={1} position="top-start">
        <Controls />
      </ToastProvider>,
    );
    expect(screen.getByRole("region", { name: "Alerts" })).toHaveAttribute("data-position", "top-start");
    fireEvent.click(screen.getByRole("button", { name: "Show first" }));
    fireEvent.click(screen.getByRole("button", { name: "Show second" }));
    expect(screen.getByRole("status")).toHaveTextContent("First update");
    fireEvent.click(screen.getByRole("button", { name: "Dismiss first" }));
    expect(screen.getByRole("status")).toHaveTextContent("Second update");
    fireEvent.click(screen.getByRole("button", { name: "Dismiss all" }));
    expect(screen.getByRole("region", { name: "Alerts" })).toBeEmptyDOMElement();
  });

  it("uses provider defaults and permits unlimited visible notifications", () => {
    function ShowDefaults() {
      const { showToast } = useToast();
      return (
        <>
          <button onClick={() => showToast({ title: "Default notification" })} type="button">Show default</button>
          <button onClick={() => showToast({ title: "Second notification", duration: 0, motion: "none" })} type="button">Show second</button>
        </>
      );
    }
    render(
      <ToastProvider defaultDuration={0} defaultMotion="none" label="All alerts" maxVisible={Number.NaN}>
        <ShowDefaults />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Show default" }));
    fireEvent.click(screen.getByRole("button", { name: "Show second" }));
    expect(screen.getByRole("region", { name: "All alerts" })).toHaveAttribute("data-position", "bottom-end");
    expect(screen.getAllByRole("status")).toHaveLength(2);
    expect(screen.getAllByRole("status")[0]).toHaveAttribute("data-motion", "none");
    expect(screen.getByText("Default notification")).toBeInTheDocument();
    expect(screen.getByText("Second notification")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "Dismiss notification" })[0]);
    expect(screen.queryByText("Default notification")).not.toBeInTheDocument();
    expect(screen.getAllByRole("status")).toHaveLength(1);
  });

  it("requires a provider when accessing toast controls", () => {
    function MissingProvider() {
      useToast();
      return null;
    }
    expect(() => render(<MissingProvider />)).toThrow(/inside a ToastProvider/);
  });
});
