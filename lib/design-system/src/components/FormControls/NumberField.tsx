import { forwardRef, useEffect, useRef, useState, type ComponentPropsWithRef } from "react";
import { FieldLabel, FieldMessages, type FormFieldProps, useFormField } from "./FormField";
import fieldStyles from "./FormControls.module.css";
import styles from "./NumberField.module.css";

export type NumberFieldProps = Omit<
  ComponentPropsWithRef<"input">,
  | "id"
  | "type"
  | "required"
  | "disabled"
  | "aria-describedby"
  | "aria-invalid"
  | "children"
  | "value"
  | "defaultValue"
> &
  FormFieldProps & {
    value?: number | string;
    defaultValue?: number | string;
    showSteppers?: boolean;
    decrementLabel?: string;
    incrementLabel?: string;
  };

export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(function NumberField(
  {
    id,
    label,
    description,
    error,
    invalid = false,
    required = false,
    disabled = false,
    className,
    readOnly = false,
    showSteppers = false,
    decrementLabel = "Decrease",
    incrementLabel = "Increase",
    value: controlledValue,
    defaultValue,
    min,
    max,
    step,
    "aria-describedby": externalDescribedBy,
    onChange,
    ...inputProps
  },
  forwardedRef,
) {
  const field = useFormField({ id, description, error, invalid, "aria-describedby": externalDescribedBy });
  const inputRef = useRef<HTMLInputElement>(null);
  const [uncontrolledValue, setUncontrolledValue] = useState(String(defaultValue ?? ""));
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? String(controlledValue) : uncontrolledValue;
  const labelId = `${field.id}-label`;
  const controlClassName = [
    fieldStyles.control,
    showSteppers && styles.inputWithSteppers,
    className,
  ].filter(Boolean).join(" ");

  const assignInputRef = (node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  const handleChange: ComponentPropsWithRef<"input">["onChange"] = (event) => {
    if (!isControlled) setUncontrolledValue(event.currentTarget.value);
    onChange?.(event);
  };

  useEffect(() => {
    if (isControlled) return;
    const input = inputRef.current;
    const form = input?.form;
    if (!input || !form) return;

    let isMounted = true;
    const handleFormReset = () => {
      queueMicrotask(() => {
        if (isMounted) setUncontrolledValue(input.value);
      });
    };

    form.addEventListener("reset", handleFormReset);
    return () => {
      isMounted = false;
      form.removeEventListener("reset", handleFormReset);
    };
  }, [inputProps.form, isControlled]);

  const stepValue = (direction: "up" | "down") => {
    const input = inputRef.current!;
    if (direction === "up") input.stepUp();
    else input.stepDown();
    input.dispatchEvent(new Event("input", { bubbles: true }));
  };

  const numericValue = currentValue === "" ? Number.NaN : Number(currentValue);
  const numericMin = min === undefined ? Number.NaN : Number(min);
  const numericMax = max === undefined ? Number.NaN : Number(max);
  const atMinimum = Number.isFinite(numericValue) && Number.isFinite(numericMin) && numericValue <= numericMin;
  const atMaximum = Number.isFinite(numericValue) && Number.isFinite(numericMax) && numericValue >= numericMax;
  const stepIsAny = step === "any";

  return (
    <div className={fieldStyles.field}>
      <FieldLabel disabled={disabled} id={field.id} labelId={labelId} label={label} required={required} />
      {showSteppers ? (
        <div
          aria-labelledby={labelId}
          className={styles.group}
          data-disabled={disabled || undefined}
          data-invalid={field.invalid || undefined}
          role="group"
        >
          <input
            {...inputProps}
            ref={assignInputRef}
            aria-describedby={field.describedBy}
            aria-invalid={field.invalid || undefined}
            className={controlClassName}
            disabled={disabled}
            id={field.id}
            max={max}
            min={min}
            value={controlledValue}
            defaultValue={defaultValue}
            onChange={handleChange}
            readOnly={readOnly}
            required={required}
            step={step}
            type="number"
          />
          <button
            aria-labelledby={`${labelId} ${field.id}-decrement-label`}
            className={styles.stepButton}
            disabled={disabled || readOnly || stepIsAny || atMinimum}
            onClick={() => stepValue("down")}
            type="button"
          >
            <span aria-hidden="true">−</span>
            <span className={styles.visuallyHidden} id={`${field.id}-decrement-label`}>{decrementLabel}</span>
          </button>
          <button
            aria-labelledby={`${labelId} ${field.id}-increment-label`}
            className={styles.stepButton}
            disabled={disabled || readOnly || stepIsAny || atMaximum}
            onClick={() => stepValue("up")}
            type="button"
          >
            <span aria-hidden="true">+</span>
            <span className={styles.visuallyHidden} id={`${field.id}-increment-label`}>{incrementLabel}</span>
          </button>
        </div>
      ) : (
        <input
          {...inputProps}
          ref={assignInputRef}
          aria-describedby={field.describedBy}
          aria-invalid={field.invalid || undefined}
          className={[fieldStyles.control, className].filter(Boolean).join(" ")}
          disabled={disabled}
          id={field.id}
          max={max}
          min={min}
          value={controlledValue}
          defaultValue={defaultValue}
          onChange={handleChange}
          readOnly={readOnly}
          required={required}
          step={step}
          type="number"
        />
      )}
      <FieldMessages
        description={description}
        descriptionId={field.descriptionId}
        error={error}
        errorId={field.errorId}
      />
    </div>
  );
});

NumberField.displayName = "NumberField";
