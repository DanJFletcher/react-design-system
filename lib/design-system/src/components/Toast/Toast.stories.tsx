import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "../Button/Button";
import {
  Toast,
  ToastProvider,
  useToast,
  type ToastProps,
  type ToastVariant,
} from "./Toast";

const meta = {
  title: "Components/Toast",
  component: Toast,
  args: {
    title: "Changes saved",
    description: "Your profile is up to date.",
    variant: "info",
    duration: 5000,
    motion: "none",
    closeLabel: "Dismiss notification",
    onDismiss: () => undefined,
  },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    variant: { control: "inline-radio", options: ["info", "success", "warning", "error"] },
    duration: { control: "number", description: "Milliseconds; 0 keeps the toast open." },
    motion: { control: "inline-radio", options: ["none", "fade", "slide"] },
    icon: { control: false },
    action: { control: false },
    closeLabel: { control: "text" },
    onDismiss: { control: false },
    className: { control: false },
    style: { control: false },
  },
  render: (args) => (
    <ToastProvider>
      <ToastPlayground {...args} />
    </ToastProvider>
  ),
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Show toast" }));
    const toast = canvas.getByRole("status");
    await expect(toast).toHaveTextContent("Changes saved");
    await expect(toast.querySelector('[data-icon="circle-info"]')).toBeInTheDocument();
    const closeButton = canvas.getByRole("button", { name: "Dismiss notification" });
    await expect(closeButton.querySelector('[data-icon="close"]')).toBeInTheDocument();
    await userEvent.click(closeButton);
    await expect(canvas.queryByRole("status")).not.toBeInTheDocument();
  },
};

export const AutoDismiss: Story = {
  args: { duration: 1500 },
};

export const FadeMotion: Story = {
  args: { duration: 0, motion: "fade" },
  globals: { motion: "full" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Show toast" }));
    const toast = canvas.getByRole("status");
    await expect(toast).toHaveAttribute("data-motion", "fade");
    await new Promise((resolve) => window.setTimeout(resolve, 80));
    await expect(toast).toHaveAttribute("data-motion-state", "open");
    await userEvent.click(canvas.getByRole("button", { name: "Dismiss notification" }));
    await expect(toast).toHaveAttribute("data-motion-state", "exiting");
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    await expect(canvas.queryByRole("status")).not.toBeInTheDocument();
  },
};

export const SlideMotion: Story = {
  args: { duration: 0, motion: "slide" },
  globals: { motion: "full" },
};

export const ReducedMotion: Story = {
  args: { duration: 0, motion: "fade" },
  globals: { motion: "reduced" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Show toast" }));
    const toast = canvas.getByRole("status");
    await expect(toast).toHaveAttribute("data-motion-state", "open");
    await userEvent.click(canvas.getByRole("button", { name: "Dismiss notification" }));
    await expect(canvas.queryByRole("status")).not.toBeInTheDocument();
  },
};

export const Variants: Story = {
  render: () => (
    <ToastProvider>
      <VariantPlayground />
    </ToastProvider>
  ),
};

export const Action: Story = {
  render: () => (
    <ToastProvider>
      <ActionPlayground />
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Show actionable toast" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("File uploaded");
    await userEvent.click(canvas.getByRole("button", { name: "Undo" }));
    await expect(canvas.queryByRole("status")).not.toBeInTheDocument();
    await expect(canvas.getByText("Undo complete")).toBeVisible();
  },
};

export const Queue: Story = {
  render: () => (
    <ToastProvider maxVisible={2} defaultDuration={0}>
      <QueuePlayground />
    </ToastProvider>
  ),
};

export const ThemeCoverage: Story = {
  render: (args) => (
    <section data-ds-theme="luna">
      <ToastProvider>
        <ToastPlayground {...args} />
      </ToastProvider>
    </section>
  ),
};

export const TopStart: Story = {
  render: (args) => (
    <ToastProvider position="top-start">
      <ToastPlayground {...args} />
    </ToastProvider>
  ),
};

export const CustomHooks: Story = {
  render: (args) => (
    <ToastProvider>
      <ToastPlayground
        {...args}
        style={{
          "--ds-toast-surface": "var(--ds-color-accent-bg)",
          "--ds-toast-text": "var(--ds-color-accent-fg)",
          "--ds-toast-border": "var(--ds-color-accent-fg)",
          "--ds-toast-radius": "var(--ds-space-6)",
          "--ds-toast-padding": "var(--ds-space-5)",
        }}
      />
    </ToastProvider>
  ),
};

function ToastPlayground(args: ToastProps) {
  const { showToast } = useToast();
  const { title, description, variant, icon, action, duration, motion, closeLabel, className, style } = args;

  return (
    <Button
      onClick={() => showToast({
        title,
        description,
        variant,
        icon,
        action,
        duration,
        motion,
        closeLabel,
        className,
        style,
      })}
    >
      Show toast
    </Button>
  );
}

function VariantPlayground() {
  const { showToast } = useToast();
  const variants: ToastVariant[] = ["info", "success", "warning", "error"];

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--ds-space-3)" }}>
      {variants.map((variant) => (
        <Button
          key={variant}
          onClick={() => showToast({
            title: `${variant[0].toUpperCase()}${variant.slice(1)} notification`,
            description: "This message uses the matching announcement role and accent.",
            variant,
            duration: 0,
          })}
        >
          Show {variant}
        </Button>
      ))}
    </div>
  );
}

function ActionPlayground() {
  const { showToast } = useToast();
  const [actionMessage, setActionMessage] = useState("");

  return (
    <div style={{ display: "grid", gap: "var(--ds-space-3)", justifyItems: "start" }}>
      <Button
        onClick={() => showToast({
          title: "File uploaded",
          description: "The file is ready to share.",
          variant: "success",
          duration: 0,
          action: { label: "Undo", onClick: () => setActionMessage("Undo complete") },
        })}
      >
        Show actionable toast
      </Button>
      {actionMessage && <span>{actionMessage}</span>}
    </div>
  );
}

function QueuePlayground() {
  const { showToast, dismissAll } = useToast();
  const [nextNumber, setNextNumber] = useState(1);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--ds-space-3)" }}>
      <Button
        onClick={() => {
          showToast({ title: `Queued notification ${nextNumber}`, duration: 0 });
          setNextNumber((current) => current + 1);
        }}
      >
        Add notification
      </Button>
      <Button onClick={dismissAll} variant="secondary">Dismiss all</Button>
    </div>
  );
}
