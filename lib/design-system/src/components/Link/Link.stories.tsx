import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { Link } from "./Link";

const meta = {
  title: "Components/Actions/Link",
  id: "components-link",
  component: Link,
  args: {
    href: "/services",
    children: "Explore our services",
    variant: "default",
    underline: "always",
  },
  argTypes: {
    href: { control: "text" },
    variant: { control: "inline-radio", options: ["default", "muted"] },
    underline: { control: "inline-radio", options: ["always", "hover", "none"] },
    target: { control: "text" },
    rel: { control: "text" },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link", { name: "Explore our services" });
    await expect(link).toHaveAttribute("href", "/services");
    await expect(getComputedStyle(link).textDecorationLine).toBe("underline");
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await expect(getComputedStyle(link).outlineStyle).toBe("solid");
  },
};

export const InlineInText: Story = {
  render: () => (
    <p style={{ maxWidth: "34rem", lineHeight: 1.6 }}>
      We help homeowners make their spaces work better.{" "}
      <Link href="/services/space-planning">See how our planning service works</Link>{" "}
      or get in touch to talk through your project.
    </p>
  ),
};

export const StyleOptions: Story = {
  render: () => (
    <div style={{ display: "grid", justifyItems: "start", gap: "var(--ds-space-4)" }}>
      <Link href="#always" underline="always">Always underlined</Link>
      <Link href="#hover" underline="hover">Underlined on hover</Link>
      <Link href="#muted" variant="muted" underline="none">Muted, no underline</Link>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "Always underlined" })).toHaveAttribute(
      "data-underline",
      "always",
    );
    await expect(canvas.getByRole("link", { name: "Underlined on hover" })).toHaveAttribute(
      "data-underline",
      "hover",
    );
    await expect(canvas.getByRole("link", { name: "Muted, no underline" })).toHaveAttribute(
      "data-variant",
      "muted",
    );
  },
};

export const OpensInNewTab: Story = {
  render: () => (
    <Link href="https://example.com/" target="_blank" rel="noreferrer">
      Visit example.com
    </Link>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link", { name: "Visit example.com" });
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link.getAttribute("rel")).toContain("noopener");
    await expect(link.getAttribute("rel")).toContain("noreferrer");
  },
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <section
          key={theme}
          data-ds-theme={theme}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--ds-space-4)",
            padding: "var(--ds-space-4)",
            color: "var(--ds-color-text-primary)",
            background: "var(--ds-color-canvas)",
          }}
        >
          <Link href={`/${theme}/services`}>{theme} services</Link>
          <Link href={`/${theme}/contact`} variant="muted" underline="hover">
            Contact
          </Link>
        </section>
      ))}
    </div>
  ),
};
