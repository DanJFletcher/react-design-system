import {
  forwardRef,
  useId,
  type AnchorHTMLAttributes,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./ContactSection.module.css";

export type ContactSectionHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type ContactSectionLayout = "split" | "stacked";
export type ContactSectionVariant = "plain" | "surface" | "accent";

export type ContactAddress = {
  lines: readonly string[];
  directionsHref?: string;
  directionsLabel?: string;
};

export type ContactMethod = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "children" | "href" | "style"
> & {
  id: string;
  label: string;
  value: string;
  href: string;
  icon?: ReactNode;
};

export type BusinessHour = {
  id: string;
  day: string;
  hours: string;
};

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type ContactSectionProps = Omit<
  ComponentPropsWithRef<"section">,
  "children" | "style" | "aria-label" | "aria-labelledby"
> & {
  heading: string;
  description?: ReactNode;
  address?: ContactAddress;
  contactMethods?: readonly ContactMethod[];
  hours?: readonly BusinessHour[];
  action?: ReactNode;
  form?: ReactNode;
  addressHeading?: string;
  contactHeading?: string;
  hoursHeading?: string;
  headingLevel?: ContactSectionHeadingLevel;
  layout?: ContactSectionLayout;
  variant?: ContactSectionVariant;
  style?: DesignSystemStyle;
};

export const ContactSection = forwardRef<HTMLElement, ContactSectionProps>(function ContactSection(
  {
    heading,
    description,
    address,
    contactMethods = [],
    hours = [],
    action,
    form,
    addressHeading = "Visit us",
    contactHeading = "Contact",
    hoursHeading = "Business hours",
    headingLevel = 2,
    layout = "split",
    variant = "plain",
    className,
    style,
    ...sectionProps
  },
  ref,
) {
  const generatedId = useId();
  const Heading = `h${headingLevel}` as HeadingTag;
  const detailLevel = Math.min(headingLevel + 1, 6) as ContactSectionHeadingLevel;
  const DetailHeading = `h${detailLevel}` as HeadingTag;
  const hasAddress = address != null
    && (address.lines.length > 0 || address.directionsHref != null);
  const hasAction = action != null && action !== false;
  const hasForm = form != null && form !== false;
  const hasDetails = hasAddress || contactMethods.length > 0 || hours.length > 0 || hasAction;

  return (
    <section
      {...sectionProps}
      ref={ref}
      aria-labelledby={`${generatedId}-heading`}
      className={[styles.contact, className].filter(Boolean).join(" ")}
      data-variant={variant}
      data-layout={layout}
      data-has-form={hasForm ? "true" : undefined}
      style={style as CSSProperties | undefined}
    >
      <header className={styles.intro}>
        <Heading className={styles.heading} id={`${generatedId}-heading`}>
          {heading}
        </Heading>
        {description != null && <div className={styles.description}>{description}</div>}
      </header>

      <div className={styles.layout}>
        {hasDetails && (
          <div className={styles.details}>
            {hasAddress && address && (
              <div className={styles.group}>
                <DetailHeading className={styles.groupHeading}>{addressHeading}</DetailHeading>
                <address className={styles.address}>
                  <div className={styles.addressLines}>
                    {address.lines.map((line, index) => <span key={`${index}-${line}`}>{line}</span>)}
                  </div>
                  {address.directionsHref && (
                    <a className={styles.link} href={address.directionsHref}>
                      {address.directionsLabel ?? "Get directions"}
                    </a>
                  )}
                </address>
              </div>
            )}

            {contactMethods.length > 0 && (
              <div className={styles.group}>
                <DetailHeading className={styles.groupHeading}>{contactHeading}</DetailHeading>
                <dl className={styles.list}>
                  {contactMethods.map((method) => {
                    const {
                      id,
                      label,
                      value,
                      href,
                      icon,
                      className: linkClassName,
                      ...anchorProps
                    } = method;
                    const iconElement = icon == null || typeof icon === "boolean"
                      ? null
                      : <span aria-hidden="true" className={styles.icon}>{icon}</span>;

                    return (
                      <div className={styles.row} key={id}>
                        <dt className={styles.term}>
                          {iconElement}
                          {label}
                        </dt>
                        <dd className={styles.definition}>
                          <a
                            {...anchorProps}
                            className={[styles.link, linkClassName].filter(Boolean).join(" ")}
                            href={href}
                          >
                            {value}
                          </a>
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            )}

            {hours.length > 0 && (
              <div className={styles.group}>
                <DetailHeading className={styles.groupHeading}>{hoursHeading}</DetailHeading>
                <dl className={styles.list}>
                  {hours.map(({ id, day, hours: dailyHours }) => (
                    <div className={styles.row} key={id}>
                      <dt className={styles.term}>{day}</dt>
                      <dd className={styles.definition}>{dailyHours}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {hasAction && <div className={styles.action}>{action}</div>}
          </div>
        )}

        {hasForm && <div className={styles.form}>{form}</div>}
      </div>
    </section>
  );
});

ContactSection.displayName = "ContactSection";
