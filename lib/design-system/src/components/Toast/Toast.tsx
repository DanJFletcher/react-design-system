import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Icon, type IconName } from "../Icon/Icon";
import type { DesignSystemStyle } from "../../generated/token-types";
import { getStandardMotionDurationMs } from "../../motion/getStandardMotionDurationMs";
import type { MotionEffect } from "../../motion/types";
import { usePrefersReducedMotion } from "../../motion/usePrefersReducedMotion";
import styles from "./Toast.module.css";

export type ToastVariant = "info" | "success" | "warning" | "error";
export type ToastPosition = "top-start" | "top-end" | "bottom-start" | "bottom-end";
type ToastMotionState = "entering" | "open" | "exiting";

/** @internal */
export function clearToastDismissalTimer(timerRef: { current: number | null }) {
  if (timerRef.current === null) return;
  window.clearTimeout(timerRef.current);
  timerRef.current = null;
}

export type ToastAction = {
  label: string;
  onClick: () => void;
};

export type ToastProps = Omit<
  ComponentPropsWithRef<"div">,
  "children" | "role" | "style"
> & {
  title: ReactNode;
  description?: ReactNode;
  variant?: ToastVariant;
  icon?: ReactNode;
  action?: ToastAction;
  duration?: number;
  motion?: MotionEffect;
  closeLabel?: string;
  onDismiss: () => void;
  style?: DesignSystemStyle;
};

export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  {
    title,
    description,
    variant = "info",
    icon,
    action,
    duration = 5000,
    motion = "fade",
    closeLabel = "Dismiss notification",
    onDismiss,
    className,
    style,
    onPointerEnter,
    onPointerLeave,
    onFocusCapture,
    onBlurCapture,
    ...divProps
  },
  ref,
) {
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [motionState, setMotionState] = useState<ToastMotionState>(
    motion === "none" || prefersReducedMotion ? "open" : "entering",
  );
  const dismissalTimerRef = useRef<number | null>(null);
  const entranceFrameRef = useRef<number | null>(null);
  const dismissalStartedRef = useRef(false);

  const requestDismiss = useCallback(() => {
    if (dismissalStartedRef.current) return;
    dismissalStartedRef.current = true;

    if (motion === "none" || prefersReducedMotion) {
      onDismiss();
      return;
    }

    setMotionState("exiting");
    dismissalTimerRef.current = window.setTimeout(() => {
      dismissalTimerRef.current = null;
      onDismiss();
    }, getStandardMotionDurationMs());
  }, [motion, onDismiss, prefersReducedMotion]);

  useEffect(() => {
    if (motionState === "entering") {
      if (motion === "none" || prefersReducedMotion) {
        setMotionState("open");
        return;
      }

      let secondFrame: number | null = null;
      entranceFrameRef.current = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => {
          entranceFrameRef.current = null;
          setMotionState("open");
        });
        entranceFrameRef.current = secondFrame;
      });

      return () => {
        if (entranceFrameRef.current !== null) {
          window.cancelAnimationFrame(entranceFrameRef.current);
          entranceFrameRef.current = null;
        }
      };
    }

    if (motionState === "exiting" && (motion === "none" || prefersReducedMotion)) {
      clearToastDismissalTimer(dismissalTimerRef);
      onDismiss();
    }

    return undefined;
  }, [motion, motionState, onDismiss, prefersReducedMotion]);

  useEffect(() => {
    if (paused || duration <= 0 || motionState === "exiting") return;
    const timeout = window.setTimeout(requestDismiss, duration);
    return () => window.clearTimeout(timeout);
  }, [duration, motionState, paused, requestDismiss]);

  useEffect(
    () => () => {
      if (dismissalTimerRef.current !== null) {
        window.clearTimeout(dismissalTimerRef.current);
      }
    },
    [],
  );

  const handleAction = () => {
    try {
      action?.onClick();
    } finally {
      requestDismiss();
    }
  };

  return (
    <div
      {...divProps}
      aria-atomic="true"
      className={[styles.toast, className].filter(Boolean).join(" ")}
      data-motion={motion}
      data-motion-state={motionState}
      data-variant={variant}
      onBlurCapture={(event) => {
        onBlurCapture?.(event);
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
      onFocusCapture={(event) => {
        onFocusCapture?.(event);
        setPaused(true);
      }}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        setPaused(true);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        setPaused(false);
      }}
      ref={ref}
      role={variant === "error" ? "alert" : "status"}
      style={style as CSSProperties | undefined}
    >
      <span aria-hidden="true" className={styles.icon}>
        {icon ?? <ToastGlyph variant={variant} />}
      </span>
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        {description != null && <div className={styles.description}>{description}</div>}
        {action != null && (
          <button className={styles.action} onClick={handleAction} type="button">
            {action.label}
          </button>
        )}
      </div>
      <button
        aria-label={closeLabel}
        className={styles.closeButton}
        onClick={requestDismiss}
        type="button"
      >
        <Icon name="close" />
      </button>
    </div>
  );
});

Toast.displayName = "Toast";

export type ToastOptions = Pick<
  ToastProps,
  | "action"
  | "className"
  | "closeLabel"
  | "description"
  | "duration"
  | "icon"
  | "motion"
  | "style"
  | "title"
  | "variant"
>;

export type ToastProviderProps = {
  children?: ReactNode;
  position?: ToastPosition;
  label?: string;
  maxVisible?: number;
  defaultDuration?: number;
  defaultMotion?: MotionEffect;
  className?: string;
  style?: DesignSystemStyle;
};

export type ToastContextValue = {
  showToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
  dismissAll: () => void;
};

type ToastRecord = ToastOptions & {
  id: string;
  duration: number;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside a ToastProvider.");
  }
  return context;
}

export function ToastProvider({
  children,
  position = "bottom-end",
  label = "Notifications",
  maxVisible = 5,
  defaultDuration = 5000,
  defaultMotion = "fade",
  className,
  style,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const idPrefix = useId();
  const nextId = useRef(0);
  const visibleLimit = Number.isFinite(maxVisible)
    ? Math.max(1, Math.floor(maxVisible))
    : Number.POSITIVE_INFINITY;

  const showToast = useCallback((options: ToastOptions) => {
    const id = `${idPrefix}-toast-${++nextId.current}`;
    setToasts((current) => [
      ...current,
      {
        ...options,
        id,
        duration: options.duration ?? defaultDuration,
        motion: options.motion ?? defaultMotion,
      },
    ]);
    return id;
  }, [defaultDuration, defaultMotion, idPrefix]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const contextValue = useMemo(
    () => ({ showToast, dismissToast, dismissAll }),
    [dismissAll, dismissToast, showToast],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div
        aria-label={label}
        className={[styles.viewport, className].filter(Boolean).join(" ")}
        data-position={position}
        role="region"
        style={style as CSSProperties | undefined}
      >
        {toasts.slice(0, visibleLimit).map((toast) => (
          <ToastEntry dismissToast={dismissToast} key={toast.id} toast={toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastEntry({
  toast,
  dismissToast,
}: {
  toast: ToastRecord;
  dismissToast: (id: string) => void;
}) {
  const { id, ...toastProps } = toast;
  const onDismiss = useCallback(() => dismissToast(id), [dismissToast, id]);
  return <Toast {...toastProps} onDismiss={onDismiss} />;
}

function ToastGlyph({ variant }: { variant: ToastVariant }) {
  const iconByVariant: Record<ToastVariant, IconName> = {
    info: "circle-info",
    success: "circle-check",
    warning: "triangle-alert",
    error: "circle-close",
  };
  return <Icon name={iconByVariant[variant]} />;
}
