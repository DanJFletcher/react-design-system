import type { LayoutGap, LayoutPolymorphicProps, LayoutElement } from "./Layout.types";
import { renderLayoutElement } from "./Layout.types";
import styles from "./Layout.module.css";

export type ContainerMaxWidth = "narrow" | "content" | "wide" | "full";

export type ContainerProps<T extends LayoutElement = "div"> =
  LayoutPolymorphicProps<
    T,
    {
      maxWidth?: ContainerMaxWidth;
      gutter?: LayoutGap;
    }
  >;

export function Container<T extends LayoutElement = "div">({
  as,
  maxWidth = "wide",
  gutter = "md",
  className,
  ...elementProps
}: ContainerProps<T>) {
  return renderLayoutElement(as, "div", {
    ...elementProps,
    className: [styles.container, className].filter(Boolean).join(" "),
    "data-gutter": gutter,
    "data-max-width": maxWidth,
  });
}

Container.displayName = "Container";
