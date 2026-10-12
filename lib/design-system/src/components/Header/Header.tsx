import {
  forwardRef,
  useId,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
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
};

export type HeaderProps = Omit<
  ComponentPropsWithRef<"header">,
  "children" | "style"
> & {
  logo?: ReactNode;
  logoHref?: string;
  logoLabel?: string;
  navItems?: readonly HeaderNavItem[];
  cta?: ReactNode;
  navigationLabel?: string;
  size?: HeaderSize;
  sticky?: boolean;
  borderBottom?: boolean;
  style?: DesignSystemStyle;
};

export const Header = forwardRef<HTMLElement, HeaderProps>(function Header(
  {
    logo,
    logoHref = "/",
    logoLabel = "Home",
    navItems = [],
    cta,
    navigationLabel = "Primary navigation",
    size = "md",
    sticky = false,
    borderBottom = true,
    className,
    style,
    onKeyDown,
    ...headerProps
  },
  ref,
) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigationId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const hasNavigation = navItems.length > 0;
  const headerClassName = [
    styles.header,
    sticky && styles.sticky,
    borderBottom && styles.borderBottom,
    className,
  ].filter(Boolean).join(" ");

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event);
    if (!event.defaultPrevented && event.key === "Escape" && menuOpen) {
      setMenuOpen(false);
      if (menuButtonRef.current?.getClientRects().length) {
        menuButtonRef.current.focus();
      }
    }
  };

  return (
    <header
      {...headerProps}
      ref={ref}
      className={headerClassName}
      data-size={size}
      onKeyDown={handleKeyDown}
      style={style as CSSProperties | undefined}
    >
      <div
        className={styles.inner}
        data-has-navigation={hasNavigation ? "true" : "false"}
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

        {hasNavigation && (
          <Button
            ref={menuButtonRef}
            className={styles.menuToggle}
            variant="ghost"
            size="sm"
            shape="rounded"
            icon={<Icon name={menuOpen ? "close" : "menu"} />}
            iconOnly
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls={navigationId}
            onClick={() => setMenuOpen((open) => !open)}
          />
        )}

        {hasNavigation && (
          <nav id={navigationId} className={styles.navigation} aria-label={navigationLabel}>
            <ul className={styles.navList}>
              {navItems.map(({ label, href, current = false, className: linkClassName, onClick, ...linkProps }, index) => (
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
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {cta != null && <div className={styles.ctaSlot}>{cta}</div>}
      </div>
    </header>
  );
});

Header.displayName = "Header";
