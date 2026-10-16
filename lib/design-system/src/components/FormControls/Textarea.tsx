import { forwardRef, type ComponentPropsWithRef } from "react";
import { FieldLabel, FieldMessages, type FormFieldProps, useFormField } from "./FormField";
import styles from "./FormControls.module.css";

export type TextareaProps = Omit<
  ComponentPropsWithRef<"textarea">,
  "id" | "required" | "disabled" | "aria-describedby" | "aria-invalid" | "children"
> & FormFieldProps;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    id,
    label,
    description,
    error,
    invalid = false,
    required = false,
    disabled = false,
    className,
    rows = 4,
    "aria-describedby": externalDescribedBy,
    ...textareaProps
  },
  ref,
) {
  const field = useFormField({ id, description, error, invalid, "aria-describedby": externalDescribedBy });
  const controlClassName = [styles.control, styles.textarea, className].filter(Boolean).join(" ");

  return (
    <div className={styles.field}>
      <FieldLabel disabled={disabled} id={field.id} label={label} required={required} />
      <textarea
        {...textareaProps}
        ref={ref}
        id={field.id}
        rows={rows}
        required={required}
        disabled={disabled}
        aria-describedby={field.describedBy}
        aria-invalid={field.invalid || undefined}
        className={controlClassName}
      />
      <FieldMessages
        description={description}
        descriptionId={field.descriptionId}
        error={error}
        errorId={field.errorId}
      />
    </div>
  );
});

Textarea.displayName = "Textarea";
