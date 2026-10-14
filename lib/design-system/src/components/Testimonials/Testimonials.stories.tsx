import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import {
  Testimonials,
  type TestimonialItem,
} from "./Testimonials";

const portrait = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="#e8ddf2"/><circle cx="48" cy="35" r="18" fill="#79588f"/><path d="M15 96c2-24 15-37 33-37s31 13 33 37" fill="#79588f"/></svg>',
)}`;

const testimonials: TestimonialItem[] = [
  {
    id: "maya-chen",
    quote:
      "The team made a busy season feel much easier to manage. I finally have time to focus on the parts of the studio I love.",
    author: {
      name: "Maya Chen",
      role: "Owner",
      company: "Northstar Studio",
      avatar: { src: portrait },
    },
    rating: 5,
  },
  {
    id: "raul-martinez",
    quote:
      "Thoughtful service, clear communication, and a result that feels completely right for our business.",
    author: {
      name: "Raul Martinez",
      role: "Co-founder",
      company: "Good Day Coffee",
    },
    rating: 5,
  },
  {
    id: "jordan-lee",
    quote:
      "From the first conversation to the final details, everything felt personal and well considered.",
    author: {
      name: "Jordan Lee",
      role: "Customer",
      company: "Local guide",
      avatar: { src: portrait },
    },
    rating: 4,
  },
];

const meta = {
  title: "Components/Testimonials",
  component: Testimonials,
  args: {
    items: testimonials,
    heading: "What our customers say",
    description: "Real experiences from people who work with us.",
    headingLevel: 2,
    layout: "grid",
    columns: 3,
    variant: "surface",
    size: "md",
    shape: "rounded",
    alignment: "start",
  },
  argTypes: {
    items: { control: "object" },
    heading: { control: "text" },
    description: { control: "text" },
    headingLevel: { control: "inline-radio", options: [2, 3, 4, 5, 6] },
    layout: { control: false },
    columns: { control: "inline-radio", options: [2, 3] },
    variant: {
      control: "inline-radio",
      options: ["surface", "outlined", "subtle", "accent"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: { control: "inline-radio", options: ["rounded", "square"] },
    alignment: { control: "inline-radio", options: ["start", "center"] },
    getRatingLabel: { control: false },
    className: { control: false },
    style: { control: false },
  },
  render: (args) => (
    <div style={{ inlineSize: "100%", maxInlineSize: "72rem", marginInline: "auto" }}>
      <Testimonials {...args} />
    </div>
  ),
} satisfies Meta<typeof Testimonials>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const section = canvas.getByRole("region", {
      name: "What our customers say",
    });

    await expect(section).toBeVisible();
    await expect(canvas.getAllByRole("article")).toHaveLength(3);
    await expect(canvas.getAllByRole("blockquote")).toHaveLength(3);
    await expect(
      canvas.getAllByRole("img", { name: "5 out of 5 stars" }),
    ).toHaveLength(2);
  },
};

export const LayoutVariants: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-8)" }}>
      <Testimonials
        aria-label="Featured customer testimonial"
        items={[testimonials[0]!]}
        layout="featured"
        variant="accent"
        size="lg"
        alignment="center"
      />
      <Testimonials
        heading="More customer stories"
        items={testimonials}
        layout="grid"
        columns={2}
        variant="outlined"
      />
    </div>
  ),
};

export const OptionalDetails: Story = {
  args: {
    heading: "A few kind words",
    items: [
      {
        id: "casey",
        quote: "A reliable local team that makes every visit feel easy.",
        author: { name: "Casey Morgan" },
      },
      {
        id: "sam",
        quote: "The personal attention makes a real difference.",
        author: { name: "Sam Patel", company: "Patel & Co." },
        rating: 4,
      },
    ],
    columns: 2,
    description: undefined,
  },
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-6)" }}>
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
          <Testimonials
            aria-label={`${theme.toUpperCase()} customer testimonials`}
            items={testimonials.slice(0, 2)}
            columns={2}
          />
        </div>
      ))}
    </div>
  ),
};

export const NestedThemeBoundary: Story = {
  render: () => (
    <div
      data-ds-theme="acme"
      style={{
        display: "grid",
        gap: "var(--ds-space-6)",
        padding: "var(--ds-space-4)",
        backgroundColor: "var(--ds-color-canvas)",
        color: "var(--ds-color-text-primary)",
      }}
    >
      <Testimonials
        aria-label="ACME parent testimonials"
        items={testimonials.slice(0, 2)}
        columns={2}
      />
      <div
        data-ds-theme="luna"
        style={{
          padding: "var(--ds-space-4)",
          backgroundColor: "var(--ds-color-canvas)",
          color: "var(--ds-color-text-primary)",
        }}
      >
        <Testimonials
          aria-label="Luna nested testimonials"
          items={testimonials.slice(0, 2)}
          columns={2}
        />
      </div>
    </div>
  ),
};

export const CustomCardHooks: Story = {
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

export const LocalizedRating: Story = {
  args: {
    items: [testimonials[0]!],
    heading: "Avis des clients",
    layout: "featured",
    getRatingLabel: (rating) => `${rating} étoiles sur 5`,
  },
};

export const NarrowLayout: Story = {
  render: () => (
    <div style={{ inlineSize: "18rem", maxInlineSize: "100%" }}>
      <Testimonials
        aria-label="Narrow customer testimonials"
        items={testimonials}
        columns={3}
      />
    </div>
  ),
};
