import { createRef } from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Combobox } from "./Combobox/Combobox";
import { MediaLibrary, type MediaAsset } from "./MediaLibrary/MediaLibrary";
import { RequestForm, type RequestFormValues } from "./RequestForm/RequestForm";
import { compareTableSortValues, Table, type TableColumn } from "./Table/Table";

const mediaAssets: MediaAsset[] = [
  {
    id: "garden",
    name: "Garden plan",
    url: "/garden.jpg",
    mimeType: "image/jpeg",
    altText: "Garden beds",
    width: 1600,
    height: 900,
    size: 2 * 1024 * 1024,
    updatedAt: new Date("2026-01-02T12:00:00Z"),
  },
  { id: "video", name: "Walkthrough", url: "/tour.mp4", mimeType: "video/mp4" },
  { id: "audio", name: "Birdsong", url: "/birds.ogg", mimeType: "audio/ogg" },
  { id: "pdf", name: "Invoice", url: "/invoice.pdf", mimeType: "application/pdf" },
  { id: "plain", name: "Notes", url: "/notes.txt", mimeType: "text/plain" },
  { id: "other", name: "Archive", url: "/archive.bin", mimeType: "application/octet-stream" },
];

describe("MediaLibrary", () => {
  it("shows empty and upload-error states and forwards selected files", () => {
    const onFilesSelected = vi.fn();
    render(
      <MediaLibrary
        assets={[]}
        onFilesSelected={onFilesSelected}
        uploadError="The upload failed."
        uploadLabel="Choose files"
      />,
    );
    expect(screen.getByText("Your library is ready for its first asset.")).toBeInTheDocument();
    expect(screen.getByText("Start by adding an image, document, or clip.")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("The upload failed.");
    const file = new File(["image"], "yard.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Choose files"), { target: { files: [file] } });
    expect(onFilesSelected).toHaveBeenCalledWith([file]);
  });

  it("filters media by type and search, clears filters, and displays file classifications", () => {
    render(<MediaLibrary assets={mediaAssets} />);
    expect(screen.getByRole("list", { name: "Available media" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Garden beds" })).toHaveAttribute("src", "/garden.jpg");
    fireEvent.change(screen.getByLabelText("Media type"), { target: { value: "document" } });
    expect(screen.getByRole("button", { name: /Invoice/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Notes/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Walkthrough/ })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Search media"), { target: { value: "missing" } });
    expect(screen.getByText("No assets match these filters.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByRole("button", { name: /Walkthrough/ })).toBeInTheDocument();
    for (const [assetId, type] of [["video", "video"], ["audio", "audio"], ["pdf", "document"], ["other", "other"]] as const) {
      fireEvent.change(screen.getByLabelText("Media type"), { target: { value: type } });
      const labels = { video: "Walkthrough", audio: "Birdsong", pdf: "Invoice", other: "Archive" };
      expect(screen.getByRole("button", { name: new RegExp(labels[assetId]) })).toBeInTheDocument();
    }
  });

  it("supports multi-selection, detail metadata, and confirmation callbacks", () => {
    const onSelectionChange = vi.fn();
    const onConfirmSelection = vi.fn();
    render(
      <MediaLibrary
        assets={mediaAssets}
        onConfirmSelection={onConfirmSelection}
        onSelectionChange={onSelectionChange}
        selectionMode="multiple"
      />,
    );
    const garden = screen.getByRole("button", { name: /Garden plan/ });
    fireEvent.click(garden);
    fireEvent.click(screen.getByRole("button", { name: /Walkthrough/ }));
    expect(garden).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("2 assets selected")).toBeInTheDocument();
    expect(screen.getByText("1600 × 900px")).toBeInTheDocument();
    expect(screen.getByText("2.0 MB")).toBeInTheDocument();
    expect(screen.getByText("Alt text").parentElement).toHaveTextContent("Garden beds");
    expect(screen.getByText("+ 1 more selected")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Use selection" }));
    expect(onConfirmSelection).toHaveBeenCalledWith([mediaAssets[0], mediaAssets[1]]);
    expect(onSelectionChange).toHaveBeenLastCalledWith(["garden", "video"], [mediaAssets[0], mediaAssets[1]]);
    fireEvent.click(garden);
    expect(screen.getByText("1 asset selected")).toBeInTheDocument();
    expect(onSelectionChange).toHaveBeenLastCalledWith(["video"], [mediaAssets[1]]);
  });

  it("toggles the single selected asset off again", () => {
    const onSelectionChange = vi.fn();
    render(<MediaLibrary assets={mediaAssets} onSelectionChange={onSelectionChange} />);
    const garden = screen.getByRole("button", { name: /Garden plan/ });
    fireEvent.click(garden);
    expect(garden).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("1 asset selected")).toBeInTheDocument();
    fireEvent.click(garden);
    expect(garden).toHaveAttribute("aria-pressed", "false");
    expect(onSelectionChange).toHaveBeenLastCalledWith([], []);
  });

  it("supports controlled and disabled selection, uploading presentation, and zero-selection mode", () => {
    const onSelectionChange = vi.fn();
    const onConfirmSelection = vi.fn();
    const { rerender } = render(
      <MediaLibrary
        assets={mediaAssets}
        disabled
        onConfirmSelection={onConfirmSelection}
        onSelectionChange={onSelectionChange}
        onFilesSelected={() => {}}
        selectedIds={["garden"]}
        uploading
      />,
    );
    expect(screen.getByRole("button", { name: /Garden plan/ })).toBeDisabled();
    expect(screen.getByText("Upload in progress")).toBeInTheDocument();
    expect(screen.getByLabelText("Add media")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Use selection" })).toBeDisabled();
    rerender(
      <MediaLibrary
        assets={mediaAssets}
        onConfirmSelection={onConfirmSelection}
        onSelectionChange={onSelectionChange}
        selectionMode="none"
      />,
    );
    expect(screen.queryByRole("button", { name: "Use selection" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Garden plan/ }));
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("formats metadata edge cases, uploads selected files, and toggles controlled selections", () => {
    const onFilesSelected = vi.fn();
    const onSelectionChange = vi.fn();
    const dated = new Date("2026-06-07T12:00:00.000Z");
    const edgeAssets: MediaAsset[] = [
      { id: "tiny", name: "Tiny image", url: "/tiny.png", mimeType: "image/png", size: 512, updatedAt: dated },
      { id: "kilobyte", name: "Small document", url: "/small.pdf", mimeType: "application/pdf", size: 2048, updatedAt: "2026-06-08T12:00:00.000Z", width: 10, height: 20 },
      { id: "invalid", name: "Unknown file", url: "/unknown.bin", mimeType: "application/octet-stream", size: -1, updatedAt: "not a date" },
      { id: "no-date", name: "Undated file", url: "/undated.bin", mimeType: "application/octet-stream", updatedAt: "" },
    ];
    const { rerender } = render(
      <MediaLibrary
        accept="image/*"
        assets={edgeAssets}
        defaultSelectedIds={["tiny"]}
        multipleUploads={false}
        onFilesSelected={onFilesSelected}
        onSelectionChange={onSelectionChange}
        uploadError="The upload failed."
      />,
    );
    expect(screen.getAllByAltText("Tiny image")).toHaveLength(2);
    expect(screen.getByText("512 B")).toBeInTheDocument();
    expect(screen.getByText(new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(dated))).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("The upload failed.");
    const upload = screen.getByLabelText("Add media") as HTMLInputElement;
    expect(upload).toHaveAttribute("accept", "image/*");
    expect(upload).not.toHaveAttribute("multiple");
    const file = new File(["garden"], "garden.png", { type: "image/png" });
    fireEvent.change(upload, { target: { files: [file] } });
    expect(onFilesSelected).toHaveBeenCalledWith([file]);
    expect(upload.value).toBe("");
    fireEvent.change(upload, { target: { files: [] } });
    fireEvent.change(upload, { target: { files: null } });
    expect(onFilesSelected).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: /Tiny image/ }));
    expect(onSelectionChange).toHaveBeenLastCalledWith([], []);
    rerender(
      <MediaLibrary assets={edgeAssets} onSelectionChange={onSelectionChange} selectedIds={["kilobyte"]} />,
    );
    expect(screen.getByText("2 KB")).toBeInTheDocument();
    expect(screen.getByText("10 × 20px")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Small document/ }));
    expect(onSelectionChange).toHaveBeenLastCalledWith([], []);
    rerender(<MediaLibrary assets={edgeAssets} selectedIds={["invalid"]} />);
    expect(screen.queryByText("File size")).not.toBeInTheDocument();
    expect(screen.queryByText("Updated")).not.toBeInTheDocument();
    rerender(<MediaLibrary assets={edgeAssets} selectedIds={["no-date"]} />);
    expect(screen.queryByText("Updated")).not.toBeInTheDocument();
  });

  it("shows the empty-library prompt and upload hint", () => {
    render(
      <MediaLibrary
        assets={[]}
        emptyMessage="Add your first photo."
        onFilesSelected={vi.fn()}
        uploadHint="Images and PDFs are accepted."
      />,
    );
    expect(screen.getByText("Add your first photo.")).toBeInTheDocument();
    expect(screen.getByText("Images and PDFs are accepted.")).toBeInTheDocument();
    expect(screen.getByText("Start by adding an image, document, or clip.")).toBeInTheDocument();
  });
});

describe("Combobox", () => {
  const options = [
    { value: "oak", label: "Oak" },
    { value: "maple", label: "Maple", disabled: true },
    { value: "cedar", label: "Cedar" },
  ];

  it("filters options, skips disabled choices, selects with the keyboard, and clears", () => {
    const onValueChange = vi.fn();
    render(<Combobox label="Tree species" name="species" onValueChange={onValueChange} options={options} required />);
    const input = screen.getByRole("combobox", { name: "Tree species" });
    fireEvent.focus(input);
    expect(screen.getByRole("listbox")).toBeVisible();
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input).toHaveAttribute("aria-activedescendant", expect.stringContaining("option-2"));
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith("cedar");
    expect(input).toHaveValue("Cedar");
    expect(screen.getByDisplayValue("cedar")).toHaveAttribute("name", "species");
    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(input).toHaveValue("");
  });

  it("shows custom-filter empty results and loading, and closes on outside pointer or Escape", () => {
    const customFilter = vi.fn(() => []);
    const { rerender } = render(
      <Combobox filterOptions={customFilter} label="Custom trees" noResultsMessage="No matching trees." options={options} />,
    );
    const input = screen.getByRole("combobox", { name: "Custom trees" });
    fireEvent.focus(input);
    expect(screen.getByRole("status")).toHaveTextContent("No matching trees.");
    expect(customFilter).toHaveBeenCalled();
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input).toHaveAttribute("aria-expanded", "false");
    rerender(<Combobox label="Custom trees" loading loadingMessage="Fetching trees…" options={options} />);
    fireEvent.focus(screen.getByRole("combobox", { name: "Custom trees" }));
    expect(screen.getByRole("status")).toHaveTextContent("Fetching trees…");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    fireEvent.pointerDown(document.body);
    expect(screen.getByRole("combobox", { name: "Custom trees" })).toHaveAttribute("aria-expanded", "false");
  });

  it("supports controlled values, native callbacks, disabled state, and validates options", () => {
    const onChange = vi.fn();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <Combobox
        description="Pick a tree"
        error="Select a valid tree."
        label="Controlled tree"
        onBlur={onBlur}
        onChange={onChange}
        onFocus={onFocus}
        onValueChange={onValueChange}
        options={options}
        value="oak"
      />,
    );
    const input = screen.getByRole("combobox", { name: "Controlled tree" });
    expect(input).toHaveValue("Oak");
    expect(input).toHaveAttribute("aria-invalid", "true");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "C" } });
    expect(onChange).toHaveBeenCalled();
    expect(onValueChange).toHaveBeenCalledWith(null);
    fireEvent.blur(input);
    expect(onFocus).toHaveBeenCalled();
    expect(onBlur).toHaveBeenCalled();
    rerender(<Combobox disabled label="Controlled tree" options={options} value="oak" />);
    expect(screen.getByRole("combobox", { name: "Controlled tree" })).toBeDisabled();
    expect(() => render(<Combobox label="Invalid" options={[{ value: "", label: "Empty value" }]} />)).toThrow(/non-empty/);
    expect(() => render(<Combobox label="Duplicate" options={[{ value: "same", label: "One" }, { value: "same", label: "Two" }]} />)).toThrow(/unique/);
    expect(() => render(<Combobox label="Missing value" options={options} value="elm" />)).toThrow(/match an option/);
  });

  it("supports Home, End, ArrowUp, Tab, disabled choices, and custom validity", () => {
    const onValueChange = vi.fn();
    render(
      <Combobox
        defaultValue="oak"
        label="Navigable species"
        options={options}
        onValueChange={onValueChange}
        required
        requiredMessage="Choose a species first."
      />,
    );
    const input = screen.getByRole("combobox", { name: "Navigable species" }) as HTMLInputElement;
    expect(input.validationMessage).toBe("");
    fireEvent.focus(input);
    expect(input).toHaveAttribute("aria-activedescendant", expect.stringContaining("option-0"));
    fireEvent.pointerDown(input);
    expect(input).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input).toHaveAttribute("aria-activedescendant", expect.stringContaining("option-2"));
    fireEvent.keyDown(input, { key: "Home" });
    expect(input).toHaveAttribute("aria-activedescendant", expect.stringContaining("option-0"));
    fireEvent.keyDown(input, { key: "End" });
    expect(input).toHaveAttribute("aria-activedescendant", expect.stringContaining("option-2"));
    fireEvent.click(screen.getByRole("option", { name: "Maple" }));
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("option", { name: "Oak" }));
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: "Tab" });
    expect(input).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(input.validationMessage).toBe("Choose a species first.");
  });

  it("keeps an all-disabled list inactive and avoids opening a disabled combobox", () => {
    const onFocus = vi.fn();
    const onValueChange = vi.fn();
    const allDisabled = [
      { value: "oak", label: "Oak", disabled: true },
      { value: "maple", label: "Maple", disabled: true },
    ];
    const { rerender } = render(
      <Combobox label="Unavailable trees" onValueChange={onValueChange} options={allDisabled} onFocus={onFocus} />,
    );
    const input = screen.getByRole("combobox", { name: "Unavailable trees" });
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input).not.toHaveAttribute("aria-activedescendant");
    fireEvent.click(screen.getByRole("option", { name: "Oak" }));
    expect(onValueChange).not.toHaveBeenCalled();
    rerender(<Combobox disabled label="Disabled trees" onFocus={onFocus} options={options} />);
    const disabledInput = screen.getByRole("combobox", { name: "Disabled trees" });
    fireEvent.focus(disabledInput);
    fireEvent.keyDown(disabledInput, { key: "ArrowDown" });
    expect(disabledInput).toHaveAttribute("aria-expanded", "false");
    expect(onFocus).toHaveBeenCalledTimes(2);
  });

  it("filters typed input, handles pointer navigation, and forwards callback and object refs", () => {
    const callbackRef = vi.fn();
    const objectRef = createRef<HTMLInputElement>();
    const customFilter = vi.fn((available: typeof options, _query: string) => available);
    const { rerender } = render(
      <Combobox
        allowClear
        filterOptions={customFilter}
        label="Pointer trees"
        options={options}
        ref={callbackRef}
      />,
    );
    const input = screen.getByRole("combobox", { name: "Pointer trees" });
    expect(callbackRef).toHaveBeenCalledWith(input);
    fireEvent.keyDown(input, { key: "Home" });
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input).toHaveAttribute("aria-activedescendant", expect.stringContaining("option-2"));
    fireEvent.keyDown(input, { key: "Home" });
    expect(input).toHaveAttribute("aria-activedescendant", expect.stringContaining("option-0"));
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input).toHaveAttribute("aria-activedescendant", expect.stringContaining("option-2"));
    fireEvent.keyDown(input, { key: "x" });
    fireEvent.keyDown(input, { key: "Tab" });
    expect(input).toHaveAttribute("aria-expanded", "false");
    fireEvent.focus(input);
    const oak = screen.getByRole("option", { name: "Oak" });
    fireEvent.pointerDown(oak);
    fireEvent.pointerEnter(screen.getByRole("option", { name: "Cedar" }));
    expect(input).toHaveAttribute("aria-activedescendant", expect.stringContaining("option-2"));
    fireEvent.pointerEnter(screen.getByRole("option", { name: "Maple" }));
    expect(input).toHaveAttribute("aria-activedescendant", expect.stringContaining("option-2"));
    fireEvent.change(input, { target: { value: "ced" } });
    expect(customFilter).toHaveBeenCalledWith(options, "ced");
    fireEvent.pointerDown(screen.getByRole("button", { name: "Clear selection" }));

    rerender(<Combobox label="Pointer trees" options={options} ref={objectRef} value={null} />);
    expect(objectRef.current).toBe(screen.getByRole("combobox", { name: "Pointer trees" }));
  });
});

describe("RequestForm", () => {
  it("submits normalized appointment fields, confirms success, and resets when requested", async () => {
    const onSubmit = vi.fn(async (_values: RequestFormValues, _formData: FormData) => {});
    render(
      <RequestForm
        defaultValues={{ name: "  Ada Lovelace ", email: " ada@example.com ", service: "pruning" }}
        heading="Book a visit"
        includeConsent
        includePhone={false}
        includeService
        onSubmit={onSubmit}
        requestType="appointment"
        resetOnSuccess
        serviceOptions={[{ value: "pruning", label: "Pruning" }]}
        successMessage="Request received."
        variant="surface"
      />,
    );
    expect(screen.getByRole("heading", { name: "Book a visit" })).toBeInTheDocument();
    expect(screen.getByLabelText("Preferred date")).toBeInTheDocument();
    expect(screen.getByLabelText("Preferred time")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: /Full name/ }), { target: { value: "  Grace Hopper " } });
    fireEvent.change(screen.getByRole("textbox", { name: /Email/ }), { target: { value: " grace@example.com " } });
    fireEvent.change(screen.getByRole("combobox", { name: /Service/ }), { target: { value: "pruning" } });
    fireEvent.change(screen.getByRole("textbox", { name: /How can we help/ }), { target: { value: "  Shape the hedge  " } });
    fireEvent.change(screen.getByLabelText("Preferred date"), { target: { value: "2026-11-12" } });
    fireEvent.change(screen.getByLabelText("Preferred time"), { target: { value: "10:15" } });
    fireEvent.click(screen.getByRole("checkbox", { name: /I agree to be contacted/ }));
    fireEvent.submit(screen.getByRole("form", { name: "Book a visit request form" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Request received.");
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      requestType: "appointment",
      name: "Grace Hopper",
      email: "grace@example.com",
      service: "pruning",
      message: "Shape the hedge",
      preferredDate: "2026-11-12",
      preferredTime: "10:15",
      consent: true,
    });
    expect((screen.getByRole("textbox", { name: /Full name/ }) as HTMLInputElement).value.trim()).toBe("Ada Lovelace");
  });

  it("renders optional fields and reports rejected submissions before allowing retry", async () => {
    const onSubmit = vi.fn(async (_values: RequestFormValues, _formData: FormData) => {
      if (onSubmit.mock.calls.length === 1) throw new Error("offline");
    });
    render(
      <RequestForm
        additionalFields={<label><input type="checkbox" /> Add a gate</label>}
        description="Tell us about the project."
        errorMessage="Please try again later."
        heading="Request a quote"
        headingLevel={3}
        includeConsent={false}
        includeMessage={false}
        includePhone={false}
        includePreferredDate={false}
        includePreferredTime
        includeService
        layout="two-column"
        onSubmit={onSubmit}
        privacyText={<a href="/privacy">Privacy notice</a>}
        serviceOptions={[]}
        variant="accent"
      />,
    );
    expect(screen.getByRole("heading", { level: 3, name: "Request a quote" })).toBeInTheDocument();
    expect(screen.getByLabelText("Preferred time")).toBeInTheDocument();
    expect(screen.queryByLabelText("Preferred date")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /Service/ })).toHaveAttribute("placeholder", "Describe the service");
    fireEvent.change(screen.getByRole("textbox", { name: /Service/ }), { target: { value: "Lawn care" } });
    fireEvent.change(screen.getByLabelText("Preferred time"), { target: { value: "14:30" } });
    const form = screen.getByRole("form", { name: "Request a quote request form" });
    fireEvent.submit(form);
    expect(await screen.findByRole("alert")).toHaveTextContent("Please try again later.");
    fireEvent.change(screen.getByRole("textbox", { name: /Full name/ }), { target: { value: "Sam" } });
    fireEvent.submit(form);
    expect(await screen.findByRole("status")).toHaveTextContent("Your quote request has been sent.");
    expect(onSubmit.mock.calls[1]?.[0]).toMatchObject({ service: "Lawn care", preferredTime: "14:30" });
  });

  it("disables all fields during an appointment submission and includes only enabled values", async () => {
    let resolveSubmission: (() => void) | undefined;
    const onSubmit = vi.fn(
      (_values: RequestFormValues, _formData: FormData) =>
        new Promise<void>((resolve) => {
          resolveSubmission = resolve;
        }),
    );
    render(
      <RequestForm
        defaultValues={{
          name: "  Robin ",
          email: " robin@example.com ",
          phone: " 555-0100 ",
          preferredDate: "2026-11-03",
          preferredTime: "09:30",
          consent: true,
        }}
        heading="Schedule work"
        includeConsent
        includeMessage={false}
        includePhone
        includePreferredDate
        includePreferredTime
        includeService={false}
        onSubmit={onSubmit}
        phoneRequired
        preferredDateRequired
        preferredTimeRequired
        requestType="appointment"
        submitLabel="Send request"
        submittingLabel="Sending…"
        variant="accent"
      />,
    );
    fireEvent.change(screen.getByLabelText(/Phone number/), { target: { value: " 555-0199 " } });
    fireEvent.change(screen.getByLabelText(/Preferred date/), { target: { value: "2026-11-20" } });
    fireEvent.change(screen.getByLabelText(/Preferred time/), { target: { value: "11:45" } });
    fireEvent.submit(screen.getByRole("form", { name: "Schedule work request form" }));
    fireEvent.submit(screen.getByRole("form", { name: "Schedule work request form" }));
    expect(screen.getByRole("form", { name: "Schedule work request form" })).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: "Sending…" })).toBeDisabled();
    expect(screen.getByLabelText(/Phone number/)).toBeDisabled();
    expect(screen.getByLabelText(/Preferred date/)).toBeDisabled();
    expect(screen.getByLabelText(/Preferred time/)).toBeDisabled();
    expect(screen.queryByLabelText("Service")).not.toBeInTheDocument();
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({
      requestType: "appointment",
      name: "Robin",
      email: "robin@example.com",
      phone: "555-0199",
      preferredDate: "2026-11-20",
      preferredTime: "11:45",
      consent: true,
    });
    await act(async () => resolveSubmission?.());
    expect(await screen.findByRole("status")).toHaveTextContent("Your appointment request has been sent.");
  });

  it("omits appointment-only fields for a standard quote request", async () => {
    const onSubmit = vi.fn((_values: RequestFormValues, _formData: FormData) => {});
    render(<RequestForm includePhone={false} includeService={false} includeMessage={false} heading="Quick quote" onSubmit={onSubmit} />);
    expect(screen.queryByLabelText("Preferred date")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Preferred time")).not.toBeInTheDocument();
    fireEvent.submit(screen.getByRole("form", { name: "Quick quote request form" }));
    expect(onSubmit.mock.calls[0]?.[0]).not.toHaveProperty("preferredDate");
    expect(onSubmit.mock.calls[0]?.[0]).not.toHaveProperty("preferredTime");
  });

  it("validates headings, request type, and service options", () => {
    const onSubmit = vi.fn((_values: RequestFormValues, _formData: FormData) => {});
    const valid = { heading: "Request", onSubmit };
    expect(() => render(<RequestForm {...valid} heading=" " />)).toThrow(/non-empty `heading`/);
    expect(() => render(<RequestForm {...valid} headingLevel={0 as 2} />)).toThrow(/headingLevel/);
    expect(() => render(<RequestForm {...valid} requestType={"other" as "quote"} />)).toThrow(/requestType/);
    expect(() => render(<RequestForm {...valid} serviceOptions={null as never} />)).toThrow(/serviceOptions.*array/);
    expect(() => render(<RequestForm {...valid} serviceOptions={[null as never]} />)).toThrow(/requires a non-empty value and label/);
    expect(() =>
      render(
        <RequestForm
          {...valid}
          serviceOptions={[
            { value: "pruning", label: "Pruning" },
            { value: "pruning", label: "Duplicate" },
          ]}
        />,
      ),
    ).toThrow(/duplicated/);
  });
});

type Row = { id: string; name: string; score: number; active: boolean; joined: Date; info: { tags: string[] } };
const tableRows: Row[] = [
  { id: "b", name: "Birch", score: 2, active: false, joined: new Date("2024-01-01"), info: { tags: ["shade"] } },
  { id: "a", name: "Alder", score: 10, active: true, joined: new Date("2025-01-01"), info: { tags: ["flowering"] } },
  { id: "c", name: "Cedar", score: 5, active: true, joined: new Date("2023-01-01"), info: { tags: ["evergreen"] } },
];
const tableColumns: TableColumn<Row>[] = [
  { id: "name", header: "Tree", accessor: "name", sortable: true, sortLabel: "Sort by tree", footer: (rows) => `${rows.length} trees` },
  { id: "score", header: "Score", accessor: "score", sortable: true, align: "end", cell: ({ value }) => `#${value}` },
  { id: "active", header: "Active", accessor: "active", hidden: true },
  { id: "info", header: "Details", accessor: "info", hidden: true },
];

describe("Table", () => {
  it("compares nullable sort values before applying stable row order", () => {
    expect(compareTableSortValues(null, null)).toBe(0);
    expect(compareTableSortValues(null, "Birch")).toBe(1);
    expect(compareTableSortValues("Birch", null)).toBe(-1);
    expect(compareTableSortValues(1, 2)).toBe(-1);
  });

  it("sorts, searches nested values, renders cells and footers, and shows no-results feedback", () => {
    const onSearchChange = vi.fn();
    const onSortChange = vi.fn();
    render(
      <Table
        bordered
        caption="Tree inventory"
        columns={tableColumns}
        data={tableRows}
        defaultSort={{ columnId: "score", direction: "asc" }}
        defaultSearchValue=""
        density="compact"
        maxHeight={280}
        onSearchChange={onSearchChange}
        onSortChange={onSortChange}
        searchable
        searchableColumns={["info"]}
        striped
        tableId="inventory"
      />,
    );
    const table = screen.getByRole("table", { name: "Tree inventory" });
    expect(table).toHaveAttribute("id", "inventory");
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent("Birch");
    fireEvent.click(screen.getByRole("button", { name: "Sort by tree" }));
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent("Alder");
    fireEvent.click(screen.getByRole("button", { name: "Sort by tree" }));
    expect(screen.getByRole("columnheader", { name: /Tree/ })).toHaveAttribute("aria-sort", "descending");
    fireEvent.click(screen.getByRole("button", { name: "Sort by tree" }));
    expect(onSortChange).toHaveBeenLastCalledWith(null);
    fireEvent.change(screen.getByRole("searchbox", { name: "Search table" }), { target: { value: "flowering" } });
    expect(screen.getByRole("status")).toHaveTextContent("1 result");
    expect(within(table).getAllByRole("row")).toHaveLength(3);
    expect(onSearchChange).toHaveBeenCalledWith("flowering");
    expect(screen.getByText("1 trees")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox", { name: "Search table" }), { target: { value: "not found" } });
    expect(screen.getByText("No matching rows found.")).toBeInTheDocument();
  });

  it("supports row selection, selectable filtering, and controlled callbacks", () => {
    const onSelectionChange = vi.fn();
    const { rerender } = render(
      <Table
        aria-label="Selectable inventory"
        columns={tableColumns}
        data={tableRows}
        isRowSelectable={(row) => row.id !== "b"}
        getRowKey={(row) => row.id}
        onSelectionChange={onSelectionChange}
        selectRowLabel={(row) => `Choose ${row.name}`}
        selectionMode="multiple"
      />,
    );
    expect(screen.getByLabelText("Choose Birch")).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    expect(onSelectionChange).toHaveBeenCalledWith(["a", "c"], [tableRows[1], tableRows[2]]);
    rerender(
      <Table
        aria-label="Selectable inventory"
        columns={tableColumns}
        data={tableRows}
        onSelectionChange={onSelectionChange}
        selectedRowKeys={["b"]}
        getRowKey={(row) => row.id}
        selectionMode="single"
      />,
    );
    fireEvent.click(screen.getByRole("radio", { name: "Select row 2" }));
    expect(onSelectionChange).toHaveBeenLastCalledWith(["a"], [tableRows[1]]);
  });

  it("covers manual sort, custom search, loading and empty states, and invalid column or row definitions", () => {
    render(
      <Table
        aria-label="Custom table"
        columns={[
          { id: "joined", header: "Joined", accessor: "joined", sortable: true, sortValue: (row: Row) => row.joined },
          { id: "manual", header: "Manual", accessor: "score", sortable: true, compare: (a, b) => a.score - b.score },
        ]}
        data={tableRows}
        loading
        loadingMessage="Loading inventory."
        searchable
        searchFunction={(row, query) => row.name.toLowerCase().startsWith(query.toLowerCase())}
        sort={{ columnId: "manual", direction: "desc" }}
        sortMode="manual"
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Loading inventory.");
    expect(screen.getByRole("table", { name: "Custom table" })).toHaveAttribute("aria-busy", "true");
    fireEvent.change(screen.getByRole("searchbox", { name: "Search table" }), { target: { value: "A" } });
    expect(screen.getByRole("search")).toBeInTheDocument();
    fireEvent.submit(screen.getByRole("search"));
    expect(() =>
      render(<Table aria-label="Empty columns" columns={[{ id: "hidden", header: "Hidden", hidden: true }]} data={tableRows} />),
    ).toThrow(/at least one visible column/);
    expect(() =>
      render(<Table aria-label="Duplicate columns" columns={[{ id: "x", header: "X" }, { id: "x", header: "Again" }]} data={tableRows} />),
    ).toThrow(/must be unique/);
    expect(() =>
      render(<Table aria-label="Unknown search column" columns={tableColumns} data={tableRows} searchable searchableColumns={["missing"]} />),
    ).toThrow(/unknown column/);
    expect(() =>
      render(<Table aria-label="Duplicate rows" columns={tableColumns} data={tableRows} getRowKey={() => "same"} />),
    ).toThrow(/row keys must be unique/);
  });

  it("sorts dates, booleans and nullable values and renders custom cells and footers", () => {
    type SampleRow = {
      id: string;
      name: string;
      score: number | null;
      active: boolean;
      joined: Date;
      rank: number;
    };
    const rows: SampleRow[] = [
      { id: "a", name: "Alder", score: null, active: false, joined: new Date("2024-04-01"), rank: 3 },
      { id: "b", name: "Birch", score: 2, active: true, joined: new Date("2024-02-01"), rank: 1 },
      { id: "c", name: "Cedar", score: 1, active: true, joined: new Date("2024-03-01"), rank: 2 },
    ];
    const compare = vi.fn((_left: SampleRow, _right: SampleRow) => Number.NaN);
    render(
      <Table<SampleRow>
        aria-label="Typed table"
        columns={[
          { id: "name", header: "Name", sortable: true, sortLabel: "Sort by name", align: "start" },
          { id: "score", header: "Score", accessor: "score", sortable: true, sortLabel: "Sort by score" },
          { id: "active", header: "Active", accessor: (row) => row.active, sortable: true, sortLabel: "Sort by active" },
          { id: "joined", header: "Joined", accessor: "joined", sortable: true, sortLabel: "Sort by joined" },
          { id: "rank", header: "Rank", accessor: "rank", sortValue: (row) => row.rank, sortable: true, sortLabel: "Sort by rank" },
          { id: "custom", header: "Custom", accessor: "id", compare, sortable: true, sortLabel: "Sort by custom", cell: ({ value }) => `id:${String(value)}`, footer: (visibleRows) => `Count ${visibleRows.length}` },
        ]}
        data={rows}
        defaultSort={{ columnId: "score", direction: "asc" }}
      />,
    );
    const table = screen.getByRole("table", { name: "Typed table" });
    const bodyRows = () => within(table).getAllByRole("row").slice(1).map((row) => row.textContent);
    expect(bodyRows()[0]).toContain("Cedar");
    expect(bodyRows()[1]).toContain("Birch");
    expect(bodyRows()[2]).toContain("Alder");
    expect(screen.getByText("id:a")).toBeInTheDocument();
    expect(screen.getByText("Count 3")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Sort by joined" }));
    expect(bodyRows()[0]).toContain("Birch");
    fireEvent.click(screen.getByRole("button", { name: "Sort by active" }));
    expect(bodyRows()[0]).toContain("Alder");
    fireEvent.click(screen.getByRole("button", { name: "Sort by rank" }));
    expect(bodyRows()[0]).toContain("Birch");
    fireEvent.click(screen.getByRole("button", { name: "Sort by custom" }));
    expect(compare).toHaveBeenCalled();
  });

  it("tracks partial controlled selections and clears only selectable rows", () => {
    const onSelectionChange = vi.fn();
    const { rerender } = render(
      <Table
        aria-label="Partially selected inventory"
        columns={tableColumns}
        data={tableRows}
        getRowKey={(row) => row.id}
        isRowSelectable={(row) => row.id !== "b"}
        onSelectionChange={onSelectionChange}
        selectedRowKeys={["a"]}
        selectionMode="multiple"
      />,
    );
    const selectAll = screen.getByRole("checkbox", { name: "Select all rows" }) as HTMLInputElement;
    expect(selectAll.indeterminate).toBe(true);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select row 3" }));
    expect(onSelectionChange).toHaveBeenLastCalledWith(["a", "c"], [tableRows[1], tableRows[2]]);
    rerender(
      <Table
        aria-label="Partially selected inventory"
        columns={tableColumns}
        data={tableRows}
        getRowKey={(row) => row.id}
        isRowSelectable={(row) => row.id !== "b"}
        onSelectionChange={onSelectionChange}
        selectedRowKeys={["a", "c"]}
        selectionMode="multiple"
      />,
    );
    expect(selectAll).toBeChecked();
    fireEvent.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    expect(onSelectionChange).toHaveBeenLastCalledWith([], []);
    rerender(
      <Table
        aria-label="Partially selected inventory"
        columns={tableColumns}
        data={tableRows}
        getRowKey={(row) => row.id}
        isRowSelectable={() => false}
        onSelectionChange={onSelectionChange}
        selectionMode="multiple"
      />,
    );
    expect(screen.getByRole("checkbox", { name: "Select all rows" })).toBeDisabled();
  });

  it("renders empty, loading, and no-results messages and validates empty column ids", () => {
    const { rerender } = render(
      <Table
        aria-label="Empty table"
        columns={[{ id: "name", header: "Name" }]}
        data={[]}
        emptyState="Nothing here."
      />,
    );
    expect(screen.getByText("Nothing here.")).toBeInTheDocument();
    rerender(
      <Table
        aria-label="Empty table"
        columns={[{ id: "name", header: "Name" }]}
        data={[]}
      />,
    );
    expect(screen.getByRole("heading", { level: 3, name: "No rows to display." })).toBeInTheDocument();
    rerender(
      <Table
        aria-label="Empty table"
        columns={[{ id: "name", header: "Name" }]}
        data={[]}
        loading
        loadingMessage="Still loading."
        searchable
        searchValue="missing"
      />,
    );
    expect(screen.getAllByRole("status")[1]).toHaveTextContent("Still loading.");
    expect(screen.getByRole("cell")).toHaveTextContent("Still loading.");
    expect(() =>
      render(<Table aria-label="Missing column id" columns={[{ id: " ", header: "Missing" }]} data={tableRows} />),
    ).toThrow(/non-empty/);
  });

  it("covers controlled search and sort, nullable values, cycles, dimensions, and selection removal", () => {
    type EdgeRow = {
      id: string;
      name: string;
      rank: number | null;
      date: Date | null;
      metadata: Record<string, unknown>;
    };
    const cyclic: Record<string, unknown> = { label: "nested metadata" };
    cyclic.self = cyclic;
    const rows: EdgeRow[] = [
      { id: "a", name: "Alpha", rank: null, date: new Date("2024-01-01"), metadata: cyclic },
      { id: "b", name: "Beta", rank: null, date: null, metadata: { label: "plain" } },
      { id: "c", name: "Gamma", rank: 1, date: new Date("2023-01-01"), metadata: { label: "other" } },
    ];
    const onSearchChange = vi.fn();
    const onSortChange = vi.fn();
    const onSelectionChange = vi.fn();
    const columns: TableColumn<EdgeRow>[] = [
      { id: "name", header: "Name", accessor: "name", sortable: true, sortLabel: "Sort by name", width: 180 },
      { id: "rank", header: "Rank", accessor: "rank", sortable: true, sortLabel: "Sort by rank" },
      { id: "date", header: "Date", accessor: "date" },
      { id: "metadata", header: "Metadata", accessor: "metadata" },
    ];
    const { rerender } = render(
      <Table
        aria-label="Edge-case table"
        caption="Edge-case data"
        captionHidden
        columns={columns}
        data={rows}
        defaultSelectedRowKeys={["a"]}
        getRowKey={(row) => row.id}
        maxHeight="22rem"
        minTableWidth={640}
        onSearchChange={onSearchChange}
        onSelectionChange={onSelectionChange}
        onSortChange={onSortChange}
        searchable
        searchableColumns={["date", "metadata", "rank"]}
        searchValue=""
        selectRowLabel={(row) => `Select ${row.name}`}
        selectionMode="multiple"
        sort={{ columnId: "rank", direction: "asc" }}
      />,
    );
    const table = screen.getByRole("table", { name: "Edge-case table" });
    expect(within(table).getByText("Edge-case data")).toHaveClass(/visuallyHidden/);
    expect(table).toHaveStyle({ minWidth: "640px" });
    fireEvent.click(screen.getByRole("button", { name: "Sort by rank" }));
    expect(onSortChange).toHaveBeenCalledWith({ columnId: "rank", direction: "desc" });
    fireEvent.click(screen.getByRole("checkbox", { name: "Select Alpha" }));
    expect(onSelectionChange).toHaveBeenLastCalledWith([], []);
    const search = screen.getByRole("searchbox", { name: "Search table" });
    fireEvent.change(search, { target: { value: "not found" } });
    expect(onSearchChange).toHaveBeenCalledWith("not found");
    expect(search).toHaveValue("");
    rerender(
      <Table
        aria-label="Edge-case table"
        caption="Edge-case data"
        captionHidden
        columns={columns}
        data={rows}
        maxHeight="22rem"
        minTableWidth={640}
        onSearchChange={onSearchChange}
        onSortChange={onSortChange}
        searchable
        searchableColumns={["date", "metadata", "rank"]}
        searchValue="not found"
        sort={{ columnId: "rank", direction: "asc" }}
      />,
    );
    expect(screen.getByText("No matching rows found.")).toBeInTheDocument();
  });

  it("keeps rows in their original order when all values in a sorted column are null", () => {
    type NullRow = { id: string; nullable: string | null };
    const rows: NullRow[] = [
      { id: "first", nullable: null },
      { id: "second", nullable: null },
    ];
    const columns: TableColumn<NullRow>[] = [
      { id: "label", header: "Label", accessor: "id" },
      {
        id: "nullable",
        header: "Nullable",
        accessor: "nullable",
        sortable: true,
        sortValue: (row) => row.nullable,
      },
    ];
    render(
      <Table
        aria-label="Null values"
        columns={columns}
        data={rows}
        defaultSort={{ columnId: "nullable", direction: "asc" }}
        getRowKey={(row) => row.id}
      />,
    );
    const table = screen.getByRole("table", { name: "Null values" });
    fireEvent.click(screen.getByRole("button", { name: "Nullable" }));
    expect(within(table).getAllByRole("row")[1]).toHaveTextContent("first");
    expect(within(table).getAllByRole("row")[2]).toHaveTextContent("second");
  });
});
