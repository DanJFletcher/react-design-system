import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AspectRatio, type AspectRatioFit } from "./AspectRatio";
import styles from "./Layout.module.css";

describe("AspectRatio", () => {
  it("renders a 16:9 cover frame by default and keeps child semantics", () => {
    render(
      <AspectRatio data-testid="default-frame">
        <img src="/landscape.jpg" alt="Mountain landscape" />
      </AspectRatio>,
    );

    const frame = screen.getByTestId("default-frame");

    expect(frame.tagName).toBe("DIV");
    expect(frame).toHaveClass(styles.aspectRatio);
    expect(frame).toHaveAttribute("data-fit", "cover");
    expect(Number.parseFloat(frame.style.aspectRatio)).toBeCloseTo(16 / 9);
    expect(screen.getByRole("img", { name: "Mountain landscape" })).toHaveAttribute(
      "src",
      "/landscape.jpg",
    );
  });

  it("supports custom ratios, contain fit, native props, custom styles, classes, and refs", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <AspectRatio
        aria-label="Portrait image frame"
        className="custom-frame"
        data-testid="custom-frame"
        fit="contain"
        id="portrait-frame"
        ratio={3 / 4}
        ref={ref}
        style={{ marginInline: "auto" }}
      >
        <img src="/portrait.jpg" alt="A portrait" />
      </AspectRatio>,
    );

    const frame = screen.getByTestId("custom-frame");

    expect(frame).toHaveClass(styles.aspectRatio, "custom-frame");
    expect(frame).toHaveAttribute("aria-label", "Portrait image frame");
    expect(frame).toHaveAttribute("data-fit", "contain");
    expect(frame).toHaveAttribute("id", "portrait-frame");
    expect(Number.parseFloat(frame.style.aspectRatio)).toBeCloseTo(3 / 4);
    expect(frame.style.marginInline).toBe("auto");
    expect(ref.current).toBe(frame);
  });

  it("rejects zero, negative, and non-finite ratios", () => {
    expect(() => renderToStaticMarkup(<AspectRatio ratio={0} />)).toThrow(
      "AspectRatio `ratio` must be a finite number greater than 0.",
    );
    expect(() => renderToStaticMarkup(<AspectRatio ratio={-1} />)).toThrow(
      RangeError,
    );
    expect(() => renderToStaticMarkup(<AspectRatio ratio={Number.NaN} />)).toThrow(
      RangeError,
    );
    expect(() =>
      renderToStaticMarkup(<AspectRatio ratio={Number.POSITIVE_INFINITY} />),
    ).toThrow(RangeError);
  });

  it("rejects unsupported media fitting values", () => {
    const invalidFit = "fill" as AspectRatioFit;

    expect(() =>
      renderToStaticMarkup(<AspectRatio fit={invalidFit} />),
    ).toThrow('AspectRatio `fit` must be either "cover" or "contain".');
  });
});
