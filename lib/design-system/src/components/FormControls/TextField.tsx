import { forwardRef, type ComponentPropsWithRef, type HTMLInputTypeAttribute, type ReactNode } from "react";
import { FieldLabel, FieldMessages, type FormFieldProps, useFormField } from "./FormField";
import styles from "./FormControls.module.css";

export type TextFieldProps = Omit<
  ComponentPropsWithRef<"input">,
  "id" | "type" | "required" | "disabled" | "aria-describedby" | "aria-invalid" | "children" | "prefix"
> & FormFieldProps & {
  type?: HTMLInputTypeAttribute;
  prefix?: ReactNode;
  suffix?: ReactNode;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    id,
    label,
    description,
    error,
    invalid = false,
    required = false,
    disabled = false,
    className,
    type = "text",
    prefix,
    suffix,
    "aria-describedby": externalDescribedBy,
    ...inputProps
  },
  ref,
) {
  const field = useFormField({ id, description, error, invalid, "aria-describedby": externalDescribedBy });
  const controlClassName = [styles.control, className].filter(Boolean).join(" ");
  const hasAffixes = (prefix !== undefined && prefix !== null && prefix !== false && prefix !== "")
    || (suffix !== undefined && suffix !== null && suffix !== false && suffix !== "");

  return (
    <div className={styles.field}>
      <FieldLabel disabled={disabled} id={field.id} label={label} required={required} />
      {hasAffixes ? (
        <div
          className={styles.inputGroup}
          data-disabled={disabled || undefined}
          data-invalid={field.invalid || undefined}
        >
          {prefix !== undefined && prefix !== null && prefix !== false && prefix !== "" && (
            <span className={styles.inputAffix}>{prefix}</span>
          )}
          <input
            {...inputProps}
            ref={ref}
            id={field.id}
            type={type}
            required={required}
            disabled={disabled}
            aria-describedby={field.describedBy}
            aria-invalid={field.invalid || undefined}
            className={controlClassName}
          />
          {suffix !== undefined && suffix !== null && suffix !== false && suffix !== "" && (
            <span className={styles.inputAffix}>{suffix}</span>
          )}
        </div>
      ) : (
        <input
          {...inputProps}
          ref={ref}
          id={field.id}
          type={type}
          required={required}
          disabled={disabled}
          aria-describedby={field.describedBy}
          aria-invalid={field.invalid || undefined}
          className={controlClassName}
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

TextField.displayName = "TextField";
