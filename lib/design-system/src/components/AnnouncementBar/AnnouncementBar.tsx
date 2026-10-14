import { forwardRef, useState, type ComponentPropsWithRef, type CSSProperties, type ReactNode } from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import { Icon } from "../Icon/Icon";
import styles from "./AnnouncementBar.module.css";

export type AnnouncementBarTone = "info" | "success" | "warning" | "error" | "neutral";
export type AnnouncementBarSize = "sm" | "md" | "lg";
export type AnnouncementBarAlignment = "start" | "center";

export type AnnouncementBarProps = Omit<ComponentPropsWithRef<"div">, "children" | "style"> & {
  children: ReactNode;
  title?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  tone?: AnnouncementBarTone;
  size?: AnnouncementBarSize;
  alignment?: AnnouncementBarAlignment;
  dismissible?: boolean;
  visible?: boolean;
  defaultVisible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  sticky?: boolean;
  announcementLabel?: string;
  dismissLabel?: string;
  style?: DesignSystemStyle;
};

export const AnnouncementBar = forwardRef<HTMLDivElement, AnnouncementBarProps>(function AnnouncementBar(
  {
    children,
    title,
    icon,
    action,
    tone = "info",
    size = "md",
    alignment = "start",
    dismissible = false,
    visible,
    defaultVisible = true,
    onVisibleChange,
    sticky = false,
    announcementLabel = "Announcement",
    dismissLabel = "Dismiss announcement",
    className,
    style,
    ...divProps
  },
  ref,
) {
  const controlled = visible !== undefined;
  const [internalVisible, setInternalVisible] = useState(defaultVisible);
  const isVisible = controlled ? visible : internalVisible;
  const hasIcon = icon != null && typeof icon !== "boolean";

  const dismiss = () => {
    if (!controlled) setInternalVisible(false);
    onVisibleChange?.(false);
  };

  if (!isVisible) return null;

  return (
    <div
      {...divProps}
      ref={ref}
      aria-label={announcementLabel}
      className={[styles.bar, className].filter(Boolean).join(" ")}
      data-ds-announcement-bar=""
      data-tone={tone}
      data-size={size}
      data-alignment={alignment}
      data-has-icon={hasIcon ? "true" : "false"}
      data-sticky={sticky ? "true" : "false"}
      style={style as CSSProperties | undefined}
      role="region"
    >
      {hasIcon && <span aria-hidden="true" className={styles.icon}>{icon}</span>}
      <div className={styles.message}>
        {title != null && <div className={styles.title}>{title}</div>}
        <div className={styles.body}>{children}</div>
      </div>
      {action != null && <div className={styles.action}>{action}</div>}
      {dismissible && (
        <button
          aria-label={dismissLabel}
          className={styles.dismiss}
          data-testid="button-dismiss-announcement"
          onClick={dismiss}
          type="button"
        >
          <Icon name="close" size="sm" />
        </button>
      )}
    </div>
  );
});

AnnouncementBar.displayName = "AnnouncementBar";
