import { useId, type ReactNode } from "react";
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

function hasContent(content: ReactNode): boolean {
  return content !== undefined && content !== null && content !== false && content !== "";
}

export function useFormField({
  id,
  description,
  error,
  invalid = false,
  "aria-describedby": externalDescribedBy,
}: Pick<FormFieldProps, "id" | "description" | "error" | "invalid" | "aria-describedby">): FormFieldMetadata {
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

interface LabelProps {
  id: string;
  labelId?: string;
  label: ReactNode;
  required?: boolean;
}

export function FieldLabel({ id, labelId, label, required = false }: LabelProps) {
  return (
    <label className={styles.label} htmlFor={id} id={labelId}>
      {label}
      {required && <span className={styles.requiredMark} aria-hidden="true"> *</span>}
    </label>
  );
}

export function FieldLegend({ label, required = false }: Omit<LabelProps, "id">) {
  return (
    <legend className={styles.label}>
      {label}
      {required && <span className={styles.requiredMark} aria-hidden="true"> *</span>}
    </legend>
  );
}

interface MessagesProps {
  description?: ReactNode;
  descriptionId?: string;
  error?: ReactNode;
  errorId?: string;
}

export function FieldMessages({ description, descriptionId, error, errorId }: MessagesProps) {
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
