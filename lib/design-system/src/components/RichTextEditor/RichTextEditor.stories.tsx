import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "storybook/test";
import { RichTextEditor, type RichTextEditorDocument } from "./RichTextEditor";

const article: RichTextEditorDocument = {
  type: "doc",
  content: [
    { type: "paragraph", content: [{ type: "text", text: "A considered first draft." }] },
    { type: "paragraph", content: [{ type: "text", text: "Select text or keep writing to shape the story." }] },
  ],
};

const meta = {
  title: "Components/RichTextEditor",
  component: RichTextEditor,
  args: {
    label: "Article body",
    description: "Write and format the content shown on your page.",
    defaultValue: article,
    onChange: fn(),
  },
  parameters: { layout: "padded" },
} satisfies Meta<typeof RichTextEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const FormattingAndSerialization: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const editor = canvas.getByRole("textbox", { name: "Article body" });
    await userEvent.click(editor);
    await userEvent.click(canvas.getByRole("button", { name: "Bold" }));
    await userEvent.keyboard("More words");
    await expect(canvas.getByRole("button", { name: "Bold" })).toHaveAttribute("aria-pressed", "true");
    await expect(args.onChange).toHaveBeenCalled();
    const emitted = (args.onChange as ReturnType<typeof fn>).mock.calls.at(-1)?.[0] as RichTextEditorDocument;
    await expect(emitted.type).toBe("doc");
    await expect(JSON.stringify(emitted)).toContain("More words");
  },
};

export const InsertLink: Story = {
  args: { defaultValue: { type: "doc", content: [{ type: "paragraph" }] } },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Insert link" }));
    await userEvent.type(canvas.getByLabelText("Destination URL"), "https://example.org/story");
    await userEvent.type(canvas.getByLabelText(/Link text/), "Read the story");
    await userEvent.click(within(canvas.getByRole("form", { name: "Insert link" })).getByRole("button", { name: "Insert link" }));
    await expect(canvas.getByRole("textbox", { name: "Article body" }).querySelector("a")).toHaveAttribute("href", "https://example.org/story");
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const InsertImage: Story = {
  args: { defaultValue: { type: "doc", content: [{ type: "paragraph" }] } },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Insert image" }));
    await userEvent.type(canvas.getByLabelText("Image URL"), "https://example.org/field-notes.jpg");
    await userEvent.type(canvas.getByLabelText("Alternative text"), "Field notes beside a window");
    await userEvent.click(within(canvas.getByRole("form", { name: "Insert image" })).getByRole("button", { name: "Insert image" }));
    await expect(canvas.getByRole("textbox", { name: "Article body" }).querySelector("img")).toHaveAttribute("alt", "Field notes beside a window");
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const ReadOnly: Story = {
  args: { readOnly: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox", { name: "Article body" })).toHaveAttribute("aria-readonly", "true");
    await expect(canvas.getByRole("button", { name: "Bold" })).toBeDisabled();
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("textbox", { name: "Article body" })).toHaveAttribute("aria-disabled", "true");
    await expect(canvas.getByRole("button", { name: "Insert image" })).toBeDisabled();
  },
};

export const RejectsUnsafeLinkProtocol: Story = {
  args: { defaultValue: { type: "doc", content: [{ type: "paragraph" }] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Insert link" }));
    await userEvent.type(canvas.getByLabelText("Destination URL"), "javascript:alert(1)");
    await userEvent.click(within(canvas.getByRole("form", { name: "Insert link" })).getByRole("button", { name: "Insert link" }));
    await expect(canvas.getByRole("alert")).toHaveTextContent("HTTP or HTTPS");
  },
};
