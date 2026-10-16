import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Avatar } from "./Avatar/Avatar";
import { AvatarGroup } from "./AvatarGroup/AvatarGroup";
import { Button } from "./Button/Button";
import { ButtonGroup } from "./ButtonGroup/ButtonGroup";
import { Checkbox } from "./FormControls/Checkbox";
import { DateField } from "./FormControls/DateField";
import { FieldGroup } from "./FormControls/FieldGroup";
import { FieldLegend } from "./FormControls/FormField";
import { FileField } from "./FormControls/FileField";
import { FormLayout } from "./FormControls/FormLayout";
import { RadioGroup } from "./FormControls/RadioGroup";
import { RangeField } from "./FormControls/RangeField";
import { Select } from "./FormControls/Select";
import { Switch } from "./FormControls/Switch";
import { Textarea } from "./FormControls/Textarea";
import { TextField } from "./FormControls/TextField";
import { ToggleButton } from "./ToggleButton/ToggleButton";
import { ToggleGroup } from "./ToggleGroup/ToggleGroup";
import { Icon } from "./Icon/Icon";
import { Spinner } from "./Spinner/Spinner";

describe("form controls", () => {
  it("associates checkbox and switch labels, descriptions, errors, and external descriptions", () => {
    render(
      <>
        <Checkbox
          aria-describedby="external-note"
          description="Optional details"
          error="Consent is required"
          id="terms"
          label="Accept terms"
          required
        />
        <Switch disabled label="Enable alerts" />
        <Switch label="Daily digest" required />
      </>,
    );
    const checkbox = screen.getByRole("checkbox", { name: /Accept terms/ });
    expect(checkbox).toHaveAttribute("aria-describedby", "external-note terms-description terms-error");
    expect(checkbox).toHaveAttribute("aria-invalid", "true");
    expect(checkbox).toBeRequired();
    expect(screen.getByText("Optional details")).toHaveAttribute("id", "terms-description");
    expect(screen.getByText("Consent is required")).toHaveAttribute("id", "terms-error");
    expect(screen.getByRole("switch", { name: "Enable alerts" })).toBeDisabled();
    expect(screen.getByRole("switch", { name: /Daily digest/ })).toBeRequired();
    expect(screen.getByText("Daily digest").closest("label")).not.toHaveAttribute("data-disabled");
  });

  it("renders text, date, file, select, and textarea fields with native constraints", () => {
    render(
      <>
        <TextField label="Email" type="email" required placeholder="you@example.com" />
        <DateField description="Choose a date" label="Start date" type="month" />
        <FileField accept="image/*" disabled label="Profile image" />
        <Select label="Region" required>
          <option value="west">West</option>
        </Select>
        <Textarea label="Notes" rows={6} value="Initial note" readOnly />
      </>,
    );
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveAttribute("type", "email");
    expect(screen.getByRole("textbox", { name: "Email" })).toBeRequired();
    expect(screen.getByLabelText("Start date")).toHaveAttribute("type", "month");
    expect(screen.getByLabelText("Start date")).toHaveAttribute("aria-describedby");
    expect(screen.getByLabelText("Profile image")).toBeDisabled();
    expect(screen.getByRole("combobox", { name: "Region" })).toBeRequired();
    expect(screen.getByLabelText("Notes")).toHaveAttribute("rows", "6");
    expect(screen.getByLabelText("Notes")).toHaveValue("Initial note");
  });

  it("supports controlled and uncontrolled radio selections with disabled choices", () => {
    const onChange = vi.fn();
    const options = [
      { value: "small", label: "Small" },
      { value: "large", label: "Large", disabled: true },
    ];
    const { rerender } = render(
      <RadioGroup defaultValue="small" description="Choose a size" label="Size" name="size" options={options} />,
    );
    expect(screen.getByRole("radio", { name: "Small" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Large" })).toBeDisabled();
    fireEvent.click(screen.getByRole("radio", { name: "Small" }));
    expect(screen.getByText("Choose a size")).toBeInTheDocument();

    rerender(
      <RadioGroup label="Size" name="size" onChange={onChange} options={options} value="large" />,
    );
    expect(screen.getByRole("radio", { name: "Large" })).toBeChecked();
    fireEvent.click(screen.getByRole("radio", { name: "Small" }));
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("normalizes range values, displays custom text, and invokes callbacks", () => {
    const onValueChange = vi.fn();
    const onChange = vi.fn();
    render(
      <RangeField
        defaultValue={8}
        description="Adjust the budget"
        formatValue={(value) => `$${value}`}
        getAriaValueText={(value) => `${value} dollars`}
        label="Budget"
        max={10}
        min={0}
        onChange={onChange}
        onValueChange={onValueChange}
        step={2}
        style={{ accentColor: "red" }}
      />,
    );
    const range = screen.getByRole("slider", { name: "Budget" });
    expect(range).toHaveValue("8");
    expect(range).toHaveAttribute("aria-valuetext", "8 dollars");
    expect(screen.getByText("$8")).toBeInTheDocument();
    expect(range.style.getPropertyValue("--range-progress")).toBe("80%");
    expect(range.style.getPropertyValue("accent-color")).toBe("red");
    fireEvent.change(range, { target: { value: "7", valueAsNumber: 7 } });
    expect(onValueChange).toHaveBeenCalledWith(8);
    expect(onChange).toHaveBeenCalledOnce();
    expect(range).toHaveValue("8");
  });

  it("supports any-step and controlled range states and rejects invalid bounds", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <RangeField label="Level" max={10} min={2} onValueChange={onValueChange} step="any" value={4.5} />,
    );
    const range = screen.getByRole("slider", { name: "Level" });
    expect(range).toHaveValue("4.5");
    expect(range).not.toHaveAttribute("aria-valuetext");
    fireEvent.change(range, { target: { value: "6.25", valueAsNumber: 6.25 } });
    expect(onValueChange).toHaveBeenCalledWith(6.25);
    rerender(<RangeField label="Fixed" max={5} min={5} value={5} />);
    expect(screen.getByRole("slider", { name: "Fixed" })).toHaveStyle({ "--range-progress": "0%" });
    expect(() => render(<RangeField label="Invalid" min={3} max={2} />)).toThrow(/finite min and max/);
    expect(() => render(<RangeField label="Invalid step" step={0} />)).toThrow(/positive finite/);
  });

  it("renders a disabled field group with combined external, description, and error references", () => {
    render(
      <FieldGroup
        aria-describedby="external"
        description="Group description"
        disabled
        error="Choose one"
        id="preferences"
        label="Preferences"
      >
        <Checkbox label="Email" />
      </FieldGroup>,
    );
    const group = screen.getByRole("group", { name: "Preferences" });
    expect(group).toBeDisabled();
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).toHaveAttribute("aria-describedby", "external preferences-description preferences-error");
    expect(screen.getByRole("checkbox", { name: "Email" })).toBeDisabled();
    expect(screen.getByText("Group description")).toBeInTheDocument();
    expect(screen.getByText("Choose one")).toBeInTheDocument();
  });

  it("configures form layout columns, gap, and forwarded attributes", () => {
    const { rerender } = render(<FormLayout data-testid="fields"><TextField label="Name" /></FormLayout>);
    expect(screen.getByTestId("fields")).toHaveAttribute("data-columns", "1");
    expect(screen.getByTestId("fields")).toHaveAttribute("data-gap", "md");
    rerender(<FormLayout columns={2} gap="lg" data-testid="fields" />);
    expect(screen.getByTestId("fields")).toHaveAttribute("data-columns", "2");
    expect(screen.getByTestId("fields")).toHaveAttribute("data-gap", "lg");
  });

  it("renders an optional field group and a required legend", () => {
    render(
      <>
        <FieldGroup label="Optional preferences"><Checkbox label="SMS" /></FieldGroup>
        <FieldLegend label="Required choices" required />
      </>,
    );
    expect(screen.getByRole("group", { name: "Optional preferences" })).not.toHaveAttribute("aria-invalid");
    expect(screen.getByText("Required choices").parentElement).toHaveTextContent("*");
  });
});

describe("avatars and toggle controls", () => {
  it("uses explicit initials or derives them and falls back when image loading fails", () => {
    const { rerender } = render(<Avatar name="  Ada Lovelace " src="/ada.png" />);
    const avatar = screen.getByRole("img", { name: "Ada Lovelace" });
    expect(avatar.querySelector("img")).toHaveAttribute("src", "/ada.png");
    fireEvent.error(avatar.querySelector("img")!);
    expect(screen.getByText("AL")).toHaveAttribute("aria-hidden", "true");
    rerender(<Avatar initials=" XY " name="" shape="square" size="xl" />);
    expect(screen.getByRole("img", { name: "Avatar" })).toHaveTextContent("XY");
  });

  it("opens avatar overflow, dismisses it outside, and validates its display limit", () => {
    const members = [
      { id: "a", name: "Ada" },
      { id: "b", name: "Grace" },
      { id: "c", name: "Katherine" },
    ];
    const { rerender } = render(<AvatarGroup label="Team" maxVisible={1} members={members} />);
    fireEvent.click(screen.getByRole("button", { name: "Show 2 more members" }));
    expect(screen.getByRole("list", { name: "Additional team members" })).toBeVisible();
    expect(screen.getByText("Katherine")).toBeInTheDocument();
    fireEvent.pointerDown(document.body);
    expect(document.querySelector('[aria-label="Additional team members"]')).not.toBeVisible();
    const overflowTrigger = screen.getByRole("button", { name: "Show 2 more members" });
    fireEvent.keyDown(overflowTrigger, { key: "Enter" });
    fireEvent.click(overflowTrigger);
    fireEvent.keyDown(overflowTrigger, { key: "Escape" });
    expect(document.querySelector('[aria-label="Additional team members"]')).not.toBeVisible();
    rerender(<AvatarGroup maxVisible={0} members={members.slice(0, 1)} overflowLabel={(count) => `More: ${count}`} />);
    expect(screen.getByRole("button", { name: "More: 1" })).toBeInTheDocument();
    expect(() => render(<AvatarGroup maxVisible={-1} members={members} />)).toThrow(RangeError);
  });

  it("toggles uncontrolled and controlled buttons while respecting prevented clicks", () => {
    const onPressedChange = vi.fn();
    const { rerender } = render(
      <ToggleButton defaultPressed className="favorite" onPressedChange={onPressedChange}>Favorite</ToggleButton>,
    );
    const button = screen.getByRole("button", { name: "Favorite" });
    expect(button).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(onPressedChange).toHaveBeenCalledWith(false);
    rerender(
      <ToggleButton onClick={(event) => event.preventDefault()} onPressedChange={onPressedChange} pressed>
        Controlled
      </ToggleButton>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Controlled" }));
    expect(screen.getByRole("button", { name: "Controlled" })).toHaveAttribute("aria-pressed", "true");
    expect(onPressedChange).toHaveBeenCalledOnce();
  });

  it("propagates group defaults, supports selection modes, and keeps controlled values controlled", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <ToggleGroup
        aria-label="View"
        defaultValue="grid"
        items={[{ value: "grid", label: "Grid" }, { value: "list", label: "List", disabled: true }]}
        size="lg"
        variant="secondary"
      />,
    );
    expect(screen.getByRole("button", { name: "Grid" })).toHaveClass(/lg/);
    expect(screen.getByRole("button", { name: "Grid" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "List" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Grid" }));
    expect(screen.getByRole("button", { name: "Grid" })).toHaveAttribute("aria-pressed", "false");

    rerender(
      <ToggleGroup
        aria-labelledby="toggle-label"
        items={[{ value: "a", label: "A" }, { value: "b", label: "B" }]}
        onValueChange={onValueChange}
        value="a"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "B" }));
    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(screen.getByRole("button", { name: "A" })).toHaveAttribute("aria-pressed", "true");

    rerender(
      <ToggleGroup
        key="multiple-mode"
        aria-label="Multiple"
        defaultValue={["a"]}
        items={[{ value: "a", label: "A" }, { value: "b", label: "B" }]}
        selectionMode="multiple"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "B" }));
    expect(screen.getByRole("button", { name: "A" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "B" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "A" }));
    expect(screen.getByRole("button", { name: "A" })).toHaveAttribute("aria-pressed", "false");
    rerender(
      <ToggleGroup
        key="controlled-multiple"
        aria-label="Controlled multiple"
        items={[{ value: "a", label: "A" }, { value: "b", label: "B" }]}
        onValueChange={onValueChange}
        selectionMode="multiple"
        value={["a"]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "A" }));
    expect(onValueChange).toHaveBeenLastCalledWith([]);
    expect(screen.getByRole("button", { name: "A" })).toHaveAttribute("aria-pressed", "true");

    rerender(
      <ToggleGroup
        key="non-empty-single"
        allowEmpty={false}
        aria-label="Required selection"
        defaultValue="a"
        items={[{ value: "a", label: "A" }, { value: "b", label: "B" }]}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "A" }));
    expect(onValueChange).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("button", { name: "A" })).toHaveAttribute("aria-pressed", "true");
    expect(() => render(<ToggleGroup aria-label="Invalid" items={[{ value: " ", label: "Empty" }]} />)).toThrow(/non-empty/);
    expect(() =>
      render(<ToggleGroup aria-label="Duplicates" items={[{ value: "same", label: "One" }, { value: "same", label: "Two" }]} />),
    ).toThrow(/unique/);
  });

  it("starts both selection modes empty when no default value is provided", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <ToggleGroup
        aria-label="Empty single selection"
        items={[{ value: "a", label: "A" }]}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "A" }));
    expect(onValueChange).toHaveBeenLastCalledWith("a");
    fireEvent.click(screen.getByRole("button", { name: "A" }));
    expect(onValueChange).toHaveBeenLastCalledWith(null);

    rerender(
      <ToggleGroup
        key="empty-multiple"
        aria-label="Empty multiple selection"
        items={[{ value: "a", label: "A" }]}
        onValueChange={onValueChange}
        selectionMode="multiple"
      />,
    );
    expect(screen.getByRole("button", { name: "A" })).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(screen.getByRole("button", { name: "A" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["a"]);
  });

  it("allows explicit ButtonGroup props while applying inherited size, variant, and disabled state", () => {
    render(
      <ButtonGroup disabled size="lg" variant="secondary">
        <Button>Inherited</Button>
        <Button size="sm" variant="ghost">Explicit</Button>
        <span>Other child</span>
        {null}
      </ButtonGroup>,
    );
    expect(screen.getByRole("group")).toHaveAttribute("data-disabled", "true");
    expect(screen.getByRole("button", { name: "Inherited" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Explicit" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Explicit" })).toHaveAttribute("data-ds-button-variant", "ghost");
  });

  it("supports accessible named icons", () => {
    render(<Icon decorative={false} label="Selected" name="check" />);
    const icon = screen.getByRole("img", { name: "Selected" });
    expect(icon).not.toHaveAttribute("aria-hidden");
    expect(icon).toHaveAttribute("data-icon", "check");
  });

  it("renders a named loading status for assistive technology", () => {
    render(<Spinner label="Saving garden" size="lg" />);
    expect(screen.getByRole("status", { name: "Saving garden" })).toHaveAttribute("data-ds-spinner", "");
  });
});
