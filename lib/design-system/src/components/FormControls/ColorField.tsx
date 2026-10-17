import { forwardRef, useState, type ChangeEvent, type ComponentPropsWithRef } from "react";
import { FieldLabel, FieldMessages, type FormFieldProps, useFormField } from "./FormField";
import styles from "./FormControls.module.css";

export type ColorFieldProps = Omit<
  ComponentPropsWithRef<"input">,
  | "id"
  | "type"
  | "required"
  | "disabled"
  | "aria-describedby"
  | "aria-invalid"
  | "children"
  | "defaultValue"
  | "max"
  | "maxLength"
  | "min"
  | "minLength"
  | "pattern"
  | "step"
  | "value"
> & FormFieldProps & {
  /** The current six-digit hexadecimal color when using controlled state. */
  value?: string;
  /** Initial six-digit hexadecimal color for uncontrolled state. Defaults to black. */
  defaultValue?: string;
  /** Called whenever the editable value or native picker changes. */
  onValueChange?: (value: string) => void;
  /** Optional separate accessible name for the native color picker. Defaults to the field label. */
  pickerLabel?: string;
};

const HEX_COLOR_PATTERN = "^#[0-9a-fA-F]{6}$";
const FALLBACK_COLOR = "#000000";

function isSixDigitHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

export const ColorField = forwardRef<HTMLInputElement, ColorFieldProps>(function ColorField(
  {
    id,
    label,
    description,
    error,
    invalid = false,
    required = false,
    disabled = false,
    className,
    value,
    defaultValue = FALLBACK_COLOR,
    onValueChange,
    onChange,
    pickerLabel,
    "aria-describedby": externalDescribedBy,
    ...inputProps
  },
  ref,
) {
  const field = useFormField({ id, description, error, invalid, "aria-describedby": externalDescribedBy });
  const labelId = `${field.id}-label`;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const currentValue = value !== undefined ? value : uncontrolledValue;
  const pickerValue = isSixDigitHexColor(currentValue) ? currentValue : FALLBACK_COLOR;
  const isReadOnly = Boolean(inputProps.readOnly);

  function updateValue(nextValue: string, event: ChangeEvent<HTMLInputElement>) {
    if (value === undefined) setUncontrolledValue(nextValue);
    onValueChange?.(nextValue);
    onChange?.(event);
  }

  return (
    <div className={styles.field}>
      <FieldLabel disabled={disabled} id={field.id} labelId={labelId} label={label} required={required} />
      <div className={styles.colorFieldControls}>
        <input
          {...inputProps}
          ref={ref}
          id={field.id}
          type="text"
          value={currentValue}
          required={required}
          disabled={disabled}
          maxLength={7}
          pattern={HEX_COLOR_PATTERN}
          aria-describedby={field.describedBy}
          aria-invalid={field.invalid || undefined}
          className={[styles.control, styles.colorHexInput, className].filter(Boolean).join(" ")}
          onChange={(event) => updateValue(event.currentTarget.value, event)}
        />
        <input
          aria-describedby={field.describedBy}
          aria-invalid={field.invalid || undefined}
          aria-label={pickerLabel}
          aria-labelledby={pickerLabel ? undefined : labelId}
          className={styles.colorPicker}
          disabled={disabled || isReadOnly}
          onChange={(event) => updateValue(event.currentTarget.value, event)}
          type="color"
          value={pickerValue}
        />
      </div>
      <FieldMessages
        description={description}
        descriptionId={field.descriptionId}
        error={error}
        errorId={field.errorId}
      />
    </div>
  );
});

ColorField.displayName = "ColorField";
