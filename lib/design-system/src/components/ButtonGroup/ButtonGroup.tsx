import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from "../Button/Button";
import { ToggleButton } from "../ToggleButton/ToggleButton";
import styles from "./ButtonGroup.module.css";

export type ButtonGroupOrientation = "horizontal" | "vertical";
export type ButtonGroupSpacing = "none" | "sm" | "md" | "lg";
export type ButtonGroupAlignment = "start" | "center" | "end";
export type ButtonGroupAppearance = "separated" | "joined";

type GroupableButtonProps = Pick<ButtonProps, "size" | "variant" | "disabled">;

function applyGroupDefaults(
  children: ReactNode,
  defaults: {
    disabled: boolean;
    size?: ButtonSize;
    variant?: ButtonVariant;
  },
): ReactNode {
  return Children.map(children, (child) => {
    if (
      !isValidElement<GroupableButtonProps>(child) ||
      (child.type !== Button && child.type !== ToggleButton)
    ) {
      return child;
    }

    const member = child as ReactElement<GroupableButtonProps>;
    const inheritedProps: Partial<GroupableButtonProps> = {};
    if (defaults.size !== undefined && member.props.size === undefined) {
      inheritedProps.size = defaults.size;
    }
    if (defaults.variant !== undefined && member.props.variant === undefined) {
      inheritedProps.variant = defaults.variant;
    }
    if (defaults.disabled) inheritedProps.disabled = true;

    return Object.keys(inheritedProps).length > 0
      ? cloneElement(member, inheritedProps)
      : child;
  });
}

export type ButtonGroupProps = Omit<
  ComponentPropsWithRef<"div">,
  "style" | "role"
> & {
  children?: ReactNode;
  orientation?: ButtonGroupOrientation;
  spacing?: ButtonGroupSpacing;
  alignment?: ButtonGroupAlignment;
  fullWidth?: boolean;
  equalWidth?: boolean;
  wrap?: boolean;
  appearance?: ButtonGroupAppearance;
  size?: ButtonSize;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: DesignSystemStyle;
};

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  {
    children,
    orientation = "horizontal",
    spacing = "sm",
    alignment = "start",
    fullWidth = false,
    equalWidth = false,
    wrap = false,
    appearance = "separated",
    size,
    variant,
    disabled = false,
    className,
    style,
    ...groupProps
  },
  ref,
) {
  const classes = [styles.group, className].filter(Boolean).join(" ");
  const groupedChildren = applyGroupDefaults(children, { disabled, size, variant });

  return (
    <div
      {...groupProps}
      className={classes}
      data-ds-button-group=""
      data-alignment={alignment}
      data-appearance={appearance}
      data-equal-width={String(equalWidth)}
      data-disabled={String(disabled)}
      data-full-width={String(fullWidth)}
      data-orientation={orientation}
      data-size={size ?? "default"}
      data-spacing={spacing}
      data-variant={variant ?? "default"}
      data-wrap={String(wrap)}
      ref={ref}
      role="group"
      style={style as CSSProperties | undefined}
    >
      {groupedChildren}
    </div>
  );
});

ButtonGroup.displayName = "ButtonGroup";
