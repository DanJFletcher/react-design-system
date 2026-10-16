import {
  forwardRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./BottomMenu.module.css";

export type BottomMenuSize = "sm" | "md" | "lg";
export type BottomMenuAlignment = "start" | "center" | "end";
export type BottomMenuPresentation = "full-width" | "floating";
export type BottomMenuSelectEvent = MouseEvent<HTMLAnchorElement | HTMLButtonElement>;

type BottomMenuItemBase = {
  /** Stable identifier used for selection state. */
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
  className?: string;
  onSelect?: (event: BottomMenuSelectEvent) => void;
};

export type BottomMenuLinkItem = BottomMenuItemBase & {
  href: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  target?: string;
  rel?: string;
};

export type BottomMenuActionItem = BottomMenuItemBase & {
  href?: never;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

export type BottomMenuItem = BottomMenuLinkItem | BottomMenuActionItem;

function isLinkItem(item: BottomMenuItem): item is BottomMenuLinkItem {
  return typeof (item as BottomMenuLinkItem).href === "string";
}

export type BottomMenuProps = Omit<
  ComponentPropsWithRef<"nav">,
  "children" | "style"
> & {
  items: readonly BottomMenuItem[];
  activeId?: string;
  defaultActiveId?: string;
  onActiveChange?: (id: string, item: BottomMenuItem) => void;
  navigationLabel?: string;
  size?: BottomMenuSize;
  presentation?: BottomMenuPresentation;
  alignment?: BottomMenuAlignment;
  iconOnly?: boolean;
  action?: ReactNode;
  border?: boolean;
  style?: DesignSystemStyle;
};

export const BottomMenu = forwardRef<HTMLElement, BottomMenuProps>(
  function BottomMenu(
    {
      items,
      activeId,
      defaultActiveId,
      onActiveChange,
      navigationLabel = "Bottom navigation",
      size = "md",
      presentation = "full-width",
      alignment = "center",
      iconOnly = false,
      action,
      border = true,
      className,
      style,
      ...navProps
    },
    ref,
  ) {
    const [uncontrolledActiveId, setUncontrolledActiveId] = useState(defaultActiveId);
    const selectedId = activeId !== undefined ? activeId : uncontrolledActiveId;

    const handleSelect = (event: BottomMenuSelectEvent, item: BottomMenuItem) => {
      item.onClick?.(event as never);
      item.onSelect?.(event);
      if (!event.defaultPrevented) {
        if (activeId === undefined) setUncontrolledActiveId(item.id);
        onActiveChange?.(item.id, item);
      }
    };

    return (
      <nav
        {...navProps}
        ref={ref}
        aria-label={navigationLabel}
        className={[styles.bottomMenu, className].filter(Boolean).join(" ")}
        data-ds-layout-component="bottom-menu"
        data-size={size}
        data-presentation={presentation}
        data-alignment={alignment}
        data-icon-only={iconOnly ? "true" : "false"}
        data-border={border ? "true" : "false"}
        style={style as CSSProperties | undefined}
      >
        <div className={styles.inner}>
          <ul className={styles.list}>
            {items.map((item) => {
              const isActive = selectedId === item.id;
              const itemClassName = [
                styles.item,
                item.className,
                isActive && styles.active,
                item.disabled && styles.disabled,
              ].filter(Boolean).join(" ");
              const content = (
                <>
                  {item.icon != null && (
                    <span className={styles.icon} aria-hidden="true">{item.icon}</span>
                  )}
                  <span className={iconOnly ? styles.visuallyHidden : styles.label}>
                    {item.label}
                  </span>
                  {item.badge != null && (
                    <span className={styles.badge}>
                      {item.badge}
                    </span>
                  )}
                </>
              );

              return (
                <li className={styles.listItem} key={item.id}>
                  {isLinkItem(item) ? (
                    <a
                      aria-current={isActive && !item.disabled ? "page" : undefined}
                      aria-disabled={item.disabled || undefined}
                      className={itemClassName}
                      data-testid={`bottom-menu-item-${item.id}`}
                      href={item.disabled ? undefined : item.href}
                      rel={item.rel}
                      target={item.target}
                      tabIndex={item.disabled ? -1 : undefined}
                      onClick={(event) => {
                        if (item.disabled) {
                          event.preventDefault();
                          return;
                        }
                        item.onClick?.(event);
                        item.onSelect?.(event);
                        if (!event.defaultPrevented) {
                          if (activeId === undefined) setUncontrolledActiveId(item.id);
                          onActiveChange?.(item.id, item);
                        }
                      }}
                    >
                      {content}
                    </a>
                  ) : (
                    <button
                      aria-pressed={isActive}
                      className={itemClassName}
                      data-testid={`bottom-menu-item-${item.id}`}
                      disabled={item.disabled}
                      type="button"
                      onClick={(event) => handleSelect(event, item)}
                    >
                      {content}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          {action != null && <div className={styles.action}>{action}</div>}
        </div>
      </nav>
    );
  },
);

BottomMenu.displayName = "BottomMenu";
