import {
  forwardRef,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./Kbd.module.css";

export type KbdSize = "sm" | "md";
export type KbdShape = "square" | "rounded";

export type KbdProps = Omit<
  ComponentPropsWithRef<"kbd">,
  "children" | "style"
> & {
  children: ReactNode;
  size?: KbdSize;
  shape?: KbdShape;
  style?: DesignSystemStyle;
};

/** Displays a keyboard key or part of a keyboard shortcut. */
export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd(
  {
    children,
    size = "md",
    shape = "square",
    className,
    style,
    ...props
  },
  ref,
) {
  const classes = [styles.kbd, styles[size], styles[shape], className]
    .filter(Boolean)
    .join(" ");

  return (
    <kbd
      {...props}
      ref={ref}
      className={classes}
      data-size={size}
      data-shape={shape}
      style={style as CSSProperties | undefined}
    >
      {children}
    </kbd>
  );
});

Kbd.displayName = "Kbd";
