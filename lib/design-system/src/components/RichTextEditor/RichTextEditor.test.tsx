import { fireEvent, render, screen } from "@testing-library/react";
import type { Editor } from "@tiptap/react";
import { describe, expect, it, vi } from "vitest";
import { applyLink, RichTextEditor, type RichTextEditorDocument } from "./RichTextEditor";

const starterDocument: RichTextEditorDocument = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "Garden notes" }] }],
};

describe("RichTextEditor", () => {
  it("applies a link mark to an existing non-empty editor selection", () => {
    const chain = {
      focus: vi.fn(),
      setLink: vi.fn(),
      insertContent: vi.fn(),
      run: vi.fn(),
    };
    chain.focus.mockReturnValue(chain);
    chain.setLink.mockReturnValue(chain);
    const editor = {
      state: { selection: { empty: false, from: 1, to: 7 } },
      chain: () => chain,
      commands: { focus: vi.fn() },
    } as unknown as Editor;

    applyLink(editor, "https://example.com/garden", "ignored text");

    expect(chain.focus).toHaveBeenCalledOnce();
    expect(chain.setLink).toHaveBeenCalledWith({ href: "https://example.com/garden" });
    expect(chain.insertContent).not.toHaveBeenCalled();
    expect(editor.commands.focus).not.toHaveBeenCalled();
  });

  it("renders an accessible editor, formats content, and emits updated documents", () => {
    const onChange = vi.fn();
    render(
      <RichTextEditor
        defaultValue={starterDocument}
        description="Write the article body."
        label="Article body"
        onChange={onChange}
        placeholder="Add article text"
      />,
    );
    const editor = screen.getByRole("textbox", { name: "Article body" });
    expect(editor).toHaveAttribute("aria-multiline", "true");
    expect(editor).toHaveAttribute("aria-describedby");
    expect(editor).toHaveAttribute("aria-readonly", "false");
    expect(editor).toHaveTextContent("Garden notes");
    expect(screen.getByRole("toolbar", { name: "Article body formatting" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Text style" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();
    fireEvent.change(screen.getByRole("combobox", { name: "Block style" }), { target: { value: "h2" } });
    expect(editor.querySelector("h2")).toHaveTextContent("Garden notes");
    fireEvent.click(screen.getByRole("button", { name: "Bold" }));
    expect(onChange).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Undo" })).toBeEnabled();
  });

  it("validates link and image forms, inserts accessible media, and allows cancelling", () => {
    render(<RichTextEditor label="Page content" />);
    fireEvent.click(screen.getByRole("button", { name: "Insert link" }));
    const linkForm = screen.getByRole("form", { name: "Insert link" });
    fireEvent.change(screen.getByLabelText("Destination URL"), { target: { value: "not a URL" } });
    fireEvent.submit(linkForm);
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a valid HTTP or HTTPS URL.");
    fireEvent.change(screen.getByLabelText("Destination URL"), { target: { value: "javascript:alert(1)" } });
    fireEvent.submit(linkForm);
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a valid HTTP or HTTPS URL.");
    fireEvent.change(screen.getByLabelText("Destination URL"), { target: { value: "https://example.com/garden" } });
    fireEvent.change(screen.getByLabelText(/Link text/), { target: { value: "Garden guide" } });
    fireEvent.submit(linkForm);
    expect(screen.queryByRole("form", { name: "Insert link" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Garden guide" })).toHaveAttribute("href", "https://example.com/garden");

    fireEvent.click(screen.getByRole("button", { name: "Insert image" }));
    const imageForm = screen.getByRole("form", { name: "Insert image" });
    fireEvent.change(screen.getByLabelText("Image URL"), { target: { value: "https://example.com/plan.png" } });
    fireEvent.submit(imageForm);
    expect(screen.getByRole("alert")).toHaveTextContent("Add alternative text for this image.");
    fireEvent.change(screen.getByLabelText("Alternative text"), { target: { value: "Garden plan" } });
    fireEvent.submit(imageForm);
    expect(screen.getByRole("img", { name: "Garden plan" })).toHaveAttribute("src", "https://example.com/plan.png");
    fireEvent.click(screen.getByRole("button", { name: "Insert link" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("form", { name: "Insert link" })).not.toBeInTheDocument();
  });

  it("links selected text and uses the URL when no link text is supplied", () => {
    render(<RichTextEditor label="URL link text" />);
    fireEvent.click(screen.getByRole("button", { name: "Insert link" }));
    fireEvent.change(screen.getByLabelText("Destination URL"), { target: { value: "https://example.com/quick-link" } });
    fireEvent.submit(screen.getByRole("form", { name: "Insert link" }));
    expect(screen.getByRole("link", { name: "https://example.com/quick-link" })).toHaveAttribute(
      "href",
      "https://example.com/quick-link",
    );
  });

  it("updates controlled content without emitting changes and disables editing when read-only or disabled", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <RichTextEditor
        label="Controlled page"
        onChange={onChange}
        value={starterDocument}
      />,
    );
    expect(screen.getByRole("textbox", { name: "Controlled page" })).toHaveTextContent("Garden notes");
    const initialChangeCount = onChange.mock.calls.length;
    const changedDocument: RichTextEditorDocument = {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Updated content" }] }],
    };
    rerender(<RichTextEditor label="Controlled page" onChange={onChange} value={changedDocument} />);
    expect(screen.getByRole("textbox", { name: "Controlled page" })).toHaveTextContent("Updated content");
    expect(onChange).toHaveBeenCalledTimes(initialChangeCount);
    rerender(<RichTextEditor label="Controlled page" readOnly value={changedDocument} />);
    expect(screen.getByRole("textbox", { name: "Controlled page" })).toHaveAttribute("aria-readonly", "true");
    expect(screen.getByRole("button", { name: "Bold" })).toBeDisabled();
    expect(screen.getByText("Read only")).toBeInTheDocument();
    rerender(<RichTextEditor label="Controlled page" disabled value={changedDocument} />);
    expect(screen.getByRole("textbox", { name: "Controlled page" })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("Disabled")).toBeInTheDocument();
  });

  it("runs paragraph, inline, block, and history toolbar commands", () => {
    const onChange = vi.fn();
    render(<RichTextEditor defaultValue={starterDocument} label="Commands" onChange={onChange} />);
    const paragraphStyle = screen.getByRole("combobox", { name: "Block style" });
    fireEvent.change(paragraphStyle, { target: { value: "paragraph" } });
    fireEvent.change(paragraphStyle, { target: { value: "h1" } });
    fireEvent.change(paragraphStyle, { target: { value: "h3" } });
    for (const label of ["Bold", "Italic", "Bulleted list", "Numbered list", "Blockquote"]) {
      const button = screen.getByRole("button", { name: label });
      fireEvent.mouseDown(button);
      fireEvent.click(button);
    }
    expect(screen.getByRole("button", { name: "Undo" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByRole("button", { name: "Redo" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    expect(onChange).toHaveBeenCalled();
  });
});
