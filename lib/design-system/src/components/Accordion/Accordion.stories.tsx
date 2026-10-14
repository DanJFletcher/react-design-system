import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { Accordion, type AccordionItem } from "./Accordion";

const faqItems: AccordionItem[] = [
  {
    id: "start",
    title: "Can we start small?",
    content: "Yes. Start with the free plan and move to a team plan when you need shared spaces and reporting.",
  },
  {
    id: "tools",
    title: "Will Orbit replace every tool we use?",
    content: "Orbit gives your projects and decisions a home. Keep the tools your team already relies on and connect them as needed.",
  },
  {
    id: "plans",
    title: "Can I change plans later?",
    content: "Yes. You can change or cancel your plan at any time; there is no long-term contract.",
  },
];

const meta = {
  title: "Components/Accordion",
  component: Accordion,
  args: {
    items: faqItems,
    label: "Frequently asked questions",
    multiple: false,
    variant: "divided",
    size: "md",
    shape: "rounded",
    panelMotion: "none",
    headingLevel: 3,
  },
  argTypes: {
    items: { control: "object" },
    label: { control: "text" },
    multiple: { control: "boolean" },
    openItems: { control: false },
    defaultOpenItems: { control: "object" },
    onOpenItemsChange: { control: false },
    variant: { control: "inline-radio", options: ["divided", "outlined", "surface"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: { control: "inline-radio", options: ["rounded", "square"] },
    panelMotion: { control: "inline-radio", options: ["none", "expand"] },
    headingLevel: { control: "select", options: [1, 2, 3, 4, 5, 6] },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstQuestion = canvas.getByRole("button", { name: "Can we start small?" });
    const firstChevron = firstQuestion.querySelector('[data-icon="chevron-down"]');
    await expect(firstChevron).toHaveAttribute("aria-hidden", "true");
    await expect(firstChevron).toHaveAttribute("data-size", "md");
    await expect(getComputedStyle(firstChevron as SVGElement).inlineSize).toBe("20px");
    await expect(firstQuestion).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(firstQuestion);
    await expect(firstQuestion).toHaveAttribute("aria-expanded", "true");
    await expect(firstQuestion.querySelector('[data-icon="chevron-down"]')).toBeInTheDocument();
    await expect(canvas.getByRole("region", { name: "Can we start small?" })).toBeVisible();
    await userEvent.keyboard("{TAB}");
    await expect(canvas.getByRole("button", { name: "Will Orbit replace every tool we use?" })).toHaveFocus();
  },
};

export const ExpandCollapseMotion: Story = {
  args: { panelMotion: "expand" },
  globals: { motion: "full" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Can we start small?" });
    const panelId = trigger.getAttribute("aria-controls");
    const panel = panelId
      ? canvasElement.querySelector<HTMLElement>(`[id="${panelId}"]`)
      : null;
    if (!panel) throw new Error("Expected the Accordion panel to be rendered.");

    await expect(panel).toHaveAttribute("aria-hidden", "true");
    await expect(panel).toHaveAttribute("inert");
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(panel).not.toHaveAttribute("aria-hidden", "true");
    await expect(panel).not.toHaveAttribute("inert");
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    await expect(canvas.getByRole("region", { name: "Can we start small?" })).toBeVisible();

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(panel).toHaveAttribute("aria-hidden", "true");
    await expect(panel).toHaveAttribute("inert");
  },
};

export const ReducedMotion: Story = {
  args: { panelMotion: "expand" },
  globals: { motion: "reduced" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Can we start small?" }));
    const panel = canvas.getByRole("region", { name: "Can we start small?" });
    await expect(document.documentElement).toHaveAttribute("data-ds-motion-preference", "reduced");
    await expect(getComputedStyle(panel).transitionDuration).toBe("0s");
    await expect(panel).toBeVisible();
  },
};

export const MultiOpen: Story = {
  args: {
    multiple: true,
    defaultOpenItems: ["start", "tools"],
  },
};

export const VariantExamples: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-6)" }}>
      {(["divided", "outlined", "surface"] as const).map((variant) => (
        <section key={variant} aria-label={`${variant} accordion`}>
          <h2 style={{ marginBlock: "0 var(--ds-space-3)" }}>{variant}</h2>
          <Accordion items={faqItems.slice(0, 2)} label={`${variant} questions`} variant={variant} />
        </section>
      ))}
    </div>
  ),
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-5)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <section data-ds-theme={theme} key={theme} aria-label={`${theme} theme`}>
          <h2>{theme.toUpperCase()}</h2>
          <Accordion items={faqItems.slice(0, 2)} label={`${theme} questions`} variant="surface" />
        </section>
      ))}
    </div>
  ),
};

export const DisabledItem: Story = {
  args: {
    items: [
      ...faqItems.slice(0, 2),
      { id: "unavailable", title: "Not available yet", content: "This answer is not ready.", disabled: true },
    ],
  },
};
