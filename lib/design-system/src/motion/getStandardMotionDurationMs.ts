const defaultStandardMotionDuration = 200;

export function getStandardMotionDurationMs(): number {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return defaultStandardMotionDuration;
  }

  const value = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue("--ds-motion-duration-standard")
    .trim();
  const match = /^(\d*\.?\d+)(ms|s)$/.exec(value);
  if (!match) return defaultStandardMotionDuration;

  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount < 0) return defaultStandardMotionDuration;
  return match[2] === "s" ? amount * 1000 : amount;
}
