import { createElement, type ComponentPropsWithoutRef, type ElementType } from "react";

export type LayoutElement =
  | "a"
  | "article"
  | "aside"
  | "div"
  | "fieldset"
  | "figure"
  | "footer"
  | "form"
  | "header"
  | "label"
  | "li"
  | "main"
  | "nav"
  | "ol"
  | "section"
  | "span"
  | "ul";

export type LayoutGap = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export type LayoutAlignment = "start" | "center" | "end" | "stretch" | "baseline";

export type LayoutJustification =
  | "start"
  | "center"
  | "end"
  | "between"
  | "around"
  | "evenly";

export type LayoutPolymorphicProps<
  T extends LayoutElement,
  OwnProps,
> = OwnProps &
  { as?: T } &
  Omit<ComponentPropsWithoutRef<T>, keyof OwnProps | "as">;

export function renderLayoutElement(
  as: LayoutElement | undefined,
  fallback: LayoutElement,
  props: object,
) {
  return createElement((as ?? fallback) as ElementType, props as never);
}
