import {
  forwardRef,
  useState,
  type ChangeEvent,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { FieldLabel, FieldMessages, type FormFieldProps, useFormField } from "./FormField";
import fieldStyles from "./FormControls.module.css";
import styles from "./RangeField.module.css";

export type RangeFieldProps = Omit<
  ComponentPropsWithRef<"input">,
  | "aria-describedby"
  | "aria-invalid"
  | "aria-valuetext"
  | "children"
  | "defaultValue"
  | "disabled"
  | "id"
  | "max"
  | "min"
  | "required"
  | "step"
  | "type"
  | "value"
> &
  Omit<FormFieldProps, "required"> & {
    "aria-valuetext"?: string;
    min?: number;
    max?: number;
    step?: number | "any";
    value?: number;
    defaultValue?: number;
    formatValue?: (value: number) => ReactNode;
    getAriaValueText?: (value: number) => string;
    onValueChange?: (value: number) => void;
  };

function normalizeRangeValue(value: number, min: number, max: number, step: number | "any") {
  const clampedValue = Math.min(max, Math.max(min, value));
  if (step === "any") return clampedValue;

  const stepCount = Math.round((clampedValue - min) / step);
  const steppedValue = min + stepCount * step;
  return Math.min(max, Math.max(min, Number(steppedValue.toPrecision(12))));
}

function validateRange(min: number, max: number, step: number | "any") {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max < min) {
    throw new Error("RangeField requires finite min and max values, with max greater than or equal to min.");
  }
  if (step !== "any" && (!Number.isFinite(step) || step <= 0)) {
    throw new Error('RangeField step must be a positive finite number or "any".');
  }
}

export const RangeField = forwardRef<HTMLInputElement, RangeFieldProps>(
  function RangeField(
    {
      id,
      label,
      description,
      error,
      invalid = false,
      disabled = false,
      min = 0,
      max = 100,
      step = 1,
      value,
      defaultValue,
      formatValue,
      getAriaValueText,
      onValueChange,
      onChange,
      className,
      style,
      "aria-describedby": externalDescribedBy,
      "aria-valuetext": externalValueText,
      ...inputProps
    },
    ref,
  ) {
    validateRange(min, max, step);
    const field = useFormField({ id, description, error, invalid, "aria-describedby": externalDescribedBy });
    const [uncontrolledValue, setUncontrolledValue] = useState(() =>
      normalizeRangeValue(defaultValue ?? min + (max - min) / 2, min, max, step),
    );
    const currentValue = normalizeRangeValue(value ?? uncontrolledValue, min, max, step);
    const progress = max === min ? 0 : ((currentValue - min) / (max - min)) * 100;
    const rangeStyle = {
      ...style,
      "--range-progress": `${progress}%`,
    } as CSSProperties;

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
      const nextValue = normalizeRangeValue(event.currentTarget.valueAsNumber, min, max, step);
      if (value === undefined) setUncontrolledValue(nextValue);
      onValueChange?.(nextValue);
      onChange?.(event);
    }

    return (
      <div className={fieldStyles.field}>
        <div className={styles.heading}>
          <FieldLabel id={field.id} label={label} />
          <output className={styles.value} htmlFor={field.id} aria-hidden="true">
            {formatValue ? formatValue(currentValue) : currentValue}
          </output>
        </div>
        <input
          {...inputProps}
          ref={ref}
          id={field.id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          disabled={disabled}
          aria-describedby={field.describedBy}
          aria-invalid={field.invalid || undefined}
          aria-valuetext={getAriaValueText?.(currentValue) ?? externalValueText}
          className={[styles.range, className].filter(Boolean).join(" ")}
          style={rangeStyle}
          onChange={handleChange}
        />
        <FieldMessages
          description={description}
          descriptionId={field.descriptionId}
          error={error}
          errorId={field.errorId}
        />
      </div>
    );
  },
);

RangeField.displayName = "RangeField";
