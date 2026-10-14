import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../components/Button/Button";
import { Callout } from "../components/Callout/Callout";
import { Card } from "../components/Card/Card";
import { Select } from "../components/FormControls/Select";
import { Textarea } from "../components/FormControls/Textarea";
import { TextField } from "../components/FormControls/TextField";

const meta = {
  title: "Foundations/Atom theme",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Atom is a dark comic-inspired theme with inked borders, vivid print-like accents, subtle halftone texture, and hard offset shadows.",
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
        </div>
      </header>

      <Card
        data-testid="atom-surface-card"
        description="Three bold inks. One clear next step."
        eyebrow="Field notes"
        title="Built for impact"
      >
        <p style={{ margin: 0 }}>
          Surfaces use a thick outline and a crisp, unblurred shadow. Controls get
          a smaller offset so their shape stays easy to read.
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
        shadows are all driven by the Atom theme.
      </Callout>
    </main>
  ),
};
