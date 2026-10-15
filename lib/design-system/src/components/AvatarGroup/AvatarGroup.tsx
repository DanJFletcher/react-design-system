import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
} from "react";
import type { DesignSystemStyle } from "../../generated/token-types";
import { Avatar, type AvatarShape, type AvatarSize } from "../Avatar/Avatar";
import styles from "./AvatarGroup.module.css";

export type AvatarGroupMember = {
  id: string;
  name: string;
  src?: string;
  initials?: string;
};

export type AvatarGroupProps = Omit<
  ComponentPropsWithRef<"div">,
  "children" | "style" | "role" | "aria-label"
> & {
  members: readonly AvatarGroupMember[];
  label?: string;
  maxVisible?: number;
  size?: AvatarSize;
  shape?: AvatarShape;
  overflowLabel?: (hiddenCount: number) => string;
  className?: string;
  style?: DesignSystemStyle;
};

const defaultOverflowLabel = (count: number) =>
  `Show ${count} more ${count === 1 ? "member" : "members"}`;

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  function AvatarGroup(
    {
      members,
      label = "Team members",
      maxVisible = 4,
      size = "md",
      shape = "circle",
      overflowLabel = defaultOverflowLabel,
      className,
      style,
      ...divProps
    },
    ref,
  ) {
    const id = useId();
    const [isOverflowOpen, setIsOverflowOpen] = useState(false);
    const overflowRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const visibleMembers = members.slice(0, maxVisible);
    const hiddenMembers = members.slice(maxVisible);
    const classes = [styles.group, className].filter(Boolean).join(" ");

    useEffect(() => {
      if (!isOverflowOpen) return undefined;
      const closeOnOutsidePointer = (event: PointerEvent) => {
        if (!overflowRef.current?.contains(event.target as Node)) {
          setIsOverflowOpen(false);
        }
      };
      document.addEventListener("pointerdown", closeOnOutsidePointer);
      return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
    }, [isOverflowOpen]);

    useEffect(() => {
      if (hiddenMembers.length === 0) setIsOverflowOpen(false);
    }, [hiddenMembers.length]);

    if (!Number.isInteger(maxVisible) || maxVisible < 0) {
      throw new RangeError("AvatarGroup maxVisible must be a non-negative integer.");
    }

    return (
      <div
        {...divProps}
        aria-label={label}
        className={classes}
        ref={ref}
        role="group"
        style={style as CSSProperties | undefined}
      >
        <div className={styles.stack}>
          {visibleMembers.map((member) => (
            <Avatar
              className={styles.memberAvatar}
              key={member.id}
              name={member.name}
              shape={shape}
              size={size}
              src={member.src}
              initials={member.initials}
            />
          ))}
          {hiddenMembers.length > 0 && (
            <div className={styles.overflow} ref={overflowRef}>
              <button
                aria-controls={`${id}-members`}
                aria-expanded={isOverflowOpen}
                aria-label={overflowLabel(hiddenMembers.length)}
                className={styles.overflowButton}
                onClick={() => setIsOverflowOpen((open) => !open)}
                onKeyDown={(event) => {
                  if (event.key === "Escape" && isOverflowOpen) {
                    event.preventDefault();
                    setIsOverflowOpen(false);
                    triggerRef.current?.focus();
                  }
                }}
                ref={triggerRef}
                type="button"
              >
                <span
                  aria-hidden="true"
                  className={styles.overflowCount}
                  data-shape={shape}
                  data-size={size}
                >
                  +{hiddenMembers.length}
                </span>
              </button>
              <ul
                aria-label="Additional team members"
                className={styles.hiddenMembers}
                hidden={!isOverflowOpen}
                id={`${id}-members`}
              >
                {hiddenMembers.map((member) => (
                  <li className={styles.hiddenMember} key={member.id}>
                    <span aria-hidden="true">
                      <Avatar
                        name={member.name}
                        shape={shape}
                        size="sm"
                        src={member.src}
                        initials={member.initials}
                      />
                    </span>
                    <span className={styles.hiddenName}>{member.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  },
);

AvatarGroup.displayName = "AvatarGroup";
