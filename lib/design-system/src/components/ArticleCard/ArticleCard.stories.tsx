import type { Meta, StoryObj } from "@storybook/react";
import { ArticleCard } from "./ArticleCard";

const coverImageSrc = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450"><rect width="800" height="450" fill="#e4efe8"/><circle cx="626" cy="116" r="62" fill="#f4c66a"/><path d="M0 328 178 184l143 118 148-149 331 252v45H0Z" fill="#83a98a"/><path d="M0 378 223 260l156 109 169-92 252 119v54H0Z" fill="#426b55"/></svg>',
)}`

const avatarSrc = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="#e8ddf2"/><circle cx="48" cy="35" r="18" fill="#79588f"/><path d="M15 96c2-24 15-37 33-37s31 13 33 37" fill="#79588f"/></svg>',
)}`

const article = {
  title: "A calmer morning routine for your studio",
  href: "/journal/calm-morning-routine",
  excerpt: "Small changes to the opening routine can make busy workdays feel more manageable.",
  category: { label: "Small business", href: "/journal/topics/small-business" },
  author: {
    name: "Maya Chen",
    href: "/journal/authors/maya-chen",
    avatarSrc,
  },
  publishedAt: { dateTime: "2026-05-14", label: "May 14, 2026" },
  readingTime: "6 min read",
  image: {
    src: coverImageSrc,
    alt: "Illustration of a sunlit hillside and green garden",
    width: 800,
    height: 450,
  },
};

const meta = {
  title: "Components/Article card",
  component: ArticleCard,
  args: {
    ...article,
    variant: "surface",
    layout: "vertical",
    alignment: "start",
    mediaPosition: "start",
    mediaAspectRatio: "wide",
    mediaFit: "cover",
    size: "md",
    shape: "rounded",
    headingLevel: 2,
    readMoreLabel: "Read article",
    showReadMore: true,
  },
  argTypes: {
    title: { control: "text" },
    href: { control: "text" },
    excerpt: { control: "text" },
    category: { control: "object" },
    author: { control: "object" },
    publishedAt: { control: "object" },
    readingTime: { control: "text" },
    image: { control: false },
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
    readMoreLabel: { control: "text" },
    showReadMore: { control: "boolean" },
    className: { control: false },
    style: { control: false },
  },
  render: (args) => (
    <div style={{ width: "100%", maxWidth: "36rem", marginInline: "auto" }}>
      <ArticleCard {...args} />
    </div>
  ),
} satisfies Meta<typeof ArticleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const LayoutVariants: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      <ArticleCard
        {...article}
        headingLevel={3}
        layout="horizontal"
        mediaAspectRatio="portrait"
        title="A horizontal article preview"
      />
      <ArticleCard
        {...article}
        headingLevel={3}
        layout="horizontal"
        mediaPosition="end"
        mediaAspectRatio="landscape"
        title="Move the image to the end"
        variant="outlined"
      />
    </div>
  ),
};

export const ContentVariants: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, var(--ds-space-32)), 1fr))",
        gap: "var(--ds-space-4)",
      }}
    >
      <ArticleCard
        {...article}
        headingLevel={3}
        title="Full post preview"
      />
      <ArticleCard
        category={{ label: "Ideas" }}
        excerpt="An example without artwork or publishing details."
        headingLevel={3}
        href="/journal/practical-ideas"
        showReadMore={false}
        title="A text-only article card"
        variant="subtle"
      />
      <ArticleCard
        {...article}
        author={undefined}
        headingLevel={3}
        publishedAt={undefined}
        readingTime={undefined}
        title="Without author metadata"
        variant="accent"
      />
    </div>
  ),
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <div
          key={theme}
          data-ds-theme={theme}
          style={{
            padding: "var(--ds-space-4)",
            borderRadius: "var(--ds-radius-shape-rounded)",
            backgroundColor: "var(--ds-color-canvas)",
            color: "var(--ds-color-text-primary)",
          }}
        >
          <ArticleCard
            {...article}
            headingLevel={3}
            title={`${theme.toUpperCase()} theme article`}
            variant="surface"
          />
        </div>
      ))}
    </div>
  ),
};

export const CustomHooks: Story = {
  args: {
    style: {
      "--ds-card-background": "var(--ds-color-accent-bg)",
      "--ds-card-text": "var(--ds-color-accent-fg)",
      "--ds-card-muted": "var(--ds-color-accent-fg)",
      "--ds-card-border": "var(--ds-color-accent-bg)",
      "--ds-card-radius": "var(--ds-radius-shape-rounded)",
      "--ds-card-padding": "var(--ds-space-6)",
    },
  },
};

export const NarrowLayout: Story = {
  render: () => (
    <div style={{ inlineSize: "18rem" }}>
      <ArticleCard
        {...article}
        layout="horizontal"
        mediaAspectRatio="square"
        title="A long article title that wraps in a narrow column"
      />
    </div>
  ),
};
