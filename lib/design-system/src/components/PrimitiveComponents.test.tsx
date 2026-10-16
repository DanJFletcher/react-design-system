import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import avatarStyles from "./Avatar/Avatar.module.css";
import { Badge } from "./Badge/Badge";
import { Avatar } from "./Avatar/Avatar";
import { AvatarGroup, type AvatarGroupMember } from "./AvatarGroup/AvatarGroup";
import { Button } from "./Button/Button";
import { ButtonGroup } from "./ButtonGroup/ButtonGroup";
import { Chip } from "./Chip/Chip";
import { Link } from "./Link/Link";
import { Progress } from "./Progress/Progress";
import { Separator } from "./Separator/Separator";
import { Skeleton } from "./Skeleton/Skeleton";
import { ToggleButton } from "./ToggleButton/ToggleButton";

const motionPreference = vi.hoisted(() => ({ reduced: false }));

vi.mock("../motion/usePrefersReducedMotion", () => ({
  usePrefersReducedMotion: () => motionPreference.reduced,
}));

describe("Badge", () => {
  it("renders the default semantic label without decorative content", () => {
    render(<Badge>New</Badge>);
    const badge = screen.getByText("New").parentElement!;

    expect(badge).toHaveAttribute("data-tone", "neutral");
    expect(badge).toHaveAttribute("data-size", "md");
    expect(badge).not.toHaveAttribute("data-shape");
    expect(badge.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it("supports status, shape, size, dot, and a right-side decorative icon", () => {
    render(
      <Badge
        className="custom-badge"
        dot
        icon={<svg data-testid="status-icon" />}
        iconPosition="right"
        shape="square"
        size="lg"
        tone="success"
      >
        Saved
      </Badge>,
    );
    const badge = screen.getByText("Saved").parentElement!;

    expect(badge).toHaveAttribute("data-tone", "success");
    expect(badge).toHaveAttribute("data-size", "lg");
    expect(badge).toHaveAttribute("data-shape", "square");
    expect(badge.className).toContain("custom-badge");
    expect(badge.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
    expect(screen.getByTestId("status-icon").parentElement).toHaveAttribute("aria-hidden", "true");
    expect(badge.lastElementChild).toBe(screen.getByTestId("status-icon").parentElement);
  });

  it("supports a left-side icon and omits boolean icon values", () => {
    const { rerender } = render(
      <Badge icon={<svg data-testid="left-icon" />}>Updated</Badge>,
    );
    const badge = screen.getByText("Updated").parentElement!;
    expect(badge.firstElementChild).toBe(screen.getByTestId("left-icon").parentElement);

    rerender(<Badge icon={false}>Updated</Badge>);
    expect(screen.getByText("Updated").parentElement?.querySelector('[aria-hidden="true"]')).toBeNull();
  });
});

describe("Link", () => {
  it("renders a native anchor with default styling data and forwards anchor props", () => {
    render(
      <Link data-testid="docs-link" href="/docs" id="primary-link">
        Read the docs
      </Link>,
    );
    const link = screen.getByRole("link", { name: "Read the docs" });

    expect(link).toHaveAttribute("href", "/docs");
    expect(link).toHaveAttribute("data-variant", "default");
    expect(link).toHaveAttribute("data-underline", "always");
    expect(link).toHaveAttribute("id", "primary-link");
    expect(link).toHaveAttribute("data-testid", "docs-link");
  });

  it("adds noopener for new tabs while preserving supplied rel tokens", () => {
    const { rerender } = render(
      <Link href="https://example.com" target="_blank" variant="muted" underline="hover">
        External
      </Link>,
    );
    const link = screen.getByRole("link", { name: "External" });
    expect(link).toHaveAttribute("rel", "noopener");
    expect(link).toHaveAttribute("data-variant", "muted");
    expect(link).toHaveAttribute("data-underline", "hover");

    rerender(
      <Link href="https://example.com" rel="nofollow" target="_BLANK" underline="none">
        External
      </Link>,
    );
    expect(link).toHaveAttribute("rel", "nofollow noopener");
    expect(link).toHaveAttribute("data-underline", "none");
  });

  it("does not duplicate noopener when the supplied rel already includes it", () => {
    render(
      <Link href="https://example.com" rel="noreferrer NOOPENER" target="_blank">
        External
      </Link>,
    );

    expect(screen.getByRole("link", { name: "External" })).toHaveAttribute(
      "rel",
      "noreferrer NOOPENER",
    );
  });
});

describe("Separator", () => {
  it("renders decoratively by default", () => {
    render(<Separator data-testid="decorative-separator" />);
    const separator = screen.getByTestId("decorative-separator");

    expect(separator).toHaveAttribute("aria-hidden", "true");
    expect(separator).not.toHaveAttribute("role");
    expect(separator).toHaveAttribute("data-orientation", "horizontal");
    expect(separator).toHaveAttribute("data-length", "full");
    expect(separator).toHaveAttribute("data-spacing", "md");
    expect(separator).toHaveAttribute("data-variant", "solid");
  });

  it("supports a semantic vertical separator and forwards native attributes", () => {
    render(
      <Separator
        aria-label="Navigation divider"
        decorative={false}
        length="short"
        orientation="vertical"
        spacing="lg"
        variant="dotted"
      />,
    );
    const separator = screen.getByRole("separator", { name: "Navigation divider" });

    expect(separator).toHaveAttribute("aria-orientation", "vertical");
    expect(separator).not.toHaveAttribute("aria-hidden");
    expect(separator).toHaveAttribute("data-orientation", "vertical");
    expect(separator).toHaveAttribute("data-length", "short");
    expect(separator).toHaveAttribute("data-spacing", "lg");
    expect(separator).toHaveAttribute("data-variant", "dotted");
  });
});

describe("Skeleton", () => {
  it("renders an aria-hidden text skeleton with merged dimensions", () => {
    render(
      <Skeleton
        className="custom-skeleton"
        data-testid="skeleton"
        height={24}
        width="12rem"
      />,
    );
    const skeleton = screen.getByTestId("skeleton");

    expect(skeleton).toHaveAttribute("aria-hidden", "true");
    expect(skeleton).toHaveAttribute("data-shape", "text");
    expect(skeleton).toHaveAttribute("data-animation", "shimmer");
    expect(skeleton).toHaveStyle({ height: "24px", width: "192px" });
    expect(skeleton.className).toContain("custom-skeleton");
  });

  it("supports shape and animation options and removes motion when reduced motion is preferred", () => {
    const { rerender } = render(
      <Skeleton data-testid="skeleton" animation="pulse" shape="circle" />,
    );
    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveAttribute("data-shape", "circle");
    expect(skeleton).toHaveAttribute("data-animation", "pulse");

    motionPreference.reduced = true;
    rerender(<Skeleton data-testid="skeleton" animation="shimmer" shape="rectangular" />);
    expect(skeleton).toHaveAttribute("data-shape", "rectangular");
    expect(skeleton).toHaveAttribute("data-animation", "none");
    motionPreference.reduced = false;
  });
});

describe("Progress", () => {
  it("renders a determinate progress value and its derived percentage", () => {
    render(<Progress aria-describedby="status-note" label="Uploading" value={40} />);
    const progress = screen.getByRole("progressbar", { name: "Uploading" });

    expect(progress).toHaveAttribute("aria-valuemin", "0");
    expect(progress).toHaveAttribute("aria-valuemax", "100");
    expect(progress).toHaveAttribute("aria-valuenow", "40");
    expect(progress).toHaveAttribute("aria-describedby", "status-note");
    expect(screen.getByText("40%")).toBeInTheDocument();
    expect(progress.firstElementChild).toHaveStyle({ inlineSize: "40%" });
  });

  it("clamps values and allows custom text or hidden visible values", () => {
    const { rerender } = render(
      <Progress label="Storage" max={8} value={12} valueText="Full" />,
    );
    let progress = screen.getByRole("progressbar", { name: "Storage" });
    expect(progress).toHaveAttribute("aria-valuemax", "8");
    expect(progress).toHaveAttribute("aria-valuenow", "8");
    expect(progress).toHaveAttribute("aria-valuetext", "Full");
    expect(screen.getByText("Full")).toBeInTheDocument();
    expect(progress.firstElementChild).toHaveStyle({ inlineSize: "100%" });

    rerender(<Progress label="Storage" showValue={false} value={-2} />);
    progress = screen.getByRole("progressbar", { name: "Storage" });
    expect(progress).toHaveAttribute("aria-valuenow", "0");
    expect(progress.firstElementChild).toHaveStyle({ inlineSize: "0%" });
    expect(screen.queryByText("0%")).not.toBeInTheDocument();
  });

  it("renders an indeterminate progressbar without a value label", () => {
    render(<Progress label="Preparing" value={undefined} />);
    const progress = screen.getByRole("progressbar", { name: "Preparing" });

    expect(progress).not.toHaveAttribute("aria-valuenow");
    expect(progress.parentElement).toHaveAttribute("data-indeterminate", "true");
    expect(screen.queryByText("%")).not.toBeInTheDocument();
  });

  it("rejects invalid maximum and value inputs", () => {
    expect(() => render(<Progress label="Invalid max" max={0} value={1} />)).toThrow(
      "Progress max must be a finite number greater than zero.",
    );
    expect(() => render(<Progress label="Invalid value" value={Number.NaN} />)).toThrow(
      "Progress value must be a finite number.",
    );
  });
});

describe("Button", () => {
  it("renders a primary button by default and invokes its click handler", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Continue</Button>);
    const button = screen.getByRole("button", { name: "Continue" });

    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("data-ds-button-variant", "primary");
    expect(button).not.toHaveAttribute("aria-busy");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("supports variants, shape, width, icon placement, and native button props", () => {
    const { rerender } = render(
      <Button
        data-testid="action"
        fullWidth
        icon={<svg data-testid="action-icon" />}
        iconPosition="right"
        shape="square"
        size="lg"
        type="submit"
        variant="destructive"
      >
        Delete
      </Button>,
    );
    let button = screen.getByRole("button", { name: "Delete" });
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveAttribute("data-ds-button-variant", "destructive");
    expect(button).toHaveAttribute("data-testid", "action");
    expect(button.lastElementChild).toBe(screen.getByTestId("action-icon").parentElement);

    rerender(
      <Button icon={<svg data-testid="left-action-icon" />} iconPosition="left" variant="secondary">
        Save
      </Button>,
    );
    button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("data-ds-button-variant", "secondary");
    expect(button.firstElementChild).toBe(screen.getByTestId("left-action-icon").parentElement);
  });

  it("supports accessible icon-only buttons and omits boolean icons", () => {
    const { rerender } = render(
      <Button aria-label="Close panel" icon={<svg data-testid="close-icon" />} iconOnly>
        {undefined}
      </Button>,
    );
    const iconButton = screen.getByRole("button", { name: "Close panel" });
    expect(iconButton.querySelector(".label")).toBeNull();
    expect(screen.getByTestId("close-icon").parentElement).toHaveAttribute("aria-hidden", "true");

    rerender(<Button icon={true}>No icon</Button>);
    expect(screen.getByRole("button", { name: "No icon" }).querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it("exposes loading state, blocks activation, and renders a decorative spinner", () => {
    const onClick = vi.fn();
    const parentClick = vi.fn();
    render(
      <div onClick={parentClick}>
        <Button loading onClick={onClick}>
          Saving
        </Button>
      </div>,
    );
    const button = screen.getByRole("button", { name: "Saving" });
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });

    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    button.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(onClick).not.toHaveBeenCalled();
    expect(parentClick).not.toHaveBeenCalled();
  });
});

describe("ButtonGroup", () => {
  it("applies group defaults to buttons and toggle buttons without changing other children", () => {
    render(
      <ButtonGroup
        alignment="center"
        appearance="joined"
        disabled
        equalWidth
        fullWidth
        orientation="vertical"
        size="lg"
        spacing="md"
        variant="secondary"
        wrap
      >
        <span data-testid="plain-child">A label</span>
        <Button data-testid="grouped-button">Edit</Button>
        <Button data-testid="custom-button" size="sm" variant="ghost">
          Cancel
        </Button>
        <ToggleButton data-testid="grouped-toggle" value="bold">
          Bold
        </ToggleButton>
      </ButtonGroup>,
    );
    const group = screen.getByRole("group");
    const groupedButton = screen.getByTestId("grouped-button");
    const customButton = screen.getByTestId("custom-button");
    const groupedToggle = screen.getByTestId("grouped-toggle");

    expect(group).toHaveAttribute("data-alignment", "center");
    expect(group).toHaveAttribute("data-appearance", "joined");
    expect(group).toHaveAttribute("data-equal-width", "true");
    expect(group).toHaveAttribute("data-disabled", "true");
    expect(group).toHaveAttribute("data-full-width", "true");
    expect(group).toHaveAttribute("data-orientation", "vertical");
    expect(group).toHaveAttribute("data-size", "lg");
    expect(group).toHaveAttribute("data-spacing", "md");
    expect(group).toHaveAttribute("data-variant", "secondary");
    expect(group).toHaveAttribute("data-wrap", "true");
    expect(groupedButton).toHaveAttribute("data-ds-button-variant", "secondary");
    expect(groupedButton).toBeDisabled();
    expect(customButton).toHaveAttribute("data-ds-button-variant", "ghost");
    expect(customButton).toBeDisabled();
    expect(groupedToggle).toBeDisabled();
    expect(screen.getByTestId("plain-child")).toHaveTextContent("A label");
  });

  it("leaves children intact when no defaults apply and handles empty children", () => {
    const { rerender } = render(
      <ButtonGroup aria-label="Actions">
        label
        <span data-testid="unmodified">Plain element</span>
        <Button data-testid="existing" size="sm" variant="ghost">
          Existing
        </Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("group", { name: "Actions" })).toHaveAttribute("data-size", "default");
    expect(screen.getByRole("group", { name: "Actions" })).toHaveAttribute("data-variant", "default");
    expect(screen.getByTestId("existing")).toHaveAttribute("data-ds-button-variant", "ghost");
    expect(screen.getByTestId("existing")).not.toBeDisabled();
    expect(screen.getByTestId("unmodified")).toHaveTextContent("Plain element");

    rerender(<ButtonGroup data-testid="empty-group">{null}</ButtonGroup>);
    expect(screen.getByTestId("empty-group")).toHaveAttribute("data-spacing", "sm");
    expect(screen.getByTestId("empty-group")).toBeEmptyDOMElement();
  });
});

describe("Avatar", () => {
  it("derives initials from multiword, single-word, and empty names", () => {
    const { rerender } = render(<Avatar name=" Ada Lovelace " size="xl" shape="rounded" />);
    let avatar = screen.getByRole("img", { name: "Ada Lovelace" });
    expect(avatar).toHaveTextContent("AL");
    expect(avatar.className).toContain("xl");
    expect(avatar.className).toContain("rounded");

    rerender(<Avatar name="Ada" />);
    avatar = screen.getByRole("img", { name: "Ada" });
    expect(avatar).toHaveTextContent("AD");

    rerender(<Avatar name="  " />);
    avatar = screen.getByRole("img", { name: "Avatar" });
    expect(avatar).toHaveTextContent("?");
  });

  it("shows a supplied image and falls back to supplied initials after an image error", () => {
    render(<Avatar data-testid="avatar" initials="  ZK " name="Zoe Kim" src="/avatar.jpg" />);
    const avatar = screen.getByTestId("avatar");
    const image = avatar.querySelector("img");

    expect(image).toHaveAttribute("src", "/avatar.jpg");
    expect(image).toHaveAttribute("alt", "");
    fireEvent.error(image!);
    expect(avatar.querySelector("img")).toBeNull();
    expect(avatar).toHaveTextContent("ZK");
  });

  it("retries when the image source changes after a failed request", () => {
    const { rerender } = render(<Avatar name="Kai" src="/old.jpg" />);
    fireEvent.error(screen.getByRole("img", { name: "Kai" }).querySelector("img")!);

    rerender(<Avatar name="Kai" src="/new.jpg" />);
    expect(screen.getByRole("img", { name: "Kai" }).querySelector("img")).toHaveAttribute(
      "src",
      "/new.jpg",
    );
  });
});

const teamMembers: AvatarGroupMember[] = [
  { id: "one", name: "Alex Rivera" },
  { id: "two", name: "Bailey Chen" },
  { id: "three", name: "Casey Morgan" },
  { id: "four", name: "Devon Shah" },
  { id: "five", name: "Emery Jones" },
  { id: "six", name: "Finley Park" },
];

describe("AvatarGroup", () => {
  it("shows the default visible members and pluralized overflow control", () => {
    render(<AvatarGroup members={teamMembers} />);
    const group = screen.getByRole("group", { name: "Team members" });
    const overflow = screen.getByRole("button", { name: "Show 2 more members" });

    expect(screen.getByRole("img", { name: "Alex Rivera" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Devon Shah" })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Emery Jones" })).not.toBeInTheDocument();
    expect(group.querySelectorAll('[role="img"]')).toHaveLength(6);
    expect(overflow).toHaveAttribute("aria-expanded", "false");
    expect(overflow).toHaveAttribute("aria-controls");

    fireEvent.click(overflow);
    expect(overflow).toHaveAttribute("aria-expanded", "true");
    const hiddenMembersList = screen.getByRole("list", { name: "Additional team members" });
    expect(hiddenMembersList).toBeVisible();
    expect(screen.getByText("Emery Jones")).toBeInTheDocument();
    fireEvent.click(overflow);
    expect(hiddenMembersList).not.toBeVisible();
  });

  it("supports a custom label, shape, size, limit, and overflow label", () => {
    render(
      <AvatarGroup
        label="Project team"
        maxVisible={1}
        members={teamMembers.slice(0, 2)}
        overflowLabel={(count) => `More teammates (${count})`}
        shape="square"
        size="lg"
      />,
    );
    const avatar = screen.getByRole("group", { name: "Project team" }).querySelector('[role="img"]');
    expect(avatar?.className).toContain(avatarStyles.lg);
    expect(avatar?.className).toContain(avatarStyles.square);
    expect(screen.getByRole("button", { name: "More teammates (1)" })).toBeInTheDocument();

    render(<AvatarGroup members={teamMembers.slice(0, 1)} maxVisible={0} />);
    expect(screen.getByRole("button", { name: "Show 1 more member" })).toBeInTheDocument();
  });

  it("closes the overflow with Escape and restores focus to its trigger", () => {
    render(<AvatarGroup members={teamMembers} maxVisible={2} />);
    const trigger = screen.getByRole("button", { name: "Show 4 more members" });
    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: "Escape" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("closes on outside pointer input but stays open for pointer input inside", () => {
    render(<AvatarGroup members={teamMembers} maxVisible={2} />);
    const trigger = screen.getByRole("button", { name: "Show 4 more members" });
    fireEvent.click(trigger);
    fireEvent.pointerDown(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    fireEvent.pointerDown(document.body);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the open overflow when the hidden member list becomes empty", () => {
    const { rerender } = render(<AvatarGroup members={teamMembers} maxVisible={2} />);
    const trigger = screen.getByRole("button", { name: "Show 4 more members" });
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    rerender(<AvatarGroup members={teamMembers.slice(0, 2)} maxVisible={2} />);
    expect(screen.queryByRole("button", { name: /Show .* more/ })).not.toBeInTheDocument();
  });

  it("rejects a negative or fractional visible-member limit", () => {
    expect(() => render(<AvatarGroup members={[]} maxVisible={-1} />)).toThrow(
      "AvatarGroup maxVisible must be a non-negative integer.",
    );
    expect(() => render(<AvatarGroup members={[]} maxVisible={1.5} />)).toThrow(
      "AvatarGroup maxVisible must be a non-negative integer.",
    );
  });
});

describe("Chip", () => {
  it("renders a static chip without selection or remove controls", () => {
    render(<Chip data-testid="category-chip">Design</Chip>);
    const chip = screen.getByTestId("category-chip");

    expect(chip).toHaveTextContent("Design");
    expect(chip).not.toHaveAttribute("data-selected");
    expect(chip).not.toHaveAttribute("data-disabled");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("reports selection changes and displays a selected check icon", () => {
    const onSelect = vi.fn();
    const { rerender } = render(
      <Chip onSelect={onSelect} selected={false} size="sm">
        Design
      </Chip>,
    );
    const selectionButton = screen.getByRole("button", { name: "Design" });
    expect(selectionButton).toHaveAttribute("aria-pressed", "false");
    expect(selectionButton.querySelector('[data-icon="check"]')).toBeNull();
    fireEvent.click(selectionButton);
    expect(onSelect).toHaveBeenCalledWith(true);

    rerender(
      <Chip onSelect={onSelect} selected>
        Design
      </Chip>,
    );
    expect(screen.getByRole("button", { name: "Design" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Design" }).querySelector('[data-icon="check"]')).toBeInTheDocument();
  });

  it("supports removal and disables both selection and removal actions", () => {
    const onSelect = vi.fn();
    const onRemove = vi.fn();
    render(
      <Chip disabled onRemove={onRemove} onSelect={onSelect} removeLabel="Remove design" selected>
        Design
      </Chip>,
    );
    const selectionButton = screen.getByRole("button", { name: "Design" });
    const removeButton = screen.getByRole("button", { name: "Remove design" });

    expect(selectionButton).toBeDisabled();
    expect(removeButton).toBeDisabled();
    expect(selectionButton.closest("[data-disabled]")).toHaveAttribute("data-disabled", "true");
    fireEvent.click(removeButton);
    expect(onRemove).not.toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("forwards removal clicks and requires a non-empty accessible remove label", () => {
    const onRemove = vi.fn();
    render(
      <Chip onRemove={onRemove} removeLabel="Remove tag">
        Topic
      </Chip>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove tag" }));
    expect(onRemove).toHaveBeenCalledTimes(1);

    expect(() =>
      render(
        <Chip onRemove={onRemove} removeLabel=" ">
          Invalid
        </Chip>,
      ),
    ).toThrow("Chip: provide a non-empty removeLabel when onRemove is used.");
  });
});
