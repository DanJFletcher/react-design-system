import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@tiptap/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tiptap/react")>();
  return {
    ...actual,
    useEditor: () => null,
    useEditorState: (options: { selector: (state: { editor: null }) => unknown }) =>
      options.selector({ editor: null }),
  };
});

import { RichTextEditor } from "./RichTextEditor";

describe("RichTextEditor without an editor instance", () => {
  it("keeps the toolbar unavailable while rendering the fallback editor state", () => {
    render(<RichTextEditor disabled label="Unavailable editor" />);
    expect(screen.getByRole("button", { name: "Bold" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();
    expect(screen.getByRole("combobox", { name: "Block style" })).toBeDisabled();
    expect(screen.getByText("Disabled")).toBeInTheDocument();
    expect(screen.queryByRole("form", { name: "Insert link" })).not.toBeInTheDocument();
  });
});
