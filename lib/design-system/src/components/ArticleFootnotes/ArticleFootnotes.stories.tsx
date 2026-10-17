import type { Meta, StoryObj } from "@storybook/react";
import { Fragment } from "react";
import { ArticleBody } from "../ArticleBody/ArticleBody";
import {
  ArticleFootnote,
  ArticleFootnotes,
  type ArticleFootnoteEntry,
  type ArticleFootnotesProps,
} from "./ArticleFootnotes";

const createExampleNotes = (prefix: string): readonly ArticleFootnoteEntry[] => [
  {
    id: `${prefix}-note-opening-hours`,
    label: "1",
    content: (
      <>
        See the{" "}
        <a href="/journal/studio-opening-hours">studio opening-hours guide</a>{" "}
        for a practical checklist.
      </>
    ),
    backlinks: [{ id: `${prefix}-citation-opening-hours` }],
  },
  {
    id: `${prefix}-note-customer-survey`,
    label: "2",
    content:
      "Customer feedback was collected in a short follow-up survey after each appointment.",
    backlinks: [
      { id: `${prefix}-citation-survey-first` },
      { id: `${prefix}-citation-survey-second` },
    ],
  },
];

const createNarrowScreenNotes = (prefix: string): readonly ArticleFootnoteEntry[] => [
  {
    id: `${prefix}-note-source`,
    label: "1",
    content: (
      <>
        <p>
          This note includes enough supporting detail to wrap across several lines on a
          narrow phone screen without making the citation difficult to follow.
        </p>
        <p>
          Source:{" "}
          <a href="https://example.org/research/archive/2026/field-notes/extended-source-reference">
            https://example.org/research/archive/2026/field-notes/extended-source-reference
          </a>
        </p>
      </>
    ),
    backlinks: [{ id: `${prefix}-citation-source` }],
  },
];

function ConnectedArticle({
  args,
  prefix,
  items = createExampleNotes(prefix),
}: {
  args: ArticleFootnotesProps;
  prefix: string;
  items?: readonly ArticleFootnoteEntry[];
}) {
  return (
    <ArticleBody aria-label="A guide to preparing a welcoming studio">
      <h1>A guide to preparing a welcoming studio</h1>
      {items.map((item, itemIndex) => (
        <p key={item.id}>
          {itemIndex === 0
            ? "A consistent opening routine helps the team prepare the space"
            : "The team also reviewed customer feedback after appointments"}
          {item.backlinks.map((backlink, backlinkIndex) => (
            <Fragment key={backlink.id}>
              {backlinkIndex === 0 ? " " : " and "}
              <ArticleFootnote
                id={backlink.id}
                noteId={item.id}
                label={item.label}
              />
            </Fragment>
          ))}
          .
        </p>
      ))}
      <ArticleFootnotes {...args} items={items} />
    </ArticleBody>
  );
}

const meta = {
  title: "Components/Article footnotes",
  component: ArticleFootnotes,
  args: {
    items: createExampleNotes("sample"),
    heading: "Footnotes",
    headingLevel: 2,
    backlinkLabel: "Back to citation",
  },
  argTypes: {
    items: { table: { disable: true } },
    heading: { control: "text" },
    headingLevel: { control: "select", options: [2, 3, 4, 5, 6] },
    backlinkLabel: { control: "text" },
    className: { control: false },
    style: { control: false },
  },
  render: (args) => <ConnectedArticle args={args} prefix="sample" />,
} satisfies Meta<typeof ArticleFootnotes>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const ThemeCoverage: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: "var(--ds-space-6)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <div
          key={theme}
          data-ds-theme={theme}
          style={{
            padding: "var(--ds-space-4)",
            borderRadius: "var(--ds-radius-shape-rounded)",
            backgroundColor: "var(--ds-color-canvas)",
          }}
        >
          <ConnectedArticle
            args={{ ...args, heading: `${theme.toUpperCase()} footnotes` }}
            prefix={theme}
          />
        </div>
      ))}
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

export const NarrowScreenLongContent: Story = {
  render: (args) => (
    <div style={{ inlineSize: "min(100%, 20rem)", marginInline: "auto" }}>
      <ConnectedArticle
        args={args}
        prefix="narrow-long"
        items={createNarrowScreenNotes("narrow-long")}
      />
    </div>
  ),
};
