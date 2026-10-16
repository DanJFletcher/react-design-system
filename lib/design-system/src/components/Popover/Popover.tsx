import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type FocusEvent,
  type ReactNode,
} from "react";
import {
  Button,
  type ButtonIconPosition,
  type ButtonShape,
  type ButtonSize,
  type ButtonVariant,
} from "../Button/Button";
import { Icon } from "../Icon/Icon";
import type { DesignSystemStyle } from "../../generated/token-types";
import { getStandardMotionDurationMs } from "../../motion/getStandardMotionDurationMs";
import type { MotionEffect } from "../../motion/types";
import { usePrefersReducedMotion } from "../../motion/usePrefersReducedMotion";
import styles from "./Popover.module.css";

export type PopoverPlacement = "top" | "right" | "bottom" | "left";
export type PopoverAlignment = "start" | "center" | "end";
type PopoverMotionState = "closed" | "entering" | "open" | "exiting";

export type PopoverProps = Omit<
  ComponentPropsWithRef<"div">,
  "children" | "style"
> & {
  /** Accessible name for the trigger and fallback name for the panel. */
  triggerLabel: string;
  /** Trigger content. Defaults to triggerLabel; the component renders a button. */
  trigger?: ReactNode;
  children?: ReactNode;
  heading?: ReactNode;
  description?: ReactNode;
  panelLabel?: string;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopoverPlacement;
  align?: PopoverAlignment;
  offset?: number;
  collisionPadding?: number;
  matchTriggerWidth?: boolean;
  panelMaxWidth?: CSSProperties["maxWidth"];
  panelClassName?: string;
  panelStyle?: CSSProperties;
  triggerVariant?: ButtonVariant;
  triggerSize?: ButtonSize;
  triggerShape?: ButtonShape;
  triggerIcon?: ReactNode;
  triggerIconPosition?: ButtonIconPosition;
  triggerClassName?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnFocusOutside?: boolean;
  returnFocusOnClose?: boolean;
  showCloseButton?: boolean;
  closeLabel?: string;
  motion?: MotionEffect;
  style?: DesignSystemStyle;
};

type PopoverCoordinates = {
  left: number;
  top: number;
  triggerWidth: number;
  side: PopoverPlacement;
};

const oppositeSide: Record<PopoverPlacement, PopoverPlacement> = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right",
};

export const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  {
    triggerLabel,
    trigger,
    children,
    heading,
    description,
    panelLabel,
    headingLevel = 2,
    open,
    defaultOpen = false,
    onOpenChange,
    placement = "bottom",
    align = "start",
    offset,
    collisionPadding,
    matchTriggerWidth = false,
    panelMaxWidth,
    panelClassName,
    panelStyle,
    triggerVariant = "secondary",
    triggerSize = "md",
    triggerShape,
    triggerIcon,
    triggerIconPosition = "right",
    triggerClassName,
    disabled = false,
    autoFocus = false,
    closeOnEscape = true,
    closeOnOutsideClick = true,
    closeOnFocusOutside = true,
    returnFocusOnClose = true,
    showCloseButton = false,
    closeLabel = "Close popover",
    motion = "slide",
    className,
    style,
    onBlurCapture,
    ...divProps
  },
  forwardedRef,
) {
  if (!triggerLabel.trim()) {
    throw new Error("Popover requires a non-empty triggerLabel.");
  }
  if (headingLevel < 2 || headingLevel > 6) {
    throw new Error("Popover headingLevel must be between 2 and 6.");
  }
  if (offset != null && (!Number.isFinite(offset) || offset < 0)) {
    throw new Error("Popover offset must be a non-negative finite number.");
  }
  if (collisionPadding != null && (!Number.isFinite(collisionPadding) || collisionPadding < 0)) {
    throw new Error("Popover collisionPadding must be a non-negative finite number.");
  }

  const controlled = open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = controlled ? open : uncontrolledOpen;
  const [motionState, setMotionState] = useState<PopoverMotionState>("closed");
  const [positioned, setPositioned] = useState(false);
  const [coordinates, setCoordinates] = useState<PopoverCoordinates>({
    left: 0,
    top: 0,
    triggerWidth: 0,
    side: placement,
  });
  const id = useId();
  const headingId = `${id}-heading`;
  const descriptionId = `${id}-description`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4" | "h5" | "h6";

  const updateOpen = useCallback((nextOpen: boolean) => {
    if (nextOpen === isOpen) return;
    if (!controlled) setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }, [controlled, isOpen, onOpenChange]);

  useEffect(() => {
    if (disabled && isOpen) updateOpen(false);
  }, [disabled, isOpen, updateOpen]);

  useLayoutEffect(() => {
    const panel = panelRef.current!;

    const duration = motion === "none" || prefersReducedMotion
      ? 0
      : getStandardMotionDurationMs();

    if (isOpen) {
      if (!panel.matches(":popover-open")) panel.showPopover();
      if (duration === 0) {
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

    } else if (panel.matches(":popover-open")) {
      if (returnFocusOnClose && panel.contains(document.activeElement)) {
        triggerRef.current?.focus();
      }
      if (duration === 0) {
        panel.hidePopover();
        setMotionState("closed");
      } else {
        setMotionState("exiting");
        closeTimerRef.current = window.setTimeout(() => {
          if (panel.matches(":popover-open")) panel.hidePopover();
          closeTimerRef.current = null;
          setMotionState("closed");
        }, duration);
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
  }, [autoFocus, isOpen, motion, prefersReducedMotion, returnFocusOnClose]);

  useLayoutEffect(() => {
    const root = rootRef.current!;
    const triggerElement = triggerRef.current!;
    const panel = panelRef.current!;
    if (!isOpen) {
      if (!panel?.matches(":popover-open")) setPositioned(false);
      return undefined;
    }
    const updatePosition = () => {
      const anchor = triggerElement.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const rootStyle = getComputedStyle(root);
      const tokenSpace = Number.parseFloat(rootStyle.getPropertyValue("--ds-space-2"));
      const viewportPadding = collisionPadding ??
        (Number.parseFloat(rootStyle.getPropertyValue("--ds-space-4")) || 16);
      const gap = offset ?? (Number.isFinite(tokenSpace) ? tokenSpace : 8);
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = document.documentElement.clientHeight;
      const available = {
        top: anchor.top - viewportPadding,
        right: viewportWidth - anchor.right - viewportPadding,
        bottom: viewportHeight - anchor.bottom - viewportPadding,
        left: anchor.left - viewportPadding,
      };
      const needed = {
        top: panelRect.height + gap,
        right: panelRect.width + gap,
        bottom: panelRect.height + gap,
        left: panelRect.width + gap,
      };
      const opposite = oppositeSide[placement];
      const side = available[placement] >= needed[placement]
        ? placement
        : available[opposite] >= needed[opposite]
          ? opposite
          : available[placement] >= available[opposite]
            ? placement
            : opposite;

      let left: number;
      let top: number;
      if (side === "top" || side === "bottom") {
        left = align === "start"
          ? anchor.left
          : align === "end"
            ? anchor.right - panelRect.width
            : anchor.left + (anchor.width - panelRect.width) / 2;
        top = side === "top" ? anchor.top - panelRect.height - gap : anchor.bottom + gap;
      } else {
        top = align === "start"
          ? anchor.top
          : align === "end"
            ? anchor.bottom - panelRect.height
            : anchor.top + (anchor.height - panelRect.height) / 2;
        left = side === "left" ? anchor.left - panelRect.width - gap : anchor.right + gap;
      }

      left = Math.min(
        Math.max(left, viewportPadding),
        Math.max(viewportPadding, viewportWidth - viewportPadding - panelRect.width),
      );
      top = Math.min(
        Math.max(top, viewportPadding),
        Math.max(viewportPadding, viewportHeight - viewportPadding - panelRect.height),
      );

      setCoordinates({
        left,
        top,
        triggerWidth: anchor.width,
        side,
      });
      setPositioned(true);
    };

    updatePosition();
    const observer = typeof ResizeObserver === "undefined"
      ? undefined
      : new ResizeObserver(updatePosition);
    observer?.observe(triggerElement);
    observer?.observe(panel);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [align, collisionPadding, isOpen, offset, placement, panelMaxWidth, matchTriggerWidth]);

  useEffect(() => {
    if (!isOpen || !autoFocus || !positioned) return;
    const panel = panelRef.current!;
    const firstFocusable = panel.querySelector<HTMLElement>(
      'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
    );
    (firstFocusable ?? panel).focus();
  }, [autoFocus, isOpen, positioned]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnEscapeKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented || !closeOnEscape) return;
      event.preventDefault();
      updateOpen(false);
    };
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!closeOnOutsideClick) return;
      const target = event.target;
      if (target instanceof Node && !rootRef.current?.contains(target)) {
        updateOpen(false);
      }
    };

    document.addEventListener("keydown", closeOnEscapeKey);
    document.addEventListener("pointerdown", closeOnOutsidePointer, true);
    return () => {
      document.removeEventListener("keydown", closeOnEscapeKey);
      document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
    };
  }, [closeOnEscape, closeOnOutsideClick, isOpen, updateOpen]);

  const handleBlurCapture = (event: FocusEvent<HTMLDivElement>) => {
    onBlurCapture?.(event);
    if (!closeOnFocusOutside) return;
    const nextTarget = event.relatedTarget;
    if (!(nextTarget instanceof Node) || !rootRef.current?.contains(nextTarget)) {
      updateOpen(false);
    }
  };

  const panelLabelledBy = heading != null ? headingId : undefined;
  const panelStyleValue = {
    ...panelStyle,
    left: coordinates.left,
    top: coordinates.top,
    minWidth: matchTriggerWidth ? coordinates.triggerWidth : undefined,
    maxWidth: panelMaxWidth,
    visibility: positioned ? undefined : "hidden",
  } satisfies CSSProperties;

  return (
    <div
      {...divProps}
      ref={(element) => {
        rootRef.current = element;
        if (typeof forwardedRef === "function") forwardedRef(element);
        else if (forwardedRef) forwardedRef.current = element;
      }}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-placement={placement}
      style={style as CSSProperties | undefined}
      onBlurCapture={handleBlurCapture}
    >
      <Button
        ref={triggerRef}
        aria-controls={id}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={triggerLabel}
        className={[styles.trigger, triggerClassName].filter(Boolean).join(" ")}
        disabled={disabled}
        icon={triggerIcon}
        iconPosition={triggerIconPosition}
        onClick={() => updateOpen(!isOpen)}
        shape={triggerShape}
        size={triggerSize}
        variant={triggerVariant}
      >
        {trigger ?? triggerLabel}
      </Button>
      <div
        aria-describedby={description != null ? descriptionId : undefined}
        aria-hidden={!isOpen || undefined}
        aria-label={!panelLabelledBy ? panelLabel ?? triggerLabel : undefined}
        aria-labelledby={panelLabelledBy}
        className={[styles.panel, panelClassName].filter(Boolean).join(" ")}
        data-align={align}
        data-motion={motion}
        data-motion-state={motionState}
        data-side={coordinates.side}
        id={id}
        inert={!isOpen || undefined}
        onKeyDown={(event) => {
          if (event.key === "Escape" && closeOnEscape) {
            event.preventDefault();
            updateOpen(false);
          }
        }}
        popover="manual"
        ref={panelRef}
        role="dialog"
        style={panelStyleValue}
        tabIndex={-1}
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
                onClick={() => updateOpen(false)}
                type="button"
              >
                <Icon name="close" />
              </button>
            )}
          </header>
        )}
        {children != null && <div className={styles.content}>{children}</div>}
      </div>
    </div>
  );
});

Popover.displayName = "Popover";
