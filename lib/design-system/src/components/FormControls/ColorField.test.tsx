import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ColorField } from "./ColorField";

function getColorPair(label: string) {
  const value = screen.getByRole("textbox", { name: label }) as HTMLInputElement;
  return {
    value,
    picker: value.parentElement?.querySelector('input[type="color"]') as HTMLInputElement,
  };
}

describe("ColorField", () => {
  it("supports labeled form values, descriptions, errors, and changes from both inputs", () => {
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    render(
      <form aria-label="Brand form">
        <ColorField
          label="Brand color"
          name="brandColor"
          defaultValue="#1769E0"
          required
          description="Choose a brand color."
          error="Review this color."
          aria-describedby="brand-help"
          onChange={onChange}
          onValueChange={onValueChange}
        />
        <span id="brand-help">Shared across the workspace.</span>
      </form>,
    );

    const { value, picker } = getColorPair("Brand color");
    expect(value).toHaveValue("#1769E0");
    expect(value).toBeRequired();
    expect(value).toHaveAttribute("pattern", "^#[0-9a-fA-F]{6}$");
    expect(value).toHaveAttribute("maxLength", "7");
    expect(value).toHaveAttribute("aria-invalid", "true");
    expect(value.getAttribute("aria-describedby")).toContain("brand-help");
    expect(value.getAttribute("aria-describedby")).toContain("description");
    expect(value.getAttribute("aria-describedby")).toContain("error");
    expect(picker).toHaveValue("#1769e0");
    expect(picker).toHaveAttribute("aria-labelledby", expect.stringContaining("label"));
    expect(screen.getByText("Choose a brand color.")).toBeInTheDocument();
    expect(screen.getByText("Review this color.")).toBeInTheDocument();

    fireEvent.change(value, { target: { value: "#A1B2C3" } });
    expect(value).toHaveValue("#A1B2C3");
    expect(picker).toHaveValue("#a1b2c3");
    expect(onValueChange).toHaveBeenLastCalledWith("#A1B2C3");
    expect(onChange).toHaveBeenCalledOnce();

    fireEvent.change(picker, { target: { value: "#123456" } });
    expect(value).toHaveValue("#123456");
    expect(onValueChange).toHaveBeenLastCalledWith("#123456");
    expect(onChange).toHaveBeenCalledTimes(2);
    const form = screen.getByRole("form", { name: "Brand form" }) as HTMLFormElement;
    expect(new FormData(form).getAll("brandColor")).toEqual(["#123456"]);
  });

  it("keeps controlled values with the parent and supports a custom picker name", () => {
    const onValueChange = vi.fn();
    const onChange = vi.fn();
    const { rerender } = render(
      <ColorField
        label="Accent"
        pickerLabel="Choose an accent color"
        name="accent"
        value="#102030"
        onValueChange={onValueChange}
        onChange={onChange}
        className="custom-hex-input"
      />,
    );

    const value = screen.getByRole("textbox", { name: "Accent" });
    const picker = screen.getByLabelText("Choose an accent color", {
      selector: 'input[type="color"]',
    });
    expect(value).toHaveClass("custom-hex-input");
    expect(value).toHaveValue("#102030");
    expect(picker).toHaveValue("#102030");

    fireEvent.change(value, { target: { value: "#ABCDEF" } });
    expect(onValueChange).toHaveBeenCalledWith("#ABCDEF");
    expect(onChange).toHaveBeenCalledOnce();
    expect(value).toHaveValue("#102030");
    fireEvent.change(picker, { target: { value: "#FEDCBA" } });
    expect(onValueChange).toHaveBeenLastCalledWith("#fedcba");
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(value).toHaveValue("#102030");

    rerender(
      <ColorField
        label="Accent"
        pickerLabel="Choose an accent color"
        name="accent"
        value="#AABBCC"
        onValueChange={onValueChange}
      />,
    );
    expect(value).toHaveValue("#AABBCC");
    expect(picker).toHaveValue("#aabbcc");
  });

  it("falls back to a black picker for invalid hex text and retains native pattern validation", () => {
    render(<ColorField label="Page color" defaultValue="#12ab" required />);

    const { value, picker } = getColorPair("Page color");
    expect(value).toHaveValue("#12ab");
    expect(value).toBeInvalid();
    expect(picker).toHaveValue("#000000");
    fireEvent.change(value, { target: { value: "#12AB34" } });
    expect(value).toBeValid();
    expect(picker).toHaveValue("#12ab34");
  });

  it("forwards refs and native input props and disables the picker for disabled or read-only fields", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <ColorField
        ref={ref}
        label="Disabled color"
        id="disabled-color"
        name="disabledColor"
        disabled
        autoComplete="off"
        placeholder="#RRGGBB"
        defaultValue="#445566"
      />,
    );

    const disabledValue = screen.getByRole("textbox", { name: "Disabled color" });
    const disabledPicker = disabledValue.parentElement?.querySelector('input[type="color"]') as HTMLInputElement;
    expect(ref.current).toBe(disabledValue);
    expect(disabledValue).toHaveAttribute("id", "disabled-color");
    expect(disabledValue).toHaveAttribute("name", "disabledColor");
    expect(disabledValue).toHaveAttribute("autocomplete", "off");
    expect(disabledValue).toHaveAttribute("placeholder", "#RRGGBB");
    expect(disabledValue).toBeDisabled();
    expect(disabledPicker).toBeDisabled();

    render(<ColorField label="Read-only color" readOnly defaultValue="#778899" />);
    const readOnlyValue = screen.getByRole("textbox", { name: "Read-only color" });
    const readOnlyPicker = readOnlyValue.parentElement?.querySelector('input[type="color"]') as HTMLInputElement;
    expect(readOnlyValue).toHaveAttribute("readonly");
    expect(readOnlyPicker).toBeDisabled();
  });

  it("defaults to black and works without optional change callbacks", () => {
    render(<ColorField label="Optional color" />);

    const { value, picker } = getColorPair("Optional color");
    expect(value).toHaveValue("#000000");
    expect(picker).toHaveValue("#000000");
    fireEvent.change(value, { target: { value: "#ABCDEF" } });
    expect(value).toHaveValue("#ABCDEF");
    expect(picker).toHaveValue("#abcdef");
  });
});
