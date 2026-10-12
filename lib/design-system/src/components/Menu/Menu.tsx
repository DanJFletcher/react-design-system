import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { Button, type ButtonShape, type ButtonSize, type ButtonVariant } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./Menu.module.css";

export type MenuPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end";
export type MenuSelectEvent = ReactMouseEvent<HTMLAnchorElement | HTMLButtonElement>;

export type MenuLinkProps = Omit<
  ComponentPropsWithoutRef<"a">,
  "children" | "id" | "href" | "role" | "tabIndex" | "aria-disabled" | "onClick" | "className"
> & {
  className?: string;
};

export type MenuActionItem = {
  type: "item";
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  href?: string;
  linkProps?: MenuLinkProps;
  onSelect?: (event: MenuSelectEvent) => void;
};

export type MenuSubmenuItem = {
  type: "submenu";
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  items: readonly MenuEntry[];
};

export type MenuDividerItem = {
  type: "divider";
  id: string;
};

export type MenuEntry = MenuActionItem | MenuSubmenuItem | MenuDividerItem;

export type MenuProps = Omit<
  ComponentPropsWithRef<"div">,
  "children" | "style"
> & {
  triggerLabel: string;
  items: readonly MenuEntry[];
  trigger?: ReactNode;
  triggerIcon?: ReactNode;
  triggerAriaLabel?: string;
  triggerVariant?: ButtonVariant;
  triggerShape?: ButtonShape;
  size?: ButtonSize;
  placement?: MenuPlacement;
  menuLabel?: string;
  emptyMessage?: string;
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnSelect?: boolean;
  menuClassName?: string;
  itemClassName?: string;
  triggerClassName?: string;
  style?: DesignSystemStyle;
};

export const Menu = forwardRef<HTMLDivElement, MenuProps>(function Menu(
  {
    triggerLabel,
    items,
    trigger,
    triggerIcon = <Icon name="chevron-down" />,
    triggerAriaLabel,
    triggerVariant = "secondary",
    triggerShape,
    size = "md",
    placement = "bottom-start",
    menuLabel = "Actions",
    emptyMessage = "No items",
    disabled = false,
    open,
    defaultOpen = false,
    onOpenChange,
    closeOnSelect = true,
    menuClassName,
    itemClassName,
    triggerClassName,
    className,
    style,
    ...divProps
  },
  ref,
) {
  const controlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = controlled ? open : internalOpen;
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const updateOpen = useCallback((nextOpen: boolean) => {
    if (nextOpen === isOpen) return;
    if (!controlled) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }, [controlled, isOpen, onOpenChange]);

  useEffect(() => {
    if (disabled && isOpen) updateOpen(false);
  }, [disabled, isOpen, updateOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && !rootRef.current?.contains(target)) {
        updateOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [isOpen, updateOpen]);

  const closeFromEscape = () => {
    updateOpen(false);
    triggerRef.current?.focus();
  };

  const handleSelect = (event: MenuSelectEvent, item: MenuActionItem) => {
    item.onSelect?.(event);
    if (closeOnSelect && !event.defaultPrevented) {
      updateOpen(false);
      if (!item.href) triggerRef.current?.focus();
    }
  };

  return (
    <div
      {...divProps}
      ref={(element) => {
        rootRef.current = element;
        if (typeof ref === "function") ref(element);
        else if (ref) ref.current = element;
      }}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-placement={placement}
      data-size={size}
      style={style as CSSProperties | undefined}
    >
      <Button
        ref={triggerRef}
        className={[styles.trigger, triggerClassName].filter(Boolean).join(" ")}
        variant={triggerVariant}
        size={size}
        shape={triggerShape}
        disabled={disabled}
        icon={triggerIcon}
        iconPosition="right"
        aria-label={triggerAriaLabel ?? (trigger == null ? undefined : triggerLabel)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => updateOpen(!isOpen)}
      >
        {trigger ?? triggerLabel}
      </Button>

      {isOpen && (
        <MenuList
          id={menuId}
          items={items}
          label={menuLabel}
          size={size}
          level={0}
          emptyMessage={emptyMessage}
          menuClassName={menuClassName}
          itemClassName={itemClassName}
          focusFirstOnMount
          onDismiss={closeFromEscape}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
});

Menu.displayName = "Menu";

type MenuListProps = {
  id: string;
  items: readonly MenuEntry[];
  label: string;
  size: ButtonSize;
  level: number;
  emptyMessage: string;
  menuClassName?: string;
  itemClassName?: string;
  focusFirstOnMount?: boolean;
  onDismiss: () => void;
  onBack?: () => void;
  onSelect: (event: MenuSelectEvent, item: MenuActionItem) => void;
};

function MenuList({
  id,
  items,
  label,
  size,
  level,
  emptyMessage,
  menuClassName,
  itemClassName,
  focusFirstOnMount = false,
  onDismiss,
  onBack,
  onSelect,
}: MenuListProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const typeaheadRef = useRef("");
  const typeaheadTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null);

  useEffect(() => {
    if (focusFirstOnMount) getEnabledMenuItems(listRef.current)[0]?.focus();
  }, [focusFirstOnMount]);

  useEffect(() => () => {
    if (typeaheadTimer.current) clearTimeout(typeaheadTimer.current);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
    const currentMenu = event.target instanceof Element
      ? event.target.closest('[role="menu"]')
      : null;
    if (currentMenu !== event.currentTarget) return;

    if (event.key === "Escape") {
      event.preventDefault();
      if (level > 0) onBack?.();
      else onDismiss();
      return;
    }

    if (event.key === "Tab") {
      onDismiss();
      return;
    }

    if (event.key === "ArrowLeft" && level > 0) {
      event.preventDefault();
      onBack?.();
      return;
    }

    const enabledItems = getEnabledMenuItems(event.currentTarget);
    if (!enabledItems.length) return;

    const currentIndex = enabledItems.indexOf(document.activeElement as HTMLElement);
    if (
      event.key.length === 1 &&
      /\p{L}|\p{N}/u.test(event.key) &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey
    ) {
      event.preventDefault();
      typeaheadRef.current += event.key.toLocaleLowerCase();
      if (typeaheadTimer.current) clearTimeout(typeaheadTimer.current);
      typeaheadTimer.current = setTimeout(() => {
        typeaheadRef.current = "";
      }, 600);

      const searchOrder = [
        ...enabledItems.slice(currentIndex + 1),
        ...enabledItems.slice(0, currentIndex + 1),
      ];
      const match = searchOrder.find((item) =>
        (item.getAttribute("aria-label") ?? item.textContent ?? "")
          .trim()
          .toLocaleLowerCase()
          .startsWith(typeaheadRef.current),
      );
      match?.focus();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      enabledItems[(currentIndex + 1) % enabledItems.length]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      enabledItems[(currentIndex - 1 + enabledItems.length) % enabledItems.length]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      enabledItems[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      enabledItems.at(-1)?.focus();
    }
  };

  const handleItemFocus = (focusedId?: string) => {
    setOpenSubmenuId((currentId) => currentId && currentId !== focusedId ? null : currentId);
  };

  const toggleSubmenu = (id: string) => {
    setOpenSubmenuId((currentId) => currentId === id ? null : id);
  };

  const listClassName = [
    styles.menu,
    level === 0 ? styles.panel : styles.submenu,
    menuClassName,
  ].filter(Boolean).join(" ");

  return (
    <ul
      ref={listRef}
      id={id}
      className={listClassName}
      role="menu"
      aria-label={label}
      aria-orientation="vertical"
      data-size={size}
      onKeyDown={handleKeyDown}
    >
      {items.length === 0 ? (
        <li role="none">
          <span className={[styles.emptyItem, styles.menuItem].join(" ")} role="menuitem" aria-disabled="true">
            {emptyMessage}
          </span>
        </li>
      ) : items.map((item) => {
        if (item.type === "divider") {
          return <li key={item.id} className={styles.divider} role="separator" aria-orientation="horizontal" />;
        }

        if (item.type === "submenu") {
          return (
            <SubmenuEntry
              key={item.id}
              item={item}
              open={openSubmenuId === item.id}
              size={size}
              level={level}
              emptyMessage={emptyMessage}
              menuClassName={menuClassName}
              itemClassName={itemClassName}
              onFocus={() => handleItemFocus(item.id)}
              onToggle={() => toggleSubmenu(item.id)}
              onBack={() => {
                setOpenSubmenuId(null);
              }}
              onDismiss={onDismiss}
              onSelect={onSelect}
            />
          );
        }

        const onClick = (event: MenuSelectEvent) => onSelect(event, item);
        const itemClasses = [styles.menuItem, itemClassName, item.linkProps?.className]
          .filter(Boolean)
          .join(" ");

        return (
          <li key={item.id} role="none">
            {item.href != null && !item.disabled ? (
              <a
                {...item.linkProps}
                href={item.href}
                className={itemClasses}
                role="menuitem"
                tabIndex={-1}
                onFocus={() => handleItemFocus()}
                onMouseEnter={() => handleItemFocus()}
                onClick={onClick}
              >
                <ItemContent label={item.label} icon={item.icon} />
              </a>
            ) : (
              <button
                type="button"
                className={itemClasses}
                role="menuitem"
                tabIndex={-1}
                disabled={item.disabled}
                onFocus={() => handleItemFocus()}
                onMouseEnter={() => handleItemFocus()}
                onClick={onClick}
              >
                <ItemContent label={item.label} icon={item.icon} />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

type SubmenuEntryProps = {
  item: MenuSubmenuItem;
  open: boolean;
  size: ButtonSize;
  level: number;
  emptyMessage: string;
  menuClassName?: string;
  itemClassName?: string;
  onFocus: () => void;
  onToggle: () => void;
  onBack: () => void;
  onDismiss: () => void;
  onSelect: (event: MenuSelectEvent, item: MenuActionItem) => void;
};

function SubmenuEntry({
  item,
  open,
  size,
  level,
  emptyMessage,
  menuClassName,
  itemClassName,
  onFocus,
  onToggle,
  onBack,
  onDismiss,
  onSelect,
}: SubmenuEntryProps) {
  const submenuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <li className={styles.submenuItem} role="none">
      <button
        ref={triggerRef}
        type="button"
        className={[styles.menuItem, styles.submenuTrigger, itemClassName].filter(Boolean).join(" ")}
        role="menuitem"
        tabIndex={-1}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={submenuId}
        disabled={item.disabled}
        onFocus={onFocus}
        onMouseEnter={onFocus}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" && !item.disabled) {
            event.preventDefault();
            if (!open) onToggle();
          }
        }}
        onClick={onToggle}
      >
        <ItemContent label={item.label} icon={item.icon} />
        <Icon className={styles.submenuChevron} name="chevron-right" size="sm" />
      </button>
      {open && (
        <MenuList
          id={submenuId}
          items={item.items}
          label={item.label}
          size={size}
          level={level + 1}
          emptyMessage={emptyMessage}
          menuClassName={menuClassName}
          itemClassName={itemClassName}
          focusFirstOnMount
          onDismiss={onDismiss}
          onBack={() => {
            onBack();
            triggerRef.current?.focus();
          }}
          onSelect={onSelect}
        />
      )}
    </li>
  );
}

function ItemContent({ label, icon }: { label: string; icon?: ReactNode }) {
  return (
    <>
      {icon != null && <span className={styles.itemIcon} aria-hidden="true">{icon}</span>}
      <span className={styles.itemLabel}>{label}</span>
    </>
  );
}

function getEnabledMenuItems(menu: HTMLUListElement | null): HTMLElement[] {
  if (!menu) return [];
  return Array.from(menu.querySelectorAll<HTMLElement>(":scope > li > [role='menuitem']"))
    .filter((item) => !item.hasAttribute("disabled") && item.getAttribute("aria-disabled") !== "true");
}
