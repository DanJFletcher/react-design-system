import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import styles from "./Icon.module.css";

export const iconNames = [
  "arrow-left",
  "arrow-right",
  "book",
  "check",
  "chevron-left",
  "chevron-down",
  "chevron-right",
  "circle-check",
  "circle-close",
  "circle-info",
  "close",
  "folder",
  "grid",
  "heart",
  "list",
  "menu",
  "moon",
  "pause",
  "play",
  "search",
  "settings",
  "sparkle",
  "triangle-alert",
] as const;

export type IconName = (typeof iconNames)[number];
export type IconSize = "xs" | "sm" | "md" | "lg" | "xl";

type IconAccessibilityProps =
  | { decorative?: true; label?: never }
  | { decorative: false; label: string };

export type IconProps = Omit<
  ComponentPropsWithoutRef<"svg">,
  | "aria-hidden"
  | "aria-label"
  | "aria-labelledby"
  | "children"
  | "color"
  | "role"
  | "style"
  | "title"
> & {
  name: IconName;
  size?: IconSize;
  style?: DesignSystemStyle;
} & IconAccessibilityProps;

const paths: Record<IconName, ReactNode> = {
  "arrow-left": <path d="M19 12H5m7 7-7-7 7-7" />,
  "arrow-right": <path d="M5 12h14m-7-7 7 7-7 7" />,
  book: (
    <>
      <path d="M5 4.5h12a2 2 0 0 1 2 2v13H7a2 2 0 0 1-2-2v-13Z" />
      <path d="M5 17.5c0-1.1.9-2 2-2h12M9 8h6" />
    </>
  ),
  check: <path d="m5 12 4.5 4.5L19 7" />,
  "chevron-left": <path d="m15 6-6 6 6 6" />,
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  "chevron-right": <path d="m9 6 6 6-6 6" />,
  "circle-check": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16.5 9" />
    </>
  ),
  "circle-close": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6m0-6-6 6" />
    </>
  ),
  "circle-info": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <circle cx="12" cy="8" r=".65" fill="currentColor" stroke="none" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  folder: (
    <>
      <path d="M3.5 6.5h6l2 2h9v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-11Z" />
      <path d="M3.5 9h17" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </>
  ),
  heart: <path d="M20 8.5c0 5-8 10-8 10s-8-5-8-10A4.5 4.5 0 0 1 12 6.7a4.5 4.5 0 0 1 8 1.8Z" />,
  list: (
    <>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <circle cx="4.5" cy="6" r=".75" fill="currentColor" />
      <circle cx="4.5" cy="12" r=".75" fill="currentColor" />
      <circle cx="4.5" cy="18" r=".75" fill="currentColor" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  moon: <path d="M20.2 15.2A8.6 8.6 0 0 1 8.8 3.8 8.7 8.7 0 1 0 20.2 15.2Z" />,
  pause: (
    <>
      <rect x="7" y="5" width="3.5" height="14" rx=".6" fill="currentColor" stroke="none" />
      <rect x="13.5" y="5" width="3.5" height="14" rx=".6" fill="currentColor" stroke="none" />
    </>
  ),
  play: <path d="m8 5 11 7-11 7V5Z" fill="currentColor" stroke="none" />,
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  settings: (
    <path d="m10.3 3.8.4-1h2.6l.4 1a2 2 0 0 0 2.7 1.1l1-.5 1.8 1.8-.5 1a2 2 0 0 0 1.1 2.7l1 .4v2.6l-1 .4a2 2 0 0 0-1.1 2.7l.5 1-1.8 1.8-1-.5a2 2 0 0 0-2.7 1.1l-.4 1h-2.6l-.4-1a2 2 0 0 0-2.7-1.1l-1 .5-1.8-1.8.5-1a2 2 0 0 0-1.1-2.7l-1-.4v-2.6l1-.4a2 2 0 0 0 1.1-2.7l-.5-1 1.8-1.8 1 .5a2 2 0 0 0 2.7-1.1Z" />
  ),
  sparkle: <path d="m12 3 2.7 6.3L21 12l-6.3 2.7L12 21l-2.7-6.3L3 12l6.3-2.7L12 3Z" />,
  "triangle-alert": (
    <>
      <path d="M12 3.5 21 20H3L12 3.5Z" />
      <path d="M12 9v5m0 2.5v.1" />
    </>
  ),
};

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  {
    name,
    size = "md",
    decorative = true,
    label,
    className,
    style,
    ...svgProps
  },
  ref,
) {
  return (
    <svg
      {...svgProps}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : label}
      className={[styles.icon, className].filter(Boolean).join(" ")}
      data-icon={name}
      data-size={size}
      fill="none"
      focusable="false"
      ref={ref}
      role={decorative ? undefined : "img"}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      style={style as CSSProperties | undefined}
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
});

Icon.displayName = "Icon";
