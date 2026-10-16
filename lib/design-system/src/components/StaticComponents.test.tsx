import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Accordion } from "./Accordion/Accordion";
import { AnnouncementBar } from "./AnnouncementBar/AnnouncementBar";
import { ArticleBody } from "./ArticleBody/ArticleBody";
import { ArticleCard } from "./ArticleCard/ArticleCard";
import { ArticleFootnote, ArticleFootnotes } from "./ArticleFootnotes/ArticleFootnotes";
import { ArticleTableOfContents } from "./ArticleTableOfContents/ArticleTableOfContents";
import { Callout } from "./Callout/Callout";
import { Card } from "./Card/Card";
import { ContentPreview } from "./ContentPreview/ContentPreview";
import { FAQSection } from "./FAQSection/FAQSection";
import { Footer } from "./Footer/Footer";
import { Hero } from "./Hero/Hero";
import { BlogLayout } from "./Layout/BlogLayout";
import { Container } from "./Layout/Container";
import { Grid } from "./Layout/Grid";
import { Inline } from "./Layout/Inline";
import { Stack } from "./Layout/Stack";
import { VisuallyHidden } from "./Layout/VisuallyHidden";
import { Heading, Text } from "./Typography/Typography";

describe("article components", () => {
  it("renders article content and forwards article attributes", () => {
    const { rerender } = render(
      <ArticleBody aria-label="Article text" className="reader" data-testid="body">
        <p>Readable content</p>
      </ArticleBody>,
    );
    expect(screen.getByRole("article", { name: "Article text" })).toHaveClass("reader");
    expect(screen.getByText("Readable content")).toBeInTheDocument();
    rerender(<ArticleBody data-testid="body"><p>Updated</p></ArticleBody>);
    expect(screen.getByText("Updated")).toBeInTheDocument();
  });

  it("renders article card metadata, imagery, category links, and optional read action", () => {
    const { rerender } = render(
      <ArticleCard
        author={{ name: "A. Writer", href: "/authors/a", avatarSrc: "/a.png", avatarAlt: "A Writer" }}
        category={{ label: "Gardening", href: "/topics/gardening" }}
        excerpt={<p>Growing tips</p>}
        href="/articles/soil"
        image={{ src: "/soil.jpg", alt: "Rich soil", loading: "eager", className: "cover" }}
        publishedAt={{ dateTime: "2026-10-16", label: "October 16, 2026" }}
        readingTime="5 min read"
        title="Healthy soil"
      />,
    );
    expect(screen.getByRole("link", { name: "Healthy soil" })).toHaveAttribute("href", "/articles/soil");
    expect(screen.getByRole("link", { name: "Gardening" })).toHaveAttribute("href", "/topics/gardening");
    expect(screen.getByRole("img", { name: "Rich soil" })).toHaveAttribute("loading", "eager");
    expect(screen.getByRole("img", { name: "A Writer" })).toHaveAttribute("src", "/a.png");
    expect(screen.getByRole("link", { name: "A. Writer" })).toHaveAttribute("href", "/authors/a");
    expect(screen.getByText("October 16, 2026").closest("time")).toHaveAttribute("datetime", "2026-10-16");
    expect(screen.getByRole("link", { name: "Read article: Healthy soil" })).toHaveAttribute("href", "/articles/soil");
    rerender(
      <ArticleCard
        author={{ name: "Writer" }}
        category={{ label: "Notes" }}
        href="/articles/next"
        image={{ src: "/next.png", alt: "" }}
        readMoreLabel="Open"
        showReadMore={false}
        title="Next article"
      />,
    );
    expect(screen.getByText("Writer")).toBeInTheDocument();
    expect(screen.getByText("Notes")).toBeInTheDocument();
    expect(screen.getByRole("presentation")).toHaveAttribute("decoding", "async");
    expect(screen.queryByRole("link", { name: /Open:/ })).not.toBeInTheDocument();
  });

  it("renders a sparse article card without media, category, or metadata", () => {
    const { container } = render(
      <>
        <ArticleCard href="/articles/brief" showReadMore={false} title="Brief update" />
        <ArticleCard author={{ name: "Contributor", avatarSrc: "/contributor.png" }} href="/articles/byline" showReadMore={false} title="Byline" />
      </>,
    );
    expect(screen.getByRole("link", { name: "Brief update" })).toHaveAttribute("href", "/articles/brief");
    expect(screen.getByRole("link", { name: "Byline" })).toHaveAttribute("href", "/articles/byline");
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
    expect(screen.queryByRole("link", { name: /Read article:/ })).not.toBeInTheDocument();
  });

  it("connects footnote markers, notes, and localized backlinks", () => {
    render(
      <>
        <p>Research <ArticleFootnote aria-label="Source one" id="cite-1" label={1} noteId="note-1" />.</p>
        <p>Second source <ArticleFootnote id="cite-3" label={3} noteId="note-3" />.</p>
        <ArticleFootnotes
          backlinkLabel="Return to citation"
          className="notes"
          heading="Sources"
          headingLevel={3}
          items={[
            { id: "note-1", label: 1, content: "Reference text", backlinks: [{ id: "cite-1" }, { id: "cite-2", ariaLabel: "Return to second citation" }] },
          ]}
        />
      </>,
    );
    expect(screen.getByRole("link", { name: "Source one" })).toHaveAttribute("href", "#note-1");
    expect(screen.getByRole("region", { name: "Sources" })).toHaveClass("notes");
    expect(screen.getByRole("heading", { level: 3, name: "Sources" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Return to citation 1 for footnote 1" })).toHaveAttribute("href", "#cite-1");
    expect(screen.getByRole("link", { name: "Return to second citation" })).toHaveAttribute("href", "#cite-2");
    expect(screen.getByRole("link", { name: "Footnote 3" })).toHaveAttribute("href", "#note-3");
  });

  it("renders a named table of contents with fragment links", () => {
    render(
      <ArticleTableOfContents
        aria-label="Contents navigation"
        heading="In this article"
        headingLevel={4}
        items={[{ id: "intro", label: "Introduction" }, { id: "care", label: "Care" }]}
      />,
    );
    expect(screen.getByRole("navigation", { name: "Contents navigation" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 4, name: "In this article" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Care" })).toHaveAttribute("href", "#care");
  });
});

describe("content and layout components", () => {
  it("renders callout optional content and ignores boolean icons", () => {
    const { rerender } = render(
      <Callout action={<button>Retry</button>} icon={<span>!</span>} title="Network" tone="warning">
        Connection interrupted
      </Callout>,
    );
    expect(screen.getByText("Network").parentElement?.parentElement).toHaveAttribute("data-tone", "warning");
    expect(screen.getByText("!").parentElement).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    rerender(<Callout icon>{/* boolean decorative slot */}Still available</Callout>);
    expect(screen.getByText("Still available").parentElement?.parentElement).toHaveAttribute("data-has-icon", "false");
  });

  it("renders card slots, accessible naming, media positions, and sparse cards", () => {
    const { rerender } = render(
      <Card
        actions={<button>Open</button>}
        alignment="center"
        description="Description"
        eyebrow="Featured"
        footer="Footer details"
        headerActions={<button aria-label="More">More</button>}
        layout="horizontal"
        media={<img alt="Card view" src="/card.png" />}
        mediaPosition="end"
        metadata="Updated today"
        title="Garden card"
        variant="outlined"
      >
        Extra body
      </Card>,
    );
    const card = screen.getByRole("article", { name: "Garden card" });
    expect(card).toHaveAttribute("data-layout", "horizontal");
    expect(card).toHaveAttribute("data-variant", "outlined");
    expect(card.lastElementChild).toHaveAttribute("data-slot", "media");
    expect(screen.getByText("Featured")).toBeInTheDocument();
    expect(screen.getByText("Updated today")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Extra body")).toBeInTheDocument();
    expect(screen.getByText("Footer details")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument();
    rerender(<Card aria-label="Empty card" media={<span>Media</span>} mediaPosition="start" />);
    expect(screen.getByRole("article", { name: "Empty card" }).firstElementChild).toHaveAttribute("data-slot", "media");
    expect(screen.queryByText("Extra body")).not.toBeInTheDocument();
  });

  it("changes content preview widths and supports controlled viewports and srcDoc", () => {
    const onViewportChange = vi.fn();
    const { rerender } = render(
      <ContentPreview
        description="Responsive sample"
        frameHeight={400}
        heading="Preview"
        onViewportChange={onViewportChange}
        src="/demo"
      />,
    );
    const mobile = screen.getByRole("button", { name: "Mobile (390 px wide)" });
    fireEvent.click(mobile);
    expect(mobile).toHaveAttribute("aria-pressed", "true");
    expect(onViewportChange).toHaveBeenCalledWith("mobile");
    expect(screen.getByTitle("Page preview — Mobile preview (390 px wide)")).toHaveStyle({ width: "390px", height: "400px" });

    rerender(
      <ContentPreview
        onViewportChange={onViewportChange}
        srcDoc="<h1>Inline</h1>"
        viewport="fluid"
        viewports={[{ id: "fluid", label: "Fluid", width: "full" }]}
      />,
    );
    expect(screen.getByRole("button", { name: "Fluid (full available width)" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTitle("Page preview — Fluid preview (full available width)")).toHaveAttribute("srcdoc", "<h1>Inline</h1>");
    expect(screen.getByRole("region", { name: /Page preview: Fluid webpage preview/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Fluid (full available width)" }));
    expect(onViewportChange).toHaveBeenLastCalledWith("fluid");
  });

  it("falls back to the first viewport for an unknown controlled viewport and rejects empty choices", () => {
    render(
      <ContentPreview
        src="/demo"
        viewport="missing"
        viewports={[
          { id: "wide", label: "Wide", width: 1200 },
          { id: "narrow", label: "Narrow", width: 420 },
        ]}
      />,
    );
    expect(screen.getByRole("button", { name: "Wide (1200 px wide)" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTitle("Page preview — Wide preview (1200 px wide)")).toHaveStyle({ width: "1200px" });
    expect(() => render(<ContentPreview srcDoc="" viewports={[]} />)).toThrow(/at least one viewport/);
  });

  it("renders FAQs and delegates open-item changes to the accordion", () => {
    const onOpenItemsChange = vi.fn();
    const { rerender } = render(
      <FAQSection
        action={<a href="/support">More help</a>}
        description="Common questions"
        heading="Help"
        headingLevel={2}
        items={[
          { id: "one", question: "First?", answer: "Answer one" },
          { id: "two", question: "Second?", answer: "Answer two", disabled: true },
        ]}
        onOpenItemsChange={onOpenItemsChange}
      />,
    );
    expect(screen.getByRole("region", { name: "Help" })).toBeInTheDocument();
    expect(screen.getByText("Common questions")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "More help" })).toHaveAttribute("href", "/support");
    fireEvent.click(screen.getByRole("button", { name: "First?" }));
    expect(screen.getByText("Answer one")).toBeVisible();
    expect(onOpenItemsChange).toHaveBeenCalledWith(["one"]);
    expect(screen.getByRole("button", { name: "Second?" })).toBeDisabled();
    rerender(<FAQSection heading="Empty" items={[]} />);
    expect(screen.queryByRole("region", { name: "Empty" })).not.toBeInTheDocument();
    expect(() => render(<FAQSection heading="Invalid" items={null as never} />)).toThrow(/must be an array/);
  });

  it("supports optional blog layout regions and polymorphic layout elements", () => {
    const { container } = render(
      <>
        <BlogLayout footer={<span>Blog footer</span>} footerGap="lg" header={<span>Blog header</span>}>
          <main>Story</main>
        </BlogLayout>
        <Container as="main" gutter="lg" maxWidth="content">Container</Container>
        <Grid as="ul" gap="xl" minItemWidth="sm"><li>Grid item</li></Grid>
        <Inline as="nav" align="start" gap="md" justify="end" wrap={false}>Navigation</Inline>
        <Stack as="section" align="center" gap="lg" justify="end">Stacked</Stack>
        <VisuallyHidden as="a" focusable href="/hidden">Hidden link</VisuallyHidden>
        <VisuallyHidden data-testid="hidden-label">Hidden label</VisuallyHidden>
      </>,
    );
    expect(screen.getByText("Blog header")).toBeInTheDocument();
    expect(screen.getByText("Blog footer").parentElement).toHaveAttribute("data-footer-gap", "lg");
    expect(screen.getByText("Container").tagName).toBe("MAIN");
    expect(screen.getByText("Grid item").parentElement?.tagName).toBe("UL");
    expect(screen.getByText("Navigation").tagName).toBe("NAV");
    expect(screen.getByText("Stacked").tagName).toBe("SECTION");
    expect(screen.getByRole("link", { name: "Hidden link" })).toHaveAttribute("data-focusable", "true");
    expect(screen.getByTestId("hidden-label")).not.toHaveAttribute("data-focusable");
    expect(container.querySelector('[data-ds-layout-component="container"]')).toHaveAttribute("data-max-width", "content");
  });

  it("renders text and heading variants as semantic elements", () => {
    render(
      <>
        <Text as="span" measure="narrow" size="sm" tone="muted" variant="caption" weight="medium">Caption</Text>
        <Heading level={5} measure="wide" size="xl" variant="display">Section title</Heading>
      </>,
    );
    expect(screen.getByText("Caption")).toHaveAttribute("data-tone", "muted");
    expect(screen.getByText("Caption").tagName).toBe("SPAN");
    expect(screen.getByRole("heading", { level: 5, name: "Section title" })).toHaveAttribute("data-variant", "display");
  });
});

describe("announcements and page composition", () => {
  it("supports announcement content, uncontrolled dismissal, and initially hidden state", () => {
    const onVisibleChange = vi.fn();
    const { rerender } = render(
      <AnnouncementBar
        action={<a href="/details">Details</a>}
        alignment="center"
        dismissible
        icon={<span>i</span>}
        onVisibleChange={onVisibleChange}
        sticky
        title="Notice"
      >
        Scheduled maintenance
      </AnnouncementBar>,
    );
    expect(screen.getByRole("region", { name: "Announcement" })).toHaveAttribute("data-sticky", "true");
    expect(screen.getByText("i").parentElement).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("link", { name: "Details" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Dismiss announcement" }));
    expect(onVisibleChange).toHaveBeenCalledWith(false);
    expect(screen.queryByRole("region", { name: "Announcement" })).not.toBeInTheDocument();

    rerender(<AnnouncementBar defaultVisible={false}>Hidden</AnnouncementBar>);
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });

  it("supports controlled announcement visibility", () => {
    const onVisibleChange = vi.fn();
    const { rerender } = render(
      <AnnouncementBar dismissible onVisibleChange={onVisibleChange} visible>
        Controlled
      </AnnouncementBar>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Dismiss announcement" }));
    expect(onVisibleChange).toHaveBeenCalledWith(false);
    expect(screen.getByText("Controlled")).toBeInTheDocument();
    rerender(<AnnouncementBar visible={false}>Controlled</AnnouncementBar>);
    expect(screen.queryByText("Controlled")).not.toBeInTheDocument();
  });

  it("renders hero content, media placements, and uses its title for the section name", () => {
    const { rerender } = render(
      <Hero
        actions={<button>Custom action</button>}
        background="surface"
        description="Seasonal services"
        eyebrow="Meadow & Mill"
        media={<img alt="Garden" src="/garden.jpg" />}
        mediaPosition="start"
        title="A better garden"
      />,
    );
    expect(screen.getByRole("region", { name: "A better garden" })).toHaveAttribute("data-background", "surface");
    expect(screen.getByRole("heading", { level: 1, name: "A better garden" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Garden" }).parentElement).toHaveAttribute("data-slot", "media");
    expect(screen.getByRole("button", { name: "Custom action" })).toBeInTheDocument();
    rerender(
      <Hero
        aria-label="Promotional area"
        headingLevel={3}
        primaryAction={<button>Start</button>}
        secondaryAction={<a href="/learn">Learn</a>}
        title="Build a garden"
      />,
    );
    expect(screen.getByRole("region", { name: "Promotional area" })).not.toHaveAttribute("aria-labelledby");
    expect(screen.getByRole("heading", { level: 3, name: "Build a garden" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Learn" })).toHaveAttribute("href", "/learn");
    rerender(<Hero title="Quiet garden" />);
    expect(screen.getByRole("region", { name: "Quiet garden" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Start" })).not.toBeInTheDocument();
  });
});

describe("footer", () => {
  it("renders all footer regions and omits empty optional navigation", () => {
    render(
      <Footer
        bottomContent={<span>Bottom</span>}
        brand={<strong>Brand</strong>}
        copyright="© Meadow"
        description="Garden care"
        headingLevel={4}
        legalLinks={[{ id: "privacy", href: "/privacy", label: "Privacy", target: "_blank" }]}
        linkGroups={[{ id: "company", title: "Company", links: [{ id: "about", href: "/about", label: "About" }] }]}
        logoHref="/"
        logoLabel="Meadow home"
        socialLinks={[]}
      >
        Custom footer content
      </Footer>,
    );
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Meadow home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("heading", { level: 4, name: "Company" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("target", "_blank");
    expect(screen.queryByRole("navigation", { name: "Social links" })).not.toBeInTheDocument();
    expect(screen.getByText("Custom footer content")).toBeInTheDocument();
    expect(screen.getByText("© Meadow")).toBeInTheDocument();
    expect(screen.getByText("Bottom")).toBeInTheDocument();
  });

  it("supports a text brand, social links, and omitted optional footer regions", () => {
    render(
      <Footer
        brand={<strong>Greenhouse</strong>}
        description="A local gardening studio."
        legalLinks={[{ id: "terms", href: "/terms", label: "Terms" }]}
        socialLinks={[{ id: "instagram", href: "https://example.com/social", label: "Instagram", rel: "me", target: "_blank" }]}
      />,
    );
    expect(screen.getByText("Greenhouse").parentElement).not.toHaveAttribute("href");
    expect(screen.getByRole("navigation", { name: "Social links" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Instagram" })).toHaveAttribute("rel", "me");
    expect(screen.queryByRole("navigation", { name: "Footer navigation" })).not.toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Legal links" })).toBeInTheDocument();
  });

  it("renders a footer without a brand or optional navigation sections", () => {
    render(
      <>
        <Footer copyright="© 2026 Garden studio" />
        <Footer bottomContent={<span>Bottom-only content</span>} />
      </>,
    );
    expect(screen.getByText("© 2026 Garden studio")).toBeInTheDocument();
    expect(screen.getByText("Bottom-only content")).toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});
