import { forwardRef, type ComponentPropsWithRef, type CSSProperties } from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./Spinner.module.css";

export type SpinnerSize = "sm" | "md" | "lg";

export type SpinnerProps = Omit<
  ComponentPropsWithRef<"span">,
  "aria-hidden" | "aria-label" | "children" | "role" | "style"
> & {
  /** Accessible name announced when the spinner represents a loading status. */
  label?: string;
  /** Hide the indicator from assistive technology when its context is already named. */
  decorative?: boolean;
  size?: SpinnerSize;
  style?: DesignSystemStyle;
};

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  {
    label = "Loading",
    decorative = false,
    size = "md",
    className,
    style,
    ...spanProps
  },
  ref,
) {
  return (
    <span
      {...spanProps}
      ref={ref}
      data-ds-spinner=""
      className={[styles.spinner, styles[size], className].filter(Boolean).join(" ")}
      role={decorative ? undefined : "status"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      style={style as CSSProperties | undefined}
    >
      <span className={styles.indicator} aria-hidden="true" />
    </span>
  );
});

Spinner.displayName = "Spinner";
