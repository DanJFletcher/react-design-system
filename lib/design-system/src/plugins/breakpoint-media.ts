import postcss, { type Plugin as PostcssPlugin } from "postcss";
import { BREAKPOINT_MEDIA_ALIASES } from "../generated/breakpoint-media.js";

export { BREAKPOINT_MEDIA_ALIASES };

export function breakpointMediaPlugin(): PostcssPlugin {
  return {
    postcssPlugin: "design-system-breakpoint-media",
    Once(root) {
      root.walkAtRules("media", (rule) => {
        rule.params = rule.params.replace(
          /\(\s*(--ds-viewport-[a-z-]+)\s*\)/g,
          (match, alias: string) => {
            const query = BREAKPOINT_MEDIA_ALIASES[alias as keyof typeof BREAKPOINT_MEDIA_ALIASES];
            if (!query) throw rule.error(`Unknown responsive breakpoint alias "${alias}".`);
            return query;
          },
        );
      });
    },
  };
}

type ViteTransformResult = { code: string; map: null };

export type BreakpointMediaVitePlugin = {
  name: string;
  enforce: "pre";
  transform(code: string, id: string): Promise<ViteTransformResult | null>;
};

export function breakpointMediaVitePlugin(): BreakpointMediaVitePlugin {
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
