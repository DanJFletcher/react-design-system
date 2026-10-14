import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Icon } from "../Icon/Icon";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./SideNavigation.module.css";

export type SideNavigationSize = "sm" | "md" | "lg";
export type SideNavigationSide = "left" | "right";
export type SideNavigationPosition = "static" | "sticky" | "fixed";
export type SideNavigationGroupMotion = "none" | "expand";
export type SideNavigationSelectEvent = MouseEvent<HTMLAnchorElement | HTMLButtonElement>;

type EntryBase = {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
};

export type SideNavigationLinkItem = EntryBase & {
  type: "link";
  href: string;
  target?: string;
  rel?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  onSelect?: (event: SideNavigationSelectEvent) => void;
};

export type SideNavigationActionItem = EntryBase & {
  type: "action";
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onSelect?: (event: SideNavigationSelectEvent) => void;
};

export type SideNavigationGroupItem = EntryBase & {
  type: "group";
  items: readonly SideNavigationEntry[];
};

export type SideNavigationDividerItem = {
  type: "divider";
  id: string;
};

export type SideNavigationEntry =
  | SideNavigationLinkItem
  | SideNavigationActionItem
  | SideNavigationGroupItem
  | SideNavigationDividerItem;

export type SideNavigationProps = Omit<
  ComponentPropsWithRef<"nav">,
  "children" | "style"
> & {
  items: readonly SideNavigationEntry[];
  activeId?: string;
  defaultActiveId?: string;
  onActiveChange?: (id: string, item: SideNavigationLinkItem) => void;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  expandedIds?: readonly string[];
  defaultExpandedIds?: readonly string[];
  onExpandedIdsChange?: (expandedIds: readonly string[]) => void;
  groupMotion?: SideNavigationGroupMotion;
  navigationLabel?: string;
  collapseLabel?: string;
  expandLabel?: string;
  mobileToggleLabel?: string;
  size?: SideNavigationSize;
  side?: SideNavigationSide;
  position?: SideNavigationPosition;
  header?: ReactNode;
  footer?: ReactNode;
  action?: ReactNode;
  style?: DesignSystemStyle;
};

function findActiveAncestors(items: readonly SideNavigationEntry[], activeId?: string): string[] {
  if (!activeId) return [];
  for (const item of items) {
    if (item.type !== "group") continue;
    if (item.items.some((entry) => entry.id === activeId)) return [item.id];
    const nested = findActiveAncestors(item.items, activeId);
    if (nested.length) return [item.id, ...nested];
  }
  return [];
}

export const SideNavigation = forwardRef<HTMLElement, SideNavigationProps>(function SideNavigation(
  {
    items,
    activeId,
    defaultActiveId,
    onActiveChange,
    collapsed,
    defaultCollapsed = false,
    onCollapsedChange,
    expandedIds,
    defaultExpandedIds = [],
    onExpandedIdsChange,
    groupMotion = "expand",
    navigationLabel = "Side navigation",
    collapseLabel = "Collapse navigation",
    expandLabel = "Expand navigation",
    mobileToggleLabel = "Toggle navigation",
    size = "md",
    side = "left",
    position = "static",
    header,
    footer,
    action,
    className,
    style,
    ...navProps
  },
  ref,
) {
  const controlledActive = activeId !== undefined;
  const [internalActiveId, setInternalActiveId] = useState(defaultActiveId);
  const selectedId = controlledActive ? activeId : internalActiveId;
  const controlledCollapsed = collapsed !== undefined;
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const isCollapsed = controlledCollapsed ? collapsed : internalCollapsed;
  const controlledExpanded = expandedIds !== undefined;
  const [internalExpanded, setInternalExpanded] = useState<readonly string[]>(defaultExpandedIds);
  const activeAncestors = useMemo(() => findActiveAncestors(items, selectedId), [items, selectedId]);
  const expanded = controlledExpanded ? expandedIds : internalExpanded;
  const [mobileOpen, setMobileOpen] = useState(false);
  const id = useId();

  useEffect(() => {
    if (!controlledExpanded && activeAncestors.length) {
      setInternalExpanded((current) => [...new Set([...current, ...activeAncestors])]);
    }
  }, [activeAncestors, controlledExpanded]);

  const setCollapsed = (next: boolean) => {
    if (!controlledCollapsed) setInternalCollapsed(next);
    onCollapsedChange?.(next);
  };

  const toggleGroup = (groupId: string) => {
    const next = expanded.includes(groupId)
      ? expanded.filter((current) => current !== groupId)
      : [...expanded, groupId];
    if (!controlledExpanded) setInternalExpanded(next);
    onExpandedIdsChange?.(next);
  };

  const selectLink = (event: SideNavigationSelectEvent, item: SideNavigationLinkItem) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    item.onClick?.(event as MouseEvent<HTMLAnchorElement>);
    item.onSelect?.(event);
    if (!controlledActive) setInternalActiveId(item.id);
    onActiveChange?.(item.id, item);
  };

  const selectAction = (event: SideNavigationSelectEvent, item: SideNavigationActionItem) => {
    item.onClick?.(event as MouseEvent<HTMLButtonElement>);
    item.onSelect?.(event);
  };

  const renderItems = (entries: readonly SideNavigationEntry[], depth = 0) => (
    <ul className={depth === 0 ? styles.list : styles.nestedList}>
      {entries.map((item) => {
        if (item.type === "divider") {
          return <li key={item.id} className={styles.divider} aria-hidden="true" />;
        }
        if (item.type === "group") {
          const open = expanded.includes(item.id);
          const groupHasActive = activeAncestors.includes(item.id);
          return (
            <li className={styles.listItem} key={item.id}>
              <button
                aria-expanded={open}
                aria-controls={`${id}-${item.id}`}
                className={[styles.entry, styles.groupTrigger, groupHasActive && styles.ancestor].filter(Boolean).join(" ")}
                data-testid={`side-navigation-group-${item.id}`}
                disabled={item.disabled}
                type="button"
                onClick={() => toggleGroup(item.id)}
              >
                <EntryContent item={item} />
                <Icon className={styles.chevron} name={open ? "chevron-down" : "chevron-right"} size="sm" />
              </button>
              <div
                id={`${id}-${item.id}`}
                aria-hidden={groupMotion === "expand" && !open ? true : undefined}
                className={groupMotion === "expand" ? styles.groupChildrenAnimated : styles.groupChildren}
                data-open={groupMotion === "expand" ? open : undefined}
                hidden={groupMotion === "none" ? !open : undefined}
                inert={groupMotion === "expand" && !open ? true : undefined}
              >
                {groupMotion === "expand" ? (
                  <div className={styles.groupChildrenInner}>
                    {renderItems(item.items, depth + 1)}
                  </div>
                ) : renderItems(item.items, depth + 1)}
              </div>
            </li>
          );
        }
        const active = item.type === "link" && selectedId === item.id;
        const commonClass = [styles.entry, active && styles.active, item.disabled && styles.disabled]
          .filter(Boolean).join(" ");
        return (
          <li className={styles.listItem} key={item.id}>
            {item.type === "link" ? (
              <a
                aria-current={active && !item.disabled ? "page" : undefined}
                aria-disabled={item.disabled || undefined}
                className={commonClass}
                data-testid={`side-navigation-link-${item.id}`}
                href={item.disabled ? undefined : item.href}
                rel={item.rel}
                target={item.target}
                tabIndex={item.disabled ? -1 : undefined}
                onClick={(event) => selectLink(event, item)}
              >
                  <EntryContent item={item} />
              </a>
            ) : (
              <button
                className={commonClass}
                data-testid={`side-navigation-action-${item.id}`}
                disabled={item.disabled}
                type="button"
                onClick={(event) => selectAction(event, item)}
              >
                <EntryContent item={item} />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div
      className={[styles.wrapper, className].filter(Boolean).join(" ")}
      data-side={side}
      data-position={position}
      data-collapsed={isCollapsed ? "true" : "false"}
      data-mobile-open={mobileOpen ? "true" : "false"}
      data-size={size}
      style={style as CSSProperties | undefined}
    >
      <button
        aria-controls={`${id}-navigation`}
        aria-expanded={mobileOpen}
        className={styles.mobileToggle}
        data-testid="side-navigation-mobile-toggle"
        type="button"
        onClick={() => setMobileOpen((open) => !open)}
      >
        <Icon name={mobileOpen ? "close" : "menu"} size="sm" />
        <span>{mobileToggleLabel}</span>
      </button>
      <nav
        {...navProps}
        ref={ref}
        id={`${id}-navigation`}
        aria-label={navigationLabel}
        className={styles.root}
        data-ds-layout-component="side-navigation"
      >
        {header != null && <div className={styles.header}>{header}</div>}
        <div className={styles.utilityRow}>
          {action != null && <div className={styles.actionSlot}>{action}</div>}
          <button
            aria-label={isCollapsed ? expandLabel : collapseLabel}
            aria-expanded={!isCollapsed}
            className={styles.collapseButton}
            data-testid="side-navigation-collapse-toggle"
            type="button"
            onClick={() => setCollapsed(!isCollapsed)}
          >
            <Icon name={isCollapsed ? (side === "left" ? "chevron-right" : "chevron-left") : (side === "left" ? "chevron-left" : "chevron-right")} size="sm" />
            <span className={styles.visuallyHidden}>{isCollapsed ? expandLabel : collapseLabel}</span>
          </button>
        </div>
        {renderItems(items)}
        {footer != null && <div className={styles.footer}>{footer}</div>}
      </nav>
    </div>
  );
});

SideNavigation.displayName = "SideNavigation";

function EntryContent({
  item,
}: {
  item: Exclude<SideNavigationEntry, SideNavigationDividerItem>;
}) {
  return (
    <>
      {item.icon != null && <span className={styles.icon} aria-hidden="true">{item.icon}</span>}
      <span className={styles.label}>{item.label}</span>
      {item.badge != null && <span className={styles.badge}>{item.badge}</span>}
    </>
  );
}
