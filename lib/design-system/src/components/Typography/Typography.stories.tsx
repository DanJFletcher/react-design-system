import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import {
  Heading,
  Text,
  type TextVariant,
  type TypographyMeasure,
  type TypographySize,
} from "./Typography";

const sizes: TypographySize[] = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl"];
const variants: TextVariant[] = ["display", "body", "body-small", "lead", "label", "caption", "eyebrow"];
const measures: TypographyMeasure[] = ["none", "narrow", "content", "wide"];

const meta = {
  title: "Components/Content/Typography",
  id: "components-typography",
  component: Text,
  args: {
    children: "Readable type keeps content clear and consistent.",
    as: "p",
    variant: "body",
    tone: "primary",
    measure: "none",
  },
  argTypes: {
    as: { control: "inline-radio", options: ["p", "span", "div"] },
    size: { control: "select", options: sizes },
    variant: { control: "select", options: variants },
    weight: { control: "inline-radio", options: ["regular", "medium", "semibold"] },
    tone: { control: "inline-radio", options: ["primary", "muted"] },
    measure: { control: "inline-radio", options: measures },
    children: { control: "text" },
    style: { control: false },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const text = within(canvasElement).getByText("Readable type keeps content clear and consistent.");
    await expect(text.tagName.toLowerCase()).toBe("p");
    await expect(text).toHaveAttribute("data-variant", "body");
    await expect(text).toHaveAttribute("data-tone", "primary");
    await expect(text).toHaveAttribute("data-measure", "none");
  },
};

export const TextScale: Story = {
  render: () => (
    <div className="theme-story-stack">
      {sizes.map((size) => (
        <Text key={size} size={size}>
          {size}: Readable type keeps content clear and consistent.
        </Text>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const size of sizes) {
      await expect(canvas.getByText(new RegExp(`^${size}:`))).toHaveAttribute("data-size", size);
    }
  },
};

export const HeadingLevels: Story = {
  render: () => (
    <div className="theme-story-stack">
      {([1, 2, 3, 4, 5, 6] as const).map((level) => (
        <Heading key={level} level={level}>
          Heading level {level}
        </Heading>
      ))}
      <Heading level={3} size="5xl">Level 3 with display size 5xl</Heading>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const level of [1, 2, 3, 4, 5, 6] as const) {
      await expect(canvas.getByRole("heading", { name: `Heading level ${level}`, level })).toBeVisible();
    }
    await expect(canvas.getByRole("heading", {
      name: "Level 3 with display size 5xl",
      level: 3,
    })).toHaveAttribute("data-size", "5xl");
  },
};

export const SemanticRolesAndMeasure: Story = {
  render: () => (
    <div className="theme-story-stack">
      <Heading level={1} variant="display">A display heading</Heading>
      <Heading level={2}>A semantic level-two heading</Heading>
      <Text variant="eyebrow">FIELD NOTES</Text>
      <Text variant="lead" measure="content">
        Lead text introduces an article with a comfortable reading measure.
      </Text>
      <Text>Body text uses the shared default reading style.</Text>
      <Text variant="body-small">Smaller supporting copy keeps its own line height.</Text>
      <Text variant="label">Form and metadata label</Text>
      <Text variant="caption">Caption text for additional context.</Text>
      <Text data-testid="narrow-measure-example" measure="narrow">
        Narrow measure keeps long copy from spanning an overly wide reading column.
      </Text>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const display = canvas.getByRole("heading", { name: "A display heading", level: 1 });
    const lead = canvas.getByText("Lead text introduces an article with a comfortable reading measure.");
    const narrow = canvas.getByTestId("narrow-measure-example");

    await expect(display).toHaveAttribute("data-variant", "display");
    await expect(getComputedStyle(display).fontSize).toBe("56px");
    await expect(getComputedStyle(display).letterSpacing).not.toBe("normal");
    await expect(lead).toHaveAttribute("data-variant", "lead");
    await expect(getComputedStyle(lead).maxInlineSize).not.toBe("none");
    await expect(getComputedStyle(lead).getPropertyValue("--ds-typography-measure-content").trim()).toBe("65ch");
    await expect(getComputedStyle(narrow).maxInlineSize).not.toBe("none");
    await expect(getComputedStyle(narrow).getPropertyValue("--ds-typography-measure-narrow").trim()).toBe("45ch");
  },
};

export const TextElements: Story = {
  render: () => (
    <div className="theme-story-stack">
      <Text as="p">Paragraph text</Text>
      <Text as="span">Inline text</Text>
      <Text as="div">Block text</Text>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Paragraph text").tagName.toLowerCase()).toBe("p");
    await expect(canvas.getByText("Inline text").tagName.toLowerCase()).toBe("span");
    await expect(canvas.getByText("Block text").tagName.toLowerCase()).toBe("div");
  },
};

export const WeightsAndTones: Story = {
  render: () => (
    <div className="theme-story-stack">
      {(["regular", "medium", "semibold"] as const).map((weight) => (
        <Text key={weight} weight={weight}>{weight} weight</Text>
      ))}
      <Text>Primary tone</Text>
      <Text tone="muted">Muted supporting copy</Text>
    </div>
  ),
};

export const ThemeCoverage: Story = {
  render: () => (
    <div className="theme-story-stack">
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <section
          key={theme}
          className="theme-story-stack"
          data-ds-theme={theme}
          style={{ backgroundColor: "var(--ds-color-canvas)", padding: "var(--ds-space-4)" }}
        >
          <Heading level={3}>{theme.toUpperCase()} heading</Heading>
          <Text variant="label">Themeable label role</Text>
          <Text>Primary text follows the active theme.</Text>
          <Text tone="muted">Muted text follows the active theme.</Text>
        </section>
      ))}
    </div>
  ),
};

export const NestedThemeBoundary: Story = {
  render: () => (
    <section
      className="theme-story-stack"
      data-ds-theme="acme"
      style={{ backgroundColor: "var(--ds-color-canvas)", padding: "var(--ds-space-4)" }}
    >
      <Text>ACME parent text</Text>
      <section
        className="theme-story-stack"
        data-ds-theme="luna"
        style={{ backgroundColor: "var(--ds-color-canvas)", padding: "var(--ds-space-4)" }}
      >
        <Heading level={3}>Nested Luna heading</Heading>
        <Text>Nested Luna text</Text>
      </section>
    </section>
  ),
  play: async ({ canvasElement }) => {
    const luna = canvasElement.querySelector('[data-ds-theme="luna"]');
    const heading = within(luna as HTMLElement).getByRole("heading", { name: "Nested Luna heading" });
    const acmeText = within(canvasElement).getByText("ACME parent text");
    await expect(getComputedStyle(heading).color).not.toBe(getComputedStyle(acmeText).color);
  },
};

export const ResponsiveWrapping: Story = {
  render: () => (
    <div style={{ inlineSize: "min(32rem, 100%)" }}>
      <Heading level={2}>Design systems make strong teams more consistent</Heading>
      <Text>
        A deliberately long paragraph demonstrates how typography components wrap naturally within a narrow layout without clipping or creating horizontal overflow.
      </Text>
    </div>
  ),
};
