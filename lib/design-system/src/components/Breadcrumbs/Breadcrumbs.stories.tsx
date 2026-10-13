import type { Meta, StoryObj } from "@storybook/react";
import type { CSSProperties } from "react";
import { expect, within } from "storybook/test";
import { Breadcrumbs } from "./Breadcrumbs";

const items = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Repairs", current: true },
] as const;

const meta = {
  title: "Components/Breadcrumbs",
  component: Breadcrumbs,
  args: {
    "aria-label": "Breadcrumb",
    items,
  },
  argTypes: {
    items: { control: false },
    "aria-label": { control: "text", description: "Accessible name for this navigation landmark." },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const navigation = canvas.getByRole("navigation", { name: "Breadcrumb" });
    const breadcrumb = within(navigation);
    await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/",
    );
    await expect(
      breadcrumb.getByRole("link", { name: "Services" }),
    ).toHaveAttribute("href", "/services");
    await expect(breadcrumb.getByText("Repairs")).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(
      breadcrumb.queryByRole("link", { name: "Repairs" }),
    ).not.toBeInTheDocument();
  },
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-6)" }}>
      {(["acme", "luna", "orchid"] as const).map((theme) => (
        <section
          aria-label={`${theme} theme`}
          data-ds-theme={theme}
          key={theme}
          style={{
            padding: "var(--ds-space-4)",
            backgroundColor: "var(--ds-color-canvas)",
          }}
        >
          <h2 style={{ color: "var(--ds-color-text-primary)" }}>
            {theme.toUpperCase()}
          </h2>
          <Breadcrumbs
            aria-label={`${theme} breadcrumb`}
            items={items}
          />
        </section>
      ))}
      <section
        aria-label="Custom theme"
        data-ds-theme="acme"
        style={
          {
            "--ds-color-action-secondary-fg": "#5b3a8a",
            "--ds-radius-control": "1.25rem",
            "--ds-space-2": "1rem",
            padding: "var(--ds-space-4)",
            backgroundColor: "var(--ds-color-canvas)",
          } as CSSProperties
        }
      >
        <h2 style={{ color: "var(--ds-color-text-primary)" }}>Custom tokens</h2>
        <Breadcrumbs aria-label="Custom breadcrumb" items={items} />
      </section>
      <section
        aria-label="Nested theme"
        data-ds-theme="acme"
        style={{ padding: "var(--ds-space-4)" }}
      >
        <div
          data-ds-theme="luna"
          style={{
            padding: "var(--ds-space-4)",
            backgroundColor: "var(--ds-color-canvas)",
          }}
        >
          <Breadcrumbs aria-label="Nested breadcrumb" items={items} />
        </div>
      </section>
    </div>
  ),
};

export const NarrowScreen: Story = {
  args: {
    "aria-label": "Narrow-screen breadcrumb",
    items: [
      { label: "Home", href: "/" },
      { label: "Products", href: "/products" },
      { label: "Home services", href: "/products/home-services" },
      {
        label: "Heating and cooling",
        href: "/products/home-services/heating-cooling",
      },
      {
        label: "Heating systems",
        href: "/products/home-services/heating-cooling/heating",
      },
      {
        label:
          "A detailed current page name with enough words to demonstrate readable wrapping",
        current: true,
      },
    ],
  },
  render: (args) => (
    <div style={{ inlineSize: "min(100%, 18rem)", marginInline: "auto" }}>
      <Breadcrumbs {...args} />
    </div>
  ),
};
