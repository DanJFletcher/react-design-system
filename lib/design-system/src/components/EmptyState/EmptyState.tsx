import {
  forwardRef,
  useId,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import { Heading, Text, type HeadingLevel } from "../Typography/Typography";
import styles from "./EmptyState.module.css";

export type EmptyStateLayout = "compact" | "full";

export type EmptyStateProps = Omit<
  ComponentPropsWithRef<"section">,
  "children" | "style"
> & {
  title: ReactNode;
  headingLevel?: HeadingLevel;
  icon?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  layout?: EmptyStateLayout;
  style?: DesignSystemStyle;
};

/**
 * A static, theme-aware empty-content message. Data, recovery actions, and
 * announcements remain under the consuming application's control.
 */
export const EmptyState = forwardRef<HTMLElement, EmptyStateProps>(function EmptyState(
  {
    title,
    headingLevel = 2,
    icon,
    description,
    actions,
    layout = "compact",
    className,
    style,
    "aria-labelledby": ariaLabelledBy,
    ...sectionProps
  },
  ref,
) {
  const generatedHeadingId = useId();
  const headingId = ariaLabelledBy ?? generatedHeadingId;

  return (
    <section
      {...sectionProps}
      ref={ref}
      aria-labelledby={headingId}
      className={[styles.emptyState, className].filter(Boolean).join(" ")}
      data-layout={layout}
      style={style as CSSProperties | undefined}
    >
      {icon != null && <div aria-hidden="true" className={styles.icon}>{icon}</div>}
      <div className={styles.content}>
        <Heading className={styles.heading} id={generatedHeadingId} level={headingLevel}>
          {title}
        </Heading>
        {description != null && (
          <Text as="p" className={styles.description} tone="muted">
            {description}
          </Text>
        )}
      </div>
      {actions != null && <div className={styles.actions}>{actions}</div>}
    </section>
  );
});

EmptyState.displayName = "EmptyState";
