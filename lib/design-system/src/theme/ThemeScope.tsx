import { type ComponentPropsWithoutRef, type CSSProperties } from "react";
import type { DesignSystemStyle } from "../generated/token-types";

export type ThemeScopeProps = Omit<ComponentPropsWithoutRef<"div">, "style"> & {
  theme: string;
  style?: DesignSystemStyle;
};

/** A local theme boundary; it never changes global document state. */
export function ThemeScope({ theme, style, ...props }: ThemeScopeProps) {
  return (
    <div
      {...props}
      data-ds-theme={theme}
      style={style as CSSProperties | undefined}
    />
  );
}
