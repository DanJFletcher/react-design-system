import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import { PublishingWorkflow } from "../PublishingWorkflow/PublishingWorkflow";
import {
  ContentPreview,
  DEFAULT_CONTENT_PREVIEW_VIEWPORTS,
  type ContentPreviewViewport,
} from "./ContentPreview";

const pageDocument = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Willow &amp; Pine Studio</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: #f6f4ef;
        color: #21312c;
        font: 16px/1.6 system-ui, sans-serif;
      }
      header, main, footer { padding: 24px; }
      header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        background: #fff;
        border-bottom: 1px solid #d8dfd8;
      }
      .brand { font-weight: 700; letter-spacing: .02em; }
      nav { display: flex; gap: 18px; }
      nav a { color: inherit; text-decoration: none; }
      .hero {
        display: grid;
        grid-template-columns: 1.2fr .8fr;
        align-items: center;
        gap: 28px;
        padding-block: 56px;
      }
      .hero h1 { max-width: 12ch; margin: 0 0 12px; font-size: clamp(2rem, 5vw, 3.5rem); line-height: 1.05; }
      .hero p { max-width: 55ch; }
      .photo {
        min-height: 260px;
        border-radius: 22px;
        background: linear-gradient(145deg, #d8ac76, #799182 60%, #486458);
      }
      .button {
        display: inline-block;
        padding: 11px 18px;
        border-radius: 999px;
        background: #274d40;
        color: white;
        font-weight: 650;
        text-decoration: none;
      }
      footer { background: #e7ebe5; }
      @media (max-width: 600px) {
        header { align-items: flex-start; flex-direction: column; }
        nav { flex-wrap: wrap; gap: 8px 16px; }
        main { padding: 16px; }
        .hero { grid-template-columns: 1fr; gap: 18px; padding-block: 28px; }
        .photo { min-height: 180px; }
      }
    </style>
  </head>
  <body>
    <header>
      <span class="brand">Willow &amp; Pine</span>
      <nav aria-label="Main navigation">
        <a href="#services">Services</a><a href="#journal">Journal</a><a href="#contact">Contact</a>
      </nav>
    </header>
    <main>
      <section class="hero">
        <div>
          <p>Thoughtful spaces, made for living</p>
          <h1>Good design grows with you.</h1>
          <p>We help homeowners shape calm, useful gardens that feel like a natural extension of home.</p>
          <a class="button" href="#contact">Plan a consultation</a>
        </div>
        <div aria-hidden="true" class="photo"></div>
      </section>
    </main>
    <footer>Willow &amp; Pine Studio · Garden design for the valley</footer>
  </body>
</html>`;

const meta = {
  title: "Compositions/CMS/Content preview",
  id: "components-content-preview",
  component: ContentPreview,
  args: {
    srcDoc: pageDocument,
    frameTitle: "Willow & Pine Studio page",
    heading: "Page preview",
    description: "Check the published page at common screen widths before it goes live.",
  },
  argTypes: {
    src: { control: false },
    srcDoc: { control: false },
    frameTitle: { control: "text" },
    viewport: { control: false },
    defaultViewport: {
      control: "select",
      options: DEFAULT_CONTENT_PREVIEW_VIEWPORTS.map((option) => option.id),
    },
    onViewportChange: { control: false },
    viewports: { control: false },
    frameHeight: { control: { type: "number", min: 240, max: 1200, step: 40 } },
    loading: { control: "inline-radio", options: ["eager", "lazy"] },
    sandbox: { control: "text" },
    className: { control: false },
    style: { control: false },
  },
} satisfies Meta<typeof ContentPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ResponsivePage: Story = {};

export const ViewportControls: Story = {
  args: { onViewportChange: fn() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const frame = canvas.getByTitle(
      "Willow & Pine Studio page — Desktop preview (1280 px wide)",
    );
    await expect(frame).toHaveStyle({ width: "1280px" });
    await expect(frame).toHaveAttribute("sandbox", "");

    await userEvent.click(canvas.getByRole("button", { name: "Mobile (390 px wide)" }));
    await expect(
      canvas.getByTitle("Willow & Pine Studio page — Mobile preview (390 px wide)"),
    ).toHaveStyle({ width: "390px" });
    await expect(canvas.getByRole("button", { name: "Mobile (390 px wide)" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await userEvent.click(canvas.getByRole("button", { name: "Desktop (1280 px wide)" }));
    await expect(
      canvas.getByTitle("Willow & Pine Studio page — Desktop preview (1280 px wide)"),
    ).toBeVisible();
  },
};

const customViewports: readonly ContentPreviewViewport[] = [
  { id: "wide", label: "Wide desktop", width: 1440 },
  { id: "compact", label: "Compact", width: 1024 },
  { id: "phone", label: "Phone", width: 360 },
  { id: "fit", label: "Fit preview area", width: "full" },
];

export const CustomViewportWidths: Story = {
  args: {
    defaultViewport: "phone",
    viewports: customViewports,
    description: "Supply named viewport widths that match your team’s supported breakpoints.",
  },
};

export const CMSReview: Story = {
  name: "CMS review before publishing",
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-5)" }}>
      <ContentPreview
        description="Review the page at desktop, tablet, and mobile widths before approval."
        frameTitle="Willow & Pine Studio review"
        heading="Review the page"
        srcDoc={pageDocument}
      />
      <PublishingWorkflow
        heading="Publishing"
        onApprove={() => {}}
        onPublish={() => {}}
        reviewSteps={[
          { id: "editorial", label: "Editorial review", status: "pending", assignee: "Theo Park" },
          { id: "brand", label: "Brand review", status: "approved", assignee: "Mara Ellison" },
        ]}
        status="in-review"
      />
    </div>
  ),
};

export const ThemeCoverage: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: "var(--ds-space-5)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <div
          data-ds-theme={theme}
          key={theme}
          style={{
            padding: "var(--ds-space-4)",
            background: "var(--ds-color-canvas)",
            color: "var(--ds-color-text-primary)",
          }}
        >
          <ContentPreview
            {...args}
            frameTitle={`${theme} site`}
            heading={`${theme} content preview`}
          />
        </div>
      ))}
    </div>
  ),
};
