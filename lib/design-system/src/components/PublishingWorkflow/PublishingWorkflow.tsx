import { forwardRef, useId, type ComponentPropsWithRef, type CSSProperties } from "react";
import { Badge, type BadgeTone } from "../Badge/Badge";
import { Button, type ButtonVariant } from "../Button/Button";
import { Progress } from "../Progress/Progress";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./PublishingWorkflow.module.css";

export type PublishingWorkflowStatus =
  | "draft"
  | "in-review"
  | "scheduled"
  | "published"
  | "archived";

export type PublishingReviewStepStatus = "pending" | "approved" | "changes-requested";

export type PublishingReviewStep = {
  id: string;
  label: string;
  status: PublishingReviewStepStatus;
  assignee?: string;
  detail?: string;
};

export type PublishingWorkflowActionId =
  | "submit-for-review"
  | "approve"
  | "request-changes"
  | "publish"
  | "publish-now"
  | "schedule"
  | "cancel-schedule"
  | "unpublish"
  | "return-to-draft"
  | "restore-draft";

export type PublishingWorkflowProps = Omit<
  ComponentPropsWithRef<"section">,
  "children" | "style" | "aria-label" | "aria-labelledby"
> & {
  status: PublishingWorkflowStatus;
  reviewSteps?: readonly PublishingReviewStep[];
  scheduleAt?: string;
  onScheduleAtChange?: (value: string) => void;
  onSubmitForReview?: () => void;
  onApprove?: () => void;
  onRequestChanges?: () => void;
  onPublish?: () => void;
  onPublishNow?: () => void;
  onSchedule?: (scheduleAt: string) => void;
  onCancelSchedule?: () => void;
  onUnpublish?: () => void;
  onReturnToDraft?: () => void;
  onRestoreDraft?: () => void;
  heading?: string;
  statusDescription?: string;
  lastSavedText?: string;
  disabled?: boolean;
  busyAction?: PublishingWorkflowActionId;
  className?: string;
  style?: DesignSystemStyle;
};

type WorkflowAction = {
  id: PublishingWorkflowActionId;
  label: string;
  variant: ButtonVariant;
  onClick: () => void;
  disabled?: boolean;
};

const statusDetails: Record<
  PublishingWorkflowStatus,
  { label: string; tone: BadgeTone; description: string }
> = {
  draft: {
    label: "Draft",
    tone: "neutral",
    description: "Only people with access to this workspace can view this draft.",
  },
  "in-review": {
    label: "In review",
    tone: "warning",
    description: "Review the content and complete the required approval steps.",
  },
  scheduled: {
    label: "Scheduled",
    tone: "accent",
    description: "This item is set to publish automatically at the scheduled time.",
  },
  published: {
    label: "Published",
    tone: "success",
    description: "This item is live and available to readers.",
  },
  archived: {
    label: "Archived",
    tone: "neutral",
    description: "This item is archived and no longer available to readers.",
  },
};

const reviewStatusDetails: Record<
  PublishingReviewStepStatus,
  { label: string; tone: BadgeTone }
> = {
  pending: { label: "Pending", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  "changes-requested": { label: "Changes requested", tone: "error" },
};

export const PublishingWorkflow = forwardRef<HTMLElement, PublishingWorkflowProps>(
  function PublishingWorkflow(
    {
      status,
      reviewSteps = [],
      scheduleAt,
      onScheduleAtChange,
      onSubmitForReview,
      onApprove,
      onRequestChanges,
      onPublish,
      onPublishNow,
      onSchedule,
      onCancelSchedule,
      onUnpublish,
      onReturnToDraft,
      onRestoreDraft,
      heading = "Publishing",
      statusDescription,
      lastSavedText,
      disabled = false,
      busyAction,
      className,
      style,
      ...sectionProps
    },
    ref,
  ) {
    const id = useId();
    const approvedCount = reviewSteps.filter((step) => step.status === "approved").length;
    const hasPendingReview = reviewSteps.some((step) => step.status === "pending");
    const hasRequestedChanges = reviewSteps.some((step) => step.status === "changes-requested");
    const allReviewsApproved = reviewSteps.length === 0 || approvedCount === reviewSteps.length;
    const canPublish = allReviewsApproved && !hasRequestedChanges;
    const scheduleValue = scheduleAt ?? "";
    const showSchedule = scheduleAt !== undefined || onScheduleAtChange !== undefined || onSchedule !== undefined;
    const currentStatus = statusDetails[status];
    const stepsPercent = reviewSteps.length === 0 ? 0 : Math.round((approvedCount / reviewSteps.length) * 100);
    const actions: WorkflowAction[] = [];

    if (status === "draft") {
      if (onSubmitForReview) {
        actions.push({
          id: "submit-for-review",
          label: "Submit for review",
          variant: "primary",
          onClick: onSubmitForReview,
        });
      }
      if (onPublishNow) {
        actions.push({
          id: "publish-now",
          label: "Publish now",
          variant: onSubmitForReview ? "secondary" : "primary",
          onClick: onPublishNow,
        });
      }
    } else if (status === "in-review") {
      if (hasRequestedChanges && onSubmitForReview) {
        actions.push({
          id: "submit-for-review",
          label: "Resubmit for review",
          variant: "primary",
          onClick: onSubmitForReview,
        });
      } else if (hasPendingReview && onApprove) {
        actions.push({
          id: "approve",
          label: "Approve review",
          variant: "primary",
          onClick: onApprove,
        });
      } else if (onApprove && !onPublish) {
        actions.push({
          id: "approve",
          label: "Approve review",
          variant: "primary",
          onClick: onApprove,
        });
      }

      if (onPublish) {
        actions.push({
          id: "publish",
          label: "Publish",
          variant: actions.length === 0 ? "primary" : "secondary",
          onClick: onPublish,
          disabled: !canPublish,
        });
      }
      if (onRequestChanges) {
        actions.push({
          id: "request-changes",
          label: "Request changes",
          variant: "secondary",
          onClick: onRequestChanges,
        });
      }
    } else if (status === "scheduled") {
      if (onPublishNow) {
        actions.push({
          id: "publish-now",
          label: "Publish now",
          variant: "primary",
          onClick: onPublishNow,
        });
      }
      if (onCancelSchedule) {
        actions.push({
          id: "cancel-schedule",
          label: "Cancel schedule",
          variant: "secondary",
          onClick: onCancelSchedule,
        });
      }
    } else if (status === "published") {
      if (onUnpublish) {
        actions.push({
          id: "unpublish",
          label: "Unpublish",
          variant: "secondary",
          onClick: onUnpublish,
        });
      }
      if (onReturnToDraft) {
        actions.push({
          id: "return-to-draft",
          label: "Return to draft",
          variant: "ghost",
          onClick: onReturnToDraft,
        });
      }
    } else if (status === "archived" && onRestoreDraft) {
      actions.push({
        id: "restore-draft",
        label: "Restore draft",
        variant: "primary",
        onClick: onRestoreDraft,
      });
    }

    if (onSchedule && (status === "draft" || status === "in-review" || status === "scheduled")) {
      actions.push({
        id: "schedule",
        label: status === "scheduled" ? "Update schedule" : "Schedule publish",
        variant: actions.length === 0 ? "primary" : "secondary",
        onClick: () => onSchedule(scheduleValue),
        disabled: scheduleValue.trim().length === 0,
      });
    }

    const classes = [styles.panel, className].filter(Boolean).join(" ");

    return (
      <section
        {...sectionProps}
        ref={ref}
        aria-busy={busyAction !== undefined || undefined}
        aria-labelledby={`${id}-heading`}
        className={classes}
        data-status={status}
        style={style as CSSProperties | undefined}
      >
        <header className={styles.header}>
          <div className={styles.headingBlock}>
            <h2 className={styles.heading} id={`${id}-heading`}>{heading}</h2>
            <p className={styles.description}>{statusDescription ?? currentStatus.description}</p>
          </div>
          <div className={styles.statusMeta}>
            <Badge dot tone={currentStatus.tone}>{currentStatus.label}</Badge>
            {lastSavedText && <span className={styles.savedText}>{lastSavedText}</span>}
          </div>
        </header>

        {reviewSteps.length > 0 && (
          <div
            aria-labelledby={`${id}-heading ${id}-review-heading`}
            className={styles.reviewSection}
            role="group"
          >
            <div className={styles.sectionHeading}>
              <h3 className={styles.sectionTitle} id={`${id}-review-heading`}>Review steps</h3>
              <span className={styles.reviewCount}>{approvedCount} of {reviewSteps.length} approved</span>
            </div>
            <Progress
              label="Review approval progress"
              showValue={false}
              value={stepsPercent}
            />
            <ol className={styles.reviewList}>
              {reviewSteps.map((step) => {
                const reviewStatus = reviewStatusDetails[step.status];
                return (
                  <li className={styles.reviewStep} data-review-status={step.status} key={step.id}>
                    <span aria-hidden="true" className={styles.stepMarker} />
                    <div className={styles.stepCopy}>
                      <strong className={styles.stepLabel}>{step.label}</strong>
                      {step.assignee && <span className={styles.stepAssignee}>{step.assignee}</span>}
                      {step.detail && <span className={styles.stepDetail}>{step.detail}</span>}
                    </div>
                    <Badge dot size="sm" tone={reviewStatus.tone}>{reviewStatus.label}</Badge>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {showSchedule && (
          <div className={styles.scheduleSection}>
            <label className={styles.scheduleLabel} htmlFor={`${id}-schedule`}>
              Publish date and time
            </label>
            <input
              aria-describedby={`${id}-schedule-hint`}
              autoComplete="off"
              className={styles.scheduleInput}
              disabled={disabled || onScheduleAtChange === undefined || busyAction !== undefined}
              id={`${id}-schedule`}
              onChange={(event) => onScheduleAtChange?.(event.currentTarget.value)}
              type="datetime-local"
              value={scheduleValue}
            />
            <p className={styles.scheduleHint} id={`${id}-schedule-hint`}>
              The host CMS is responsible for validating the time zone and saving the schedule.
            </p>
          </div>
        )}

        {status === "in-review" && onPublish && !canPublish && (
          <p className={styles.actionHint}>
            {hasRequestedChanges
              ? "Resolve requested changes and resubmit before publishing."
              : "Approve all review steps before publishing."}
          </p>
        )}

        {actions.length > 0 && (
          <div className={styles.actions}>
            {actions.map((action) => (
              <Button
                disabled={disabled || busyAction !== undefined || action.disabled}
                key={action.id}
                loading={busyAction === action.id}
                onClick={action.onClick}
                variant={action.variant}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </section>
    );
  },
);

PublishingWorkflow.displayName = "PublishingWorkflow";
