import { forwardRef, useId, type ComponentPropsWithRef, type CSSProperties } from "react";
import { Badge } from "../Badge/Badge";
import { Button } from "../Button/Button";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./RevisionHistory.module.css";

export type ContentRevision = {
  id: string;
  version: string;
  author: string;
  dateText: string;
  dateTime?: string;
  summary: string;
};

export type RevisionHistoryAction = "compare" | "restore";

export type RevisionHistoryProps = Omit<
  ComponentPropsWithRef<"section">,
  "children" | "style" | "title" | "aria-label" | "aria-labelledby"
> & {
  revisions: readonly ContentRevision[];
  currentRevisionId?: string;
  onCompare?: (revision: ContentRevision) => void;
  onRestore?: (revision: ContentRevision) => void;
  heading?: string;
  description?: string;
  emptyMessage?: string;
  loading?: boolean;
  disabled?: boolean;
  busyRevisionId?: string;
  busyAction?: RevisionHistoryAction;
  compareLabel?: string;
  restoreLabel?: string;
  currentLabel?: string;
  className?: string;
  style?: DesignSystemStyle;
};

export const RevisionHistory = forwardRef<HTMLElement, RevisionHistoryProps>(
  function RevisionHistory(
    {
      revisions,
      currentRevisionId,
      onCompare,
      onRestore,
      heading = "Revision history",
      description = "Review earlier versions of this content.",
      emptyMessage = "No saved versions yet.",
      loading = false,
      disabled = false,
      busyRevisionId,
      busyAction,
      compareLabel = "Compare",
      restoreLabel = "Restore",
      currentLabel = "Current",
      className,
      style,
      ...sectionProps
    },
    ref,
  ) {
    const id = useId();
    const isBusy = loading || busyRevisionId !== undefined;
    const classes = [styles.panel, className].filter(Boolean).join(" ");

    return (
      <section
        {...sectionProps}
        aria-busy={isBusy || undefined}
        aria-labelledby={`${id}-heading`}
        className={classes}
        ref={ref}
        style={style as CSSProperties | undefined}
      >
        <header className={styles.header}>
          <div className={styles.headingBlock}>
            <h2 className={styles.heading} id={`${id}-heading`}>{heading}</h2>
            {description && <p className={styles.description}>{description}</p>}
          </div>
          <span aria-live="polite" className={styles.versionCount}>
            {loading
              ? "Loading versions"
              : `${revisions.length} ${revisions.length === 1 ? "version" : "versions"}`}
          </span>
        </header>

        {loading ? (
          <p className={styles.loadingState} role="status">Loading revision history…</p>
        ) : revisions.length === 0 ? (
          <p className={styles.emptyState}>{emptyMessage}</p>
        ) : (
          <ol aria-label="Content versions" className={styles.revisionList}>
            {revisions.map((revision) => {
              const isCurrent = revision.id === currentRevisionId;
              const compareIsBusy =
                busyRevisionId === revision.id && busyAction === "compare";
              const restoreIsBusy =
                busyRevisionId === revision.id && busyAction === "restore";
              const actionsDisabled = disabled || busyRevisionId !== undefined;

              return (
                <li
                  aria-current={isCurrent ? "true" : undefined}
                  className={styles.revision}
                  data-current={isCurrent || undefined}
                  key={revision.id}
                >
                  <div className={styles.revisionHeader}>
                    <div className={styles.revisionDetails}>
                      <div className={styles.revisionTitle}>
                        <h3 className={styles.version}>{revision.version}</h3>
                        {isCurrent && <Badge size="sm" tone="success">{currentLabel}</Badge>}
                      </div>
                      <div className={styles.metadata}>
                        <span className={styles.author}>{revision.author}</span>
                        <span aria-hidden="true" className={styles.metadataDivider}>·</span>
                        <time className={styles.date} dateTime={revision.dateTime}>
                          {revision.dateText}
                        </time>
                      </div>
                    </div>
                    {(onCompare || onRestore) && !isCurrent && (
                      <div className={styles.actions}>
                        {onCompare && (
                          <Button
                            aria-label={`${compareLabel} ${revision.version}`}
                            disabled={actionsDisabled}
                            loading={compareIsBusy}
                            onClick={() => onCompare(revision)}
                            size="sm"
                            variant="secondary"
                          >
                            {compareLabel}
                          </Button>
                        )}
                        {onRestore && (
                          <Button
                            aria-label={`${restoreLabel} ${revision.version}`}
                            disabled={actionsDisabled}
                            loading={restoreIsBusy}
                            onClick={() => onRestore(revision)}
                            size="sm"
                            variant="ghost"
                          >
                            {restoreLabel}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  <p className={styles.summary}>{revision.summary}</p>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    );
  },
);

RevisionHistory.displayName = "RevisionHistory";
