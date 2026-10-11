import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Card } from "./Card";

const meta = {
  title: "Components/Card",
  component: Card,
  args: {
    eyebrow: "Workspace",
    title: "Design project overview",
    description: "Keep the latest updates, files, and decisions in one place.",
    variant: "surface",
    layout: "horizontal",
    alignment: "start",
    mediaPosition: "start",
    mediaAspectRatio: "landscape",
    mediaFit: "cover",
    size: "md",
    shape: "rounded",
    headingLevel: 2,
  },
  argTypes: {
    eyebrow: { control: "text" },
    title: { control: "text" },
    description: { control: "text" },
    metadata: { control: false },
    headerActions: { control: false },
    media: { control: false },
    children: { control: false },
    footer: { control: false },
    actions: { control: false },
    variant: { control: "inline-radio", options: ["surface", "outlined", "subtle", "accent"] },
    layout: { control: "inline-radio", options: ["vertical", "horizontal"] },
    alignment: { control: "inline-radio", options: ["start", "center"] },
    mediaPosition: { control: "inline-radio", options: ["start", "end"] },
    mediaAspectRatio: {
      control: "inline-radio",
      options: ["auto", "square", "landscape", "wide", "portrait"],
    },
    mediaFit: { control: "inline-radio", options: ["cover", "contain"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: { control: "inline-radio", options: ["rounded", "square"] },
    headingLevel: { control: "select", options: [1, 2, 3, 4, 5, 6] },
    style: { control: false },
    className: { control: "text" },
  },
  render: (args) => (
    <Card
      {...args}
      media={<CardArtwork />}
      metadata={<span>Updated today · 4 contributors</span>}
      headerActions={<Button size="sm" variant="ghost">Save</Button>}
      children={
        <div style={{ color: "var(--ds-color-text-muted)" }}>
          Three new comments and two files were added this week.
        </div>
      }
      actions={(
        <>
          <Button size="sm" variant="ghost">Details</Button>
          <Button size="sm">Open card</Button>
        </>
      )}
    />
  ),
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("article", { name: "Design project overview" })).toBeVisible();
    await expect(canvas.getByRole("heading", {
      name: "Design project overview",
      level: 2,
    })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Open card" })).toBeVisible();
    await expect(canvas.getByText("Updated today · 4 contributors")).toBeVisible();
  },
};

export const LayoutExamples: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))", gap: "var(--ds-space-4)" }}>
      <Card
        title="Vertical card"
        description="The default layout places media above the card content."
        media={<CardArtwork />}
        mediaAspectRatio="wide"
        actions={<Button size="sm">View details</Button>}
      />
      <Card
        title="Media on the left"
        description="Horizontal cards place the media beside the content on wide screens."
        media={<CardArtwork />}
        layout="horizontal"
        mediaPosition="start"
        mediaAspectRatio="portrait"
        size="sm"
      />
      <Card
        title="Media on the right"
        description="Change media placement without changing the content structure."
        media={<CardArtwork />}
        layout="horizontal"
        mediaPosition="end"
        mediaAspectRatio="square"
        variant="outlined"
      />
    </div>
  ),
};

export const VariantExamples: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))", gap: "var(--ds-space-4)" }}>
      {(["surface", "outlined", "subtle", "accent"] as const).map((variant) => (
        <Card
          key={variant}
          variant={variant}
          eyebrow={variant.toUpperCase()}
          title={`A ${variant} card`}
          description="Choose a visual treatment independently of the card content."
        />
      ))}
    </div>
  ),
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      {(["acme", "luna", "orchid"] as const).map((theme) => (
        <div key={theme} data-ds-theme={theme}>
          <Card
            eyebrow={theme.toUpperCase()}
            title={`${theme.toUpperCase()} themed card`}
            description="Card colors follow the active theme boundary."
            variant="surface"
            size="sm"
            headingLevel={3}
          />
        </div>
      ))}
    </div>
  ),
};

export const ContentSlots: Story = {
  render: () => (
    <Card
      eyebrow="Release"
      title="Spring launch"
      headerActions={<Button size="sm" variant="secondary">Edit</Button>}
      metadata={<span>Published · 2 hours ago</span>}
      description="The launch checklist is almost complete."
      footer={<span>Owner: Product team</span>}
      actions={<Button size="sm">Review checklist</Button>}
      media={<CardArtwork />}
      mediaAspectRatio="wide"
      size="lg"
    >
      <ul style={{ marginBlock: 0, paddingInlineStart: "var(--ds-space-5)" }}>
        <li>Confirm release notes</li>
        <li>Review support handoff</li>
      </ul>
    </Card>
  ),
};

export const CustomHookOverrides: Story = {
  render: () => (
    <Card
      eyebrow="Scoped hooks"
      title="Customize the card in place"
      description="Change its surface, spacing, and shape without replacing the theme."
      variant="surface"
      media={<CardArtwork />}
      mediaAspectRatio="landscape"
      style={{
        "--ds-card-background": "var(--ds-color-accent-bg)",
        "--ds-card-text": "var(--ds-color-accent-fg)",
        "--ds-card-muted": "var(--ds-color-accent-fg)",
        "--ds-card-border": "var(--ds-color-accent-bg)",
        "--ds-card-radius": "var(--ds-space-6)",
        "--ds-card-padding": "var(--ds-space-6)",
        "--ds-card-media-radius": "var(--ds-space-3)",
      }}
    />
  ),
};

export const TextOnly: Story = {
  render: () => (
    <Card
      eyebrow="No media required"
      title="A text-only card"
      description="Cards work with only the slots your content needs."
      variant="subtle"
      alignment="center"
      shape="square"
      actions={<Button size="sm" variant="secondary">Read more</Button>}
    />
  ),
};

function CardArtwork() {
  return (
    <div
      aria-hidden="true"
      style={{
        display: "grid",
        placeItems: "center",
        minBlockSize: "var(--ds-space-24)",
        aspectRatio: "4 / 3",
        backgroundColor: "var(--ds-color-accent-bg)",
        color: "var(--ds-color-accent-fg)",
      }}
    >
      <svg viewBox="0 0 160 120" fill="none" aria-hidden="true">
        <rect x="24" y="18" width="112" height="84" rx="10" fill="currentColor" opacity=".12" />
        <path d="M44 78 67 54l16 16 13-13 20 21H44Z" fill="currentColor" opacity=".65" />
        <circle cx="106" cy="40" r="8" fill="currentColor" />
      </svg>
    </div>
  );
}
