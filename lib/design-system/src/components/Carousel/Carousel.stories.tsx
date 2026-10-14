import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { Carousel, type CarouselSlide } from "./Carousel";

const featuredSlides: CarouselSlide[] = [
  {
    id: "focus",
    label: "Find your focus",
    content: (
      <SlideContent
        index="01"
        title="Find your focus"
        description="A clear view of the work that matters most."
      />
    ),
  },
  {
    id: "flow",
    label: "Build your flow",
    content: (
      <SlideContent
        index="02"
        title="Build your flow"
        description="Bring projects and people together in one calm space."
      />
    ),
  },
  {
    id: "forward",
    label: "Move forward",
    content: (
      <SlideContent
        index="03"
        title="Move forward"
        description="Turn team momentum into meaningful progress."
      />
    ),
  },
];

const meta = {
  title: "Components/Carousel",
  component: Carousel,
  args: {
    label: "Featured stories",
    slides: featuredSlides,
    loop: true,
    showControls: true,
    indicators: "dots",
    controlsPosition: "below",
    overlaySafeArea: true,
    variant: "surface",
    size: "md",
  },
  argTypes: {
    label: { control: "text" },
    slides: { control: false },
    index: { control: false },
    defaultIndex: { control: "number" },
    onIndexChange: { control: false },
    getSlideLabel: { control: false },
    getIndicatorLabel: { control: false },
    loop: { control: "boolean" },
    showControls: { control: "boolean" },
    autoPlay: { control: "boolean" },
    autoPlayInterval: {
      control: { type: "number", min: 1000, max: 30000, step: 500 },
    },
    pauseLabel: { control: "text" },
    playLabel: { control: "text" },
    reducedMotionLabel: { control: "text" },
    indicators: { control: "inline-radio", options: ["dots", "fraction", "none"] },
    controlsPosition: { control: "inline-radio", options: ["overlay", "below"] },
    overlaySafeArea: { control: "boolean" },
    previousLabel: { control: "text" },
    nextLabel: { control: "text" },
    emptyMessage: { control: "text" },
    variant: { control: "inline-radio", options: ["surface", "outlined", "subtle", "accent"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    style: { control: false },
    className: { control: "text" },
  },
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const carousel = canvas.getByRole("region", { name: "Featured stories" });
    await expect(carousel).toHaveAttribute("aria-roledescription", "carousel");
    await expect(canvas.getByRole("group", { name: "Find your focus, 1 of 3" })).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: "Next slide" }));
    await expect(canvas.getByRole("group", { name: "Build your flow, 2 of 3" })).toBeVisible();

    carousel.focus();
    await userEvent.keyboard("{End}");
    await expect(canvas.getByRole("group", { name: "Move forward, 3 of 3" })).toBeVisible();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("group", { name: "Find your focus, 1 of 3" })).toBeVisible();
  },
};

export const AutoPlay: Story = {
  args: {
    label: "Auto-advancing stories",
    autoPlay: true,
    autoPlayInterval: 1600,
    loop: true,
  },
};

export const SwipeExample: Story = {
  args: {
    label: "Swipe example",
  },
};

export const ControlsExamples: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-6)" }}>
      <Carousel
        label="Safe overlay controls example"
        slides={featuredSlides}
        loop
        controlsPosition="overlay"
        indicators="dots"
        variant="outlined"
      />
      <Carousel
        label="Full-bleed overlay controls example"
        slides={featuredSlides}
        loop
        controlsPosition="overlay"
        overlaySafeArea={false}
        indicators="dots"
        variant="outlined"
      />
      <Carousel
        label="Fraction indicator example"
        slides={featuredSlides}
        defaultIndex={0}
        indicators="fraction"
        controlsPosition="below"
        size="sm"
      />
      <Carousel
        label="Below controls example"
        slides={featuredSlides}
        controlsPosition="below"
        indicators="dots"
        variant="subtle"
      />
    </div>
  ),
};

export const VariantExamples: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))", gap: "var(--ds-space-4)" }}>
      {(["surface", "outlined", "subtle", "accent"] as const).map((variant) => (
        <Carousel
          key={variant}
          label={`${variant} carousel`}
          slides={featuredSlides}
          variant={variant}
          size="sm"
          indicators="fraction"
          showControls={false}
        />
      ))}
    </div>
  ),
};

export const ThemeCoverage: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      {(["acme", "luna", "orchid", "atom"] as const).map((theme) => (
        <div key={theme} data-ds-theme={theme}>
          <Carousel
            label={`${theme.toUpperCase()} featured content`}
            slides={featuredSlides}
            variant="surface"
            size="sm"
          />
        </div>
      ))}
    </div>
  ),
};

export const Controlled: Story = {
  render: () => <ControlledCarousel />,
};

export const LocalizedLabels: Story = {
  render: () => (
    <Carousel
      label="Contenu en vedette"
      slides={featuredSlides}
      previousLabel="Diapositive précédente"
      nextLabel="Diapositive suivante"
      getSlideLabel={(slide, index, total) => `${slide.label ?? "Diapositive"} ${index + 1} sur ${total}`}
      getIndicatorLabel={(_slide, index, total) => `Aller à la diapositive ${index + 1} sur ${total}`}
      loop
    />
  ),
};

export const CustomHookOverrides: Story = {
  render: () => (
    <Carousel
      label="Custom themed carousel"
      slides={featuredSlides}
      variant="surface"
      style={{
        "--ds-carousel-background": "var(--ds-color-accent-bg)",
        "--ds-carousel-text": "var(--ds-color-accent-fg)",
        "--ds-carousel-border": "var(--ds-color-accent-bg)",
        "--ds-carousel-radius": "var(--ds-space-6)",
        "--ds-carousel-slide-radius": "var(--ds-space-4)",
        "--ds-carousel-padding": "var(--ds-space-6)",
        "--ds-carousel-control-bg": "var(--ds-color-surface-primary)",
        "--ds-carousel-control-fg": "var(--ds-color-text-primary)",
        "--ds-carousel-control-border": "var(--ds-color-border-control)",
        "--ds-carousel-indicator": "var(--ds-color-accent-fg)",
        "--ds-carousel-indicator-active": "var(--ds-color-accent-fg)",
        "--ds-carousel-indicator-surface": "var(--ds-color-accent-bg)",
      }}
    />
  ),
};

export const EmptyState: Story = {
  args: {
    label: "Empty carousel",
    slides: [],
    emptyMessage: "There are no featured stories right now.",
  },
};

function ControlledCarousel() {
  const [index, setIndex] = useState(1);
  return (
    <Carousel
      label="Controlled carousel"
      slides={featuredSlides}
      index={index}
      onIndexChange={setIndex}
      indicators="fraction"
    />
  );
}

function SlideContent({
  index,
  title,
  description,
}: {
  index: string;
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        minBlockSize: "var(--ds-space-32)",
        placeContent: "center",
        gap: "var(--ds-space-3)",
        padding: "var(--ds-space-6)",
        borderRadius: "var(--ds-radius-shape-rounded)",
        backgroundColor: "var(--ds-color-canvas)",
        color: "var(--ds-color-text-primary)",
        textAlign: "center",
      }}
    >
      <div style={{ color: "var(--ds-color-text-muted)", fontSize: "var(--ds-font-size-sm)" }}>
        STORY {index}
      </div>
      <h3 style={{ margin: 0, fontSize: "var(--ds-font-size-2xl)" }}>{title}</h3>
      <p style={{ maxInlineSize: "36rem", margin: 0, color: "var(--ds-color-text-muted)" }}>
        {description}
      </p>
    </div>
  );
}
