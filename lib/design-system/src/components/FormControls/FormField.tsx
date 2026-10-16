import { useId, type ReactNode } from "react";
import { Label } from "../Label/Label";
import labelStyles from "../Label/Label.module.css";
import styles from "./FormControls.module.css";

export interface FormFieldProps {
  id?: string;
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
  "aria-describedby"?: string;
}

export interface FormFieldMetadata {
  id: string;
  descriptionId?: string;
  errorId?: string;
  describedBy?: string;
  invalid: boolean;
}

export type FormFieldOptions = Pick<
  FormFieldProps,
  "id" | "description" | "error" | "invalid" | "aria-describedby"
>;

function hasContent(content: ReactNode): boolean {
  return content !== undefined && content !== null && content !== false && content !== "";
}

/**
 * Creates the shared ID and accessibility metadata for a form control.
 * Apply `id`, `describedBy`, and `invalid` to the actual control; native
 * required and disabled semantics remain the control owner's responsibility.
 */
export function useFormField({
  id,
  description,
  error,
  invalid = false,
  "aria-describedby": externalDescribedBy,
}: FormFieldOptions): FormFieldMetadata {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const descriptionId = hasContent(description) ? `${fieldId}-description` : undefined;
  const errorId = hasContent(error) ? `${fieldId}-error` : undefined;
  const describedBy = Array.from(new Set([
    ...(externalDescribedBy?.split(/\s+/) ?? []),
    descriptionId,
    errorId,
  ].filter((value): value is string => Boolean(value)))).join(" ") || undefined;

  return {
    id: fieldId,
    descriptionId,
    errorId,
    describedBy,
    invalid: invalid || Boolean(errorId),
  };
}

export interface FormFieldLabelProps {
  id: string;
  labelId?: string;
  label: ReactNode;
  required?: boolean;
  disabled?: boolean;
}

export function FieldLabel({
  id,
  labelId,
  label,
  required = false,
  disabled = false,
}: FormFieldLabelProps) {
  return (
    <Label disabled={disabled} htmlFor={id} id={labelId} required={required}>
      {label}
    </Label>
  );
}

export function FieldLegend({ label, required = false }: Omit<FormFieldLabelProps, "id" | "disabled" | "labelId">) {
  return (
    <legend className={labelStyles.label}>
      {label}
      {required && <span className={labelStyles.requiredMark} aria-hidden="true"> *</span>}
    </legend>
  );
}

export interface FormFieldMessagesProps {
  description?: ReactNode;
  descriptionId?: string;
  error?: ReactNode;
  errorId?: string;
}

export function FieldMessages({ description, descriptionId, error, errorId }: FormFieldMessagesProps) {
  const showDescription = hasContent(description);
  const showError = hasContent(error);

  if (!showDescription && !showError) return null;

  return (
    <>
      {showDescription && (
        <div className={styles.description} id={descriptionId}>
          {description}
        </div>
      )}
      {showError && (
        <div className={styles.error} id={errorId} aria-live="polite" aria-atomic="true">
          {error}
        </div>
      )}
    </>
  );
}

/** Public composition helpers for custom native and third-party form controls. */
export { FieldLabel as FormFieldLabel, FieldMessages as FormFieldMessages };
