import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  type ComponentPropsWithRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./Dialog.module.css";

export type DialogSize = "sm" | "md" | "lg";
export type DialogHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

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

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleClose: NonNullable<DialogProps["onClose"]> = (event) => {
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
              <CloseIcon />
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

function CloseIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
      <path
        d="m5 5 10 10M15 5 5 15"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}
