import {
  forwardRef,
  useEffect,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import {
  ContactSection,
  type BusinessHour,
  type BusinessHoursException,
  type ContactAddress,
  type ContactMethod,
  type ContactSectionHeadingLevel,
  type ContactSectionVariant,
} from "../ContactSection/ContactSection";
import {
  formatBusinessDate,
  getBusinessDateKey,
  getLocationHoursStatus,
  validateBusinessHoursExceptions,
} from "./locationHoursStatus";
import styles from "./LocationHours.module.css";

export type LocationHoursLayout = "split" | "stacked";
export type LocationHoursMapPosition = "start" | "end";
export type LocationHoursOpenStatusOptions = {
  /** IANA timezone for the business location, such as "America/Toronto". */
  timeZone: string;
  /** Locale used to format times and relative days. Defaults to the browser locale. */
  locale?: string;
};

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type LocationHoursPhone = {
  value: string;
  href: string;
  label?: string;
};

export type LocationHoursProps = Omit<
  ComponentPropsWithRef<"div">,
  "style"
> & {
  heading: string;
  address: ContactAddress;
  hours: readonly BusinessHour[];
  description?: ReactNode;
  phone?: LocationHoursPhone;
  map?: ReactNode;
  /** IANA timezone used for special-hours dates; openStatus.timeZone takes precedence. */
  timeZone?: string;
  openStatus?: LocationHoursOpenStatusOptions;
  specialHours?: readonly BusinessHoursException[];
  mapLabel?: string;
  addressHeading?: string;
  contactHeading?: string;
  hoursHeading?: string;
  headingLevel?: ContactSectionHeadingLevel;
  layout?: LocationHoursLayout;
  mapPosition?: LocationHoursMapPosition;
  variant?: ContactSectionVariant;
  style?: DesignSystemStyle;
};

export const LocationHours = forwardRef<HTMLDivElement, LocationHoursProps>(
  function LocationHours(
    {
      heading,
      address,
      hours,
      description,
      phone,
      map,
      timeZone,
      openStatus,
      specialHours = [],
      mapLabel = "Map showing the location",
      addressHeading = "Visit us",
      contactHeading = "Contact",
      hoursHeading = "Business hours",
      headingLevel = 2,
      layout = "split",
      mapPosition = "end",
      variant = "surface",
      className,
      style,
      ...layoutProps
    },
    ref,
  ) {
    const [currentTime, setCurrentTime] = useState(() => new Date());
    const hasTimeSensitiveHours = openStatus != null || specialHours.length > 0;

    useEffect(() => {
      if (!hasTimeSensitiveHours) return;
      const intervalId = globalThis.setInterval(() => setCurrentTime(new Date()), 60_000);
      return () => globalThis.clearInterval(intervalId);
    }, [hasTimeSensitiveHours]);

    const businessTimeZone = openStatus?.timeZone
      ?? timeZone
      ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
    const specialHoursByDate = validateBusinessHoursExceptions(specialHours);
    const today = specialHours.length > 0
      ? getBusinessDateKey(currentTime, businessTimeZone)
      : "";
    const upcomingSpecialHours = [...specialHoursByDate.values()]
      .filter((exception) => exception.date >= today)
      .sort((left, right) => left.date.localeCompare(right.date));
    const status = openStatus
      ? getLocationHoursStatus(hours, openStatus, currentTime, specialHours)
      : null;
    const SpecialHoursHeading =
      `h${Math.min(headingLevel + 2, 6)}` as HeadingTag;
    const specialHoursContent = upcomingSpecialHours.length > 0 && (
      <div className={styles.specialHours}>
        <SpecialHoursHeading className={styles.specialHoursHeading}>
          Special hours
        </SpecialHoursHeading>
        <dl className={styles.specialHoursList}>
          {upcomingSpecialHours.map((exception) => (
            <div className={styles.specialHoursRow} key={exception.id}>
              <dt className={styles.specialHoursTerm}>
                {exception.label && (
                  <span className={styles.specialHoursLabel}>{exception.label}</span>
                )}
                <time dateTime={exception.date}>
                  {formatBusinessDate(exception.date, openStatus?.locale)}
                </time>
              </dt>
              <dd className={styles.specialHoursDefinition}>{exception.hours}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
    const contactMethods: readonly ContactMethod[] = phone
      ? [{
          id: "phone",
          label: phone.label ?? "Phone",
          value: phone.value,
          href: phone.href,
        }]
      : [];
    const hasMap = map != null && typeof map !== "boolean";

    return (
      <div
        {...layoutProps}
        ref={ref}
        className={[styles.locationHours, className].filter(Boolean).join(" ")}
        data-ds-location-hours=""
        data-layout={layout}
        data-map-position={mapPosition}
        style={style as CSSProperties | undefined}
      >
        <ContactSection
          className={styles.details}
          address={address}
          addressHeading={addressHeading}
          contactHeading={contactHeading}
          contactMethods={contactMethods}
          description={description}
          heading={heading}
          headingLevel={headingLevel}
          hours={hours}
          hoursHeading={hoursHeading}
          hoursSupplement={specialHoursContent}
          hoursStatus={status && (
            <span
              aria-live="polite"
              className={styles.hoursStatus}
              data-state={status.state}
              role="status"
            >
              {status.message}
            </span>
          )}
          variant={variant}
        />
        {hasMap && (
          <aside
            aria-label={mapLabel}
            className={styles.map}
            data-variant="surface"
          >
            {map}
          </aside>
        )}
      </div>
    );
  },
);

LocationHours.displayName = "LocationHours";
