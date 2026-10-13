import { forwardRef, useId, type ComponentPropsWithRef, type CSSProperties } from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./Progress.module.css";

export type ProgressProps = Omit<
  ComponentPropsWithRef<"div">,
  | "children"
  | "role"
  | "style"
  | "aria-label"
  | "aria-labelledby"
  | "aria-valuemin"
  | "aria-valuemax"
  | "aria-valuenow"
  | "aria-valuetext"
> & {
  label: string;
  value?: number;
  max?: number;
  valueText?: string;
  showValue?: boolean;
  style?: DesignSystemStyle;
};

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  {
    label,
    value,
    max = 100,
    valueText,
    showValue = true,
    className,
    style,
    "aria-describedby": ariaDescribedBy,
    ...divProps
  },
  ref,
) {
  if (!Number.isFinite(max) || max <= 0) {
    throw new RangeError("Progress max must be a finite number greater than zero.");
  }
  if (value !== undefined && !Number.isFinite(value)) {
    throw new RangeError("Progress value must be a finite number.");
  }

  const labelId = useId();
  const normalizedValue = value === undefined ? undefined : Math.min(max, Math.max(0, value));
  const percentage = normalizedValue === undefined ? undefined : (normalizedValue / max) * 100;
  const isIndeterminate = normalizedValue === undefined;
  const visibleValue = valueText ?? (percentage === undefined ? undefined : `${Math.round(percentage)}%`);

  return (
    <div
      {...divProps}
      ref={ref}
      className={[styles.progress, className].filter(Boolean).join(" ")}
      data-indeterminate={isIndeterminate ? "true" : undefined}
      style={style as CSSProperties | undefined}
    >
      <div className={styles.header}>
        <span className={styles.label} id={labelId}>{label}</span>
        {showValue && visibleValue != null && (
          <span className={styles.value}>{visibleValue}</span>
        )}
      </div>
      <div
        aria-describedby={ariaDescribedBy}
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={normalizedValue}
        aria-valuetext={valueText || undefined}
        className={styles.track}
        role="progressbar"
      >
        <span
          className={styles.indicator}
          style={{ inlineSize: percentage === undefined ? undefined : `${percentage}%` }}
        />
      </div>
    </div>
  );
});

Progress.displayName = "Progress";
