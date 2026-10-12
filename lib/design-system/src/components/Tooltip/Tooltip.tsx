import {
  cloneElement,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type FocusEvent as ReactFocusEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./Tooltip.module.css";

export type TooltipPlacement = "top" | "right" | "bottom" | "left";

export type TooltipProps = Omit<
  ComponentPropsWithRef<"span">,
  "children" | "style"
> & {
  /** One trigger element. It should be keyboard-focusable when its help is needed. */
  children: ReactElement;
  /** Brief, supplementary text. Do not put essential instructions only in a tooltip. */
  content: ReactNode;
  placement?: TooltipPlacement;
  style?: DesignSystemStyle;
};

const oppositeSide: Record<TooltipPlacement, TooltipPlacement> = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right",
};

export const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(function Tooltip(
  {
    children,
    content,
    placement = "top",
    className,
    style,
    onBlurCapture,
    onFocusCapture,
    onPointerDownCapture,
    onPointerEnter,
    onPointerLeave,
    ...spanProps
  },
  forwardedRef,
) {
  const id = useId();
  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touchOpen, setTouchOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [side, setSide] = useState<TooltipPlacement>(placement);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const [positioned, setPositioned] = useState(false);
  const open = !dismissed && (hovered || focused || touchOpen);

  const setAnchor = useCallback((node: HTMLSpanElement | null) => {
    anchorRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  }, [forwardedRef]);

  const describedBy = [
    (children.props as { "aria-describedby"?: string })["aria-describedby"],
    id,
  ].filter(Boolean).join(" ");

  useEffect(() => {
    if (!open) return;

    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setDismissed(true);
      setTouchOpen(false);
    };
    const dismissOutside = (event: PointerEvent) => {
      if (!anchorRef.current?.contains(event.target as Node)) {
        setDismissed(true);
        setTouchOpen(false);
      }
    };
    document.addEventListener("keydown", dismissOnEscape);
    document.addEventListener("pointerdown", dismissOutside, true);
    return () => {
      document.removeEventListener("keydown", dismissOnEscape);
      document.removeEventListener("pointerdown", dismissOutside, true);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) {
      setPositioned(false);
      return;
    }

    const anchor = anchorRef.current;
    const tooltip = tooltipRef.current;
    if (!anchor || !tooltip) return;

    const updatePosition = () => {
      const anchorRect = anchor.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const rootStyle = getComputedStyle(anchor);
      const gap = Number.parseFloat(rootStyle.getPropertyValue("--ds-space-2")) || 8;
      const inset = gap;
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = document.documentElement.clientHeight;
      const room = {
        top: anchorRect.top - inset,
        right: viewportWidth - anchorRect.right - inset,
        bottom: viewportHeight - anchorRect.bottom - inset,
        left: anchorRect.left - inset,
      };
      const required: Record<TooltipPlacement, number> = {
        top: tooltipRect.height + gap,
        bottom: tooltipRect.height + gap,
        left: tooltipRect.width + gap,
        right: tooltipRect.width + gap,
      };
      let nextSide = placement;
      if (room[nextSide] < required[nextSide]) {
        const opposite = oppositeSide[nextSide];
        if (room[opposite] >= required[opposite]) {
          nextSide = opposite;
        } else if (nextSide === "top" || nextSide === "bottom") {
          nextSide = room.top >= room.bottom ? "top" : "bottom";
        } else {
          nextSide = room.left >= room.right ? "left" : "right";
        }
      }

      let x: number;
      let y: number;
      if (nextSide === "top" || nextSide === "bottom") {
        x = anchorRect.left + anchorRect.width / 2;
        y = nextSide === "top"
          ? anchorRect.top - gap
          : anchorRect.bottom + gap;
      } else {
        x = nextSide === "left"
          ? anchorRect.left - gap
          : anchorRect.right + gap;
        y = anchorRect.top + anchorRect.height / 2;
      }

      if (nextSide === "top" || nextSide === "bottom") {
        x = Math.min(
          Math.max(x, inset + tooltipRect.width / 2),
          viewportWidth - inset - tooltipRect.width / 2,
        );
      } else if (nextSide === "left") {
        x = Math.min(Math.max(x, inset + tooltipRect.width), viewportWidth - inset);
      } else {
        x = Math.min(Math.max(x, inset), viewportWidth - inset - tooltipRect.width);
      }
      y = Math.min(
        Math.max(
          y,
          inset + (nextSide === "top" ? tooltipRect.height : nextSide === "bottom" ? 0 : tooltipRect.height / 2),
        ),
        viewportHeight - inset - (nextSide === "bottom" ? tooltipRect.height : nextSide === "top" ? 0 : tooltipRect.height / 2),
      );
      setSide(nextSide);
      setCoordinates({ x, y });
      setPositioned(true);
    };

    updatePosition();
    const observer = new ResizeObserver(updatePosition);
    observer.observe(anchor);
    observer.observe(tooltip);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, placement, content]);

  const handleFocus = (event: ReactFocusEvent<HTMLSpanElement>) => {
    onFocusCapture?.(event);
    setFocused(true);
    setDismissed(false);
  };

  const handleBlur = (event: ReactFocusEvent<HTMLSpanElement>) => {
    onBlurCapture?.(event);
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    setFocused(false);
    setTouchOpen(false);
    if (!hovered) setDismissed(false);
  };

  const handlePointerEnter = (event: ReactPointerEvent<HTMLSpanElement>) => {
    onPointerEnter?.(event);
    if (event.pointerType === "touch") return;
    setHovered(true);
    setDismissed(false);
  };

  const handlePointerLeave = (event: ReactPointerEvent<HTMLSpanElement>) => {
    onPointerLeave?.(event);
    if (event.pointerType === "touch") return;
    setHovered(false);
    if (!focused) setDismissed(false);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLSpanElement>) => {
    onPointerDownCapture?.(event);
    if (event.pointerType !== "touch") return;
    setDismissed(open);
    setTouchOpen(!open);
  };

  const trigger = cloneElement(
    children as ReactElement<{ "aria-describedby"?: string }>,
    { "aria-describedby": describedBy },
  );

  return (
    <span
      {...spanProps}
      className={[styles.anchor, className].filter(Boolean).join(" ")}
      onBlurCapture={handleBlur}
      onFocusCapture={handleFocus}
      onPointerDownCapture={handlePointerDown}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      ref={setAnchor}
      style={style as CSSProperties | undefined}
    >
      {trigger}
      <div
        aria-hidden={!open}
        className={styles.tooltip}
        data-open={open ? "true" : "false"}
        data-positioned={positioned ? "true" : "false"}
        data-side={side}
        hidden={!open}
        id={id}
        ref={tooltipRef}
        role="tooltip"
        style={{ left: coordinates.x, top: coordinates.y }}
      >
        {content}
      </div>
    </span>
  );
});

Tooltip.displayName = "Tooltip";
