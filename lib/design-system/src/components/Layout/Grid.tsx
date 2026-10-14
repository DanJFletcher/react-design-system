import type { LayoutGap, LayoutPolymorphicProps, LayoutElement } from "./Layout.types";
import { renderLayoutElement } from "./Layout.types";
import styles from "./Layout.module.css";

export type GridMinItemWidth = "sm" | "md" | "lg";

export type GridProps<T extends LayoutElement = "div"> =
  LayoutPolymorphicProps<
    T,
    {
      gap?: LayoutGap;
      minItemWidth?: GridMinItemWidth;
    }
  >;

export function Grid<T extends LayoutElement = "div">({
  as,
  gap = "md",
  minItemWidth = "md",
  className,
  ...elementProps
}: GridProps<T>) {
  return renderLayoutElement(as, "div", {
    ...elementProps,
    className: [styles.grid, className].filter(Boolean).join(" "),
    "data-ds-layout-component": "grid",
    "data-gap": gap,
    "data-min-item-width": minItemWidth,
  });
}

Grid.displayName = "Grid";
