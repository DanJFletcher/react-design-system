import {
  forwardRef,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import { Heading, Text, type HeadingLevel } from "../Typography/Typography";
import styles from "./PageHeader.module.css";

export type PageHeaderProps = Omit<
  ComponentPropsWithRef<"header">,
  "children" | "style"
> & {
  title: ReactNode;
  headingLevel?: HeadingLevel;
  breadcrumbs?: ReactNode;
  description?: ReactNode;
  status?: ReactNode;
  actions?: ReactNode;
  style?: DesignSystemStyle;
};

/**
 * A responsive page-level heading composition. Content and actions remain
 * consumer-owned; the global site navigation belongs in Header.
 */
export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(function PageHeader(
  {
    title,
    headingLevel = 1,
    breadcrumbs,
    description,
    status,
    actions,
    className,
    style,
    ...headerProps
  },
  ref,
) {
  return (
    <header
      {...headerProps}
      ref={ref}
      className={[styles.pageHeader, className].filter(Boolean).join(" ")}
      style={style as CSSProperties | undefined}
    >
      {breadcrumbs != null && <div className={styles.breadcrumbs}>{breadcrumbs}</div>}
      <div className={styles.content}>
        <div className={styles.copy}>
          <div className={styles.headingRow}>
            <Heading className={styles.heading} level={headingLevel}>
              {title}
            </Heading>
            {status != null && <div className={styles.status}>{status}</div>}
          </div>
          {description != null && (
            <Text as="p" className={styles.description} tone="muted">
              {description}
            </Text>
          )}
        </div>
        {actions != null && <div className={styles.actions}>{actions}</div>}
      </div>
    </header>
  );
});

PageHeader.displayName = "PageHeader";
