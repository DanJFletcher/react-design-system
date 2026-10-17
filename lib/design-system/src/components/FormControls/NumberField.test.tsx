import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { NumberField } from "./NumberField";

describe("NumberField", () => {
  it("renders a labeled native number input with native constraints and connected help", () => {
    render(
      <NumberField
        aria-describedby="quantity-policy"
        description="Choose a whole number."
        error="Enter a quantity from 1 to 12."
        id="quantity"
        label="Quantity"
        min={1}
        max={12}
        step={2}
        defaultValue={4}
        required
        name="quantity"
      />,
    );

    const input = screen.getByRole("spinbutton", { name: "Quantity" });
    expect(input).toHaveAttribute("type", "number");
    expect(input).toHaveAttribute("min", "1");
    expect(input).toHaveAttribute("max", "12");
    expect(input).toHaveAttribute("step", "2");
    expect(input).toHaveAttribute("name", "quantity");
    expect(input).toHaveValue(4);
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute(
      "aria-describedby",
      "quantity-policy quantity-description quantity-error",
    );
    expect(screen.getByText("Choose a whole number.")).toHaveAttribute("id", "quantity-description");
    expect(screen.getByText("Enter a quantity from 1 to 12.")).toHaveAttribute("id", "quantity-error");
  });

  it("forwards native change events for uncontrolled and controlled values", () => {
    const onUncontrolledChange = vi.fn();
    const onControlledChange = vi.fn();
    function ControlledField() {
      const [value, setValue] = useState(3);
      return (
        <NumberField
          label="Controlled quantity"
          value={value}
          min={0}
          max={10}
          showSteppers
          onChange={(event) => {
            onControlledChange(event.currentTarget.value);
            setValue(Number(event.currentTarget.value));
          }}
        />
      );
    }

    render(
      <>
        <NumberField
          defaultValue={2}
          label="Uncontrolled quantity"
          onChange={(event) => onUncontrolledChange(event.currentTarget.value)}
        />
        <ControlledField />
      </>,
    );

    const uncontrolled = screen.getByRole("spinbutton", { name: "Uncontrolled quantity" });
    fireEvent.change(uncontrolled, { target: { value: "5" } });
    expect(uncontrolled).toHaveValue(5);
    expect(onUncontrolledChange).toHaveBeenCalledWith("5");

    const controlled = screen.getByRole("spinbutton", { name: "Controlled quantity" });
    fireEvent.change(controlled, { target: { value: "7" } });
    expect(controlled).toHaveValue(7);
    expect(onControlledChange).toHaveBeenCalledWith("7");
    fireEvent.click(screen.getByRole("button", { name: "Controlled quantity Increase" }));
    expect(controlled).toHaveValue(8);
    expect(onControlledChange).toHaveBeenCalledWith("8");
  });

  it("adds accessible, native step controls and disables them at min and max", () => {
    render(
      <>
        <NumberField
          defaultValue={1}
          label="Minimum count"
          min={1}
          max={5}
          step={2}
          showSteppers
        />
        <NumberField
          defaultValue={5}
          label="Maximum count"
          min={1}
          max={5}
          step={2}
          showSteppers
        />
      </>,
    );

    const minimumInput = screen.getByRole("spinbutton", { name: "Minimum count" });
    expect(screen.getByRole("group", { name: "Minimum count" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Minimum count Decrease" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Minimum count Increase" })).toBeEnabled();

    const maximumInput = screen.getByRole("spinbutton", { name: "Maximum count" });
    expect(screen.getByRole("button", { name: "Maximum count Decrease" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Maximum count Increase" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Minimum count Increase" }));
    expect(minimumInput).toHaveValue(3);
    expect(screen.getByRole("button", { name: "Minimum count Decrease" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Maximum count Decrease" }));
    expect(maximumInput).toHaveValue(3);
    expect(screen.getByRole("button", { name: "Maximum count Increase" })).toBeEnabled();
  });

  it("keeps step buttons accurate after an uncontrolled form reset", async () => {
    render(
      <form aria-label="Counts">
        <NumberField defaultValue={1} label="Minimum count" min={1} max={5} showSteppers />
        <NumberField defaultValue={5} label="Maximum count" min={1} max={5} showSteppers />
        <NumberField defaultValue={3} label="In-range count" min={1} max={5} showSteppers />
      </form>,
    );

    const form = screen.getByRole("form", { name: "Counts" });
    const minimumInput = screen.getByRole("spinbutton", { name: "Minimum count" });
    const maximumInput = screen.getByRole("spinbutton", { name: "Maximum count" });
    const inRangeInput = screen.getByRole("spinbutton", { name: "In-range count" });

    fireEvent.change(minimumInput, { target: { value: "2" } });
    fireEvent.change(maximumInput, { target: { value: "4" } });
    fireEvent.change(inRangeInput, { target: { value: "4" } });

    await act(async () => {
      (form as HTMLFormElement).reset();
      await Promise.resolve();
    });

    expect(minimumInput).toHaveValue(1);
    expect(screen.getByRole("button", { name: "Minimum count Decrease" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Minimum count Increase" })).toBeEnabled();

    expect(maximumInput).toHaveValue(5);
    expect(screen.getByRole("button", { name: "Maximum count Decrease" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Maximum count Increase" })).toBeDisabled();

    expect(inRangeInput).toHaveValue(3);
    expect(screen.getByRole("button", { name: "In-range count Decrease" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "In-range count Increase" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Minimum count Increase" }));
    expect(minimumInput).toHaveValue(2);
    fireEvent.click(screen.getByRole("button", { name: "Maximum count Decrease" }));
    expect(maximumInput).toHaveValue(4);
    fireEvent.click(screen.getByRole("button", { name: "In-range count Decrease" }));
    expect(inRangeInput).toHaveValue(2);
    fireEvent.click(screen.getByRole("button", { name: "In-range count Increase" }));
    expect(inRangeInput).toHaveValue(3);
  });

  it("gives step buttons native button semantics and localized accessible names", () => {
    render(
      <NumberField
        defaultValue={2}
        decrementLabel="Remove one"
        incrementLabel="Add one"
        label="Items"
        min={0}
        max={4}
        showSteppers
      />,
    );

    const input = screen.getByRole("spinbutton", { name: "Items" });
    const decrement = screen.getByRole("button", { name: "Items Remove one" });
    const increment = screen.getByRole("button", { name: "Items Add one" });

    expect(decrement).toHaveAttribute("type", "button");
    decrement.focus();
    expect(decrement).toHaveFocus();
    fireEvent.click(decrement);
    expect(input).toHaveValue(1);

    increment.focus();
    expect(increment).toHaveFocus();
    fireEvent.click(increment);
    expect(input).toHaveValue(2);
  });

  it("disables step buttons for disabled, read-only, and any-step fields", () => {
    render(
      <>
        <NumberField defaultValue={2} disabled label="Disabled count" showSteppers />
        <NumberField defaultValue={2} label="Read-only count" readOnly showSteppers />
        <NumberField defaultValue={2} label="Any-step count" step="any" showSteppers />
      </>,
    );

    for (const label of ["Disabled count", "Read-only count", "Any-step count"]) {
      expect(screen.getByRole("button", { name: `${label} Decrease` })).toBeDisabled();
      expect(screen.getByRole("button", { name: `${label} Increase` })).toBeDisabled();
    }
  });
});
