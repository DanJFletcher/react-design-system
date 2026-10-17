import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import {
  ServicesSection,
  type ServicesSectionProps,
} from "./ServicesSection";

const designServices = [
  {
    id: "custom-woodwork",
    title: "Custom woodwork",
    description: "Built-to-fit shelves, cabinetry, and thoughtful details for your home.",
    eyebrow: "Made to measure",
    icon: <Icon name="sparkle" />,
    link: { href: "/services/custom-woodwork", label: "Explore custom woodwork" },
  },
  {
    id: "space-planning",
    title: "Space planning",
    description: "Practical layouts that make small rooms work harder and feel calmer.",
    eyebrow: "Design service",
    icon: <Icon name="sparkle" />,
    link: { href: "/services/space-planning" },
  },
  {
    id: "consultation",
    title: "Project consultation",
    description: "Get a clear plan, timeline, and material recommendations before work begins.",
    image: <ServiceArtwork />,
    action: <Button size="sm" variant="secondary">Book an assessment</Button>,
  },
] satisfies ServicesSectionProps["items"];

const meta = {
  title: "Compositions/Marketing/Services section",
  id: "components-services-section",
  component: ServicesSection,
  args: {
    eyebrow: "Harbor & Pine Studio",
    heading: "Thoughtful help for every project",
    description: "From the first sketch to the final detail, choose the support that fits your space.",
    items: designServices,
    columns: 3,
    headingLevel: 2,
    variant: "plain",
    cardVariant: "surface",
    cardSize: "md",
    cardShape: "rounded",
    cardAlignment: "start",
    mediaAspectRatio: "landscape",
    mediaFit: "cover",
  },
  argTypes: {
    eyebrow: { control: "text" },
    heading: { control: "text" },
    description: { control: "text" },
    items: { control: false },
    columns: { control: "inline-radio", options: [1, 2, 3, 4] },
    headingLevel: { control: "select", options: [1, 2, 3, 4, 5, 6] },
    variant: { control: "inline-radio", options: ["plain", "surface", "accent"] },
    cardVariant: { control: "inline-radio", options: ["surface", "outlined", "subtle", "accent"] },
    cardSize: { control: "inline-radio", options: ["sm", "md", "lg"] },
    cardShape: { control: "inline-radio", options: ["rounded", "square"] },
    cardAlignment: { control: "inline-radio", options: ["start", "center"] },
    mediaAspectRatio: {
      control: "inline-radio",
      options: ["auto", "square", "landscape", "wide", "portrait"],
    },
    mediaFit: { control: "inline-radio", options: ["cover", "contain"] },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof ServicesSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const section = canvas.getByRole("region", { name: "Thoughtful help for every project" });
    const services = within(section);
    await expect(services.getByRole("heading", {
      name: "Thoughtful help for every project",
      level: 2,
    })).toBeVisible();
    await expect(services.getAllByRole("listitem")).toHaveLength(3);
    await expect(services.getByRole("article", { name: "Custom woodwork" })).toBeVisible();
    await expect(services.getByRole("link", { name: "Explore custom woodwork" }))
      .toHaveAttribute("href", "/services/custom-woodwork");
    await expect(services.getByRole("link", { name: "Learn more about Space planning" }))
      .toHaveAttribute("href", "/services/space-planning");
    await expect(services.getByRole("button", { name: "Book an assessment" })).toBeVisible();
  },
};

export const ImageLedServices: Story = {
  args: {
    heading: "One team, every detail",
    description: "Add images when customers benefit from seeing the work.",
    items: [
      {
        id: "renovation",
        title: "Room refresh",
        description: "A focused update to make your favorite room feel new again.",
        image: <ServiceArtwork variation="sage" />,
        link: { href: "/services/room-refresh" },
      },
      {
        id: "built-ins",
        title: "Built-in storage",
        description: "Custom storage designed around how your family uses the space.",
        image: <ServiceArtwork variation="clay" />,
        link: { href: "/services/built-in-storage" },
      },
    ],
  },
};

export const CompactFourColumnGrid: Story = {
  args: {
    eyebrow: "Quick services",
    heading: "Small jobs, handled well",
    description: undefined,
    columns: 4,
    cardSize: "sm",
    cardVariant: "outlined",
    items: [
      { id: "repairs", title: "Small repairs", description: "Fix the details before they become a bigger job.", icon: <Icon name="sparkle" /> },
      { id: "paint", title: "Touch-up painting", description: "Freshen up scuffs, trim, and tired walls.", icon: <Icon name="sparkle" /> },
      { id: "lighting", title: "Lighting updates", description: "Improve the feel of a room with better lighting.", icon: <Icon name="sparkle" /> },
      { id: "consult", title: "Home consults", description: "Get practical advice for your next improvement.", icon: <Icon name="sparkle" /> },
    ],
  },
};

export const HeadinglessServices: Story = {
  args: {
    eyebrow: undefined,
    heading: undefined,
    description: undefined,
    "aria-label": "Ways we can help",
    items: designServices.slice(0, 2),
  },
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <div
          data-ds-theme={theme}
          key={theme}
          style={{ padding: "var(--ds-space-4)", backgroundColor: "var(--ds-color-canvas)" }}
        >
          <ServicesSection
            cardSize="sm"
            heading={`${theme.toUpperCase()} services`}
            items={designServices.slice(0, 2)}
            variant="surface"
          />
        </div>
      ))}
    </div>
  ),
};

export const CustomHooks: Story = {
  args: {
    heading: "Services with scoped styling",
    variant: "surface",
    style: {
      "--ds-services-surface": "var(--ds-color-accent-bg)",
      "--ds-services-text": "var(--ds-color-accent-fg)",
      "--ds-services-muted": "var(--ds-color-accent-fg)",
      "--ds-services-border": "var(--ds-color-accent-fg)",
      "--ds-services-link": "var(--ds-color-accent-fg)",
      "--ds-services-radius": "var(--ds-radius-surface)",
      "--ds-services-padding": "var(--ds-space-6)",
      "--ds-services-gap": "var(--ds-space-4)",
    },
  },
};

export const LongContent: Story = {
  render: (args: ServicesSectionProps) => (
    <div style={{ inlineSize: "19rem" }}>
      <ServicesSection
        {...args}
        columns={3}
        heading="Support for the details that make a home work better"
        items={[
          {
            id: "long-service",
            title: "Planning and installation for custom storage in compact spaces",
            description: "We work around existing fixtures, unusual corners, and long-term storage needs.",
            link: { href: "/services/custom-storage" },
          },
        ]}
      />
    </div>
  ),
};

function ServiceArtwork({ variation = "sand" }: { variation?: "sand" | "sage" | "clay" }) {
  const colors = {
    sand: ["#e8dece", "#b99775"],
    sage: ["#dbe6de", "#718b7c"],
    clay: ["#f0ded1", "#b97657"],
  }[variation];

  return (
    <div
      aria-hidden="true"
      style={{
        display: "grid",
        placeItems: "center",
        minBlockSize: "var(--ds-space-24)",
        aspectRatio: "4 / 3",
        backgroundColor: colors[0],
        color: colors[1],
      }}
    >
      <svg viewBox="0 0 240 150" fill="none" aria-hidden="true">
        <rect x="34" y="26" width="172" height="98" rx="18" fill="currentColor" opacity=".16" />
        <path d="M54 106 96 62l30 32 24-24 36 36H54Z" fill="currentColor" opacity=".72" />
        <circle cx="168" cy="52" r="13" fill="currentColor" />
      </svg>
    </div>
  );
}
