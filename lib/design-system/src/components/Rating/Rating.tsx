import { useState, type ChangeEvent, type CSSProperties, type ReactNode } from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import { FieldLegend, FieldMessages, useFormField } from "../FormControls/FormField";
import fieldStyles from "../FormControls/FormControls.module.css";
import styles from "./Rating.module.css";

export type RatingSize = "sm" | "md" | "lg";
export type RatingStep = 0.5 | 1;
export type RatingSymbol = "star" | "heart" | "thumbs";

const ratingSymbolPaths: Record<RatingSymbol, string> = {
  star: "M12 2.75 14.72 8.27 20.82 9.16 16.41 13.46 17.45 19.53 12 16.66 6.55 19.53 7.59 13.46 3.18 9.16 9.28 8.27 12 2.75Z",
  heart: "M12 21C10.7 19.8 3 14.3 3 8.5C3 5.5 5.2 3.5 8 3.5C9.8 3.5 11.2 4.4 12 5.8C12.8 4.4 14.2 3.5 16 3.5C18.8 3.5 21 5.5 21 8.5C21 14.3 13.3 19.8 12 21Z",
  thumbs: "M7.5 10.5 12 4.8a1.9 1.9 0 0 1 3.2 1.6l-.8 4.1h4.1a2 2 0 0 1 1.9 2.5l-1.5 6a2 2 0 0 1-1.9 1.5H7.5m0-10h-3A1.5 1.5 0 0 0 3 12v7a1.5 1.5 0 0 0 1.5 1.5h3m0-10v10",
};

type RatingBaseProps = {
  id?: string;
  max?: number;
  size?: RatingSize;
  showValue?: boolean;
  getRatingLabel?: (rating: number, max: number, symbol: RatingSymbol) => string;
  formatValue?: (rating: number, max: number) => ReactNode;
  symbol?: RatingSymbol;
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
  step?: RatingStep;
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

function validateInputStep(step: number): asserts step is RatingStep {
  if (step !== 0.5 && step !== 1) {
    throw new RangeError("Rating input step must be 1 or 0.5.");
  }
}

function validateInputValue(value: number | null, max: number, step: RatingStep) {
  if (value === null || value === 0) return;
  if (
    !Number.isFinite(value)
    || value < step
    || value > max
    || !Number.isSafeInteger(value / step)
  ) {
    throw new RangeError(`Rating input value must be 0 or a multiple of ${step} up to ${max}.`);
  }
}

function getAccessibleRatingLabel(
  rating: number,
  max: number,
  symbol: RatingSymbol,
  getRatingLabel?: (rating: number, max: number, symbol: RatingSymbol) => string,
) {
  const unit = symbol === "star"
    ? "stars"
    : symbol === "heart"
      ? "hearts"
      : "thumbs up";
  const label = getRatingLabel?.(rating, max, symbol) ?? `${rating} out of ${max} ${unit}`;
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

function RatingSymbolIcon({
  value,
  index,
  symbol,
}: {
  value: number;
  index: number;
  symbol: RatingSymbol;
}) {
  const fill = Math.min(1, Math.max(0, value - index)) * 100;

  return (
    <span className={styles.symbol} data-rating-symbol={symbol}>
      <svg
        aria-hidden="true"
        className={styles.symbolOutline}
        focusable="false"
        viewBox="0 0 24 24"
      >
        <path d={ratingSymbolPaths[symbol]} />
      </svg>
      <span
        className={styles.symbolFill}
        data-rating-star-fill=""
        style={{ "--rating-fill": `${fill}%` } as CSSProperties}
      >
        <svg
          aria-hidden="true"
          className={styles.symbolSolid}
          focusable="false"
          viewBox="0 0 24 24"
        >
          <path d={ratingSymbolPaths[symbol]} />
        </svg>
      </span>
    </span>
  );
}

function RatingSymbols({
  value,
  max,
  symbol,
}: {
  value: number;
  max: number;
  symbol: RatingSymbol;
}) {
  return (
    <span className={styles.symbols} aria-hidden="true">
      {Array.from({ length: max }, (_, index) => (
        <RatingSymbolIcon key={index} value={value} index={index} symbol={symbol} />
      ))}
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
    symbol = "star",
    showValue = false,
    getRatingLabel,
    formatValue,
    className,
    style,
  } = props;

  validateMax(max);
  validateDisplayValue(value, max);
  const accessibleLabel = getAccessibleRatingLabel(value, max, symbol, getRatingLabel);

  return (
    <div
      id={id}
      className={[styles.displayRoot, className].filter(Boolean).join(" ")}
      data-size={size}
      style={style as CSSProperties | undefined}
    >
      {label != null && <span className={styles.displayLabel}>{label}</span>}
      <span className={styles.accessibleSymbols} role="img" aria-label={accessibleLabel}>
        <RatingSymbols value={value} max={max} symbol={symbol} />
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
    step = 1,
    symbol = "star",
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
  validateInputStep(step);
  validateInputValue(defaultValue, max, step);
  if (value !== undefined) validateInputValue(value, max, step);

  const field = useFormField({ id, description, error, invalid, "aria-describedby": externalDescribedBy });
  const [uncontrolledValue, setUncontrolledValue] = useState<number | null>(defaultValue);
  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value ?? null : uncontrolledValue;
  validateInputValue(selectedValue, max, step);
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
        <div
          className={styles.options}
          data-step={step}
          onMouseLeave={() => setPreviewValue(null)}
        >
          {step === 0.5
            ? Array.from({ length: max }, (_, index) => {
                const wholeStar = index + 1;
                const choices = [wholeStar - 0.5, wholeStar];
                return (
                  <span
                    className={styles.halfStarCell}
                    data-disabled={disabled || undefined}
                    key={wholeStar}
                  >
                    <span className={styles.halfStarVisual} aria-hidden="true">
                      <RatingSymbolIcon value={activeValue} index={index} symbol={symbol} />
                    </span>
                    <span className={styles.halfTargets}>
                      {choices.map((rating) => (
                        <label
                          className={styles.halfOption}
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
                            data-rating-option={rating}
                            disabled={disabled}
                            name={groupName}
                            onChange={handleChange}
                            required={required}
                            type="radio"
                            value={rating}
                          />
                          <span className={styles.focusIndicator} aria-hidden="true" />
                          <span className={styles.visuallyHidden}>
                            {getAccessibleRatingLabel(rating, max, symbol, getRatingLabel)}
                          </span>
                        </label>
                      ))}
                    </span>
                  </span>
                );
              })
            : Array.from({ length: max }, (_, index) => {
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
                      <RatingSymbolIcon value={activeValue} index={index} symbol={symbol} />
                    </span>
                    <span className={styles.visuallyHidden}>
                      {getAccessibleRatingLabel(rating, max, symbol, getRatingLabel)}
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
