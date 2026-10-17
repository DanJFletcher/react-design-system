import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import { Header, type HeaderMobileNavigationRenderProps, type HeaderNavItem } from "./Header";

const navItems: HeaderNavItem[] = [
  { label: "Products", href: "#products" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
];

const meta = {
  title: "Compositions/Marketing/Header",
  id: "components-header",
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
    renderMobileNavigation: { control: false },
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

export const CustomMobileNavigation: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: (args) => (
    <Header
      {...args}
      logo={<strong>ACME</strong>}
      cta={<Button size="sm">Get started</Button>}
      renderMobileNavigation={(navigationProps) => <CustomNavigation {...navigationProps} />}
    />
  ),
};

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

function CustomNavigation({
  id,
  navItems,
  navigationLabel,
  open,
  onOpenChange,
}: HeaderMobileNavigationRenderProps) {
  return (
    <div style={{ display: "grid", justifyItems: "end", gap: "var(--ds-space-2)" }}>
      <Button
        size="sm"
        variant="ghost"
        shape="rounded"
        icon={<Icon name={open ? "close" : "menu"} />}
        iconOnly
        aria-label={open ? "Close custom navigation" : "Open custom navigation"}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => onOpenChange(!open)}
      />
      {open && (
        <nav
          id={id}
          aria-label={navigationLabel}
          style={{
            display: "grid",
            gap: "var(--ds-space-2)",
            minInlineSize: "var(--ds-space-40)",
            padding: "var(--ds-space-3)",
            border: "var(--ds-border-width-default) solid var(--ds-color-border-control)",
            borderRadius: "var(--ds-radius-surface)",
            backgroundColor: "var(--ds-color-surface-primary)",
          }}
        >
          <ul>
            {navItems.map(({ label, href, current, icon, onClick, ...linkProps }) => (
              <li key={href}>
                <a
                  {...linkProps}
                  href={href}
                  aria-current={current ? "page" : undefined}
                  onClick={onClick}
                >
                  {icon != null && <span aria-hidden="true">{icon}</span>}
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

