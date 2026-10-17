import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { Footer } from "./Footer";

const groups = [
  {
    id: "product",
    title: "Product",
    links: [
      { id: "features", label: "Features", href: "#features" },
      { id: "pricing", label: "Pricing", href: "#pricing" },
      { id: "integrations", label: "Integrations", href: "#integrations" },
    ],
  },
  {
    id: "company",
    title: "Company",
    links: [
      { id: "about", label: "About us", href: "#about" },
      { id: "careers", label: "Careers", href: "#careers" },
      { id: "contact", label: "Contact", href: "#contact" },
    ],
  },
];

const meta = {
  title: "Compositions/Marketing/Footer",
  id: "components-footer",
  component: Footer,
  args: {
    variant: "plain",
    size: "md",
    headingLevel: 3,
  },
  argTypes: {
    brand: { control: false },
    description: { control: false },
    logoHref: { control: false },
    logoLabel: { control: false },
    linkGroups: { control: false },
    socialLinks: { control: false },
    copyright: { control: false },
    legalLinks: { control: false },
    bottomContent: { control: false },
    children: { control: false },
    navigationLabel: { control: false },
    socialNavigationLabel: { control: false },
    legalNavigationLabel: { control: false },
    headingLevel: { control: "select", options: [1, 2, 3, 4, 5, 6] },
    variant: { control: "inline-radio", options: ["plain", "surface", "accent"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    className: { control: false },
    style: { control: false },
  },
  render: (args) => (
    <Footer
      {...args}
      brand={<span style={{ fontSize: "var(--ds-font-size-xl)" }}>northstar</span>}
      description="Tools for thoughtful teams making work better."
      logoHref="#home"
      logoLabel="Northstar home"
      linkGroups={groups}
      socialLinks={[
        { id: "mastodon", label: "Mastodon", href: "#mastodon" },
        { id: "linkedin", label: "LinkedIn", href: "#linkedin" },
      ]}
      copyright="© 2026 Northstar, Inc."
      legalLinks={[
        { id: "privacy", label: "Privacy", href: "#privacy" },
        { id: "terms", label: "Terms", href: "#terms" },
      ]}
    />
  ),
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("contentinfo")).toBeVisible();
    await expect(canvas.getByRole("navigation", { name: "Footer navigation" })).toBeVisible();
    await expect(canvas.getByRole("heading", { name: "Product", level: 3 })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Privacy" })).toBeVisible();
    await expect(canvas.getByRole("navigation", { name: "Social links" })).toBeVisible();
  },
};

export const SurfaceVariant: Story = {
  args: { variant: "surface" },
};

export const AccentVariant: Story = {
  args: { variant: "accent" },
};

export const ThemeCoverage: Story = {
  render: () => (
    <div data-ds-theme="luna">
      <Footer
        variant="surface"
        brand="northstar"
        description="Tools for thoughtful teams."
        linkGroups={groups}
        copyright="© 2026 Northstar"
      />
    </div>
  ),
};

export const CustomContent: Story = {
  render: () => (
    <Footer
      brand="northstar"
      description="Tools for thoughtful teams."
      linkGroups={groups}
      copyright="© 2026 Northstar"
      bottomContent={<span>Made for the long view.</span>}
    >
      <p>Trusted by teams in more than 30 countries.</p>
    </Footer>
  ),
};
