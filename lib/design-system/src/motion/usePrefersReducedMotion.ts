import { useEffect, useState } from "react";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const preferenceAttribute = "data-ds-motion-preference";

function readPreference(): boolean {
  if (typeof document !== "undefined") {
    const override = document.documentElement.getAttribute(preferenceAttribute);
    if (override === "reduced") return true;
    if (override === "full") return false;
  }

  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(reducedMotionQuery).matches
  );
}

/**
 * Returns the active reduced-motion preference.
 * Uses the operating-system preference by default; Storybook can override it
 * with `data-ds-motion-preference="reduced"` or `"full"` on the document root.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(readPreference);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const mediaQuery =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia(reducedMotionQuery)
        : undefined;
    const syncPreference = () => setPrefersReducedMotion(readPreference());
    const observer =
      typeof MutationObserver === "undefined"
        ? undefined
        : new MutationObserver(syncPreference);

    mediaQuery?.addEventListener("change", syncPreference);
    observer?.observe(root, {
      attributes: true,
      attributeFilter: [preferenceAttribute],
    });
    syncPreference();

    return () => {
      mediaQuery?.removeEventListener("change", syncPreference);
      observer?.disconnect();
    };
  }, []);

  return prefersReducedMotion;
}
