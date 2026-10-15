import { useState, type ChangeEvent, type CSSProperties, type ReactNode } from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import { FieldLegend, FieldMessages, useFormField } from "../FormControls/FormField";
import fieldStyles from "../FormControls/FormControls.module.css";
import styles from "./Rating.module.css";

export type RatingSize = "sm" | "md" | "lg";

type RatingBaseProps = {
  id?: string;
  max?: number;
  size?: RatingSize;
  showValue?: boolean;
  getRatingLabel?: (rating: number, max: number) => string;
  formatValue?: (rating: number, max: number) => ReactNode;
  className?: string;
  style?: DesignSystemStyle;
};

export type RatingDisplayProps = RatingBaseProps & {
  mode?: "display";
  value: number;
  label?: ReactNode;
};

export type RatingInputProps = RatingBaseProps & {
  mode: "input";
  label: ReactNode;
  value?: number | null;
  defaultValue?: number | null;
  name?: string;
  onValueChange?: (value: number) => void;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  description?: ReactNode;
  error?: ReactNode;
  invalid?: boolean;
  "aria-describedby"?: string;
};

export type RatingProps = RatingDisplayProps | RatingInputProps;

function validateMax(max: number) {
  if (!Number.isSafeInteger(max) || max < 1 || max > 10) {
    throw new RangeError("Rating max must be an integer from 1 to 10.");
  }
}

function validateDisplayValue(value: number, max: number) {
  if (!Number.isFinite(value) || value < 0 || value > max) {
    throw new RangeError(`Rating value must be between 0 and ${max}.`);
  }
}

function validateInputValue(value: number | null, max: number) {
  if (value !== null && (!Number.isSafeInteger(value) || value < 0 || value > max)) {
    throw new RangeError(`Rating input value must be 0 or an integer from 1 to ${max}.`);
  }
}

function getAccessibleRatingLabel(
  rating: number,
  max: number,
  getRatingLabel?: (rating: number, max: number) => string,
) {
  const label = getRatingLabel?.(rating, max) ?? `${rating} out of ${max} stars`;
  if (typeof label !== "string" || !label.trim()) {
    throw new Error("Rating getRatingLabel must return non-empty text.");
  }
  return label;
}

function formatRatingValue(
  value: number,
  max: number,
  formatValue?: (rating: number, max: number) => ReactNode,
) {
  return formatValue ? formatValue(value, max) : `${value}/${max}`;
}

function RatingStars({ value, max }: { value: number; max: number }) {
  return (
    <span className={styles.stars} aria-hidden="true">
      {Array.from({ length: max }, (_, index) => {
        const fill = Math.min(1, Math.max(0, value - index)) * 100;
        return (
          <span className={styles.star} key={index}>
            <span className={styles.starGlyph}>☆</span>
            <span
              className={styles.starFill}
              data-rating-star-fill=""
              style={{ "--rating-fill": `${fill}%` } as CSSProperties}
            >
              ★
            </span>
          </span>
        );
      })}
    </span>
  );
}

function DisplayRating(props: RatingDisplayProps) {
  const {
    id,
    label,
    value,
    max = 5,
    size = "md",
    showValue = false,
    getRatingLabel,
    formatValue,
    className,
    style,
  } = props;

  validateMax(max);
  validateDisplayValue(value, max);
  const accessibleLabel = getAccessibleRatingLabel(value, max, getRatingLabel);

  return (
    <div
      id={id}
      className={[styles.displayRoot, className].filter(Boolean).join(" ")}
      data-size={size}
      style={style as CSSProperties | undefined}
    >
      {label != null && <span className={styles.displayLabel}>{label}</span>}
      <span className={styles.accessibleStars} role="img" aria-label={accessibleLabel}>
        <RatingStars value={value} max={max} />
      </span>
      {showValue && (
        <output className={styles.value} aria-hidden="true">
          {formatRatingValue(value, max, formatValue)}
        </output>
      )}
    </div>
  );
}

function InputRating(props: RatingInputProps) {
  const {
    id,
    label,
    value,
    defaultValue = null,
    max = 5,
    size = "md",
    showValue = false,
    getRatingLabel,
    formatValue,
    name,
    onValueChange,
    onChange,
    required = false,
    disabled = false,
    description,
    error,
    invalid = false,
    className,
    style,
    "aria-describedby": externalDescribedBy,
  } = props;

  validateMax(max);
  validateInputValue(defaultValue, max);
  if (value !== undefined) validateInputValue(value, max);

  const field = useFormField({ id, description, error, invalid, "aria-describedby": externalDescribedBy });
  const [uncontrolledValue, setUncontrolledValue] = useState<number | null>(defaultValue);
  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value ?? null : uncontrolledValue;
  validateInputValue(selectedValue, max);
  const [previewValue, setPreviewValue] = useState<number | null>(null);
  const activeValue = previewValue ?? selectedValue ?? 0;
  const groupName = name ?? field.id;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = Number(event.currentTarget.value);
    if (!isControlled) setUncontrolledValue(nextValue);
    onValueChange?.(nextValue);
    onChange?.(event);
  }

  return (
    <fieldset
      id={field.id}
      className={[fieldStyles.radioGroup, styles.inputRoot, className].filter(Boolean).join(" ")}
      data-size={size}
      aria-describedby={field.describedBy}
      aria-invalid={field.invalid || undefined}
      disabled={disabled}
      style={style as CSSProperties | undefined}
    >
      <FieldLegend label={label} required={required} />
      <div className={styles.inputRow}>
        <div className={styles.options} onMouseLeave={() => setPreviewValue(null)}>
          {Array.from({ length: max }, (_, index) => {
            const rating = index + 1;
            return (
              <label
                className={styles.option}
                data-disabled={disabled || undefined}
                key={rating}
                onMouseEnter={() => {
                  if (!disabled) setPreviewValue(rating);
                }}
              >
                <input
                  aria-describedby={field.describedBy}
                  aria-invalid={field.invalid || undefined}
                  checked={selectedValue === rating}
                  className={styles.radio}
                  disabled={disabled}
                  name={groupName}
                  onChange={handleChange}
                  required={required}
                  type="radio"
                  value={rating}
                />
                <span
                  className={styles.optionStar}
                  data-filled={rating <= activeValue}
                  data-rating-option={rating}
                  aria-hidden="true"
                >
                  <span className={styles.optionStarGlyph}>☆</span>
                  {rating <= activeValue && (
                    <span className={styles.optionStarFill}>★</span>
                  )}
                </span>
                <span className={styles.visuallyHidden}>
                  {getAccessibleRatingLabel(rating, max, getRatingLabel)}
                </span>
              </label>
            );
          })}
        </div>
        {showValue && (
          <output className={styles.value} aria-hidden="true">
            {selectedValue == null || selectedValue === 0
              ? "—"
              : formatRatingValue(selectedValue, max, formatValue)}
          </output>
        )}
      </div>
      <FieldMessages
        description={description}
        descriptionId={field.descriptionId}
        error={error}
        errorId={field.errorId}
      />
    </fieldset>
  );
}

export function Rating(props: RatingProps) {
  return props.mode === "input" ? <InputRating {...props} /> : <DisplayRating {...props} />;
}

Rating.displayName = "Rating";
