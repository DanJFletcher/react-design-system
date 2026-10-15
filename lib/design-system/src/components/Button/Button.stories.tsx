import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Icon, iconNames, type IconName } from "../Icon/Icon";
import { Button, type ButtonShape } from "./Button";

const meta = {
  title: "Components/Button",
  component: Button,
  args: {
    children: "Save changes",
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary", "ghost", "destructive"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: { control: "inline-radio", options: ["rounded", "square", "pill"] },
    fullWidth: { control: "boolean" },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    type: { control: "inline-radio", options: ["button", "submit", "reset"] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

const iconChoices = Object.fromEntries(
  iconNames.map((name) => [name, <Icon key={name} name={name} />]),
) as Record<IconName, ReactNode>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: "secondary" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Destructive: Story = {
  args: { variant: "destructive", children: "Delete project" },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Delete project" });
    await expect(button).toHaveAttribute("data-ds-button-variant", "destructive");
    await expect(getComputedStyle(button).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  },
};

export const AllVariantsAndSizes: Story = {
  render: () => (
    <div className="button-story-grid">
      {(["primary", "secondary", "ghost", "destructive"] as const).map((variant) => (
        <div key={variant} className="button-story-row">
          <strong>{variant}</strong>
          {(["sm", "md", "lg"] as const).map((size) => (
            <Button key={`${variant}-${size}`} variant={variant} size={size}>
              {size.toUpperCase()} button
            </Button>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const ShapeOptionsAndFullWidth: Story = {
  render: () => (
    <div style={{ display: "grid", justifyItems: "start", gap: "1rem", width: "24rem", maxWidth: "100%" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
        {(["rounded", "square", "pill"] as const).map((shape) => (
          <Button key={shape} shape={shape}>
            {shape}
          </Button>
        ))}
      </div>
      <Button fullWidth>Full width</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const shapeRadii: Array<[ButtonShape, string]> = [
      ["rounded", "12px"],
      ["square", "0px"],
      ["pill", "9999px"],
    ];
    for (const [shape, radius] of shapeRadii) {
      const button = canvas.getByRole("button", { name: shape });
      await expect(getComputedStyle(button).borderTopLeftRadius).toBe(radius);
    }
    const fullWidthButton = canvas.getByRole("button", { name: "Full width" });
    const containerWidth = fullWidthButton.parentElement!.getBoundingClientRect().width;
    await expect(fullWidthButton.getBoundingClientRect().width).toBe(containerWidth);
  },
};

export const IconControls: Story = {
  args: {
    children: "Save to favorites",
    icon: "sparkle",
    iconPosition: "left",
    iconOnly: false,
    "aria-label": "Save to favorites",
  },
  argTypes: {
    icon: { control: "select", options: iconNames },
    iconPosition: { control: "inline-radio", options: ["left", "right"] },
    iconOnly: { control: "boolean" },
  },
  render: (args) => {
    const iconName =
      typeof args.icon === "string" && args.icon in iconChoices
        ? (args.icon as IconName)
        : "sparkle";
    const selectedIcon = iconChoices[iconName];
    return (
      <div className="button-story-row">
        <Button {...args} icon={selectedIcon} />
        <Button icon={selectedIcon} iconPosition="right">
          Continue
        </Button>
        <Button iconOnly icon={selectedIcon} aria-label="Open favorites" variant="ghost" />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Save to favorites" });
    await expect(button).toBeVisible();
    await expect(button.querySelector('[aria-hidden="true"] svg')).toBeInTheDocument();
    const rightIconButton = within(canvasElement).getByRole("button", { name: "Continue" });
    await expect(rightIconButton.firstElementChild?.getAttribute("aria-hidden")).toBeNull();
    await expect(rightIconButton.lastElementChild?.getAttribute("aria-hidden")).toBe("true");
    await expect(within(canvasElement).getByRole("button", { name: "Open favorites" })).toBeVisible();
  },
};

export const IconOnly: Story = {
  render: () => (
    <Button iconOnly icon={<Icon name="sparkle" />} aria-label="Save to favorites" variant="ghost" />
  ),
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Save to favorites" });
    await expect(button).toBeVisible();
    await expect(button.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    await expect(button.textContent).toBe("");
  },
};

export const Disabled: Story = { args: { disabled: true } };
export const Loading: Story = { args: { loading: true } };
export const InteractionStates: Story = {
  render: () => (
    <div className="button-story-row">
      <Button>Resting</Button>
      <Button disabled>Disabled</Button>
      <Button loading>Loading</Button>
    </div>
  ),
};
export const LongWrappingLabel: Story = {
  render: () => (
    <div style={{ maxWidth: "12rem" }}>
      <Button>Continue to the next step after reviewing your account details</Button>
    </div>
  ),
};
export const DecorativeIcon: Story = {
  render: () => (
    <Button>
      <span aria-hidden="true">✦</span>
      Save to collection
    </Button>
  ),
};
export const NestedThemes: Story = {
  render: () => (
    <div className="theme-story-stack" data-ds-theme="acme">
      <Button>ACME default</Button>
      <div className="theme-story-stack" data-ds-theme="luna">
        <Button>Nested Luna</Button>
        <div className="theme-story-stack" data-ds-theme="acme">
          <Button>Restored ACME</Button>
        </div>
      </div>
    </div>
  ),
};
export const CustomThemeAndScopedOverride: Story = {
  render: () => (
    <div className="theme-story-stack" data-ds-theme="orchid">
      <Button style={{ "--ds-button-radius": "12px" }}>Orchid with a local radius override</Button>
    </div>
  ),
};
export const RefAndNativeProps: Story = {
  render: () => {
    return (
      <Button
        id="forwarded-button"
        name="action"
        value="save"
        aria-label="Save the current work"
        ref={(element) => {
          if (element) element.dataset.refAttached = "true";
        }}
      >
        Save
      </Button>
    );
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Save the current work" });
    await expect(button).toHaveAttribute("id", "forwarded-button");
    await expect(button).toHaveAttribute("name", "action");
    await expect(button).toHaveAttribute("value", "save");
    await expect(button).toHaveAttribute("data-ref-attached", "true");
  },
};
export const DefaultIsNotSubmit: Story = {
  render: () => (
    <form onSubmit={(event) => event.preventDefault()}>
      <Button data-testid="default-action">Default button type</Button>
      <Button data-testid="submit-action" type="submit">Explicit submit</Button>
    </form>
  ),
  play: async ({ canvasElement }) => {
    let submitCount = 0;
    const form = canvasElement.querySelector("form")!;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submitCount += 1;
    });
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("default-action"));
    await expect(submitCount).toBe(0);
    await userEvent.click(canvas.getByTestId("submit-action"));
    await expect(submitCount).toBe(1);
  },
};

export const LoadingKeepsDimensionsAndFocus: Story = {
  render: () => <LoadingTransition />,
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Start action" });
    const before = button.getBoundingClientRect();
    await userEvent.click(button);
    const after = button.getBoundingClientRect();
    await expect(button).toHaveFocus();
    await expect(button).toHaveAttribute("aria-busy", "true");
    await expect(after.width).toBe(before.width);
    await expect(after.height).toBe(before.height);
  },
};

export const ClickActivation: Story = {
  args: {
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Save changes" });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const LoadingSuppressesActivation: Story = {
  args: {
    loading: true,
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Save changes" });
    button.focus();
    await userEvent.click(button);
    await expect(button).toHaveAttribute("aria-busy", "true");
    await expect(button).toHaveAttribute("aria-disabled", "true");
    await expect(button).toHaveFocus();
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const DisabledSuppressesActivation: Story = {
  args: {
    disabled: true,
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Save changes" }));
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const KeyboardActivation: Story = {
  args: { onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", { name: "Save changes" });
    button.focus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).toHaveBeenCalledOnce();
    await userEvent.keyboard(" ");
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};

function LoadingTransition() {
  const [loading, setLoading] = useState(false);
  return (
    <Button loading={loading} onClick={() => setLoading(true)}>
      Start action
    </Button>
  );
}

