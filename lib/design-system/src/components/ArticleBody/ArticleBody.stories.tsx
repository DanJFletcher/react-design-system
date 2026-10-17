import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { ArticleBody } from "./ArticleBody";
import { ArticleFootnote, ArticleFootnotes } from "../ArticleFootnotes/ArticleFootnotes";

const illustrationSrc = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 480"><rect width="960" height="480" fill="#e4efe8"/><circle cx="740" cy="130" r="68" fill="#f4c66a"/><path d="M0 360 210 170l170 155 175-175 405 310v20H0Z" fill="#83a98a"/><path d="M0 405 270 265l180 130 195-105 315 150v40H0Z" fill="#426b55"/></svg>',
)}`;

const meta = {
  title: "Components/Article body",
  component: ArticleBody,
  args: {
    "aria-label": "A calmer morning routine for your studio",
  },
  argTypes: {
    children: { control: false },
    className: { control: false },
    style: { control: false },
  },
  render: (args) => (
    <ArticleBody {...args}>
      <p>
        A welcoming studio starts before the first appointment. A few small,
        repeatable steps can help the whole team feel prepared without making
        the morning feel rushed.
      </p>
      <h2>Begin with a little breathing room</h2>
      <p>
        Arrive early enough to open the windows, check the day&apos;s schedule,
        and make one thoughtful adjustment to the space. See{" "}
        <a href="/journal/studio-planning">our studio planning guide</a> for a
        simple checklist. Run <code>pnpm check</code> to validate changes.
      </p>
      <pre tabIndex={0} aria-label="Example shell commands">
        <code>{`pnpm install
pnpm --filter @workspace/design-system test:visual`}</code>
      </pre>
      <ul>
        <li>Set out the tools needed for the first appointment.</li>
        <li>Review any notes that will make a guest feel recognized.</li>
        <li>Leave a few minutes for an unexpected change.</li>
      </ul>
      <figure>
        <img
          alt="A bright green hillside beneath a warm morning sun"
          height={480}
          src={illustrationSrc}
          width={960}
        />
        <figcaption>A calm, prepared space makes room for good work.</figcaption>
      </figure>
      <blockquote>
        <p>
          The best routine is the one that makes the day easier for the people
          who use it.
        </p>
      </blockquote>
      <h3>A quick weekly check-in</h3>
      <table tabIndex={0}>
        <caption>Three useful moments to reset the studio</caption>
        <thead>
          <tr>
            <th scope="col">When</th>
            <th scope="col">Focus</th>
            <th scope="col">Time needed</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Monday</th>
            <td>Review the week ahead</td>
            <td>10 minutes</td>
          </tr>
          <tr>
            <th scope="row">Friday</th>
            <td>Restock shared supplies</td>
            <td>15 minutes</td>
          </tr>
        </tbody>
      </table>
      <p>
        Keep the routine flexible, and adjust it as the studio changes. A
        little preparation should support the work, not become more work.
      </p>
    </ArticleBody>
  ),
} satisfies Meta<typeof ArticleBody>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FullArticle: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const article = canvas.getByRole("article", {
      name: "A calmer morning routine for your studio",
    });
    await expect(article).toBeVisible();
    await expect(canvas.getByRole("heading", { name: "Begin with a little breathing room", level: 2 })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "our studio planning guide" })).toHaveAttribute(
      "href",
      "/journal/studio-planning",
    );
    await expect(canvas.getByRole("list")).toBeVisible();
    await expect(canvas.getByRole("figure")).toBeVisible();
    await expect(canvas.getByRole("img", {
      name: "A bright green hillside beneath a warm morning sun",
    })).toBeVisible();
    await expect(canvas.getByRole("table", {
      name: "Three useful moments to reset the studio",
    })).toBeVisible();
    await expect(canvas.getByRole("rowheader", { name: "Monday" })).toBeVisible();
  },
};

function CitationsAndFootnotesExample() {
  return (
    <ArticleBody aria-label="A guide to preparing your studio">
      <h2>A useful opening checklist</h2>
      <p>
        A short opening checklist helps the team prepare the studio{" "}
        <ArticleFootnote
          id="article-citation-checklist"
          noteId="article-note-checklist"
          label="1"
        />
        .
      </p>
      <p>
        The same checklist is useful during weekly reviews{" "}
        <ArticleFootnote
          id="article-citation-weekly-review"
          noteId="article-note-checklist"
          label="1"
        />
        .
      </p>
      <ArticleFootnotes
        heading="Sources and notes"
        headingLevel={2}
        items={[
          {
            id: "article-note-checklist",
            label: "1",
            content: (
              <>
                See the{" "}
                <a href="/journal/opening-checklist">full opening checklist</a>.
              </>
            ),
            backlinks: [
              { id: "article-citation-checklist" },
              { id: "article-citation-weekly-review" },
            ],
          },
        ]}
      />
    </ArticleBody>
  );
}

export const CitationsAndFootnotes: Story = {
  render: () => <CitationsAndFootnotesExample />,
};

export const CitationsAndFootnotesKeyboard: Story = {
  render: () => <CitationsAndFootnotesExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const citations = canvas.getAllByRole("link", { name: "Footnote 1" });
    const firstCitation = citations[0];
    const secondCitation = citations[1];
    const note = canvas.getByRole("listitem");
    const backlinks = canvas.getAllByRole("link", {
      name: /Back to citation/,
    });

    await expect(canvas.getByRole("region", { name: "Sources and notes" })).toBeVisible();
    await expect(canvas.getByRole("list")).toBeVisible();
    await expect(firstCitation).toHaveAttribute("href", "#article-note-checklist");
    await expect(secondCitation).toHaveAttribute("href", "#article-note-checklist");
    await expect(backlinks[0]).toHaveAttribute("href", "#article-citation-checklist");
    await expect(backlinks[1]).toHaveAttribute("href", "#article-citation-weekly-review");

    await userEvent.tab();
    await expect(firstCitation).toHaveFocus();
    await userEvent.tab();
    await expect(secondCitation).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("link", { name: "full opening checklist" })).toHaveFocus();
    await userEvent.tab();
    await expect(backlinks[0]).toHaveFocus();
    await userEvent.tab();
    await expect(backlinks[1]).toHaveFocus();
    await expect(note).toHaveAttribute("id", "article-note-checklist");
  },
};

export const ThemeCoverage: Story = {
  render: (args) => (
    <div className="theme-story-stack">
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <section
          key={theme}
          data-ds-theme={theme}
          style={{
            padding: "var(--ds-space-4)",
            color: "var(--ds-color-text-primary)",
            backgroundColor: "var(--ds-color-canvas)",
          }}
        >
          <ArticleBody {...args} aria-label={`${theme.toUpperCase()} sample article`}>
            <h2>{theme.toUpperCase()} article styling</h2>
            <p>
              Readable article text uses semantic colors and spacing from the
              active theme, with a line length suited to long-form reading.
              Inline commands such as <code>pnpm check</code> remain easy to
              distinguish.
            </p>
            <pre tabIndex={0} aria-label={`${theme.toUpperCase()} themed code example`}>
              <code>{`const theme = "${theme}";
console.log("Readable code in every theme");`}</code>
            </pre>
            <table tabIndex={0}>
              <caption>{theme.toUpperCase()} article table</caption>
              <thead>
                <tr>
                  <th scope="col">Pattern</th>
                  <th scope="col">Shared choice</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Action color</td>
                  <td>Primary token</td>
                </tr>
              </tbody>
            </table>
            <p>
              <a href="/journal/reading">A themed article link</a>
            </p>
          </ArticleBody>
        </section>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const atomArticle = canvas.getByRole("article", { name: "ATOM sample article" });
    const atomTable = within(atomArticle).getByRole("table", { name: "ATOM article table" });
    const atomHeader = within(atomTable).getByRole("columnheader", { name: "Pattern" });
    const atomBorder = getComputedStyle(atomHeader).borderTopColor;
    expect(atomBorder).toBe("rgb(112, 232, 255)");

    const acmeArticle = canvas.getByRole("article", { name: "ACME sample article" });
    const acmeTable = within(acmeArticle).getByRole("table", { name: "ACME article table" });
    const acmeHeader = within(acmeTable).getByRole("columnheader", { name: "Pattern" });
    expect(getComputedStyle(acmeHeader).borderTopColor).not.toBe(atomBorder);
  },
};

export const NarrowScreen: Story = {
  render: (args) => (
    <div style={{ inlineSize: "min(100%, 20rem)", marginInline: "auto" }}>
      <ArticleBody {...args}>
        <h2>A long article heading that wraps on a narrow screen</h2>
        <p>
          This long-form paragraph stays readable at a phone width. Long words
          and links can wrap rather than forcing the page to scroll sideways.
          An inline command such as <code>--long-unbroken-option-name</code>
          also wraps with the text.
        </p>
        <pre tabIndex={0} aria-label="A long command that can scroll horizontally">
          <code>{`pnpm --filter @workspace/design-system test:visual --project=chromium --reporter=list --grep=article-body-responsive-code-example-that-continues-beyond-the-phone-viewport-width`}</code>
        </pre>
        <table tabIndex={0}>
          <caption>Wide data remains available to scroll</caption>
          <thead>
            <tr>
              <th scope="col">A long column heading</th>
              <th scope="col">Another wide column</th>
              <th scope="col">Third column</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>First detail</td>
              <td>Second detail</td>
              <td>Third detail</td>
            </tr>
          </tbody>
        </table>
      </ArticleBody>
    </div>
  ),
};
