import {
  forwardRef,
  type ComponentPropsWithRef,
  type ReactNode,
} from "react";
import type { LayoutGap } from "./Layout.types";
import styles from "./BlogLayout.module.css";

export type BlogLayoutFooterGap = LayoutGap;

export type BlogLayoutProps = Omit<
  ComponentPropsWithRef<"div">,
  "children"
> & {
  children: ReactNode;
  footer?: ReactNode;
  footerGap?: BlogLayoutFooterGap;
  header?: ReactNode;
};

export const BlogLayout = forwardRef<HTMLDivElement, BlogLayoutProps>(
  function BlogLayout(
    {
      children,
      className,
      footer,
      footerGap = "2xl",
      header,
      ...layoutProps
    },
    ref,
  ) {
    return (
      <div
        {...layoutProps}
        ref={ref}
        className={[styles.layout, className].filter(Boolean).join(" ")}
        data-ds-blog-layout=""
      >
        {header != null && <div className={styles.header}>{header}</div>}
        <div className={styles.content}>{children}</div>
        {footer != null && (
          <div className={styles.footer} data-footer-gap={footerGap}>
            {footer}
          </div>
        )}
      </div>
    );
  },
);

BlogLayout.displayName = "BlogLayout";
