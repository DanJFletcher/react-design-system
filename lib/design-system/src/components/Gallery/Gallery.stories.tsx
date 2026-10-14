import type { Meta, StoryObj } from "@storybook/react";
import { Gallery, type GalleryItem } from "./Gallery";

const portfolioItems: GalleryItem[] = [
  {
    id: "sunroom",
    src: illustration("#D9E7D6", "#9CB7A2", "#F4C68A"),
    alt: "A bright sunroom with soft green plants and warm morning light.",
    caption: "Sunroom refresh",
    href: "/projects/sunroom",
    linkLabel: "View sunroom project",
  },
  {
    id: "kitchen",
    src: illustration("#F1D9C3", "#B86F4E", "#E9B28C"),
    alt: "A warm terracotta kitchen with a simple island and pendant lights.",
    caption: "Terracotta kitchen",
    href: "/projects/terracotta-kitchen",
    linkLabel: "View kitchen project",
  },
  {
    id: "courtyard",
    src: illustration("#D1E2E2", "#6E9891", "#E2C87F"),
    alt: "A small courtyard garden with a stone path and leafy trees.",
    caption: "Courtyard garden",
    href: "/projects/courtyard",
    linkLabel: "View courtyard project",
  },
  {
    id: "living-room",
    src: illustration("#E9DDE8", "#9D7898", "#E2B8A2"),
    alt: "A calm living room in muted plum and blush colors.",
    caption: "Living room update",
    href: "/projects/living-room",
    linkLabel: "View living room project",
  },
  {
    id: "entry",
    src: illustration("#D7E1EF", "#758FAE", "#E7C9A0"),
    alt: "A welcoming entryway with a blue door and pale stone steps.",
    caption: "Front entry",
    href: "/projects/front-entry",
    linkLabel: "View front entry project",
  },
  {
    id: "studio",
    src: illustration("#E8E0CE", "#B49C76", "#A3B8A0"),
    alt: "A quiet creative studio with a desk beside a large window.",
    caption: "Creative studio",
    href: "/projects/studio",
    linkLabel: "View studio project",
  },
];

const meta = {
  title: "Components/Gallery",
  component: Gallery,
  args: {
    label: "Studio portfolio",
    items: portfolioItems,
    columns: 3,
    gap: "md",
    aspectRatio: "landscape",
    fit: "cover",
    variant: "plain",
    lightbox: false,
  },
  argTypes: {
    label: { control: "text" },
    items: { control: false },
    columns: { control: "select", options: [1, 2, 3, 4] },
    gap: { control: "inline-radio", options: ["sm", "md", "lg"] },
    aspectRatio: {
      control: "select",
      options: ["square", "landscape", "portrait", "natural"],
    },
    fit: { control: "inline-radio", options: ["cover", "contain"] },
    variant: { control: "inline-radio", options: ["plain", "framed"] },
    lightbox: { control: "boolean" },
    loop: { control: "boolean" },
    emptyMessage: { control: "text" },
    getOpenImageLabel: { control: false },
    previousLabel: { control: "text" },
    nextLabel: { control: "text" },
    closeLabel: { control: "text" },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof Gallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const PortfolioWithLightbox: Story = {
  args: {
    lightbox: true,
    variant: "framed",
    columns: 3,
  },
};

export const SquareProductGrid: Story = {
  args: {
    label: "Handmade product collection",
    aspectRatio: "square",
    columns: 4,
    gap: "sm",
    variant: "plain",
    items: portfolioItems.slice(0, 4).map((item) => ({
      ...item,
      href: undefined,
      linkLabel: undefined,
    })),
  },
};

export const NaturalImageSizes: Story = {
  args: {
    label: "Workshop snapshots",
    aspectRatio: "natural",
    columns: 2,
    fit: "contain",
    lightbox: true,
    items: portfolioItems.slice(0, 4),
  },
};

export const EmptyState: Story = {
  args: {
    label: "Recent projects",
    items: [],
    emptyMessage: "New project photos will appear here soon.",
  },
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-5)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <section
          key={theme}
          data-ds-theme={theme}
          style={{
            display: "grid",
            gap: "var(--ds-space-3)",
            padding: "var(--ds-space-4)",
            borderRadius: "var(--ds-radius-surface)",
            backgroundColor: "var(--ds-color-canvas)",
            color: "var(--ds-color-text-primary)",
          }}
        >
          <strong>{theme}</strong>
          <Gallery
            label={`${theme} project gallery`}
            items={portfolioItems.slice(0, 3)}
            columns={3}
            variant="framed"
          />
        </section>
      ))}
    </div>
  ),
};

export const CustomHooks: Story = {
  args: {
    label: "Custom gallery style",
    variant: "framed",
    style: {
      "--ds-gallery-gap": "var(--ds-space-6)",
      "--ds-gallery-radius": "var(--ds-space-2)",
      "--ds-gallery-border": "var(--ds-color-action-primary-bg)",
      "--ds-gallery-surface": "var(--ds-color-accent-bg)",
      "--ds-gallery-caption": "var(--ds-color-accent-fg)",
      "--ds-gallery-muted": "var(--ds-color-accent-fg)",
    },
  },
};

function illustration(sky: string, ground: string, detail: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="sky" x2="0" y2="1">
          <stop stop-color="${sky}" />
          <stop offset="1" stop-color="#F7EBDD" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#sky)" />
      <circle cx="600" cy="142" r="76" fill="${detail}" opacity=".9" />
      <path d="M0 390 165 250l145 133 142-191 194 197 154-95v306H0Z" fill="${ground}" />
      <path d="M0 475c166-62 283 36 432-11s246-55 368 3v133H0Z" fill="${detail}" opacity=".65" />
      <path d="M105 600V365h170v235M129 400h52v72h-52m78-72h44v72h-44" fill="#FFF9F0" opacity=".85" />
      <path d="M478 600V438h150v162" fill="#FFF9F0" opacity=".78" />
      <path d="M495 453h52v59h-52m67-59h51v59h-51" fill="${ground}" opacity=".8" />
    </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
