import { forwardRef, type ComponentPropsWithRef, type CSSProperties, type ReactNode } from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./ButtonGroup.module.css";

export type ButtonGroupOrientation = "horizontal" | "vertical";
export type ButtonGroupSpacing = "none" | "sm" | "md" | "lg";
export type ButtonGroupAlignment = "start" | "center" | "end";

export type ButtonGroupProps = Omit<
  ComponentPropsWithRef<"div">,
  "style" | "role"
> & {
  children?: ReactNode;
  orientation?: ButtonGroupOrientation;
  spacing?: ButtonGroupSpacing;
  alignment?: ButtonGroupAlignment;
  fullWidth?: boolean;
  equalWidth?: boolean;
  wrap?: boolean;
  style?: DesignSystemStyle;
};

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  {
    children,
    orientation = "horizontal",
    spacing = "sm",
    alignment = "start",
    fullWidth = false,
    equalWidth = false,
    wrap = false,
    className,
    style,
    ...groupProps
  },
  ref,
) {
  const classes = [styles.group, className].filter(Boolean).join(" ");

  return (
    <div
      {...groupProps}
      className={classes}
      data-alignment={alignment}
      data-equal-width={String(equalWidth)}
      data-full-width={String(fullWidth)}
      data-orientation={orientation}
      data-spacing={spacing}
      data-wrap={String(wrap)}
      ref={ref}
      role="group"
      style={style as CSSProperties | undefined}
    >
      {children}
    </div>
  );
});

ButtonGroup.displayName = "ButtonGroup";
