import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import postcss, { type Plugin as PostcssPlugin } from "postcss";
import type { Plugin as VitePlugin } from "vite";

const packageRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const foundations = JSON.parse(
  readFileSync(resolve(packageRoot, "src/tokens/foundations.json"), "utf8"),
) as {
  tokens: Record<string, { type: string; value: { amount: number; unit: string } }>;
};

function breakpointValue(name: string): string {
  const token = foundations.tokens[name];
  if (
    token?.type !== "dimension" ||
    !token.value ||
    !Number.isFinite(token.value.amount) ||
    token.value.unit !== "rem"
  ) {
    throw new Error(`Breakpoint media alias references invalid token "${name}".`);
  }
  return `${token.value.amount}${token.value.unit}`;
}

export const BREAKPOINT_MEDIA_ALIASES: Readonly<Record<string, string>> = Object.freeze({
  "--ds-viewport-narrow": `(max-width: ${breakpointValue("breakpoint.narrow")})`,
  "--ds-viewport-compact": `(max-width: ${breakpointValue("breakpoint.compact")})`,
  "--ds-viewport-below-medium": `(width < ${breakpointValue("breakpoint.medium")})`,
  "--ds-viewport-medium-up": `(min-width: ${breakpointValue("breakpoint.medium")})`,
  "--ds-viewport-wide-up": `(min-width: ${breakpointValue("breakpoint.wide")})`,
});

export function breakpointMediaPlugin(): PostcssPlugin {
  return {
    postcssPlugin: "design-system-breakpoint-media",
    Once(root) {
      root.walkAtRules("media", (rule) => {
        rule.params = rule.params.replace(
          /\(\s*(--ds-viewport-[a-z-]+)\s*\)/g,
          (match, alias: string) => {
            const query = BREAKPOINT_MEDIA_ALIASES[alias];
            if (!query) throw rule.error(`Unknown responsive breakpoint alias "${alias}".`);
            return query;
          },
        );
      });
    },
  };
}

export function breakpointMediaVitePlugin(): VitePlugin {
  return {
    name: "design-system-breakpoint-media",
    enforce: "pre",
    async transform(code, id) {
      if (!id.split("?")[0]?.endsWith(".css")) return null;
      const result = await postcss([breakpointMediaPlugin()]).process(code, { from: id, map: false });
      if (result.css === code) return null;
      return { code: result.css, map: null };
    },
  };
}
