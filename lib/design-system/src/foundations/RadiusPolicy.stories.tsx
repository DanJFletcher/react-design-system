import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Accordion } from "../components/Accordion/Accordion";
import { ArticleBody } from "../components/ArticleBody/ArticleBody";
import { Button } from "../components/Button/Button";
import { Callout } from "../components/Callout/Callout";
import { Card } from "../components/Card/Card";
import { Carousel } from "../components/Carousel/Carousel";
import { ContactSection } from "../components/ContactSection/ContactSection";
import { FieldGroup } from "../components/FormControls/FieldGroup";
import { Select } from "../components/FormControls/Select";
import { Switch } from "../components/FormControls/Switch";
import { Textarea } from "../components/FormControls/Textarea";
import { TextField } from "../components/FormControls/TextField";
import { PricingDetails } from "../components/PricingDetails/PricingDetails";

const meta = {
  title: "Foundations/Radius Policy",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Choose corners by purpose: bounded surfaces, action controls, single-line inputs, explicit shapes, and intentional circles. Atom uses 8px surface corners and compact controls; Luna uses 32px surfaces and pill-shaped action and input controls.",
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function Examples({ name }: { name: string }) {
  return (
    <div style={{ display: "grid", gap: "var(--ds-space-6)", minWidth: 0 }}>
      <h2>{name} corners</h2>
      <Card
        data-testid={`${name}-card`}
        title={`${name} content card`}
        headingLevel={3}
        media={<div style={{ padding: "var(--ds-space-4)", background: "var(--ds-color-accent-bg)", color: "var(--ds-color-accent-fg)" }}>Media surface</div>}
        description="Bounded corners preserve a rectangular content surface."
      />
      <ArticleBody aria-label={`${name} code example`}>
        <pre data-testid={`${name}-code`} tabIndex={0}><code>{"const surface = \"bounded\";\nconst controls = \"pill\";"}</code></pre>
      </ArticleBody>
      <Callout data-testid={`${name}-callout`} title={`${name} note`}>Surface corners use the theme's bounded radius.</Callout>
      <Accordion
        label={`${name} questions`}
        variant="surface"
        items={[{ id: "corners", title: `${name}: Why separate radius roles?`, content: "Panels should not inherit a pill control's shape." }]}
      />
      <Carousel
        data-testid={`${name}-carousel`}
        label={`${name} slides`}
        controlsPosition="overlay"
        slides={[
          { id: "one", content: <div style={{ padding: "var(--ds-space-6)" }}>First content surface</div> },
          { id: "two", content: <div style={{ padding: "var(--ds-space-6)" }}>Second content surface</div> },
        ]}
      />
      <PricingDetails data-testid={`${name}-pricing`} title={`${name} plan`} price="$29" description="A rounded pricing panel." />
      <ContactSection data-testid={`${name}-contact`} heading={`${name} contact`} variant="surface" />
      <FieldGroup label={`${name} form group`} data-testid={`${name}-group`}>
        <TextField label={`${name} name`} />
        <Select label={`${name} region`} defaultValue="local"><option value="local">Local</option></Select>
        <Textarea label={`${name} notes`} />
        <Switch label={`${name} updates`} />
      </FieldGroup>
      <Button data-testid={`${name}-button`}>{name} action</Button>
    </div>
  );
}

export const LunaSurfaces: Story = {
  globals: { theme: "luna" },
  render: () => <Examples name="Luna" />,
};

export const ThemeComparison: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 18rem), 1fr))", gap: "var(--ds-space-6)" }}>
      {["acme", "luna", "orchid", "atom", "sublime"].map((theme) => (
        <div key={theme} data-ds-theme={theme} style={{ background: "var(--ds-color-canvas)", color: "var(--ds-color-text-primary)", padding: "var(--ds-space-4)", minWidth: 0 }}>
          <Examples name={theme} />
        </div>
      ))}
    </div>
  ),
};

export const OverridesAndShapes: Story = {
  globals: { theme: "luna" },
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-6)" }}>
      <Card data-testid="square-card" title="Explicit square card" shape="square" />
      <Card data-testid="custom-card" title="Custom radius wins over square" shape="square" style={{ "--ds-card-radius": "var(--ds-space-10)" }} />
      <div data-ds-theme="luna" style={{ "--ds-card-radius": "var(--ds-space-8)", color: "var(--ds-color-text-primary)", background: "var(--ds-color-canvas)" } as CSSProperties}>
        <Card data-testid="outer-card" title="Outer hook override" />
        <div data-ds-theme="acme" style={{ background: "var(--ds-color-canvas)", color: "var(--ds-color-text-primary)", padding: "var(--ds-space-4)" }}>
          <Card data-testid="nested-card" title="Nested theme resets the hook" />
          <div data-ds-theme="luna" style={{ background: "var(--ds-color-canvas)", color: "var(--ds-color-text-primary)", padding: "var(--ds-space-4)" }}>
            <Card data-testid="nested-luna-card" title="Nested Luna restores surface defaults" />
          </div>
        </div>
      </div>
      <div data-ds-theme="luna" style={{ "--ds-radius-surface": "18px" } as CSSProperties}>
        <Card data-testid="semantic-override-card" title="Local semantic override" />
        <Button data-testid="unchanged-pill">Action radius stays independent</Button>
      </div>
      <Accordion label="Square disclosure example" shape="square" variant="outlined" items={[{ id: "square", title: "Square question", content: "Explicit square remains supported." }]} />
      <PricingDetails data-testid="square-pricing" title="Square pricing" price="$29" shape="square" />
      <Button data-testid="square-button" shape="square">Square action</Button>
      <Button data-testid="rounded-button" shape="rounded">Explicit rounded action</Button>
      <Button data-testid="pill-button" shape="pill">Explicit pill action</Button>
    </div>
  ),
};
