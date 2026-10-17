import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { Button } from "../Button/Button";
import {
  PortfolioSection,
  type PortfolioSectionProps,
} from "./PortfolioSection";

const projectArtwork =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 720 480'%3E%3Crect width='720' height='480' fill='%23dce9df'/%3E%3Cpath d='M0 345L178 176L306 285L454 126L720 354V480H0Z' fill='%237a9b78'/%3E%3Cpath d='M0 387L188 276L337 356L530 220L720 342V480H0Z' fill='%234b7050'/%3E%3C/svg%3E";

const projects = [
  {
    id: "courtyard",
    title: "A calmer city courtyard",
    description:
      "A compact outdoor space redesigned for quiet mornings and easy entertaining.",
    category: "Garden design",
    location: "Toronto, ON",
    completedAt: {
      dateTime: "2026-05",
      label: "Completed May 2026",
    },
    image: {
      src: projectArtwork,
      alt: "Layered green hills representing a completed garden design",
    },
    link: {
      href: "/projects/courtyard",
      label: "View project",
    },
  },
  {
    id: "front-garden",
    title: "A welcoming front garden",
    description:
      "Four-season planting and a clear path make this entrance feel warm year-round.",
    category: "Planting",
    location: "Oakville, ON",
    image: {
      src: projectArtwork,
      alt: "Layered green hills representing a front garden",
    },
    action: <Button size="sm" variant="secondary">Ask about this project</Button>,
  },
  {
    id: "patio",
    title: "A practical family patio",
    description:
      "Durable materials and layered planting create room to gather outdoors.",
    category: "Outdoor living",
    location: "Mississauga, ON",
    image: {
      src: projectArtwork,
      alt: "Layered green hills representing a family patio",
    },
    link: {
      href: "/projects/family-patio",
      target: "_blank",
      rel: "noreferrer",
    },
  },
] satisfies PortfolioSectionProps["items"];

const meta = {
  title: "Components/Portfolio section",
  component: PortfolioSection,
  args: {
    eyebrow: "Recent work",
    heading: "Projects made for real life",
    description:
      "A selection of spaces shaped around the people who use them every day.",
    items: projects,
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
    action: { control: false },
    emptyMessage: { control: "text" },
    columns: { control: "inline-radio", options: [1, 2, 3, 4] },
    headingLevel: { control: "select", options: [1, 2, 3, 4, 5, 6] },
    variant: { control: "inline-radio", options: ["plain", "surface", "accent"] },
    cardVariant: {
      control: "inline-radio",
      options: ["surface", "outlined", "subtle", "accent"],
    },
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
} satisfies Meta<typeof PortfolioSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    action: <Button variant="primary">Plan your project</Button>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const section = canvas.getByRole("region", {
      name: "Projects made for real life",
    });
    const projectsList = within(section);

    await expect(
      projectsList.getByRole("heading", {
        name: "Projects made for real life",
        level: 2,
      }),
    ).toBeVisible();
    await expect(projectsList.getAllByRole("listitem")).toHaveLength(3);
    await expect(
      projectsList.getByRole("article", { name: "A calmer city courtyard" }),
    ).toBeVisible();
    await expect(
      projectsList.getByRole("link", { name: "View project: A calmer city courtyard" }),
    ).toHaveAttribute("href", "/projects/courtyard");
    await expect(
      projectsList.getByRole("button", { name: "Plan your project" }),
    ).toBeVisible();
  },
};

export const SurfaceVariant: Story = {
  args: {
    variant: "surface",
    cardVariant: "outlined",
  },
};

export const EmptyPortfolio: Story = {
  args: {
    heading: "Coming soon",
    description: "New projects are being added.",
    items: [],
    emptyMessage: "Check back soon for project details.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText("Check back soon for project details."),
    ).toBeVisible();
    await expect(canvas.queryByRole("list")).not.toBeInTheDocument();
  },
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <div
          data-ds-theme={theme}
          key={theme}
          style={{
            padding: "var(--ds-space-4)",
            backgroundColor: "var(--ds-color-canvas)",
          }}
        >
          <PortfolioSection
            cardSize="sm"
            heading={`${theme.toUpperCase()} projects`}
            items={projects.slice(0, 2)}
            variant="surface"
          />
        </div>
      ))}
    </div>
  ),
};
