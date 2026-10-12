import {
  forwardRef,
  useId,
  type AnchorHTMLAttributes,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./Footer.module.css";

export type FooterVariant = "plain" | "surface" | "accent";
export type FooterSize = "sm" | "md" | "lg";
export type FooterHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type FooterLink = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "children" | "href" | "style"
> & {
  id: string;
  label: ReactNode;
  href: string;
};

export type FooterLinkGroup = {
  id: string;
  title: ReactNode;
  links: readonly FooterLink[];
};

export type FooterProps = Omit<
  ComponentPropsWithRef<"footer">,
  "children" | "style"
> & {
  brand?: ReactNode;
  description?: ReactNode;
  logoHref?: string;
  logoLabel?: string;
  linkGroups?: readonly FooterLinkGroup[];
  socialLinks?: readonly FooterLink[];
  copyright?: ReactNode;
  legalLinks?: readonly FooterLink[];
  bottomContent?: ReactNode;
  children?: ReactNode;
  navigationLabel?: string;
  socialNavigationLabel?: string;
  legalNavigationLabel?: string;
  headingLevel?: FooterHeadingLevel;
  variant?: FooterVariant;
  size?: FooterSize;
  style?: DesignSystemStyle;
};

function FooterLinks({
  links,
  label,
  className,
}: {
  links: readonly FooterLink[];
  label: string;
  className: string;
}) {
  if (links.length === 0) return null;

  return (
    <nav aria-label={label} className={className}>
      <ul className={styles.linkList}>
        {links.map(({ id, label: linkLabel, href, ...anchorProps }) => (
          <li key={id}>
            <a {...anchorProps} href={href}>
              {linkLabel}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export const Footer = forwardRef<HTMLElement, FooterProps>(function Footer(
  {
    brand,
    description,
    logoHref,
    logoLabel = "Home",
    linkGroups = [],
    socialLinks = [],
    copyright,
    legalLinks = [],
    bottomContent,
    children,
    navigationLabel = "Footer navigation",
    socialNavigationLabel = "Social links",
    legalNavigationLabel = "Legal links",
    headingLevel = 3,
    variant = "plain",
    size = "md",
    className,
    style,
    ...footerProps
  },
  ref,
) {
  const generatedId = useId();
  const Heading = `h${headingLevel}` as
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6";
  const brandContent = brand == null
    ? null
    : logoHref
      ? (
        <a aria-label={logoLabel} className={styles.brandLink} href={logoHref}>
          {brand}
        </a>
      )
      : <div className={styles.brandLink}>{brand}</div>;

  return (
    <footer
      {...footerProps}
      ref={ref}
      className={[styles.footer, className].filter(Boolean).join(" ")}
      data-variant={variant}
      data-size={size}
      style={style as CSSProperties | undefined}
    >
      <div className={styles.content}>
        {(brandContent != null || description != null) && (
          <div className={styles.brand}>
            {brandContent}
            {description != null && <div className={styles.description}>{description}</div>}
          </div>
        )}

        {linkGroups.length > 0 && (
          <nav aria-label={navigationLabel} className={styles.groups}>
            {linkGroups.map((group, index) => {
              const headingId = `${generatedId}-group-${index}`;
              return (
                <div aria-labelledby={headingId} className={styles.group} key={group.id} role="group">
                  <Heading className={styles.groupTitle} id={headingId}>
                    {group.title}
                  </Heading>
                  <ul className={styles.linkList}>
                    {group.links.map(({ id, label, href, ...anchorProps }) => (
                      <li key={id}>
                        <a {...anchorProps} href={href}>{label}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </nav>
        )}

        {socialLinks.length > 0 && (
          <FooterLinks
            className={styles.social}
            label={socialNavigationLabel}
            links={socialLinks}
          />
        )}

        {children != null && <div className={styles.customContent}>{children}</div>}
      </div>

      {(copyright != null || legalLinks.length > 0 || bottomContent != null) && (
        <div className={styles.bottom}>
          {copyright != null && <div className={styles.copyright}>{copyright}</div>}
          {bottomContent != null && <div className={styles.bottomContent}>{bottomContent}</div>}
          <FooterLinks
            className={styles.legal}
            label={legalNavigationLabel}
            links={legalLinks}
          />
        </div>
      )}
    </footer>
  );
});

Footer.displayName = "Footer";
