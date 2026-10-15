import {
  forwardRef,
  type ComponentPropsWithRef,
  type CSSProperties,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import { usePrefersReducedMotion } from "../../motion/usePrefersReducedMotion";
import styles from "./Skeleton.module.css";

export type SkeletonShape = "text" | "circle" | "rectangular";
export type SkeletonAnimation = "shimmer" | "pulse" | "none";

export type SkeletonProps = Omit<
  ComponentPropsWithRef<"span">,
  "children" | "style" | "aria-hidden" | "role" | "aria-label" | "aria-labelledby"
> & {
  shape?: SkeletonShape;
  animation?: SkeletonAnimation;
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  style?: DesignSystemStyle;
};

export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(function Skeleton(
  {
    shape = "text",
    animation = "shimmer",
    width,
    height,
    className,
    style,
    ...spanProps
  },
  ref,
) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const effectiveAnimation = prefersReducedMotion ? "none" : animation;
  const inlineStyle = {
    ...(style as CSSProperties | undefined),
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
  };
  const classes = [styles.skeleton, className].filter(Boolean).join(" ");

  return (
    <span
      {...spanProps}
      aria-hidden="true"
      className={classes}
      data-animation={effectiveAnimation}
      data-shape={shape}
      ref={ref}
      style={inlineStyle}
    />
  );
});

Skeleton.displayName = "Skeleton";
