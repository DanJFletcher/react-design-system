import type { Meta, StoryObj } from "@storybook/react";
import type { CSSProperties } from "react";
import { expect, within } from "storybook/test";
import { ArticleBody } from "../ArticleBody/ArticleBody";
import {
  ArticleTableOfContents,
  type ArticleTableOfContentsItem,
  type ArticleTableOfContentsProps,
} from "./ArticleTableOfContents";

const sectionTitles = [
  "Start with a simple routine",
  "Prepare the space",
  "Welcome each guest",
  "Review and improve",
];

function createSections(prefix: string): readonly ArticleTableOfContentsItem[] {
  return sectionTitles.map((label, index) => ({
    id: `${prefix}-section-${index + 1}`,
    label,
  }));
}

function ConnectedArticle({
  args,
  prefix = "sample",
}: {
  args: ArticleTableOfContentsProps;
  prefix?: string;
}) {
  const items = createSections(prefix);

  return (
    <ArticleBody aria-label="A guide to preparing a welcoming studio">
      <h1>A guide to preparing a welcoming studio</h1>
      <ArticleTableOfContents {...args} items={items} />
      {items.map((item) => (
        <section key={item.id}>
          <h2 id={item.id}>{item.label}</h2>
          <p>
            A thoughtful routine makes it easier to prepare a welcoming
            space and give each guest a consistent experience.
          </p>
        </section>
      ))}
    </ArticleBody>
  );
}

const meta = {
  title: "Compositions/Editorial/Article table of contents",
  id: "components-article-table-of-contents",
  component: ArticleTableOfContents,
  args: {
    "aria-label": "Article table of contents",
    heading: "In this article",
    headingLevel: 2,
    items: createSections("sample"),
  },
  argTypes: {
    items: { control: false },
    heading: { control: "text" },
    headingLevel: { control: "select", options: [2, 3, 4, 5, 6] },
    "aria-label": { control: "text" },
    className: { control: false },
    style: { control: false },
  },
  render: (args) => <ConnectedArticle args={args} />,
} satisfies Meta<typeof ArticleTableOfContents>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const navigation = canvas.getByRole("navigation", {
      name: "Article table of contents",
    });
    const link = within(navigation).getByRole("link", {
      name: "Prepare the space",
    });

    await expect(link).toHaveAttribute("href", "#sample-section-2");
    await expect(
      canvas.getByRole("heading", { name: "Prepare the space", level: 2 }),
    ).toHaveAttribute("id", "sample-section-2");
  },
};

export const ThemeCoverage: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: "var(--ds-space-6)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <div
          aria-label={`${theme.toUpperCase()} theme example`}
          data-testid={`${theme}-theme`}
          data-ds-theme={theme}
          key={theme}
          style={{
            padding: "var(--ds-space-4)",
            backgroundColor: "var(--ds-color-canvas)",
          }}
        >
          <ConnectedArticle
            args={{
              ...args,
              "aria-label": `${theme.toUpperCase()} article table of contents`,
              heading: `${theme.toUpperCase()} article sections`,
            }}
            prefix={theme}
          />
        </div>
      ))}
      <div
        aria-label="Custom theme example"
        data-testid="custom-theme"
        data-ds-theme="acme"
        style={{
          "--ds-color-action-secondary-fg": "#5b3a8a",
          "--ds-color-border-control": "#9b82be",
          padding: "var(--ds-space-4)",
        } as CSSProperties}
      >
        <ConnectedArticle
          args={{
            ...args,
            "aria-label": "Custom article table of contents",
            heading: "Custom article sections",
          }}
          prefix="custom"
        />
      </div>
      <div
        aria-label="Nested theme example"
        data-testid="nested-theme"
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
          <ConnectedArticle
            args={{
              ...args,
              "aria-label": "Nested article table of contents",
              heading: "Nested article sections",
            }}
            prefix="nested"
          />
        </div>
      </div>
    </div>
  ),
};

export const NarrowScreen: Story = {
  render: (args) => (
    <div style={{ inlineSize: "min(100%, 20rem)", marginInline: "auto" }}>
      <ConnectedArticle args={args} prefix="narrow" />
    </div>
  ),
};
