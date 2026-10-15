import {
  forwardRef,
  useState,
  type ComponentPropsWithRef,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import { Button, type ButtonProps } from "../Button/Button";
import styles from "./ToggleButton.module.css";

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export type ToggleButtonProps = DistributiveOmit<
  ButtonProps,
  "aria-pressed" | "onClick" | "style"
> & {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  onClick?: ComponentPropsWithRef<"button">["onClick"];
  style?: DesignSystemStyle;
};

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  function ToggleButton(
    {
      pressed,
      defaultPressed = false,
      onPressedChange,
      onClick,
      className,
      style,
      ...buttonProps
    },
    ref,
  ) {
    const [uncontrolledPressed, setUncontrolledPressed] = useState(defaultPressed);
    const isControlled = pressed !== undefined;
    const isPressed = isControlled ? pressed : uncontrolledPressed;
    const classes = [styles.toggleButton, className].filter(Boolean).join(" ");

    return (
      <Button
        {...(buttonProps as ButtonProps)}
        aria-pressed={isPressed}
        className={classes}
        data-state={isPressed ? "on" : "off"}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;

          const nextPressed = !isPressed;
          if (!isControlled) setUncontrolledPressed(nextPressed);
          onPressedChange?.(nextPressed);
        }}
        ref={ref}
        style={style}
      />
    );
  },
);

ToggleButton.displayName = "ToggleButton";
