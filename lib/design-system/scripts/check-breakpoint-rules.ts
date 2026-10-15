import type { Root } from "postcss";
import { BREAKPOINT_MEDIA_ALIASES } from "./breakpoint-media";

const widthQueryPattern = /\b(?:min|max)-width\b|\bwidth\s*[<>]=?/i;
const aliasPattern = /--ds-viewport-[a-z-]+/g;

export function checkBreakpointRules(root: Root, fileName: string): string[] {
  const errors: string[] = [];
  root.walkAtRules("media", (rule) => {
    const aliases = [...rule.params.matchAll(aliasPattern)].map((match) => match[0]);
    for (const alias of aliases) {
      if (!(alias in BREAKPOINT_MEDIA_ALIASES)) {
        errors.push(`${fileName}:${rule.source?.start?.line ?? "?"}: unknown responsive breakpoint alias "${alias}"`);
      }
    }
    if (widthQueryPattern.test(rule.params)) {
      errors.push(`${fileName}:${rule.source?.start?.line ?? "?"}: use a shared responsive breakpoint alias instead of a raw viewport width`);
    }
  });
  return errors;
}
