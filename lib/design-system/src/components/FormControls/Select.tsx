import { forwardRef, type ComponentPropsWithRef } from "react";
import { FieldLabel, FieldMessages, type FormFieldProps, useFormField } from "./FormField";
import styles from "./FormControls.module.css";

export type SelectProps = Omit<
  ComponentPropsWithRef<"select">,
  "id" | "required" | "disabled" | "aria-describedby" | "aria-invalid"
> & FormFieldProps;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    id,
    label,
    description,
    error,
    invalid = false,
    required = false,
    disabled = false,
    className,
    "aria-describedby": externalDescribedBy,
    ...selectProps
  },
  ref,
) {
  const field = useFormField({ id, description, error, invalid, "aria-describedby": externalDescribedBy });
  const controlClassName = [styles.control, styles.select, className].filter(Boolean).join(" ");

  return (
    <div className={styles.field}>
      <FieldLabel id={field.id} label={label} required={required} />
      <div className={styles.selectWrapper}>
        <select
          {...selectProps}
          ref={ref}
          id={field.id}
          required={required}
          disabled={disabled}
          aria-describedby={field.describedBy}
          aria-invalid={field.invalid || undefined}
          className={controlClassName}
        />
        <svg
          className={styles.selectIndicator}
          viewBox="0 0 16 16"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="m2 6 6 6 6-6"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
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

Select.displayName = "Select";
