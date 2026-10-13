import { forwardRef, type ComponentPropsWithRef, type CSSProperties, type ReactNode } from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./Callout.module.css";

export type CalloutTone = "info" | "success" | "warning" | "error" | "neutral";

export type CalloutProps = Omit<
  ComponentPropsWithRef<"div">,
  "children" | "style"
> & {
  children: ReactNode;
  title?: ReactNode;
  tone?: CalloutTone;
  icon?: ReactNode;
  action?: ReactNode;
  style?: DesignSystemStyle;
};

export const Callout = forwardRef<HTMLDivElement, CalloutProps>(function Callout(
  {
    children,
    title,
    tone = "info",
    icon,
    action,
    className,
    style,
    ...divProps
  },
  ref,
) {
  const hasIcon = icon != null && typeof icon !== "boolean";
  const classes = [styles.callout, className].filter(Boolean).join(" ");

  return (
    <div
      {...divProps}
      ref={ref}
      className={classes}
      data-tone={tone}
      data-has-icon={hasIcon}
      style={style as CSSProperties | undefined}
    >
      {hasIcon && (
        <span aria-hidden="true" className={styles.icon}>
          {icon}
        </span>
      )}
      <div className={styles.content}>
        {title != null && <div className={styles.title}>{title}</div>}
        <div className={styles.body}>{children}</div>
        {action != null && <div className={styles.action}>{action}</div>}
      </div>
    </div>
  );
});

Callout.displayName = "Callout";
