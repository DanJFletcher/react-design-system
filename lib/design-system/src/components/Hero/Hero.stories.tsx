import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Hero } from "./Hero";

const meta = {
  title: "Components/Hero",
  component: Hero,
  args: {
    eyebrow: "A clearer way forward",
    title: "Make room for your next big idea",
    description: "Bring your team, tools, and plans together in one calm workspace.",
    layout: "split",
    alignment: "start",
    mediaPosition: "end",
    mediaAspectRatio: "landscape",
    mediaFit: "cover",
    size: "md",
    background: "transparent",
    contentWidth: "wide",
    headingLevel: 1,
  },
  argTypes: {
    eyebrow: { control: "text" },
    title: { control: "text" },
    description: { control: "text" },
    primaryAction: { control: false },
    secondaryAction: { control: false },
    actions: { control: false },
    media: { control: false },
    layout: { control: "inline-radio", options: ["split", "stacked"] },
    alignment: { control: "inline-radio", options: ["start", "center"] },
    mediaPosition: { control: "inline-radio", options: ["start", "end"] },
    mediaAspectRatio: {
      control: "inline-radio",
      options: ["auto", "square", "landscape", "portrait"],
    },
    mediaFit: { control: "inline-radio", options: ["cover", "contain"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    background: { control: "inline-radio", options: ["transparent", "surface", "accent"] },
    contentWidth: { control: "inline-radio", options: ["narrow", "normal", "wide", "full"] },
    headingLevel: { control: "select", options: [1, 2, 3, 4, 5, 6] },
    style: { control: false },
    className: { control: "text" },
  },
  render: (args) => (
    <Hero
      {...args}
      media={<HeroArtwork />}
      primaryAction={<Button>Start for free</Button>}
      secondaryAction={<Button variant="ghost">Explore features</Button>}
    />
  ),
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", {
      name: "Make room for your next big idea",
      level: 1,
    })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Start for free" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Explore features" })).toBeVisible();
  },
};

export const LayoutExamples: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-8)" }}>
      <Hero
        eyebrow="Media first"
        title="Put the visual on the left"
        description="Choose the side that best supports your story."
        media={<HeroArtwork />}
        mediaPosition="start"
        mediaAspectRatio="landscape"
        headingLevel={2}
      />
      <Hero
        eyebrow="Centered and stacked"
        title="Give one message the full stage"
        description="Use the stacked layout for a focused announcement."
        media={<HeroArtwork />}
        layout="stacked"
        alignment="center"
        background="surface"
        size="sm"
        headingLevel={2}
        primaryAction={<Button>See how it works</Button>}
      />
    </div>
  ),
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-6)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <div key={theme} data-ds-theme={theme}>
          <Hero
            eyebrow={theme.toUpperCase()}
            title={`A ${theme.toUpperCase()} hero that follows its theme`}
            description="Semantic colors and spacing adapt without theme-specific component code."
            media={<HeroArtwork />}
            background="surface"
            size="sm"
            headingLevel={2}
            primaryAction={<Button size="sm">Learn more</Button>}
          />
        </div>
      ))}
    </div>
  ),
};

export const AccentBackground: Story = {
  args: {
    background: "accent",
    alignment: "center",
    contentWidth: "normal",
    layout: "stacked",
    mediaAspectRatio: "square",
  },
};

export const CustomHookOverrides: Story = {
  render: () => (
    <Hero
      eyebrow="Scoped customization"
      title="Tune the hero without replacing its theme"
      description="Registered hooks can change colors, spacing, and media shape locally."
      media={<HeroArtwork />}
      background="surface"
      style={{
        "--ds-hero-background": "var(--ds-color-accent-bg)",
        "--ds-hero-text": "var(--ds-color-accent-fg)",
        "--ds-hero-description": "var(--ds-color-accent-fg)",
        "--ds-hero-padding-block": "var(--ds-space-8)",
        "--ds-hero-media-radius": "var(--ds-space-6)",
      }}
      primaryAction={<Button>Customize yours</Button>}
    />
  ),
};

export const TextOnly: Story = {
  render: () => (
    <Hero
      eyebrow="No media required"
      title="A flexible text-only hero"
      description="Use the same semantic component with or without an illustration or product image."
      layout="stacked"
      alignment="center"
      contentWidth="normal"
      background="accent"
      secondaryAction={<Button variant="secondary">Read the guide</Button>}
    />
  ),
};

function HeroArtwork() {
  return (
    <div
      aria-hidden="true"
      style={{
        display: "grid",
        placeItems: "center",
        minBlockSize: "var(--ds-space-32)",
        aspectRatio: "4 / 3",
        backgroundColor: "var(--ds-color-accent-bg)",
        color: "var(--ds-color-accent-fg)",
      }}
    >
      <svg viewBox="0 0 160 120" fill="none" aria-hidden="true">
        <rect x="22" y="18" width="116" height="84" rx="12" fill="currentColor" opacity=".12" />
        <circle cx="80" cy="59" r="24" fill="currentColor" opacity=".2" />
        <path d="M65 61.5 75 71l21-24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" />
      </svg>
    </div>
  );
}
