import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import {
  ArticleBody,
  ArticleTableOfContents,
  Badge,
  BlogLayout,
  Breadcrumbs,
  Button,
  Callout,
  Footer,
  Header,
} from "../index";
import styles from "./BlogArticle.module.css";

const sections = [
  { id: "why-systems", label: "Why design systems matter" },
  { id: "tokens", label: "Tokens make decisions reusable" },
  { id: "one-change", label: "One change, many surfaces" },
  { id: "shared-language", label: "A shared language for teams" },
  { id: "what-to-tokenize", label: "What to tokenize first" },
  { id: "keep-it-healthy", label: "Keep the system healthy" },
  { id: "start-small", label: "Start small and learn" },
] as const;

const footerGroups = [
  {
    id: "journal",
    title: "Journal",
    links: [
      { id: "all-articles", label: "All articles", href: "#top" },
      { id: "design-systems", label: "Design systems", href: "#why-systems" },
    ],
  },
  {
    id: "resources",
    title: "Resources",
    links: [
      { id: "tokens", label: "Using tokens", href: "#tokens" },
      { id: "start", label: "Getting started", href: "#start-small" },
    ],
  },
];

const meta = {
  title: "Examples/Blog article",
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    docs: {
      description: {
        story:
          "A complete five-minute article about design systems and design tokens, composed with the library's editorial components.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const FiveMinuteRead: Story = {
  render: () => (
    <BlogLayout
      className={styles.site}
      id="top"
      footerGap="2xl"
      header={
        <Header
          className={styles.header}
          logo={<span className={styles.brand}>Fieldnotes<span aria-hidden="true">.</span></span>}
          logoHref="#top"
          logoLabel="Fieldnotes home"
          navItems={[
            { label: "Journal", href: "#top", current: true },
            { label: "Design systems", href: "#why-systems" },
            { label: "Practical guide", href: "#start-small" },
          ]}
          cta={
            <a className={styles.headerCta} href="#start-small">
              Start small
            </a>
          }
          size="md"
          borderBottom
        />
      }
      footer={
        <Footer
          className={styles.footer}
          brand="Fieldnotes"
          description="Thoughtful notes on building clear, consistent digital products."
          logoHref="#top"
          logoLabel="Fieldnotes home"
          linkGroups={footerGroups}
          copyright="© 2026 Fieldnotes Journal"
          size="sm"
          variant="surface"
        />
      }
    >
      <main className={styles.main}>
        <Breadcrumbs
          className={styles.breadcrumbs}
          items={[
            { label: "Home", href: "#top" },
            { label: "Journal", href: "#top" },
            { label: "Design systems", current: true },
          ]}
        />

        <ArticleBody
          aria-labelledby="article-title"
          className={styles.article}
        >
          <header className={styles.articleHeader}>
            <Badge size="sm" shape="rounded">Design practice</Badge>
            <h1 id="article-title">
              The quiet power of a design system
            </h1>
            <p className={styles.dek}>
              A shared set of patterns makes everyday product work clearer.
              Tokens turn those patterns into decisions your whole component
              library can reuse.
            </p>
            <div className={styles.byline}>
              <span className={styles.avatar} aria-hidden="true">ME</span>
              <span>
                <strong>Mara Ellis</strong>
                <span className={styles.authorRole}>Design systems editor</span>
              </span>
              <span className={styles.metaDivider} aria-hidden="true" />
              <time dateTime="2026-10-14">October 14, 2026</time>
              <span className={styles.readTime}>5 min read</span>
            </div>
            <figure className={styles.diagram}>
              <svg
                aria-labelledby="token-diagram-title"
                role="img"
                viewBox="0 0 960 420"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title id="token-diagram-title">
                  Design tokens connect shared decisions to reusable components and product pages
                </title>
                <rect
                  x="1"
                  y="1"
                  width="958"
                  height="418"
                  rx="24"
                  fill="var(--ds-color-surface-primary)"
                  stroke="var(--ds-color-border-control)"
                  strokeWidth="2"
                />
                <g fill="var(--ds-color-canvas)" stroke="var(--ds-color-border-control)" strokeWidth="2">
                  <rect x="42" y="74" width="226" height="272" rx="18" />
                  <rect x="367" y="74" width="226" height="272" rx="18" />
                  <rect x="692" y="74" width="226" height="272" rx="18" />
                </g>
                <g
                  fill="var(--ds-color-text-primary)"
                  fontFamily="system-ui, sans-serif"
                  fontSize="25"
                  fontWeight="700"
                >
                  <text x="70" y="120">TOKENS</text>
                  <text x="395" y="120">COMPONENTS</text>
                  <text x="720" y="120">PAGES</text>
                </g>
                <g
                  fill="var(--ds-color-text-muted)"
                  fontFamily="system-ui, sans-serif"
                  fontSize="18"
                >
                  <text x="70" y="174">color.action.primary</text>
                  <text x="70" y="221">space.4</text>
                  <text x="70" y="268">radius.control</text>
                  <text x="70" y="315">type.heading</text>
                  <text x="395" y="184">Button</text>
                  <text x="395" y="235">Card</text>
                  <text x="395" y="286">Form field</text>
                  <text x="720" y="184">Service page</text>
                  <text x="720" y="235">Booking flow</text>
                  <text x="720" y="286">Customer portal</text>
                </g>
                <g
                  fill="none"
                  stroke="var(--ds-color-action-primary-bg)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M286 210h66m-18-18 18 18-18 18" />
                  <path d="M611 210h66m-18-18 18 18-18 18" />
                </g>
                <circle cx="188" cy="318" r="7" fill="var(--ds-color-action-primary-bg)" />
              </svg>
              <figcaption>
                One clear decision can carry through a token, a component, and
                every page that uses it.
              </figcaption>
            </figure>
          </header>

          <div className={styles.articleGrid}>
            <div className={styles.articleCopy} data-testid="blog-article-copy">
              <section aria-labelledby="why-systems">
                <h2 id="why-systems">Why design systems matter</h2>
                <p>
                  A growing product collects small decisions. How rounded
                  should a button be? Which shade signals success? How much
                  space belongs between a label and its field? When each page
                  answers those questions on its own, the result can feel
                  subtly unfamiliar from one screen to the next. More
                  importantly, every new feature asks the team to solve the
                  same problems again.
                </p>
                <p>
                  A design system makes those decisions visible and reusable.
                  It is a shared language for how a product looks and behaves:
                  foundations such as color, type, and spacing; components
                  assembled from those foundations; and guidance that helps
                  people use them well. It gives designers and developers a
                  dependable starting point without requiring every screen to
                  look identical.
                </p>
              </section>

              <section aria-labelledby="tokens">
                <h2 id="tokens">Tokens make decisions reusable</h2>
                <p>
                  Design tokens are named values for decisions that matter
                  across an interface. A color token can stand for the main
                  action color; a spacing token can define the gap used inside
                  controls; a type token can establish the size of a page
                  heading. The name explains the job of the value, while the
                  stored value can change to suit a theme or product.
                </p>
                <p>
                  Without tokens, a component may contain a color as a hex
                  code, spacing as an unrelated number, and a radius selected
                  by eye. Those values can look right in isolation, but they
                  have no shared meaning. A token replaces a raw value with an
                  intentional choice. That makes the component easier to
                  understand, tune, and carry into a second theme.
                </p>
                <pre tabIndex={0} aria-label="Example of a button using design tokens">
                  <code>{`.button {
  background: var(--ds-color-action-primary-bg);
  color: var(--ds-color-action-primary-fg);
  padding-inline: var(--ds-button-md-padding-inline, var(--ds-space-4));
}`}</code>
                </pre>
                <p>
                  Here, the button does not need to know the brand’s exact
                  color or the spacing scale’s current measurement. It asks
                  for the primary action color and a medium button’s inline
                  padding. A theme can then change the values without making
                  the component’s purpose harder to read.
                </p>
              </section>

              <section aria-labelledby="one-change">
                <h2 id="one-change">One change, many surfaces</h2>
                <p>
                  The most visible benefit is consistency. If buttons,
                  navigation, form fields, and notices all refer to the same
                  semantic color tokens, a palette update can reach every
                  component that depends on it. A new campaign or a dark theme
                  no longer requires a hunt for repeated color values spread
                  through stylesheets.
                </p>
                <p>
                  Tokens also make the system adaptable. Semantic names like
                  “text muted” or “surface primary” describe a role instead
                  of a hue. In one theme, a surface might be white; in another,
                  it might be a deep navy. The component can keep using the
                  surface token, and the theme supplies the appropriate
                  contrast.
                </p>
                <table tabIndex={0}>
                  <caption>Examples of token names and the decisions they carry</caption>
                  <thead>
                    <tr>
                      <th scope="col">Token</th>
                      <th scope="col">Decision shared across the library</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row"><code>color.action.primary</code></th>
                      <td>How the main action is identified</td>
                    </tr>
                    <tr>
                      <th scope="row"><code>space.4</code></th>
                      <td>A repeatable gap or padding step</td>
                    </tr>
                    <tr>
                      <th scope="row"><code>radius.control</code></th>
                      <td>The shape language used by controls</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section aria-labelledby="shared-language">
                <h2 id="shared-language">A shared language for teams</h2>
                <p>
                  A system helps people coordinate because the choices have
                  names. A designer can ask for the “compact control spacing”
                  instead of describing a measurement from a screenshot. A
                  developer can find the semantic token used by the
                  component rather than guessing which of several similar
                  grays is correct. A reviewer can discuss the intended role
                  of a color, not just its value.
                </p>
                <p>
                  That shared vocabulary is useful for a small team as well as
                  a large one. It reduces the number of decisions that need
                  lengthy handoffs, helps new contributors learn the product,
                  and gives feedback a clear place to land. When a pattern
                  needs to change, the conversation can start with the reason
                  and scope instead of a list of scattered files.
                </p>
              </section>

              <section aria-labelledby="what-to-tokenize">
                <h2 id="what-to-tokenize">What to tokenize first</h2>
                <p>
                  A useful token set starts with repeated decisions, not with
                  an attempt to name every pixel. Look for values that appear
                  across several components or that the team expects to
                  change for themes, accessibility, or a rebrand. Common
                  places to begin include:
                </p>
                <ul>
                  <li>Semantic colors for text, surfaces, borders, and actions.</li>
                  <li>A spacing scale used by layouts, cards, and form controls.</li>
                  <li>Typography roles for body text, labels, and headings.</li>
                  <li>Radii, focus rings, and motion values shared by controls.</li>
                </ul>
                <p>
                  Keep the vocabulary small enough to use consistently. If two
                  names always mean the same thing, consider whether one is
                  unnecessary. If a value appears only once and has no
                  foreseeable role elsewhere, it may be better left local.
                  The goal is not maximum abstraction; it is making recurring
                  intent easy to recognize.
                </p>
              </section>

              <section aria-labelledby="keep-it-healthy">
                <h2 id="keep-it-healthy">Keep the system healthy</h2>
                <p>
                  Tokens deliver value when components actually use them.
                  Document the names, explain what they control, and make the
                  right values easy to discover in the component library.
                  Include examples of the same component in multiple themes
                  so contributors can see which decisions are shared and
                  which are intentionally different.
                </p>
                <p>
                  It also helps to set boundaries. A one-off visual treatment
                  can be a local override; a value that repeats across the
                  product may deserve a shared token. When a token changes,
                  check the components and stories that depend on it.
                  Contrast, focus visibility, responsive layouts, and
                  disabled states can all shift when a color or dimension
                  changes.
                </p>
                <Callout tone="info" title="A practical rule">
                  Promote a value to a token when it expresses a repeated
                  design decision, not simply because it appears in a style.
                </Callout>
              </section>

              <section aria-labelledby="start-small">
                <h2 id="start-small">Start small and learn</h2>
                <p>
                  You do not need a large platform project to get started.
                  Choose one small, visible area such as buttons and form
                  fields. Identify their repeated colors, spacing, and
                  typography, give those values clear names, then update the
                  components to use them. Add a second theme or a contrast
                  check; it will show whether the names describe intent or
                  merely repeat today’s appearance.
                </p>
                <p>
                  Once the pattern is useful, extend it to nearby components.
                  Keep the examples current, invite feedback from the people
                  who use the library, and remove tokens that do not help
                  anyone make a better choice. A design system is not a
                  finished catalogue. It is a practical agreement that grows
                  alongside the product.
                </p>
                <p>
                  The quiet power is in that agreement: shared decisions make
                  each new interface easier to build, easier to review, and
                  more familiar to the people who rely on it.
                </p>
              </section>
            </div>

            <aside className={styles.contents}>
              <ArticleTableOfContents
                aria-label="In this article"
                heading="In this article"
                items={sections}
              />
            </aside>
          </div>
        </ArticleBody>

        <section className={styles.nextRead} aria-labelledby="next-read-title">
          <div>
            <p className={styles.eyebrow}>Keep exploring</p>
            <h2 id="next-read-title">Make the next decision easier.</h2>
            <p>
              Start with one shared choice, give it a useful name, and let
              your components carry it forward.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => document.getElementById("tokens")?.scrollIntoView({
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
              block: "start",
            })}
          >
            Revisit the token examples
          </Button>
        </section>
      </main>
    </BlogLayout>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const article = canvas.getByRole("article", {
      name: "The quiet power of a design system",
    });
    await expect(article).toBeVisible();
    await expect(canvas.getByText("5 min read", { exact: true })).toBeVisible();
    const copy = canvas.getByTestId("blog-article-copy");
    const wordCount = (copy.textContent ?? "").trim().split(/\s+/).filter(Boolean).length;
    expect(wordCount).toBeGreaterThanOrEqual(850);
    expect(wordCount).toBeLessThanOrEqual(1_150);
    const navigation = canvas.getByRole("navigation", { name: "In this article" });
    const links = within(navigation).getAllByRole("link");
    expect(links).toHaveLength(sections.length);
    for (const link of links) {
      const href = link.getAttribute("href");
      expect(href).toBeTruthy();
      expect(canvasElement.querySelector(href!)).not.toBeNull();
    }
    const nextRead = canvas.getByRole("region", {
      name: "Make the next decision easier.",
    });
    const footer = canvas.getByRole("contentinfo");
    expect(
      footer.getBoundingClientRect().top - nextRead.getBoundingClientRect().bottom,
    ).toBeGreaterThanOrEqual(48);
  },
};
