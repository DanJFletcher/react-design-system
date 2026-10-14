import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import { MediaLibrary, type MediaAsset, type MediaLibraryProps } from "./MediaLibrary";

const imageOne = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420"><rect width="640" height="420" fill="#dce9df"/><circle cx="490" cy="112" r="55" fill="#e9bb68"/><path d="M0 330 150 170l122 120 105-132 263 230v32H0Z" fill="#688b78"/><path d="m0 365 195-118 121 90 139-82 185 112v53H0Z" fill="#355d50"/></svg>')}`;
const imageTwo = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420"><rect width="640" height="420" fill="#eadfd6"/><rect x="72" y="76" width="496" height="270" rx="24" fill="#bd7662"/><path d="M112 305 254 160l92 93 81-66 112 118Z" fill="#f2d39b"/><circle cx="453" cy="143" r="26" fill="#f3d9b4"/></svg>')}`;
const sampleAssets: MediaAsset[] = [
  { id: "ridge", name: "Dawn over the ridge", url: imageOne, mimeType: "image/svg+xml", altText: "Layered green mountains under a morning sun", width: 1600, height: 1050, size: 286720, updatedAt: "2024-04-12" },
  { id: "studio", name: "Studio in late light", url: imageTwo, mimeType: "image/svg+xml", altText: "A warm studio interior with an abstract landscape", width: 1200, height: 800, size: 418201, updatedAt: "2024-03-29" },
  { id: "brief", name: "Spring campaign brief.pdf", url: "#brief", mimeType: "application/pdf", size: 945120, updatedAt: "2024-04-08" },
  { id: "interview", name: "Founder interview.mp4", url: "#interview", mimeType: "video/mp4", size: 14200000, updatedAt: "2024-04-02" },
  { id: "sound", name: "Market ambience.wav", url: "#sound", mimeType: "audio/wav", size: 3145728 },
];

const meta = {
  title: "Components/Media library",
  component: MediaLibrary,
  args: {
    assets: sampleAssets,
    label: "Media library",
    selectionMode: "single",
    onFilesSelected: fn(),
  },
  argTypes: {
    assets: { control: false },
    selectedIds: { control: false },
    defaultSelectedIds: { control: false },
    onSelectionChange: { control: false },
    onConfirmSelection: { control: false },
    onFilesSelected: { control: false },
    style: { control: false },
    className: { control: false },
  },
} satisfies Meta<typeof MediaLibrary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const SelectionAndUpload: Story = {
  args: {
    selectionMode: "multiple",
    onConfirmSelection: fn(),
    confirmLabel: "Use selected media",
    uploadHint: "JPG, PNG, SVG, PDF up to 20 MB",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: "Media type" }), "document");
    await expect(canvas.getByRole("button", { name: /Spring campaign brief\.pdf/ })).toBeVisible();
    await expect(canvas.queryByRole("button", { name: /Dawn over the ridge/ })).not.toBeInTheDocument();
    await userEvent.selectOptions(canvas.getByRole("combobox", { name: "Media type" }), "all");
    await userEvent.type(canvas.getByRole("searchbox", { name: "Search media" }), "ridge");
    await expect(canvas.getByRole("button", { name: /Dawn over the ridge/ })).toBeVisible();
    await expect(canvas.queryByRole("button", { name: /Studio in late light/ })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: /Dawn over the ridge/ }));
    await expect(canvas.getByRole("status")).toHaveTextContent("1 asset selected");
    await userEvent.click(canvas.getByRole("button", { name: "Use selected media" }));
    await expect(args.onConfirmSelection).toHaveBeenCalled();

    const file = new File(["editorial asset"], "feature.png", { type: "image/png" });
    await userEvent.upload(canvas.getByLabelText("Add media"), file);
    await expect(args.onFilesSelected).toHaveBeenCalledWith([file]);
  },
};

export const BrowseOnly: Story = {
  args: {
    selectionMode: "none",
    defaultSelectedIds: ["ridge"],
    onConfirmSelection: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("status")).toHaveTextContent("0 assets selected");
    await expect(canvas.queryByRole("button", { name: "Use selection" })).not.toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: /Dawn over the ridge/ })).toBeDisabled();
  },
};

export const EmptyLibrary: Story = {
  args: { assets: [], emptyMessage: "No files have been added to this workspace." },
};

export const NoResults: Story = {
  render: (args) => <MediaLibrary {...args} />,
  args: { assets: sampleAssets },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("searchbox", { name: "Search media" }), "does-not-exist");
    await expect(canvas.getByText("Nothing found")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Clear filters" }));
    await expect(canvas.getByRole("button", { name: /Dawn over the ridge/ })).toBeVisible();
  },
};

function UploadingExample() {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const handleFiles: NonNullable<MediaLibraryProps["onFilesSelected"]> = () => {
    setUploading(true);
    setUploadError("");
    window.setTimeout(() => {
      setUploading(false);
      setUploadError("The file could not be added. Check the file and try again.");
    }, 1100);
  };
  return (
    <MediaLibrary
      assets={sampleAssets}
      onFilesSelected={handleFiles}
      uploading={uploading}
      uploadError={uploadError}
    />
  );
}

export const UploadStates: Story = {
  render: () => <UploadingExample />,
  args: { assets: sampleAssets },
};

export const ThemeCoverage: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: "var(--ds-space-4)" }}>
      {(["acme", "luna", "orchid", "atom", "sublime"] as const).map((theme) => (
        <section key={theme} data-ds-theme={theme} style={{ padding: "var(--ds-space-4)", background: "var(--ds-color-canvas)", color: "var(--ds-color-text-primary)" }}>
          <MediaLibrary {...args} label={`${theme} media`} selectionMode="multiple" />
        </section>
      ))}
    </div>
  ),
  args: { assets: sampleAssets, onConfirmSelection: fn() },
};
