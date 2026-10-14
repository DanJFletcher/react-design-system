import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { Header, type HeaderNavItem } from "./Header";

const navItems: HeaderNavItem[] = [
  { label: "Products", href: "#products" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
];

const meta = {
  title: "Components/Header",
  component: Header,
  args: {
    navItems,
    logoHref: "/",
    logoLabel: "ACME home",
    navigationLabel: "Primary navigation",
    size: "md",
    sticky: false,
    borderBottom: true,
  },
  argTypes: {
    navItems: { control: "object" },
    logo: { control: false },
    logoHref: { control: "text" },
    logoLabel: { control: "text" },
    cta: { control: false },
    navigationLabel: { control: "text" },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    sticky: { control: "boolean" },
    borderBottom: { control: "boolean", name: "Bottom border" },
  },
  render: (args) => (
    <Header
      {...args}
      logo={<strong>ACME</strong>}
      cta={<Button size="sm">Get started</Button>}
    />
  ),
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const HeightExamples: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <section key={size} aria-label={`${size.toUpperCase()} header example`}>
          <Header
            logo={<strong>ACME · {size.toUpperCase()}</strong>}
            logoLabel={`ACME ${size.toUpperCase()} header home`}
            navItems={navItems}
            cta={<Button size="sm">Get started</Button>}
            navigationLabel={`${size.toUpperCase()} navigation`}
            size={size}
          />
        </section>
      ))}
    </div>
  ),
};

export const StickyWithoutBorder: Story = {
  args: {
    size: "lg",
    sticky: true,
    borderBottom: false,
  },
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-6)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <section key={theme} data-ds-theme={theme}>
          <h2>{theme.toUpperCase()}</h2>
          <Header
            logo={<strong>ACME</strong>}
            logoLabel="ACME home"
            navItems={navItems}
            cta={<Button size="sm">Get started</Button>}
            navigationLabel={`${theme.toUpperCase()} navigation`}
            size="md"
          />
        </section>
      ))}
    </div>
  ),
};

