import { forwardRef, type ComponentPropsWithRef } from "react";
import styles from "./FormControls.module.css";

export type FormLayoutProps = ComponentPropsWithRef<"div"> & {
  columns?: 1 | 2;
  gap?: "sm" | "md" | "lg";
};

export const FormLayout = forwardRef<HTMLDivElement, FormLayoutProps>(function FormLayout(
  { columns = 1, gap = "md", className, ...layoutProps },
  ref,
) {
  const layoutClassName = [styles.formLayout, className].filter(Boolean).join(" ");

  return (
    <div
      {...layoutProps}
      ref={ref}
      data-columns={columns}
      data-gap={gap}
      className={layoutClassName}
    />
  );
});

FormLayout.displayName = "FormLayout";
