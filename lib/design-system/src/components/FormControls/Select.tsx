import { forwardRef, type ComponentPropsWithRef } from "react";
import { Icon } from "../Icon/Icon";
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
        <Icon
          className={styles.selectIndicator}
          name="chevron-down"
          size="sm"
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

Select.displayName = "Select";
