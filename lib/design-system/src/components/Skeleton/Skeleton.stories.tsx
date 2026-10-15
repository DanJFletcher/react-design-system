import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { Skeleton } from "./Skeleton";

const meta = {
  title: "Components/Skeleton",
  component: Skeleton,
  args: {
    shape: "text",
    animation: "shimmer",
    width: "70%",
  },
  argTypes: {
    shape: { control: "inline-radio", options: ["text", "circle", "rectangular"] },
    animation: { control: "inline-radio", options: ["shimmer", "pulse", "none"] },
    width: { control: "text" },
    height: { control: "text" },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const CommonShapes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)", maxWidth: "24rem" }}>
      <div style={{ display: "grid", gap: "var(--ds-space-2)" }}>
        <strong>Text line</strong>
        <Skeleton data-testid="text-skeleton" shape="text" width="82%" />
      </div>
      <div style={{ display: "grid", gap: "var(--ds-space-2)" }}>
        <strong>Profile image</strong>
        <Skeleton data-testid="circle-skeleton" shape="circle" width="var(--ds-space-16)" height="var(--ds-space-16)" />
      </div>
      <div style={{ display: "grid", gap: "var(--ds-space-2)" }}>
        <strong>Media block</strong>
        <Skeleton data-testid="rect-skeleton" shape="rectangular" width="100%" height="var(--ds-space-32)" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const text = canvas.getByTestId("text-skeleton");
    const circle = canvas.getByTestId("circle-skeleton");
    const rectangle = canvas.getByTestId("rect-skeleton");
    await expect(text).toHaveAttribute("aria-hidden", "true");
    await expect(text).toHaveAttribute("data-shape", "text");
    await expect(getComputedStyle(circle).borderRadius).toBe("9999px");
    await expect(rectangle.getBoundingClientRect().height).toBeGreaterThan(0);
  },
};

export const AnimationOptions: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)", maxWidth: "24rem" }}>
      <div style={{ display: "grid", gap: "var(--ds-space-2)" }}>
        <strong>Shimmer</strong>
        <Skeleton animation="shimmer" shape="rectangular" height="var(--ds-space-8)" />
      </div>
      <div style={{ display: "grid", gap: "var(--ds-space-2)" }}>
        <strong>Pulse</strong>
        <Skeleton animation="pulse" shape="rectangular" height="var(--ds-space-8)" />
      </div>
      <div style={{ display: "grid", gap: "var(--ds-space-2)" }}>
        <strong>Static</strong>
        <Skeleton animation="none" shape="rectangular" height="var(--ds-space-8)" />
      </div>
    </div>
  ),
};

export const ProfileLoading: Story = {
  render: () => (
    <div
      aria-busy="true"
      aria-label="Loading profile"
      className="skeleton-profile-loading"
      role="status"
      style={{
        display: "grid",
        gap: "var(--ds-space-3)",
        maxWidth: "24rem",
      }}
    >
      <Skeleton shape="circle" width="var(--ds-space-16)" height="var(--ds-space-16)" />
      <Skeleton shape="text" width="46%" />
      <Skeleton shape="text" width="100%" />
      <Skeleton shape="text" width="78%" />
    </div>
  ),
};

export const ReducedMotion: Story = {
  globals: { motion: "reduced" },
  play: async ({ canvasElement }) => {
    const skeleton = within(canvasElement).getByTestId("reduced-motion-skeleton");
    await expect(document.documentElement).toHaveAttribute("data-ds-motion-preference", "reduced");
    await expect(skeleton).toHaveAttribute("data-animation", "none");
  },
  render: () => (
    <div style={{ maxWidth: "24rem" }}>
      <Skeleton
        data-testid="reduced-motion-skeleton"
        shape="rectangular"
        height="var(--ds-space-8)"
      />
    </div>
  ),
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <section
          data-ds-theme={theme}
          key={theme}
          style={{
            display: "grid",
            gap: "var(--ds-space-3)",
            padding: "var(--ds-space-4)",
            background: "var(--ds-color-canvas)",
            color: "var(--ds-color-text-primary)",
          }}
        >
          <strong>{theme}</strong>
          <Skeleton shape="text" width="76%" />
          <Skeleton shape="rectangular" height="var(--ds-space-16)" />
        </section>
      ))}
    </div>
  ),
};
