import {
  forwardRef,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./Label.module.css";

export type LabelVariant = "field" | "choice";

export type LabelProps = Omit<
  ComponentPropsWithRef<"label">,
  "children" | "style"
> & {
  children: ReactNode;
  variant?: LabelVariant;
  required?: boolean;
  disabled?: boolean;
  style?: DesignSystemStyle;
};

/**
 * A styled native label. `required` adds a visual marker; apply native
 * requiredness to the associated form control itself.
 */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  {
    children,
    variant = "field",
    required = false,
    disabled = false,
    className,
    style,
    ...labelProps
  },
  ref,
) {
  const classes = [styles.label, styles[variant], className].filter(Boolean).join(" ");

  return (
    <label
      {...labelProps}
      ref={ref}
      className={classes}
      data-disabled={disabled ? "true" : undefined}
      data-variant={variant}
      style={style as CSSProperties | undefined}
    >
      {children}
      {required && <span className={styles.requiredMark} aria-hidden="true"> *</span>}
    </label>
  );
});

Label.displayName = "Label";
