import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "storybook/test";
import { Button } from "../components/Button/Button";
import { Callout } from "../components/Callout/Callout";
import { Card } from "../components/Card/Card";
import { ArticleBody } from "../components/ArticleBody/ArticleBody";
import { Footer } from "../components/Footer/Footer";
import { Select } from "../components/FormControls/Select";
import { Textarea } from "../components/FormControls/Textarea";
import { TextField } from "../components/FormControls/TextField";
import { Grid } from "../components/Layout/Grid";
import { Inline } from "../components/Layout/Inline";
import { Container } from "../components/Layout/Container";
import { Stack } from "../components/Layout/Stack";
import { Header } from "../components/Header/Header";
import { Hero } from "../components/Hero/Hero";
import { Heading } from "../components/Typography/Typography";

const meta = {
  title: "Foundations/Atom theme",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Atom is a dark comic-inspired theme with inked borders, cyan table borders, vivid print-like accents, subtle halftone texture, hard offset shadows on content surfaces and controls, and clipped marker highlights. H1 and H2 use cyan over electric yellow; H3 uses hot pink over cyan; H4 and H5 use black over hot pink; H6 uses purple over black. Page layout components and article bodies remain flat.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <main
      data-ds-theme="atom"
      style={{
        boxSizing: "border-box",
        display: "grid",
        gap: "var(--ds-space-6)",
        maxInlineSize: "var(--ds-layout-container-content)",
        minInlineSize: 0,
        marginInline: "auto",
        padding: "var(--ds-space-6)",
        backgroundColor: "var(--ds-color-canvas)",
        color: "var(--ds-color-text-primary)",
        fontFamily: "var(--ds-font-family-sans)",
      }}
    >
      <header style={{ display: "grid", gap: "var(--ds-space-3)" }}>
        <p
          style={{
            justifySelf: "start",
            margin: 0,
            padding: "var(--ds-space-1) var(--ds-space-3)",
            border: "var(--ds-border-width-default) solid var(--ds-color-border-control)",
            backgroundColor: "var(--ds-color-accent-bg)",
            color: "var(--ds-color-accent-fg)",
            fontWeight: "var(--ds-font-weight-semibold)",
            textTransform: "uppercase",
          }}
        >
          Atom · issue 01
        </p>
        <h1
          style={{
            margin: 0,
            fontSize: "var(--ds-font-size-4xl)",
            fontWeight: 900,
            lineHeight: "var(--ds-line-height-tight)",
            textTransform: "uppercase",
          }}
        >
          Make some noise.
        </h1>
        <p style={{ maxInlineSize: "var(--ds-layout-container-narrow)", margin: 0 }}>
          A dark, high-contrast comic palette with hot-pink action, electric-cyan
          focus, and yellow callouts.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--ds-space-3)" }}>
          <Button data-testid="atom-primary-button">Start the story</Button>
          <Button data-testid="atom-secondary-button" variant="secondary">
            Read the issue
          </Button>
          <Button data-testid="atom-ghost-button" variant="ghost">
            More details
          </Button>
        </div>
      </header>

      <Card
        data-testid="atom-surface-card"
        description="Three bold inks. One clear next step."
        eyebrow="Field notes"
        title="Built for impact"
      >
        <p style={{ margin: 0 }}>
          Content surfaces use a thick outline and a crisp, unblurred shadow.
          Page layout components stay flat; controls get a smaller offset.
        </p>
      </Card>

      <section
        aria-label="Atom form controls"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 16rem), 1fr))",
          gap: "var(--ds-space-4)",
        }}
      >
        <TextField
          data-testid="atom-text-field"
          label="Email address"
          placeholder="you@example.com"
          type="email"
        />
        <Select data-testid="atom-select" label="Choose a service" defaultValue="">
          <option disabled value="">Select a service</option>
          <option value="design">Design consultation</option>
          <option value="build">Build and install</option>
        </Select>
        <Textarea
          data-testid="atom-textarea"
          label="Your notes"
          placeholder="Tell us what you have in mind."
        />
      </section>

      <Callout tone="info">
        Halftone canvas, high-contrast type, thick inked edges, and hard block
        shadows on content surfaces and controls are all driven by the Atom theme.
      </Callout>
    </main>
  ),
};

export const LayoutShadowScope: Story = {
  render: () => (
    <div data-ds-theme="atom">
      <Header
        data-testid="atom-layout-header"
        logo="Atom"
        logoHref="#"
        logoLabel="Atom home"
      />
      <main
        style={{
          display: "grid",
          gap: "var(--ds-space-6)",
          padding: "var(--ds-space-6)",
        }}
      >
        <Hero
          data-testid="atom-layout-hero"
          background="surface"
          size="sm"
          title="Keep the frame flat."
          description="Page structure stays clean while content surfaces keep their inked shadow."
        />
        <Container data-testid="atom-layout-container" maxWidth="content">
          <Stack data-testid="atom-layout-stack" gap="md">
            <Inline data-testid="atom-layout-inline">
              <Button data-testid="atom-layout-button">A control</Button>
              <span>Shared page content</span>
            </Inline>
            <Grid data-testid="atom-layout-grid" minItemWidth="sm">
              <Card
                data-testid="atom-content-card"
                title="Content keeps its shadow"
                description="The Atom surface treatment remains on cards."
              />
            </Grid>
          </Stack>
        </Container>
        <ArticleBody data-testid="atom-layout-article-body" aria-label="Sample article">
          <h2>Article bodies stay flat.</h2>
          <p>
            Long-form reading content stays on the canvas; cards and controls
            keep their comic-book shadows.
          </p>
        </ArticleBody>
      </main>
      <Footer
        data-testid="atom-layout-footer"
        brand="Atom"
        variant="surface"
        copyright="Page layout stays flat."
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const component of [
      "header",
      "hero",
      "footer",
      "container",
      "stack",
      "grid",
      "inline",
      "article-body",
    ]) {
      const element = canvas.getByTestId(`atom-layout-${component}`);
      expect(getComputedStyle(element).boxShadow).toBe("none");
    }
    expect(getComputedStyle(canvas.getByTestId("atom-content-card")).boxShadow).not.toBe("none");
    expect(getComputedStyle(canvas.getByTestId("atom-layout-button")).boxShadow).not.toBe("none");
  },
};

export const HeadingHighlights: Story = {
  render: () => (
    <section
      data-ds-theme="atom"
      aria-label="Atom heading highlights"
      style={{
        display: "grid",
        gap: "var(--ds-space-6)",
        padding: "var(--ds-space-6)",
        backgroundColor: "var(--ds-color-canvas)",
        color: "var(--ds-color-text-primary)",
        fontFamily: "var(--ds-font-family-sans)",
      }}
    >
      <h1 data-testid="atom-marker-h1" style={{ margin: 0, fontSize: "var(--ds-font-size-4xl)" }}>
        Make some noise.
      </h1>
      <h2 data-testid="atom-marker-h2" style={{ margin: 0, fontSize: "var(--ds-font-size-3xl)" }}>
        Big ideas deserve a bold beginning.
      </h2>
      <Heading level={2} tone="muted" data-testid="atom-marker-component">
        A heading from the component library
      </Heading>
      <h3 data-testid="atom-marker-h3" style={{ margin: 0 }}>
        Section headings use hot pink over cyan.
      </h3>
      <Heading level={3} data-testid="atom-marker-h3-component">
        Component H3 headings follow the same marker style.
      </Heading>
      <h4 data-testid="atom-marker-h4" style={{ margin: 0 }}>
        Fourth-level headings use black over hot pink.
      </h4>
      <h5 data-testid="atom-marker-h5" style={{ margin: 0 }}>
        Fifth-level headings share the same bold layers.
      </h5>
      <Heading level={4} tone="muted" data-testid="atom-marker-h4-component">
        Component H4 headings use the same marker style.
      </Heading>
      <Heading level={5} tone="muted" data-testid="atom-marker-h5-component">
        Component H5 headings use the same marker style.
      </Heading>
      <h6 data-testid="atom-marker-h6" style={{ margin: 0 }}>
        Sixth-level headings use purple over black.
      </h6>
      <Heading level={6} tone="muted" data-testid="atom-marker-h6-component">
        Component H6 headings follow the same marker style.
      </Heading>
      <div data-ds-theme="luna">
        <Heading level={2} data-testid="luna-unmarked-heading">
          Nested themes keep their own typography.
        </Heading>
        <h4 data-testid="luna-unmarked-h4">Luna H4 stays unmarked.</h4>
        <h5 data-testid="luna-unmarked-h5">Luna H5 stays unmarked.</h5>
        <h6 data-testid="luna-unmarked-h6">Luna H6 stays unmarked.</h6>
      </div>
    </section>
  ),
};
