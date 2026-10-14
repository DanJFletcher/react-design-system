import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Icon } from "../Icon/Icon";
import type { DesignSystemStyle } from "../../generated/token-types";
import { getStandardMotionDurationMs } from "../../motion/getStandardMotionDurationMs";
import type { MotionEffect } from "../../motion/types";
import { usePrefersReducedMotion } from "../../motion/usePrefersReducedMotion";
import styles from "./Dialog.module.css";

export type DialogSize = "sm" | "md" | "lg";
export type DialogHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type DialogMotionState = "closed" | "entering" | "open" | "exiting";

export type DialogProps = Omit<
  ComponentPropsWithRef<"dialog">,
  "open" | "children" | "style" | "onClose" | "onCancel" | "onClick"
> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  heading?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: DialogSize;
  headingLevel?: DialogHeadingLevel;
  showCloseButton?: boolean;
  closeLabel?: string;
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
  motion?: MotionEffect;
  onClose?: ComponentPropsWithoutRef<"dialog">["onClose"];
  onCancel?: ComponentPropsWithoutRef<"dialog">["onCancel"];
  onClick?: ComponentPropsWithoutRef<"dialog">["onClick"];
  style?: DesignSystemStyle;
};

export const Dialog = forwardRef<HTMLDialogElement, DialogProps>(function Dialog(
  {
    open,
    onOpenChange,
    heading,
    description,
    children,
    footer,
    size = "md",
    headingLevel = 2,
    showCloseButton = true,
    closeLabel = "Close dialog",
    closeOnEscape = true,
    closeOnBackdropClick = false,
    motion = "fade",
    className,
    style,
    onClose,
    onCancel,
    onClick,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    ...dialogProps
  },
  ref,
) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [motionState, setMotionState] = useState<DialogMotionState>("closed");
  const prefersReducedMotion = usePrefersReducedMotion();
  const generatedId = useId();
  const headingId = `${generatedId}-heading`;
  const descriptionId = `${generatedId}-description`;
  const Heading = `h${headingLevel}` as
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6";

  useImperativeHandle(ref, () => dialogRef.current as HTMLDialogElement, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    if (open) {
      if (!dialog.open) {
        dialog.showModal();
        if (motion === "none" || prefersReducedMotion) {
          setMotionState("open");
        } else {
          setMotionState("entering");
          animationFrameRef.current = window.requestAnimationFrame(() => {
            animationFrameRef.current = window.requestAnimationFrame(() => {
              animationFrameRef.current = null;
              setMotionState("open");
            });
          });
        }
      } else {
        setMotionState("open");
      }
    } else if (dialog.open) {
      if (motion === "none" || prefersReducedMotion) {
        setMotionState("closed");
        dialog.close();
      } else {
        setMotionState("exiting");
        closeTimerRef.current = window.setTimeout(() => {
          if (dialog.open) dialog.close();
          closeTimerRef.current = null;
          setMotionState("closed");
        }, getStandardMotionDurationMs());
      }
    } else {
      setMotionState("closed");
    }

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [open, motion, prefersReducedMotion]);

  const handleClose: NonNullable<DialogProps["onClose"]> = (event) => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setMotionState("closed");
    if (open) onOpenChange(false);
    onClose?.(event);
  };

  const handleCancel: NonNullable<DialogProps["onCancel"]> = (event) => {
    onCancel?.(event);
    if (event.defaultPrevented) return;

    event.preventDefault();
    if (closeOnEscape && open) onOpenChange(false);
  };

  const handleClick: NonNullable<DialogProps["onClick"]> = (event) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (closeOnBackdropClick && event.target === event.currentTarget && open) {
      onOpenChange(false);
    }
  };

  return (
    <dialog
      {...dialogProps}
      aria-labelledby={ariaLabelledBy ?? (heading != null ? headingId : undefined)}
      aria-describedby={ariaDescribedBy ?? (description != null ? descriptionId : undefined)}
      ref={dialogRef}
      className={[styles.dialog, className].filter(Boolean).join(" ")}
      data-motion={motion}
      data-motion-state={motionState}
      data-size={size}
      onCancel={handleCancel}
      onClose={handleClose}
      onClick={handleClick}
      style={style as CSSProperties | undefined}
    >
      {(heading != null || description != null || showCloseButton) && (
        <header className={styles.header}>
          <div className={styles.headingGroup}>
            {heading != null && <Heading className={styles.heading} id={headingId}>{heading}</Heading>}
            {description != null && (
              <div className={styles.description} id={descriptionId}>{description}</div>
            )}
          </div>
          {showCloseButton && (
            <button
              aria-label={closeLabel}
              className={styles.closeButton}
              onClick={() => onOpenChange(false)}
              type="button"
            >
              <Icon name="close" />
            </button>
          )}
        </header>
      )}
      {children != null && <div className={styles.body}>{children}</div>}
      {footer != null && <footer className={styles.footer}>{footer}</footer>}
    </dialog>
  );
});

Dialog.displayName = "Dialog";
