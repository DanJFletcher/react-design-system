import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import {
  ContentMetadataPanel,
  type ContentMetadataImage,
  type ContentMetadataValue,
} from "./ContentMetadataPanel";

const imageSunset = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#e7d8c6"/><circle cx="900" cy="165" r="92" fill="#d58b65"/><path d="M0 468 282 228l170 138 186-184 246 259v189H0Z" fill="#667b70"/><path d="m0 534 316-160 182 114 233-124 469 180v86H0Z" fill="#334e48"/></svg>')}`;
const imageShop = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#d8e1d9"/><rect x="318" y="156" width="564" height="350" rx="12" fill="#b8755d"/><path d="M278 236h644l-52-136H330Z" fill="#f1d7a8"/><rect x="380" y="292" width="146" height="214" fill="#ead7bc"/><rect x="585" y="292" width="236" height="128" fill="#6e8d7b"/><path d="M603 404 690 320l62 60 38-34 31 58Z" fill="#f0d7a7"/></svg>')}`;

const sampleImages: readonly ContentMetadataImage[] = [
  { id: "sunset", label: "Evening over the hills", url: imageSunset, altText: "Layered green hills beneath a copper sunset" },
  { id: "shop", label: "The neighborhood studio", url: imageShop, altText: "A welcoming neighborhood shopfront" },
];

const meta = {
  title: "Components/Content metadata panel",
  component: ContentMetadataPanel,
  args: {
    images: sampleImages,
    siteUrl: "https://willowandpine.example",
    siteName: "Willow & Pine Studio",
    defaultValue: {
      slug: "services/garden-design",
      seoTitle: "Garden design for thoughtful outdoor living",
      metaDescription: "Plan a more welcoming outdoor space with practical garden design for homes across the valley.",
      socialImageId: "sunset",
    },
  },
  argTypes: {
    value: { control: false },
    defaultValue: { control: false },
    images: { control: false },
    onChange: { control: false },
    style: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof ContentMetadataPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { onChange: fn() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slug = canvas.getByRole("textbox", { name: "Page URL slug" });
    const title = canvas.getByRole("textbox", { name: "SEO title" });
    const description = canvas.getByRole("textbox", { name: "Meta description" });
    await userEvent.clear(slug);
    await userEvent.type(slug, "/about//our-studio/");
    await expect(canvas.getByText("https://willowandpine.example/about/our-studio")).toBeVisible();

    await userEvent.clear(title);
    await userEvent.type(title, "A title that fits");
    await expect(canvas.getByText("17/60")).toBeVisible();
    await expect(canvas.getAllByText("A title that fits")).toHaveLength(2);

    await userEvent.clear(description);
    await userEvent.type(description, "An inviting description for this page.");
    await expect(canvas.getByText("38/160")).toBeVisible();
    await expect(canvas.getAllByText("An inviting description for this page.")).toHaveLength(3);

    await userEvent.selectOptions(canvas.getByRole("combobox", { name: "Social sharing image" }), "shop");
    await expect(canvas.getByRole("img", { name: "A welcoming neighborhood shopfront" })).toBeVisible();
    await expect(canvas.getByText("Willow & Pine Studio")).toBeVisible();
  },
};

export const EmptyAndNoImage: Story = {
  args: {
    images: [],
    defaultValue: { slug: "new-page", seoTitle: "", metaDescription: "" },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("No social image selected")).toBeVisible();
    await expect(canvas.getByRole("combobox", { name: "Social sharing image" })).toBeEnabled();
    await expect(canvas.getByText("https://willowandpine.example/new-page")).toBeVisible();
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox", { name: "Page URL slug" })).toBeDisabled();
    await expect(canvas.getByRole("textbox", { name: "SEO title" })).toBeDisabled();
    await expect(canvas.getByRole("textbox", { name: "Meta description" })).toBeDisabled();
    await expect(canvas.getByRole("combobox", { name: "Social sharing image" })).toBeDisabled();
  },
};

function ControlledExample() {
  const [value, setValue] = useState<ContentMetadataValue>({
    slug: "appointments",
    seoTitle: "Book a visit",
    metaDescription: "Find a time that works for you.",
    socialImageId: "shop",
  });

  return (
    <ContentMetadataPanel
      images={sampleImages}
      onChange={setValue}
      siteName="Willow & Pine Studio"
      siteUrl="https://willowandpine.example"
      value={value}
    />
  );
}

export const ControlledUpdates: Story = {
  render: () => <ControlledExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByRole("textbox", { name: "SEO title" });
    await userEvent.clear(title);
    await userEvent.type(title, "Studio appointments");
    await expect(title).toHaveValue("Studio appointments");
    await expect(canvas.getAllByText("Studio appointments")).toHaveLength(2);
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: "Social sharing image" }), "sunset");
    await expect(canvas.getByRole("img", { name: "Layered green hills beneath a copper sunset" })).toBeVisible();
  },
};

export const ThemeCoverage: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: "var(--ds-space-5)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <div
          data-ds-theme={theme}
          key={theme}
          style={{ padding: "var(--ds-space-4)", background: "var(--ds-color-canvas)", color: "var(--ds-color-text-primary)" }}
        >
          <ContentMetadataPanel {...args} label={`${theme} metadata`} />
        </div>
      ))}
    </div>
  ),
};
