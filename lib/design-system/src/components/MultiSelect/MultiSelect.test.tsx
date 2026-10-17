import { createRef } from "react";
import type { ComponentProps, KeyboardEvent as ReactKeyboardEvent } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MultiSelect, type MultiSelectOption } from "./MultiSelect";

const options: readonly MultiSelectOption[] = [
  { value: "design", label: "Design systems" },
  { value: "a11y", label: "Accessibility" },
  { value: "react", label: "React" },
  { value: "locked", label: "Locked option", disabled: true },
];

describe("MultiSelect", () => {
  it("filters, toggles values, submits repeated fields, and clears required validity", async () => {
    render(
      <form aria-label="Topic form">
        <MultiSelect
          description="Choose topics."
          label="Topics"
          name="topics"
          options={options}
          required
          placeholder="Search topics"
        />
      </form>,
    );

    const input = screen.getByRole("combobox", { name: "Topics" }) as HTMLInputElement;
    const form = screen.getByRole("form", { name: "Topic form" }) as HTMLFormElement;
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toHaveAttribute("aria-describedby", expect.stringContaining("description"));
    expect(input).toHaveAttribute("placeholder", "Search topics");
    expect(form.checkValidity()).toBe(false);

    fireEvent.focus(input);
    expect(screen.getByRole("listbox")).toHaveAttribute("aria-multiselectable", "true");
    fireEvent.change(input, { target: { value: "design" } });
    expect(screen.getAllByRole("option")).toHaveLength(1);
    const design = screen.getByRole("option", { name: "Design systems" });
    fireEvent.pointerDown(design);
    fireEvent.click(design);

    expect(screen.getByRole("button", { name: "Remove Design systems" })).toBeInTheDocument();
    expect(input).toHaveValue("");
    expect(form.checkValidity()).toBe(true);
    expect(new FormData(form).getAll("topics")).toEqual(["design"]);

    fireEvent.change(input, { target: { value: "react" } });
    const react = screen.getByRole("option", { name: "React" });
    fireEvent.pointerEnter(react);
    fireEvent.click(react);
    expect(new FormData(form).getAll("topics")).toEqual(["design", "react"]);
    const removeDesign = screen.getByRole("button", { name: "Remove Design systems" });
    fireEvent.pointerDown(removeDesign);
    fireEvent.click(removeDesign);
    expect(new FormData(form).getAll("topics")).toEqual(["react"]);
    const clear = screen.getByRole("button", { name: "Clear selections" });
    fireEvent.pointerDown(clear);
    fireEvent.click(clear);
    expect(new FormData(form).getAll("topics")).toEqual([]);
    await waitFor(() => expect(form.checkValidity()).toBe(false));
  });

  it("supports keyboard navigation, selection toggling, escape, tab, and backspace removal", () => {
    render(
      <MultiSelect
        defaultValue={["design", "react"]}
        label="Topics"
        options={options}
      />,
    );
    const input = screen.getByRole("combobox", { name: "Topics" });

    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input).toHaveAttribute("aria-activedescendant", expect.stringContaining("option-2"));
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input).toHaveAttribute("aria-activedescendant", expect.stringContaining("option-0"));
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input).toHaveAttribute("aria-activedescendant", expect.stringContaining("option-1"));
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input).toHaveAttribute("aria-activedescendant", expect.stringContaining("option-2"));
    fireEvent.keyDown(input, { key: "End" });
    expect(input).toHaveAttribute("aria-activedescendant", expect.stringContaining("option-2"));
    fireEvent.keyDown(input, { key: "Home" });
    expect(input).toHaveAttribute("aria-activedescendant", expect.stringContaining("option-0"));
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.queryByRole("button", { name: "Remove Design systems" })).not.toBeInTheDocument();
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByRole("button", { name: "Remove Design systems" })).toBeInTheDocument();
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).toHaveValue("");
    fireEvent.keyDown(input, { key: "Escape" });

    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(screen.queryByRole("button", { name: "Remove Design systems" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove React" })).toBeInTheDocument();
    fireEvent.keyDown(input, { key: "Tab" });
    expect(input).toHaveAttribute("aria-expanded", "false");
    fireEvent.keyDown(input, { key: "Home" });
    fireEvent.keyDown(input, { key: "End" });
    fireEvent.keyDown(input, { key: "Backspace" });
  });

  it("does not remove disabled selected options with Backspace and ignores disabled options", () => {
    render(
      <MultiSelect
        defaultValue={["locked"]}
        label="Topics"
        options={options}
      />,
    );
    const input = screen.getByRole("combobox", { name: "Topics" });
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(screen.getByRole("button", { name: "Remove Locked option" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("option", { name: "Locked option" }));
    expect(screen.getByRole("button", { name: "Remove Locked option" })).toBeInTheDocument();
    fireEvent.pointerEnter(screen.getByRole("option", { name: "Locked option" }));
  });

  it("supports controlled selection, custom filtering, and native input callbacks", () => {
    const onValueChange = vi.fn();
    const filterOptions = vi.fn((items: readonly MultiSelectOption[]) => items.filter((item) => item.value === "react"));
    const onChange = vi.fn();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const ref = createRef<HTMLInputElement>();
    const { rerender } = render(
      <MultiSelect
        filterOptions={filterOptions}
        label="Topics"
        onBlur={onBlur}
        onChange={onChange}
        onFocus={onFocus}
        onValueChange={onValueChange}
        options={options}
        ref={ref}
        value={["design"]}
      />,
    );

    const input = screen.getByRole("combobox", { name: "Topics" });
    expect(ref.current).toBe(input);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "r" } });
    expect(onFocus).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledOnce();
    expect(filterOptions).toHaveBeenCalled();
    expect(screen.getAllByRole("option")).toHaveLength(1);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith(["design", "react"]);
    expect(screen.getByRole("button", { name: "Remove Design systems" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove React" })).not.toBeInTheDocument();

    rerender(
      <MultiSelect
        filterOptions={filterOptions}
        label="Topics"
        onBlur={onBlur}
        onChange={onChange}
        onFocus={onFocus}
        onValueChange={onValueChange}
        options={options}
        value={["design", "react"]}
      />,
    );
    expect(screen.getByRole("button", { name: "Remove React" })).toBeInTheDocument();
    fireEvent.blur(input, { relatedTarget: document.body });
    expect(onBlur).toHaveBeenCalledOnce();
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on outside pointer and keeps the popup open when focus moves within the control", () => {
    render(<MultiSelect defaultValue={["design"]} label="Topics" options={options} />);
    const input = screen.getByRole("combobox", { name: "Topics" });
    fireEvent.focus(input);
    const remove = screen.getByRole("button", { name: "Remove Design systems" });
    fireEvent.blur(input, { relatedTarget: remove });
    expect(input).toHaveAttribute("aria-expanded", "true");
    fireEvent.pointerDown(document.body);
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("restores focus after keyboard clearing without reopening the list", () => {
    render(<MultiSelect defaultValue={["design"]} label="Topics" options={options} />);
    const input = screen.getByRole("combobox", { name: "Topics" }) as HTMLInputElement;
    input.focus();
    const clear = screen.getByRole("button", { name: "Clear selections" });
    clear.focus();
    fireEvent.click(clear);
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("announces loading and empty results, supports custom names, and blocks interaction when disabled", () => {
    render(
      <>
        <MultiSelect label="Loading" loading loadingMessage="Fetching…" options={[]} />
        <MultiSelect label="Empty" noResultsMessage="Nothing matched." options={options} />
        <MultiSelect
          allowClear={false}
          defaultValue={["design"]}
          disabled
          label="Disabled"
          options={options}
          removeLabel={(option) => `Delete ${option.label}`}
        />
      </>,
    );
    const loadingInput = screen.getByRole("combobox", { name: "Loading" });
    fireEvent.focus(loadingInput);
    expect(screen.getByText("Fetching…")).toBeInTheDocument();

    const emptyInput = screen.getByRole("combobox", { name: "Empty" });
    fireEvent.focus(emptyInput);
    fireEvent.change(emptyInput, { target: { value: "missing" } });
    expect(screen.getByText("Nothing matched.")).toBeInTheDocument();

    const disabledInput = screen.getByRole("combobox", { name: "Disabled" });
    expect(disabledInput).toBeDisabled();
    fireEvent.focus(disabledInput);
    fireEvent.keyDown(disabledInput, { key: "ArrowDown" });
    expect(screen.getByRole("button", { name: "Delete Design systems" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Clear selections" })).not.toBeInTheDocument();
  });

  it("supports externally prevented key events and no-result filter state", () => {
    const onKeyDown = vi.fn((event: ReactKeyboardEvent<HTMLInputElement>) => event.preventDefault());
    render(<MultiSelect label="Topics" onKeyDown={onKeyDown} options={options} />);
    const input = screen.getByRole("combobox", { name: "Topics" });
    fireEvent.focus(input);
    const activeDescendant = input.getAttribute("aria-activedescendant");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(onKeyDown).toHaveBeenCalledOnce();
    expect(input).toHaveAttribute("aria-activedescendant", activeDescendant);
  });

  it("handles empty and all-disabled option lists and supports callback refs", () => {
    const callbackRef = vi.fn();
    render(
      <MultiSelect
        label="Unavailable topics"
        options={[{ value: "locked", label: "Locked", disabled: true }]}
        ref={callbackRef}
      />,
    );
    const input = screen.getByRole("combobox", { name: "Unavailable topics" });
    expect(callbackRef).toHaveBeenCalledWith(input);
    fireEvent.focus(input);
    expect(input).not.toHaveAttribute("aria-activedescendant");
    fireEvent.keyDown(input, { key: "ArrowUp" });
    const locked = screen.getByRole("option", { name: "Locked" });
    fireEvent.pointerEnter(locked);
    fireEvent.click(locked);
    expect(input).not.toHaveAttribute("aria-activedescendant");
  });

  it("throws for malformed or mismatched option and value data", () => {
    const renderWith = (props: Partial<ComponentProps<typeof MultiSelect>> = {}) => (
      <MultiSelect label="Topics" options={options} {...props} />
    );
    expect(() => render(renderWith({ options: [{ value: "", label: "Bad" }] }))).toThrow(
      "MultiSelect options require non-empty values and labels.",
    );
    expect(() => render(renderWith({ options: [{ value: "bad", label: "   " }] }))).toThrow(
      "MultiSelect options require non-empty values and labels.",
    );
    expect(() =>
      render(renderWith({ options: [{ value: "dup", label: "One" }, { value: "dup", label: "Two" }] })),
    ).toThrow('MultiSelect option values must be unique: "dup".');
    expect(() => render(renderWith({ value: ["missing"] }))).toThrow(
      'MultiSelect value must match an option: "missing".',
    );
    expect(() => render(renderWith({ value: ["design", "design"] }))).toThrow(
      'MultiSelect values must be unique: "design".',
    );
    expect(() => render(renderWith({ loading: true, value: ["pending"] }))).not.toThrow();
  });
});
