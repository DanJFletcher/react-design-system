import {
  forwardRef,
  useId,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import { Heading, Text, type HeadingLevel } from "../Typography/Typography";
import styles from "./ActivityFeed.module.css";

type ActivityFeedSubject =
  | { subject: ReactNode; href?: string }
  | { subject?: never; href?: never };

export type ActivityFeedItem = {
  id: string;
  actor: string;
  action: ReactNode;
  dateText: string;
  dateTime: string;
  avatar?: ReactNode;
  details?: ReactNode;
} & ActivityFeedSubject;

export type ActivityFeedProps = Omit<
  ComponentPropsWithRef<"section">,
  "children" | "style"
> & {
  events: readonly ActivityFeedItem[];
  heading?: ReactNode;
  headingLevel?: HeadingLevel;
  description?: ReactNode;
  emptyMessage?: ReactNode;
  style?: DesignSystemStyle;
};

/**
 * A static, ordered summary of recent workspace events. Event data, ordering,
 * links, and permissions remain owned by the consuming application.
 */
export const ActivityFeed = forwardRef<HTMLElement, ActivityFeedProps>(
  function ActivityFeed(
    {
      events,
      heading = "Recent activity",
      headingLevel = 2,
      description,
      emptyMessage = "Team updates will appear here.",
      className,
      style,
      "aria-labelledby": ariaLabelledBy,
      ...sectionProps
    },
    ref,
  ) {
    const generatedHeadingId = useId();

    return (
      <section
        {...sectionProps}
        ref={ref}
        aria-labelledby={ariaLabelledBy ?? generatedHeadingId}
        className={[styles.panel, className].filter(Boolean).join(" ")}
        style={style as CSSProperties | undefined}
      >
        <header className={styles.header}>
          <div className={styles.headingBlock}>
            <Heading className={styles.heading} id={generatedHeadingId} level={headingLevel}>
              {heading}
            </Heading>
            {description != null && (
              <Text as="p" className={styles.description} tone="muted">
                {description}
              </Text>
            )}
          </div>
        </header>

        {events.length === 0 ? (
          <Text as="p" className={styles.emptyMessage} tone="muted">
            {emptyMessage}
          </Text>
        ) : (
          <ol className={styles.eventList}>
            {events.map(({ id, actor, action, subject, href, avatar, details, dateText, dateTime }) => (
              <li className={styles.event} key={id}>
                {avatar != null && (
                  <span aria-hidden="true" className={styles.avatar}>
                    {avatar}
                  </span>
                )}
                <div className={styles.eventContent}>
                  <p className={styles.summary}>
                    <span className={styles.actor}>{actor}</span>{" "}
                    {action}
                    {subject != null && (
                      <>
                        {" "}
                        {href != null ? (
                          <a className={styles.subjectLink} href={href}>
                            {subject}
                          </a>
                        ) : (
                          <span className={styles.subject}>{subject}</span>
                        )}
                      </>
                    )}
                  </p>
                  {details != null && (
                    <div className={styles.details}>{details}</div>
                  )}
                  <time className={styles.timestamp} dateTime={dateTime}>
                    {dateText}
                  </time>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    );
  },
);

ActivityFeed.displayName = "ActivityFeed";
