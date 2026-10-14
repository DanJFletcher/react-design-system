import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Tooltip } from "../Tooltip/Tooltip";
import { Dialog, type DialogProps } from "./Dialog";

const meta = {
  title: "Components/Dialog",
  component: Dialog,
  args: {
    open: false,
    onOpenChange: () => undefined,
    heading: "Confirm the changes?",
    description: "Review this action before continuing.",
    size: "md",
    headingLevel: 2,
    showCloseButton: true,
    closeLabel: "Close dialog",
    closeOnEscape: true,
    closeOnBackdropClick: false,
    motion: "fade",
  },
  argTypes: {
    open: { control: false },
    onOpenChange: { control: false },
    heading: { control: "text" },
    description: { control: "text" },
    children: { control: false },
    footer: { control: false },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    headingLevel: { control: "select", options: [1, 2, 3, 4, 5, 6] },
    showCloseButton: { control: "boolean" },
    closeLabel: { control: "text" },
    closeOnEscape: { control: "boolean" },
    closeOnBackdropClick: { control: "boolean" },
    motion: { control: "inline-radio", options: ["none", "fade", "slide"] },
    onClose: { control: false },
    onCancel: { control: false },
    onClick: { control: false },
    className: { control: false },
    style: { control: false },
  },
  render: (args) => <DialogPlayground {...args} />,
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const DefaultMotion: Story = {
  render: (args) => {
    const props = { ...args };
    delete props.motion;
    return <DialogPlayground {...props} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open dialog" }));
    const dialog = canvas.getByRole("dialog", { name: "Confirm the changes?" });
    await expect(dialog).toHaveAttribute("data-motion", "fade");
    await userEvent.click(canvas.getByRole("button", { name: "Close dialog" }));
    await expect(dialog).toHaveAttribute("data-motion-state", "exiting");
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
  },
};

export const FadeMotion: Story = {
  args: { motion: "fade" },
  globals: { motion: "full" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open dialog" }));
    const dialog = canvas.getByRole("dialog", { name: "Confirm the changes?" });
    await expect(dialog).toHaveAttribute("data-motion", "fade");
    await userEvent.click(canvas.getByRole("button", { name: "Close dialog" }));
    await expect(dialog).toHaveAttribute("data-motion-state", "exiting");
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
  },
};

export const SlideMotion: Story = {
  args: { motion: "slide" },
  globals: { motion: "full" },
};

export const ReducedMotion: Story = {
  args: { motion: "fade" },
  globals: { motion: "reduced" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open dialog" }));
    const dialog = canvas.getByRole("dialog", { name: "Confirm the changes?" });
    await expect(dialog).toHaveAttribute("data-motion-state", "open");
    await userEvent.click(canvas.getByRole("button", { name: "Close dialog" }));
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
  },
};

export const InitiallyOpen: Story = {
  render: (args) => <DialogPlayground {...args} initiallyOpen />,
};

export const TooltipInsideDialog: Story = {
  render: (args) => (
    <DialogPlayground {...args}>
      <Tooltip content="Additional context for this dialog action.">
        <Button variant="secondary">Dialog help</Button>
      </Tooltip>
    </DialogPlayground>
  ),
};

export const TooltipWhileBodyScrolls: Story = {
  render: (args) => (
    <DialogPlayground {...args}>
      <div>
        <div aria-hidden="true" style={{ blockSize: "24rem" }} />
        <Tooltip content="Additional context for this dialog action.">
          <Button variant="secondary">Dialog help</Button>
        </Tooltip>
        <div aria-hidden="true" style={{ blockSize: "48rem" }} />
      </div>
    </DialogPlayground>
  ),
};

export const SmallSize: Story = {
  args: { size: "sm" },
};

export const LargeSize: Story = {
  args: { size: "lg" },
};

export const EscapeDisabled: Story = {
  args: { closeOnEscape: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open dialog" }));
    await expect(canvas.getByRole("dialog", { name: "Confirm the changes?" })).toBeVisible();
    const closeButton = canvas.getByRole("button", { name: "Close dialog" });
    await expect(closeButton.querySelector('[data-icon="close"]')).toBeInTheDocument();
    await userEvent.click(closeButton);
    await expect(canvas.getByRole("dialog")).toHaveAttribute("data-motion-state", "exiting");
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
  },
};

export const BackdropDismissal: Story = {
  args: { closeOnBackdropClick: true },
};

export const NativeCloseForm: Story = {
  render: (args) => (
    <DialogPlayground
      {...args}
      children={(
        <form method="dialog">
          <p>Submitting this form closes the native dialog and requests the controlled state update.</p>
          <Button type="submit">Close through form</Button>
        </form>
      )}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open dialog" }));
    await userEvent.click(canvas.getByRole("button", { name: "Close through form" }));
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Open dialog" })).toHaveFocus();
  },
};

export const ThemeCoverage: Story = {
  render: (args) => <DialogPlayground {...args} theme="luna" />,
};

export const CustomHooks: Story = {
  render: (args) => (
    <DialogPlayground
      {...args}
      style={{
        "--ds-dialog-surface": "var(--ds-color-accent-bg)",
        "--ds-dialog-text": "var(--ds-color-accent-fg)",
        "--ds-dialog-border": "var(--ds-color-accent-fg)",
        "--ds-dialog-radius": "var(--ds-space-6)",
        "--ds-dialog-padding": "var(--ds-space-8)",
      }}
    />
  ),
};

function DialogPlayground({
  open: _open,
  onOpenChange: _onOpenChange,
  children,
  footer,
  theme,
  initiallyOpen = false,
  ...dialogProps
}: DialogProps & { theme?: string; initiallyOpen?: boolean }) {
  const [open, setOpen] = useState(initiallyOpen);
  const defaultFooter = (
    <>
      <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
      <Button onClick={() => setOpen(false)}>Confirm</Button>
    </>
  );

  return (
    <div
      data-ds-theme={theme}
      style={theme ? {
        minBlockSize: "var(--ds-space-32)",
        padding: "var(--ds-space-6)",
        backgroundColor: "var(--ds-color-canvas)",
        color: "var(--ds-color-text-primary)",
      } : undefined}
    >
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog
        {...dialogProps}
        open={open}
        onOpenChange={setOpen}
        footer={footer ?? defaultFooter}
      >
        {children ?? (
          <p>
            Your draft changes are ready to save. Confirm to keep them, or cancel to return to editing.
          </p>
        )}
      </Dialog>
    </div>
  );
}
