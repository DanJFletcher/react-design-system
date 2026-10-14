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
  type ContactAddress,
  type ContactMethod,
  type ContactSectionHeadingLevel,
  type ContactSectionVariant,
} from "../ContactSection/ContactSection";
import { getLocationHoursStatus } from "./locationHoursStatus";
import styles from "./LocationHours.module.css";

export type LocationHoursLayout = "split" | "stacked";
export type LocationHoursMapPosition = "start" | "end";
export type LocationHoursOpenStatusOptions = {
  /** IANA timezone for the business location, such as "America/Toronto". */
  timeZone: string;
  /** Locale used to format times and relative days. Defaults to the browser locale. */
  locale?: string;
};

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
  openStatus?: LocationHoursOpenStatusOptions;
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
      openStatus,
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
    const isOpenStatusEnabled = openStatus != null;

    useEffect(() => {
      if (!isOpenStatusEnabled) return;
      const intervalId = globalThis.setInterval(() => setCurrentTime(new Date()), 60_000);
      return () => globalThis.clearInterval(intervalId);
    }, [isOpenStatusEnabled]);

    const status = openStatus
      ? getLocationHoursStatus(hours, openStatus, currentTime)
      : null;
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
