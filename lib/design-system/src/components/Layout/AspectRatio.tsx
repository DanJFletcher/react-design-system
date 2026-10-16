import {
  forwardRef,
  type ComponentPropsWithRef,
  type CSSProperties,
} from "react";
import styles from "./Layout.module.css";

const aspectRatioFits = ["cover", "contain"] as const;

export type AspectRatioFit = (typeof aspectRatioFits)[number];
export type AspectRatioStyle = Omit<CSSProperties, "aspectRatio">;

export type AspectRatioProps = Omit<
  ComponentPropsWithRef<"div">,
  "style"
> & {
  /** Positive width-to-height ratio. Defaults to 16:9. */
  ratio?: number;
  /** How direct image and video children fill the frame. */
  fit?: AspectRatioFit;
  /** Inline styles excluding aspectRatio, which is controlled by `ratio`. */
  style?: AspectRatioStyle;
};

export const AspectRatio = forwardRef<HTMLDivElement, AspectRatioProps>(
  function AspectRatio(
    {
      ratio = 16 / 9,
      fit = "cover",
      children,
      className,
      style,
      ...divProps
    },
    ref,
  ) {
    if (!Number.isFinite(ratio) || ratio <= 0) {
      throw new RangeError(
        "AspectRatio `ratio` must be a finite number greater than 0.",
      );
    }

    if (!aspectRatioFits.includes(fit)) {
      throw new RangeError(
        'AspectRatio `fit` must be either "cover" or "contain".',
      );
    }

    const classes = [styles.aspectRatio, className].filter(Boolean).join(" ");

    return (
      <div
        {...divProps}
        className={classes}
        data-fit={fit}
        ref={ref}
        style={{ ...style, aspectRatio: ratio }}
      >
        {children}
      </div>
    );
  },
);

AspectRatio.displayName = "AspectRatio";
