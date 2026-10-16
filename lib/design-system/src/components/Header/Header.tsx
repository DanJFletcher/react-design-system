import {
  forwardRef,
  useId,
  useState,
  type ComponentPropsWithRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { Icon } from "../Icon/Icon";
import { Menu, type MenuNavigationEntry, type MenuSelectEvent } from "../Menu/Menu";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./Header.module.css";

export type HeaderSize = "sm" | "md" | "lg";

export type HeaderNavItem = Omit<
  ComponentPropsWithoutRef<"a">,
  "children" | "href" | "aria-current"
> & {
  label: string;
  href: string;
  current?: boolean;
  icon?: ReactNode;
};

export type HeaderMobileNavigationRenderProps = {
  id: string;
  navItems: readonly HeaderNavItem[];
  navigationLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export type HeaderProps = Omit<
  ComponentPropsWithRef<"header">,
  "children" | "style"
> & {
  logo?: ReactNode;
  logoHref?: string;
  logoLabel?: string;
  navItems?: readonly HeaderNavItem[];
  renderMobileNavigation?: (props: HeaderMobileNavigationRenderProps) => ReactNode;
  cta?: ReactNode;
  navigationLabel?: string;
  size?: HeaderSize;
  sticky?: boolean;
  borderBottom?: boolean;
  style?: DesignSystemStyle;
};

export const Header = forwardRef<HTMLElement, HeaderProps>(function Header(props, ref) {
  const {
    logo,
    logoHref = "/",
    logoLabel = "Home",
    navItems = [],
    renderMobileNavigation,
    cta,
    navigationLabel = "Primary navigation",
    size = "md",
    sticky = false,
    borderBottom = true,
    className,
    style,
    ...headerProps
  } = props;
  const [menuOpen, setMenuOpen] = useState(false);
  const desktopNavigationId = useId();
  const mobileNavigationId = useId();
  const hasNavigation = navItems.length > 0 || renderMobileNavigation != null;
  const headerClassName = [
    styles.header,
    sticky && styles.sticky,
    borderBottom && styles.borderBottom,
    className,
  ].filter(Boolean).join(" ");

  const mobileNavItems = navItems.map((item) => ({
    ...item,
    onClick: (event: ReactMouseEvent<HTMLAnchorElement>) => {
      item.onClick?.(event);
      if (!event.defaultPrevented) setMenuOpen(false);
    },
  }));

  const menuItems: MenuNavigationEntry[] = navItems.map((item, index) => {
    const {
      label,
      href,
      current,
      icon,
      className: linkClassName,
      onClick,
      ...linkProps
    } = item;

    return {
      type: "item",
      id: `header-navigation-${index}`,
      label,
      href,
      icon,
      linkProps: {
        ...linkProps,
        className: linkClassName,
        "aria-current": current ? "page" : undefined,
      },
      onSelect: (event: MenuSelectEvent) => {
        onClick?.(event as ReactMouseEvent<HTMLAnchorElement>);
        if (!event.defaultPrevented) setMenuOpen(false);
      },
    };
  });

  return (
    <header
      {...headerProps}
      ref={ref}
      className={headerClassName}
      data-ds-layout-component="header"
      data-size={size}
      style={style as CSSProperties | undefined}
    >
      <div
        className={styles.inner}
        data-has-navigation={hasNavigation ? "true" : "false"}
        data-custom-mobile-navigation={renderMobileNavigation ? "true" : "false"}
        data-menu-open={menuOpen ? "true" : "false"}
      >
        {logo != null && (
          <a
            className={styles.logo}
            href={logoHref}
            aria-label={logoLabel}
            onClick={() => setMenuOpen(false)}
          >
            {logo}
          </a>
        )}

        {hasNavigation && renderMobileNavigation && (
          <div className={styles.mobileNavigation} data-header-mobile-navigation>
            {renderMobileNavigation({
              id: mobileNavigationId,
              navItems: mobileNavItems,
              navigationLabel,
              open: menuOpen,
              onOpenChange: setMenuOpen,
            })}
          </div>
        )}

        {navItems.length > 0 && renderMobileNavigation && (
          <nav id={desktopNavigationId} className={styles.navigation} aria-label={navigationLabel}>
            <ul className={styles.navList}>
              {navItems.map(({ label, href, current = false, icon, className: linkClassName, onClick, ...linkProps }, index) => (
                <li key={`${href}-${label}-${index}`}>
                  <a
                    {...linkProps}
                    href={href}
                    className={[styles.navLink, linkClassName].filter(Boolean).join(" ")}
                    aria-current={current ? "page" : undefined}
                    onClick={(event) => {
                      onClick?.(event);
                      setMenuOpen(false);
                    }}
                  >
                    {icon != null && <span className={styles.navIcon} aria-hidden="true">{icon}</span>}
                    <span>{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {navItems.length > 0 && !renderMobileNavigation && (
          <Menu
            className={styles.responsiveNavigation}
            triggerLabel={navigationLabel}
            trigger={<Icon name={menuOpen ? "close" : "menu"} />}
            triggerIcon={null}
            triggerAriaLabel={menuOpen ? "Close navigation" : "Open navigation"}
            triggerVariant="ghost"
            triggerShape="rounded"
            size="sm"
            mode="navigation"
            desktopInline
            menuLabel={navigationLabel}
            items={menuItems}
            navigationFooter={cta}
            placement="bottom-end"
            open={menuOpen}
            onOpenChange={setMenuOpen}
          />
        )}

        {cta != null && (renderMobileNavigation || navItems.length === 0) && (
          <div className={styles.ctaSlot}>{cta}</div>
        )}
      </div>
    </header>
  );
});

Header.displayName = "Header";
