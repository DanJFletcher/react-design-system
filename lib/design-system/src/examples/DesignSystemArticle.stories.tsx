import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import {
  ArticleBody,
  ArticleFootnote,
  ArticleFootnotes,
  ArticleTableOfContents,
  Badge,
  BlogLayout,
  Breadcrumbs,
  Button,
  Callout,
  Footer,
  Header,
} from "../index";
import type { ArticleFootnoteEntry } from "../components/ArticleFootnotes/ArticleFootnotes";
import styles from "./DesignSystemArticle.module.css";

const contents = [
  { id: "a-library-is-more-than-code", label: "A library is more than code" },
  { id: "start-with-decisions", label: "Start with decisions" },
  { id: "turn-decisions-into-components", label: "Turn decisions into components" },
  { id: "make-composition-the-default", label: "Make composition the default" },
  { id: "documentation-is-part-of-the-interface", label: "Documentation is part of the interface" },
  { id: "quality-grows-through-feedback", label: "Quality grows through feedback" },
  { id: "adopt-the-system-in-small-steps", label: "Adopt the system in small steps" },
  { id: "measure-what-the-system-gives-back", label: "Measure what the system gives back" },
] as const;

const sources: readonly ArticleFootnoteEntry[] = [
  {
    id: "source-uswds-tokens",
    label: "1",
    content: (
      <>
        U.S. Web Design System, “Design tokens.” The guide describes tokens as
        curated, discrete values for visual decisions such as color, spacing,
        and typography.{" "}
        <a href="https://designsystem.digital.gov/design-tokens/" target="_blank" rel="noreferrer">
          Read the USWDS token guide
        </a>
        .
      </>
    ),
    backlinks: [{ id: "citation-uswds-tokens" }],
  },
  {
    id: "source-uswds-documentation",
    label: "2",
    content: (
      <>
        U.S. Web Design System, “How to use USWDS.” It describes tokens as
        building blocks for components, and components as building blocks for a
        site or service; it also recommends incremental adoption.{" "}
        <a href="https://designsystem.digital.gov/documentation/" target="_blank" rel="noreferrer">
          Read the USWDS overview
        </a>
        .
      </>
    ),
    backlinks: [{ id: "citation-uswds-documentation" }],
  },
  {
    id: "source-govuk-criteria",
    label: "3",
    content: (
      <>
        GOV.UK Design System, “Contribution criteria.” The criteria ask
        whether a proposed pattern is useful and unique, and review
        implementations for usability, consistency, and versatility.{" "}
        <a
          href="https://design-system.service.gov.uk/community/contribution-criteria/"
          target="_blank"
          rel="noreferrer"
        >
          Read GOV.UK contribution criteria
        </a>
        .
      </>
    ),
    backlinks: [
      { id: "citation-govuk-criteria" },
      { id: "citation-govuk-criteria-repeat" },
    ],
  },
  {
    id: "source-dtcg-spec",
    label: "4",
    content: (
      <>
        Design Tokens Community Group, “Design Tokens Technical Reports
        2025.10.” This stable Community Group Report describes a format for
        exchanging design-token data; it explicitly states that it is not a W3C
        Standard.{" "}
        <a href="https://www.designtokens.org/TR/2025.10/" target="_blank" rel="noreferrer">
          Read the Design Tokens specification
        </a>
        .
      </>
    ),
    backlinks: [{ id: "citation-dtcg-spec" }],
  },
];

const footerGroups = [
  {
    id: "article",
    title: "In this article",
    links: [
      { id: "footer-tokens", label: "Start with decisions", href: "#start-with-decisions" },
      { id: "footer-components", label: "Build components", href: "#turn-decisions-into-components" },
    ],
  },
  {
    id: "library",
    title: "Explore the library",
    links: [
      { id: "footer-docs", label: "Component documentation", href: "#documentation-is-part-of-the-interface" },
      { id: "footer-quality", label: "Quality and feedback", href: "#quality-grows-through-feedback" },
    ],
  },
];

const meta = {
  title: "Examples/Design system article",
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    docs: {
      description: {
        story:
          "A long-form, roughly twelve-minute guide to using design-system decisions and tokens to shape a coherent component library.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const TwelveMinuteRead: Story = {
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
            { label: "Design systems", href: "#a-library-is-more-than-code" },
            { label: "Components", href: "#turn-decisions-into-components" },
          ]}
          size="md"
          borderBottom
        />
      }
      footer={
        <Footer
          className={styles.footer}
          brand="Fieldnotes"
          description="Practical notes for teams building clear, consistent digital products."
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

        <ArticleBody aria-labelledby="article-title" className={styles.article}>
          <header className={styles.articleHeader}>
            <Badge size="sm" shape="rounded">Design practice</Badge>
            <h1 id="article-title">
              From shared decisions to a component library people can trust
            </h1>
            <p className={styles.dek}>
              A design system is not a shelf of polished controls. It is the
              shared set of decisions, tools, and guidance that helps a team
              turn user needs into consistent product experiences.
            </p>
            <div className={styles.byline}>
              <span className={styles.avatar} aria-hidden="true">FL</span>
              <span>
                <strong>Fieldnotes editors</strong>
                <span className={styles.authorRole}>Design systems and product engineering</span>
              </span>
              <span className={styles.metaDivider} aria-hidden="true" />
              <time dateTime="2026-10-15">October 15, 2026</time>
              <span className={styles.readTime}>12 min read</span>
            </div>
          </header>

          <ArticleTableOfContents
            className={styles.contents}
            aria-label="In this article"
            heading="In this article"
            headingLevel={2}
            items={contents}
          />

          <div className={styles.articleCopy} data-testid="article-copy">
            <p>
              Most product teams do not set out to create inconsistency. It
              arrives one reasonable decision at a time: a slightly different
              button on a new page, another shade chosen to improve contrast, a
              form label with its own spacing rule. Each choice solves a local
              problem. Over time, however, the product begins to ask its team
              the same questions again and again.
            </p>
            <p>
              A design system gives those decisions a place to live and a
              language people can share. Its tokens name recurring visual
              roles, its components package repeated behavior, and its
              documentation explains when to use each pattern. When these
              pieces support one another, a component library becomes more
              than reusable code: it becomes a reliable way to make the next
              product decision.
            </p>

            <section aria-labelledby="a-library-is-more-than-code">
              <h2 id="a-library-is-more-than-code">A library is more than code</h2>
              <p>
                A component library is often the most visible part of a design
                system because developers import it and users see it on screen.
                But components alone cannot answer why a control looks or
                behaves a certain way. Without shared foundations, each
                component can carry its own colors, dimensions, and interaction
                assumptions. Reuse then spreads the code without spreading the
                intent.
              </p>
              <p>
                The system around the library explains that intent. It connects
                user needs to design principles, principles to semantic
                tokens, tokens to component APIs, and those APIs to examples
                people can adapt. This relationship is what makes it possible
                to improve an underlying decision once and have the
                improvement carry through multiple interfaces. The code is
                essential, but it is only one layer in the agreement.
              </p>

              <h3>A shared system reduces repeated decisions</h3>
              <p>
                Consider a new settings page. The team needs a heading,
                explanatory text, a text field, a select, a save action, and
                feedback after submission. Without a system, the design and
                implementation work begins with a series of small debates:
                which neutral border, what radius, how large the target, which
                focus treatment, and how the success message is announced.
                None of these decisions is difficult in isolation, but repeating
                them across every feature consumes time and makes review less
                meaningful.
              </p>
              <h3>Consistency creates useful momentum</h3>
              <p>
                Consistency is valuable because it helps people recognize
                familiar patterns, not because every page should look
                identical. A button that keeps its meaning, focus behavior,
                and visual treatment across a booking flow is easier to
                understand than a button whose meaning changes with each
                screen. The product can still make room for distinctive
                content, brand expression, and specialized workflows.
              </p>
              <Callout tone="info" title="The useful question">
                Ask whether a shared decision will help people make the next
                interface clearer—not whether another component can be added
                to the catalogue.
              </Callout>
            </section>

            <section aria-labelledby="start-with-decisions">
              <h2 id="start-with-decisions">Start with decisions, not components</h2>
              <p>
                Tokens make those decisions explicit. They turn a raw value
                into a named choice that components can consume and themes
                can change. USWDS describes its design tokens as curated
                discrete values for visual decisions, rather than leaving
                every implementation to choose from an unlimited range.<ArticleFootnote
                  id="citation-uswds-tokens"
                  noteId="source-uswds-tokens"
                  label="1"
                /> The important idea is not that every team needs the same
                token list. It is that the names and scales express decisions
                the team wants to reuse.
              </p>

              <h3>Give tokens semantic jobs</h3>
              <p>
                A token called <code>pink-500</code> describes a palette
                location. A token called <code>color.action.primary</code>
                describes a responsibility. The second name can continue to
                make sense if the brand palette changes, if a dark theme
                reverses the contrast, or if another product uses a different
                hue. Semantic names help component authors ask for the role
                they need instead of guessing which raw value fits.
              </p>
              <pre tabIndex={0} aria-label="CSS component styles using semantic design tokens">
                <code>{`.ds-button {
  color: var(--ds-color-action-primary-fg);
  background: var(--ds-color-action-primary-bg);
  border: var(--ds-border-width-default) solid
    var(--ds-color-border-control);
  padding-inline: var(--ds-space-4);
  border-radius: var(--ds-radius-control);
}

.ds-button:focus-visible {
  outline: var(--ds-focus-width) solid
    var(--ds-color-focus-ring);
  outline-offset: var(--ds-focus-offset);
}`}</code>
              </pre>
              <h3>Keep the map intentionally small</h3>
              <p>
                Tokenizing every isolated pixel produces a large vocabulary
                without necessarily improving reuse. Begin with values that
                recur, values likely to vary by theme or accessibility need,
                and values that define a recognizable product role. If two
                tokens always change together and mean the same thing, they
                may be redundant. If a value is genuinely unique to one
                illustration, keeping it local may be more honest than
                promoting it into the shared contract.
              </p>
            </section>

            <section aria-labelledby="turn-decisions-into-components">
              <h2 id="turn-decisions-into-components">Turn decisions into components</h2>
              <p>
                Once recurring decisions have names, components can consume
                them consistently. A component should own one recognizable
                responsibility: a button communicates and performs an
                action; a field labels and captures a value; a callout
                highlights a message. Keeping each component’s purpose clear
                makes it easier to reuse, test, document, and compose.
              </p>
              <p>
                The U.S. Web Design System describes tokens as building blocks
                for components, then components as building blocks for a site
                or service. Its adoption guidance also recommends moving
                incrementally rather than treating a system as an all-or-
                nothing migration.<ArticleFootnote
                  id="citation-uswds-documentation"
                  noteId="source-uswds-documentation"
                  label="2"
                /> This is a practical sequence for a product team: make
                shared decisions visible, connect one high-value component
                to them, and then expand the pattern where it proves useful.
              </p>

              <h3>Design the component contract</h3>
              <p>
                A reusable component needs a contract, not just a visual
                appearance. Define its semantic element, content slots,
                supported variants, states, and customization points. Decide
                which state belongs to the component and which belongs to
                the application. For a button, disabled behavior is native
                and local; whether a request is still saving may be owned by
                the form or page and passed in as a loading state.
              </p>
              <pre tabIndex={0} aria-label="A component API composed from existing design-system components">
                <code>{`function SaveDraft({ onSave, saving }) {
  return (
    <div className="editor-actions">
      <Button
        variant="primary"
        loading={saving}
        onClick={onSave}
      >
        Save draft
      </Button>
      {saving && (
        <Callout tone="info" title="Saving changes">
          Keep this page open while the draft is saved.
        </Callout>
      )}
    </div>
  );
}`}</code>
              </pre>
              <h3>Build behavior into the shared layer</h3>
              <p>
                Visual consistency is only part of the benefit. When
                keyboard navigation, focus visibility, disabled states,
                reduced motion, and responsive behavior are considered in
                the shared layer, every adopting feature starts from a
                stronger baseline. A component should use native browser
                behavior where that serves the task, and add custom
                interaction only when it provides a clear improvement.
              </p>
            </section>

            <section aria-labelledby="make-composition-the-default">
              <h2 id="make-composition-the-default">Make composition the default</h2>
              <p>
                Product interfaces are made from relationships between
                components. A sign-up form has labels, fields, help text,
                validation, and a submit action. A publishing page combines
                navigation, metadata, an editor, a preview, and a state
                summary. The component library supplies reliable parts; a
                pattern or page shell explains how those parts work together.
              </p>
              <h3>Let components cooperate without becoming entangled</h3>
              <p>
                Components should fit together through stable, understandable
                interfaces. A field can expose a label, description, error,
                and native input props. A form can arrange several fields,
                group related choices, and decide how submission works.
                The field does not need to know which API endpoint receives
                its value. The form does not need to reimplement how the
                field announces an error.
              </p>
              <h3>Know when a pattern deserves a shared home</h3>
              <p>
                A repeated layout does not automatically need a new
                component. First ask whether it solves a common user need,
                whether an existing component already covers it, and whether
                the new behavior can work in more than one context. The
                GOV.UK Design System’s contribution criteria use questions
                of usefulness and uniqueness for proposals, then assess
                implementations for usability, consistency, and
                versatility.<ArticleFootnote
                  id="citation-govuk-criteria"
                  noteId="source-govuk-criteria"
                  label="3"
                /> These are useful checks for any library, even when its
                audience and governance model differ.
              </p>
            </section>

            <section aria-labelledby="documentation-is-part-of-the-interface">
              <h2 id="documentation-is-part-of-the-interface">
                Documentation is part of the interface
              </h2>
              <p>
                A package is not easy to reuse if its consumers cannot
                discover what it does. Documentation helps people move from
                “this component exists” to “this is the right component for
                my task.” It should explain the use case, expected content,
                behavior, states, accessibility requirements, and
                customization boundary—not merely repeat a prop table.
              </p>
              <p>
                Examples make those contracts concrete. A playground helps
                an author explore supported options. A focused usage example
                shows the smallest sensible composition. A complete page
                demonstrates how components and tokens work together in a
                realistic flow. These examples should use the actual library
                components, so the documentation teaches the supported API
                instead of a parallel implementation that will drift.
              </p>

              <h3>Show the states people actually encounter</h3>
              <p>
                A default state is rarely the whole component. Include
                disabled, loading, empty, invalid, selected, expanded, and
                narrow-screen cases where they apply. Show keyboard focus
                in an interactive story, and show what happens when content
                is long or missing. If a component animates, demonstrate
                reduced-motion behavior too. Readers should be able to
                recognize the component’s boundaries before they depend on
                it.
              </p>
              <p>
                A full example article can teach several things at once:
                heading hierarchy, navigation to sections, citation
                backlinks, callouts, and scrollable code samples. It also
                tests whether the components remain readable when they are
                composed into a long page. Realistic examples are useful
                precisely because they make gaps between isolated
                components visible.
              </p>

              <h3>Make examples honest and transferable</h3>
              <p>
                Mark illustrative content as a demo, use meaningful names,
                and make source claims traceable. Avoid hidden dependencies
                on a demo’s application state or on one brand’s unexported
                CSS. Where a code sample omits production concerns, say so.
                A reader should be able to distinguish a supported library
                contract from a short teaching example.
              </p>
              <p>
                Keep examples close to the components they document and
                verify them as part of the same workflow. If a prop changes,
                the examples should tell the truth. If an example is
                removed, documentation that relies on it should be updated
                rather than left pointing to a missing story. The library’s
                learning experience is part of the product quality.
              </p>
            </section>

            <section aria-labelledby="quality-grows-through-feedback">
              <h2 id="quality-grows-through-feedback">Quality grows through feedback</h2>
              <p>
                A shared component magnifies both good and bad decisions.
                That makes quality checks important, but it also makes them
                more efficient: one test can protect behavior used in many
                places. Build a layered check around the contracts that
                matter. Type checks catch invalid usage; unit and story
                tests cover state transitions; browser checks verify focus,
                responsive layout, and actual rendering.
              </p>
              <p>
                Test semantic behavior, not only a screenshot. Does a menu
                button expose its expanded state? Can a keyboard user reach
                the close control? Does a field associate its description
                and error? Can a dialog return focus to its trigger? Screenshots
                are valuable for visual regressions, but they cannot prove
                that an interaction is understandable or operable.
              </p>

              <h3>Test the system’s real variation points</h3>
              <p>
                Themes, density settings, custom hooks, and nested theme
                boundaries are not decorative edge cases when the library
                supports them. Verify that a semantic token remains
                readable in each supported theme and that component hooks
                do not leak across nested boundaries. Check long text,
                forced-colors mode, zoom, and reduced motion wherever
                those conditions change the experience.
              </p>
              <p>
                A useful strategy tests high-risk contracts deeply and
                representative combinations broadly. Every component can
                receive baseline semantic and interaction checks. A
                theme-specific shadow or border rule deserves a targeted
                visual assertion. A complex responsive menu deserves
                focused viewport tests. This is more dependable than
                treating every prop combination as equally important or
                attempting an unbounded matrix.
              </p>

              <h3>Keep contribution review focused on user outcomes</h3>
              <p>
                Contribution criteria help reviewers discuss evidence
                instead of preference. Is the task common enough to share?
                Is the pattern distinct from what already exists? Has it
                been evaluated with the people who need it? Can the
                implementation adapt across contexts without becoming
                difficult to understand? Clear questions make it easier to
                say yes, ask for changes, or keep a one-off local.
              </p>
              <p>
                Review is not a gate for its own sake. It is how a system
                protects users from inaccessible defaults and consumers
                from unstable contracts. GOV.UK publishes explicit criteria
                and a review path for proposed and developed patterns,
                including consistency with existing styles and testing
                across contexts.<ArticleFootnote
                  id="citation-govuk-criteria-repeat"
                  noteId="source-govuk-criteria"
                  label="3"
                /> A smaller library with clear rationale can serve teams
                better than a larger collection with uncertain behavior.
              </p>

              <Callout tone="warning" title="A useful boundary">
                Promote a pattern when shared behavior improves the user
                experience across contexts. Keep local details local when
                sharing them would add complexity without adding value.
              </Callout>
            </section>

            <section aria-labelledby="adopt-the-system-in-small-steps">
              <h2 id="adopt-the-system-in-small-steps">Adopt the system in small steps</h2>
              <p>
                A design system is more likely to earn trust when it solves
                visible problems in the work teams already do. Avoid
                beginning with a long migration plan that asks every product
                to stop and replace everything at once. Choose a surface
                where repeated decisions are obvious, the user impact is
                meaningful, and the team can observe whether the change
                helped.
              </p>

              <h3>1. Find a repeated experience</h3>
              <p>
                Review a small set of real screens and note recurring
                controls, styles, and behavior. Talk with the people who
                build and use them. Look for the places where teams copy
                code, debate the same values, work around an awkward
                component, or receive repeated user feedback. The goal is
                not to catalogue every pixel; it is to understand which
                shared decisions would remove friction or prevent a
                recurring mistake.
              </p>

              <h3>2. Name the intent and the constraints</h3>
              <p>
                Write down what a pattern is for, who uses it, and what
                would make it successful. Define tokens around those
                purposes, then note the constraints that protect meaning:
                minimum target sizes, contrast requirements, supported
                heading levels, error behavior, and responsive changes.
                Bring designers, engineers, content specialists, and
                accessibility expertise into this step so the contract
                reflects the whole experience.
              </p>

              <h3>3. Build one useful slice</h3>
              <p>
                Choose a modest set of components that makes the experience
                complete. A button and field without their labels,
                validation, focus behavior, or documentation may not reduce
                much work. A small but coherent slice can include the
                components, tokens, stories, and guidance needed to
                implement a real task. This is enough to test whether the
                proposed abstractions are useful before widening the scope.
              </p>

              <h3>4. Put the slice into a real workflow</h3>
              <p>
                Use the components in an actual page or flow and invite
                the team to report what is missing. Watch for repeated
                overrides: they may signal a missing token, a poor default,
                or a context-specific need that should stay local. Observe
                what users do, and check whether the shared pattern helps
                them complete their task. A component can be technically
                reusable and still fail to address the underlying need.
              </p>

              <h3>5. Improve the contract before scaling</h3>
              <p>
                Incorporate evidence into the API and documentation, then
                repeat the process with a neighboring problem. Avoid
                turning one product’s first version into an irreversible
                standard. Keep the API small until multiple uses reveal
                which options are genuinely necessary. When a new variant
                is proposed, ask whether it represents a recurring design
                decision or merely captures a local exception.
              </p>
            </section>

            <section aria-labelledby="measure-what-the-system-gives-back">
              <h2 id="measure-what-the-system-gives-back">Measure what the system gives back</h2>
              <p>
                Counting components can show growth, but it cannot show
                whether the system is helping. Look at outcomes that relate
                to the work: how long it takes to implement a common flow,
                how often teams duplicate patterns, how many overrides
                appear, how quickly a bug can be fixed across products,
                and whether keyboard and screen-reader checks are passed
                earlier in development.
              </p>
              <p>
                Pair numbers with the experiences behind them. A shorter
                implementation time is not a win if the resulting page is
                harder to understand. A high adoption rate does not prove
                that consumers can customize the system safely. Feedback
                from developers and designers can identify confusing
                documentation; user research can show whether a
                standardized pattern actually helps people complete a task.
                Treat each signal as evidence to investigate, not a score
                to optimize in isolation.
              </p>

              <h3>Use portability without confusing it for quality</h3>
              <p>
                Teams with multiple design tools or platforms may also
                benefit from interoperable token formats. The Design Tokens
                Community Group’s 2025.10 report defines a stable way to
                represent and exchange token data across tools.<ArticleFootnote
                  id="citation-dtcg-spec"
                  noteId="source-dtcg-spec"
                  label="4"
                /> That can reduce translation work between design and
                implementation, but a file format does not decide which
                tokens a product needs, whether a contrast pair is
                accessible, or how a component should behave. Portability
                moves decisions; good system design still requires people
                to make and validate them.
              </p>
            </section>

            <section aria-labelledby="the-system-is-an-agreement">
              <h2 id="the-system-is-an-agreement">The system is an agreement that keeps learning</h2>
              <p>
                A useful design system connects more than styles and
                components. It makes design intent legible to the people
                who implement, review, maintain, and use a product. Tokens
                express recurring decisions. Components provide dependable
                behavior. Patterns show how pieces work together.
                Documentation makes those choices teachable, while
                research and review keep them accountable to real needs.
              </p>
              <p>
                Start with the decisions your team repeats, give those
                decisions names that describe their purpose, and connect
                them to a small set of components people can use in real
                work. Add examples and tests that demonstrate the
                contract. Then listen for evidence that the system is
                saving effort, improving consistency, or removing
                barriers—and revise it when the evidence points elsewhere.
              </p>
              <p>
                The goal is not to centralize every choice. It is to make
                the important shared choices easier to find, safer to
                reuse, and simpler to improve. When a component library
                grows from that foundation, it can help a team move faster
                without making its products feel less thoughtful.
              </p>
            </section>

            <blockquote>
              <p>
                A component library should make a good decision easier to
                repeat—and make a better decision easier to share.
              </p>
            </blockquote>
          </div>

          <ArticleFootnotes
            className={styles.sources}
            heading="Sources"
            headingLevel={2}
            items={sources}
          />
        </ArticleBody>

        <section className={styles.nextRead} aria-labelledby="next-read-title">
          <div>
            <p className={styles.eyebrow}>Keep building</p>
            <h2 id="next-read-title">Make one shared decision easier to reuse.</h2>
            <p>
              Start with a repeated user need, name the intent, and let the
              right component carry that decision into the next page.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => document.getElementById("start-with-decisions")?.scrollIntoView({
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
              block: "start",
            })}
          >
            Revisit the starting points
          </Button>
        </section>
      </main>
    </BlogLayout>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const article = canvas.getByRole("article", {
      name: "From shared decisions to a component library people can trust",
    });
    await expect(article).toBeVisible();
    await expect(canvas.getByText("12 min read", { exact: true })).toBeVisible();
    await expect(canvas.getAllByRole("heading", { level: 2 })[0]).toBeVisible();
    await expect(canvas.getAllByRole("heading", { level: 3 })[0]).toBeVisible();
    await expect(canvas.getByRole("navigation", { name: "In this article" })).toBeVisible();
    await expect(canvas.getByText("The useful question")).toBeVisible();
    await expect(canvas.getByText("A useful boundary")).toBeVisible();
    await expect(canvas.getByRole("heading", { name: "Sources", level: 2 })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Read the Design Tokens specification" })).toHaveAttribute(
      "href",
      "https://www.designtokens.org/TR/2025.10/",
    );
    const wordCount = (canvas.getByTestId("article-copy").textContent ?? "")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    expect(wordCount).toBeGreaterThanOrEqual(2_100);
    expect(wordCount).toBeLessThanOrEqual(2_700);
    const citationLinks = article.querySelectorAll('a[id^="citation-"]');
    expect(citationLinks).toHaveLength(5);
    citationLinks.forEach((citation) => {
      const target = citation.getAttribute("href");
      expect(target).toBeTruthy();
      expect(article.querySelector(target!)).not.toBeNull();
    });
  },
};
