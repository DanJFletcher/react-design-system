import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { Avatar } from "./Avatar";

const portrait = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="#e8ddf2"/><circle cx="48" cy="35" r="18" fill="#79588f"/><path d="M15 96c2-24 15-37 33-37s31 13 33 37" fill="#79588f"/></svg>',
)}`;

const meta = {
  title: "Components/Identity/Avatar",
  id: "components-avatar",
  component: Avatar,
  args: {
    name: "Maya Chen",
    src: portrait,
    size: "md",
    shape: "circle",
  },
  argTypes: {
    name: { control: "text" },
    src: { control: "text" },
    initials: { control: "text" },
    size: { control: "inline-radio", options: ["sm", "md", "lg", "xl"] },
    shape: { control: "inline-radio", options: ["circle", "rounded", "square"] },
    className: { control: false },
    style: { control: false },
  },
  render: (args) => (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-3)" }}>
      <Avatar {...args} />
      <span>{args.name}</span>
    </div>
  ),
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const InitialsFallback: Story = {
  args: { name: "Maya Chen", src: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("img", { name: "Maya Chen" })).toBeVisible();
    await expect(canvas.getByText("MC")).toBeVisible();
  },
};

export const CustomInitials: Story = {
  args: { name: "Maya Chen", initials: "MC", src: undefined, size: "lg" },
};

export const ImageFallback: Story = {
  args: {
    name: "Theo Park",
    src: "data:image/png;base64,not-a-valid-image",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("img", { name: "Theo Park" })).toBeVisible();
    await expect(canvas.findByText("TP")).resolves.toBeVisible();
  },
};

export const SizeAndShapeOptions: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-3)" }}>
        <Avatar name="Ari Morgan" size="sm" src={portrait} />
        <Avatar name="Maya Chen" size="md" src={portrait} />
        <Avatar name="Theo Park" size="lg" src={portrait} />
        <Avatar name="Nia Woods" size="xl" src={portrait} />
        <span>Small through extra large</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--ds-space-3)" }}>
        <Avatar name="Circle avatar" shape="circle" src={portrait} />
        <Avatar name="Rounded avatar" shape="rounded" src={portrait} />
        <Avatar name="Square avatar" shape="square" src={portrait} />
        <span>Circle, rounded, and square shapes</span>
      </div>
    </div>
  ),
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <div
          data-ds-theme={theme}
          key={theme}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--ds-space-3)",
            padding: "var(--ds-space-4)",
            background: "var(--ds-color-canvas)",
            color: "var(--ds-color-text-primary)",
          }}
        >
          <Avatar name={`${theme} editor`} size="lg" src={portrait} />
          <Avatar name={`${theme} editor without photo`} size="lg" />
          <span>{theme} theme</span>
        </div>
      ))}
    </div>
  ),
};
