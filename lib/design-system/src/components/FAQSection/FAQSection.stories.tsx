import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "../Button/Button";
import { FAQSection, type FAQSectionItem } from "./FAQSection";
import styles from "./FAQSection.stories.module.css";

const faqItems: FAQSectionItem[] = [
  {
    id: "consultation",
    question: "How do I book a consultation?",
    answer: "Send us a message and we’ll help find a time that works for you.",
  },
  {
    id: "service-area",
    question: "Which areas do you serve?",
    answer: "We work with customers throughout the city and nearby neighborhoods.",
  },
  {
    id: "payment",
    question: "What payment methods do you accept?",
    answer: "We accept major credit cards and debit cards.",
  },
];

const meta = {
  title: "Components/FAQ Section",
  component: FAQSection,
  args: {
    heading: "Frequently asked questions",
    description: "Helpful details before you get started.",
    items: faqItems,
    multiple: false,
    variant: "divided",
    size: "md",
    shape: "rounded",
    headingLevel: 2,
    action: <Button variant="secondary">Talk to our team</Button>,
  },
  argTypes: {
    heading: { control: "text" },
    description: { control: "text" },
    items: { control: "object" },
    action: { control: false },
    multiple: { control: "boolean" },
    openItems: { control: false },
    defaultOpenItems: { control: "object" },
    onOpenItemsChange: { control: false },
    variant: { control: "inline-radio", options: ["divided", "outlined", "surface"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: { control: "inline-radio", options: ["rounded", "square"] },
    headingLevel: { control: "select", options: [1, 2, 3, 4, 5] },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof FAQSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const section = canvas.getByRole("region", { name: "Frequently asked questions" });
    const sectionCanvas = within(section);
    const firstQuestion = canvas.getByRole("button", { name: "How do I book a consultation?" });

    await expect(sectionCanvas.getByRole("heading", {
      name: "Frequently asked questions",
      level: 2,
    })).toBeVisible();
    await expect(firstQuestion).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(firstQuestion);
    await expect(firstQuestion).toHaveAttribute("aria-expanded", "true");
    await expect(sectionCanvas.getByRole("region", { name: "How do I book a consultation?" }))
      .toBeVisible();
    await userEvent.keyboard("{TAB}");
    await expect(canvas.getByRole("button", { name: "Which areas do you serve?" })).toHaveFocus();
    await expect(canvas.getByRole("button", { name: "Talk to our team" })).toBeVisible();
  },
};

export const MultipleOpen: Story = {
  args: {
    heading: "Questions about getting started",
    multiple: true,
    defaultOpenItems: ["consultation", "service-area"],
    action: undefined,
  },
};

export const VariantExamples: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-6)" }}>
      {(["divided", "outlined", "surface"] as const).map((variant) => (
        <FAQSection
          action={null}
          heading={`${variant[0]!.toUpperCase()}${variant.slice(1)} FAQ style`}
          items={faqItems.slice(0, 2)}
          key={variant}
          variant={variant}
        />
      ))}
    </div>
  ),
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-5)" }}>
      {(["acme", "luna", "orchid", "atom"] as const).map((theme) => (
        <div
          data-ds-theme={theme}
          key={theme}
          style={{
            backgroundColor: "var(--ds-color-canvas)",
            color: "var(--ds-color-text-primary)",
            padding: "var(--ds-space-4)",
          }}
        >
          <FAQSection
            action={null}
            heading={`${theme.toUpperCase()} FAQs`}
            items={faqItems.slice(0, 2)}
            variant="surface"
          />
        </div>
      ))}
    </div>
  ),
};

export const NestedThemeBoundary: Story = {
  render: () => (
    <div data-ds-theme="acme" style={{ display: "grid", gap: "var(--ds-space-6)" }}>
      <FAQSection
        action={null}
        heading="ACME studio FAQs"
        items={faqItems.slice(0, 2)}
        variant="surface"
      />
      <div
        data-ds-theme="luna"
        style={{
          backgroundColor: "var(--ds-color-canvas)",
          color: "var(--ds-color-text-primary)",
          padding: "var(--ds-space-4)",
        }}
      >
        <FAQSection
          action={null}
          heading="Luna studio FAQs"
          items={faqItems.slice(0, 2)}
          variant="surface"
        />
      </div>
    </div>
  ),
};

export const ScopedStyling: Story = {
  render: () => (
    <FAQSection
      action={null}
      className={styles.scopedFaq}
      heading="FAQs with scoped styling"
      items={faqItems.slice(0, 2)}
      variant="divided"
    />
  ),
};

function ControlledFAQExample() {
  const [openItems, setOpenItems] = useState<string[]>([]);

  return (
    <FAQSection
      action={null}
      heading="Controlled service questions"
      items={faqItems}
      onOpenItemsChange={setOpenItems}
      openItems={openItems}
    />
  );
}

export const ControlledState: Story = {
  render: () => <ControlledFAQExample />,
};

export const DisabledQuestion: Story = {
  args: {
    heading: "Questions with an unavailable answer",
    items: [
      ...faqItems.slice(0, 2),
      {
        id: "future-service",
        question: "Will you offer weekend appointments?",
        answer: "We’ll share an update when weekend hours are available.",
        disabled: true,
      },
    ],
    action: null,
  },
};

export const EmptyItems: Story = {
  args: {
    heading: "FAQs not loaded yet",
    items: [],
    action: null,
  },
};

export const NarrowLayout: Story = {
  render: () => (
    <div style={{ maxInlineSize: "24rem", padding: "var(--ds-space-3)" }}>
      <FAQSection
        action={null}
        description="Common questions from customers in our local community."
        heading="Small-screen FAQs"
        items={[
          {
            ...faqItems[0]!,
            question: "Can I change or reschedule my appointment after I have booked?",
          },
          faqItems[1]!,
          faqItems[2]!,
        ]}
        variant="outlined"
      />
    </div>
  ),
};
