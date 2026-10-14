import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { Button } from "../Button/Button";
import { PricingDetails } from "./PricingDetails";

const meta = {
  title: "Components/Pricing details",
  component: PricingDetails,
  args: {
    eyebrow: "Annual plan",
    title: "Professional",
    description: "Everything your growing team needs to stay on track.",
    badge: "Best value",
    price: "39",
    pricePrefix: "$",
    billingPeriod: "per user / month, billed annually",
    compareAtPrice: "$49 per month",
    priceLabel: "39 US dollars per user per month, billed annually",
    detailsLabel: "Plan details",
    details: [
      { id: "seats", label: "Team members", value: "Up to 10" },
      { id: "projects", label: "Projects", value: "Unlimited" },
      { id: "support", label: "Support", value: "Priority", emphasis: true },
    ],
    variant: "featured",
    layout: "split",
    alignment: "start",
    size: "md",
    shape: "rounded",
    headingLevel: 2,
  },
  argTypes: {
    eyebrow: { control: "text" },
    title: { control: "text" },
    description: { control: "text" },
    badge: { control: "text" },
    price: { control: "text" },
    pricePrefix: { control: "text" },
    priceSuffix: { control: "text" },
    billingPeriod: { control: "text" },
    compareAtPrice: { control: "text" },
    priceLabel: { control: "text" },
    detailsLabel: { control: "text" },
    details: { control: false },
    features: { control: false },
    children: { control: false },
    primaryAction: { control: false },
    secondaryAction: { control: false },
    actions: { control: false },
    footer: { control: false },
    variant: {
      control: "inline-radio",
      options: ["surface", "outlined", "subtle", "accent", "featured"],
    },
    layout: { control: "inline-radio", options: ["stacked", "split"] },
    alignment: { control: "inline-radio", options: ["start", "center"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: { control: "inline-radio", options: ["rounded", "square"] },
    headingLevel: { control: "select", options: [1, 2, 3, 4, 5, 6] },
    style: { control: false },
    className: { control: "text" },
  },
  render: (args) => (
    <PricingDetails
      {...args}
      features={(
        <ul style={{ display: "grid", gap: "var(--ds-space-2)", margin: 0, paddingInlineStart: "var(--ds-space-5)" }}>
          <li>Unlimited projects</li>
          <li>Shared team workspace</li>
          <li>Advanced reporting</li>
        </ul>
      )}
      primaryAction={<Button>Start 14-day trial</Button>}
      secondaryAction={<Button variant="ghost">Contact sales</Button>}
      footer="No charge today. Cancel any time."
    />
  ),
} satisfies Meta<typeof PricingDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const pricing = canvas.getByRole("article", { name: "Professional" });
    const pricingCanvas = within(pricing);
    await expect(pricing).toBeVisible();
    await expect(pricingCanvas.getByRole("heading", {
      name: "Professional",
      level: 2,
    })).toBeVisible();
    await expect(pricingCanvas.getByText("39")).toBeVisible();
    await expect(pricingCanvas.getByText("Priority")).toBeVisible();
    await expect(pricingCanvas.getByRole("button", { name: "Start 14-day trial" })).toBeVisible();
  },
};

export const LayoutExamples: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-5)" }}>
      <PricingDetails
        eyebrow="Flexible"
        title="Monthly"
        description="A straightforward plan with no annual commitment."
        price="$12"
        billingPeriod="per user / month"
        layout="stacked"
        alignment="center"
        variant="surface"
        detailsLabel="Included"
        details={[
          { id: "projects", label: "Projects", value: "Unlimited" },
          { id: "support", label: "Support", value: "Standard" },
        ]}
        primaryAction={<Button>Choose monthly</Button>}
      />
      <PricingDetails
        eyebrow="Best value"
        title="Annual"
        description="Save with annual billing and get everything in the monthly plan."
        price="$9"
        billingPeriod="per user / month, billed annually"
        layout="split"
        variant="featured"
        size="lg"
        detailsLabel="Included"
        details={[
          { id: "projects", label: "Projects", value: "Unlimited" },
          { id: "support", label: "Support", value: "Priority" },
        ]}
        actions={<Button>Choose annual</Button>}
      />
    </div>
  ),
};

export const VariantExamples: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))", gap: "var(--ds-space-4)" }}>
      {(["surface", "outlined", "subtle", "accent", "featured"] as const).map((variant) => (
        <PricingDetails
          key={variant}
          variant={variant}
          eyebrow={variant.toUpperCase()}
          title={`${variant} plan`}
          price="$18"
          billingPeriod="per month"
          details={[{ id: "members", label: "Members", value: "5" }]}
          size="sm"
          headingLevel={3}
        />
      ))}
    </div>
  ),
};

export const OrderSummary: Story = {
  render: () => (
    <PricingDetails
      eyebrow="Checkout preview"
      title="Order summary"
      description="A display-only breakdown; the consumer owns all price calculations."
      price="$86.40"
      billingPeriod="due today"
      layout="split"
      variant="outlined"
      detailsLabel="Price breakdown"
      details={[
        { id: "plan", label: "Annual plan", value: "$90.00" },
        { id: "addon", label: "Additional seats", value: "$20.00" },
        { id: "discount", label: "Annual discount", value: "−$30.00" },
        { id: "tax", label: "Estimated tax", value: "$6.40" },
        { id: "total", label: "Total", value: "$86.40", emphasis: true },
      ]}
      footer="Taxes are estimates and may change based on your billing address."
    />
  ),
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <div key={theme} data-ds-theme={theme}>
          <PricingDetails
            eyebrow={theme.toUpperCase()}
            title={`${theme.toUpperCase()} pricing`}
            price="$24"
            billingPeriod="per month"
            variant="surface"
            size="sm"
            headingLevel={3}
            details={[{ id: "features", label: "Included features", value: "All core features" }]}
          />
        </div>
      ))}
    </div>
  ),
};

export const CustomHookOverrides: Story = {
  render: () => (
    <PricingDetails
      eyebrow="Scoped customization"
      title="Tune the pricing surface"
      description="Adjust price, spacing, borders, and shape without replacing the active theme."
      price="$32"
      billingPeriod="per user / month"
      variant="featured"
      detailsLabel="Included"
      details={[
        { id: "projects", label: "Projects", value: "Unlimited" },
        { id: "seats", label: "Team members", value: "Up to 20" },
      ]}
      style={{
        "--ds-pricing-background": "var(--ds-color-accent-bg)",
        "--ds-pricing-text": "var(--ds-color-accent-fg)",
        "--ds-pricing-muted": "var(--ds-color-accent-fg)",
        "--ds-pricing-price": "var(--ds-color-accent-fg)",
        "--ds-pricing-border": "var(--ds-color-accent-bg)",
        "--ds-pricing-featured-border": "var(--ds-color-accent-fg)",
        "--ds-pricing-detail-border": "var(--ds-color-accent-fg)",
        "--ds-pricing-radius": "var(--ds-space-6)",
        "--ds-pricing-padding": "var(--ds-space-6)",
      }}
    />
  ),
};

export const TextOnly: Story = {
  render: () => (
    <PricingDetails
      title="Contact us"
      description="Need a custom plan? Talk with our team to build the right fit."
      variant="subtle"
      alignment="center"
      shape="square"
      actions={<Button variant="secondary">Contact sales</Button>}
      footer="Available for teams of 50 or more."
    />
  ),
};
