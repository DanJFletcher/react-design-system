import postcss, { type Declaration, type Rule } from "postcss";
import hookSource from "../src/tokens/component-hooks.json";
import policy from "./radius-policy.json";

type RadiusRole = "surface" | "action" | "form" | "shape" | "circle" | "inherited";
export type RadiusException = {
  file: string;
  selector: string;
  role: RadiusRole;
  reason: string;
};
const roles = new Set<RadiusRole>(["surface", "action", "form", "shape", "circle", "inherited"]);
const normalize = (selector: string) => selector.replace(/\s+/g, " ").trim();
const surfaceTokens = new Set([
  "--ds-radius-surface", "--ds-radius-tooltip", "--ds-radius-menu",
  "--ds-radius-textarea", "--ds-radius-form-group", "--ds-radius-shape-square",
]);
const shapeTokens = new Set([
  "--ds-radius-shape-rounded", "--ds-radius-shape-square", "--ds-radius-full",
]);
const radiusHooks = new Set(Object.keys(hookSource.hooks)
  .filter((key) => key.endsWith(".radius") || key.endsWith("-radius"))
  .map((key) => `--ds-${key.replaceAll(".", "-")}`));

function selectorOf(declaration: Declaration): string {
  return declaration.parent?.type === "rule" ? normalize((declaration.parent as Rule).selector) : "";
}
function isRadius(declaration: Declaration): boolean {
  return /^(?:border-radius|border-(?:top|bottom)-(?:left|right)-radius|border-(?:start|end)-(?:start|end)-radius)$/
    .test(declaration.prop) || /^--_[\w-]*radius$/.test(declaration.prop);
}

/** Surfaces are the default. Only exact, reviewed selectors can opt into pill/circle roles. */
export function checkRadiusRules(
  source: string,
  file: string,
  exceptions: readonly RadiusException[] = policy.exceptions as RadiusException[],
): string[] {
  const root = postcss.parse(source, { from: file });
  const errors: string[] = [];
  const privateValues = new Map<string, Declaration[]>();
  const applicable = exceptions.filter((entry) => entry.file === file);
  const used = new Set<RadiusException>();
  root.walkDecls((declaration) => {
    if (declaration.prop.startsWith("--_")) {
      const definitions = privateValues.get(declaration.prop) ?? [];
      definitions.push(declaration);
      privateValues.set(declaration.prop, definitions);
    }
  });
  const roleFor = (declaration: Declaration): RadiusRole => {
    const entry = applicable.find((item) => normalize(item.selector) === selectorOf(declaration));
    if (!entry) return "surface";
    used.add(entry);
    if (!roles.has(entry.role) || !entry.reason.trim()) {
      errors.push(`${file}: radius exception needs a valid role and reason: ${entry.selector}`);
      return "surface";
    }
    return entry.role;
  };
  const fail = (declaration: Declaration, message: string) => {
    errors.push(`${file}:${declaration.source?.start?.line ?? "?"} ${selectorOf(declaration)}: ${message}`);
  };
  const validate = (value: string, role: RadiusRole, declaration: Declaration, chain: string[]): void => {
    for (const part of postcss.list.space(value)) {
      if (part === "0") continue;
      if (part === "inherit" && role === "inherited") continue;
      const variable = /^var\(\s*(--[\w-]+)\s*(?:,([\s\S]+))?\)$/.exec(part);
      if (!variable) {
        fail(declaration, `radius role "${role}" needs a semantic radius token (received "${part}").`);
        continue;
      }
      const name = variable[1]!;
      const fallback = variable[2]?.trim();
      if (name.startsWith("--_")) {
        if (chain.includes(name)) {
          fail(declaration, `cyclic private radius chain: ${[...chain, name].join(" -> ")}.`);
        } else {
          const definitions = privateValues.get(name);
          if (!definitions?.length && !fallback) fail(declaration, `unresolved private radius "${name}".`);
          for (const definition of definitions ?? []) {
            validate(definition.value, role, declaration, [...chain, name]);
          }
        }
      } else if (radiusHooks.has(name)) {
        const hookRole = name === "--ds-button-radius" ? ["action", "shape"]
          : name === "--ds-progress-radius" ? ["circle"]
          : name === "--ds-search-radius" ? ["form"] : ["surface"];
        if (!hookRole.includes(role)) fail(declaration, `hook "${name}" does not belong to radius role "${role}".`);
        if (!fallback) fail(declaration, `radius hook "${name}" needs a role-correct default fallback.`);
      } else {
        const allowed = role === "surface" ? surfaceTokens.has(name)
          : role === "action" ? name === "--ds-radius-control"
          : role === "form" ? name === "--ds-radius-form-control"
          : role === "shape" ? shapeTokens.has(name)
          : role === "circle" ? name === "--ds-radius-full" : false;
        if (!allowed) fail(declaration, `token "${name}" is not allowed for radius role "${role}"; surfaces use --ds-radius-surface.`);
      }
      // Validate every fallback too: a bounded first token must not hide a pill fallback.
      if (fallback) validate(fallback, role, declaration, chain);
    }
  };
  root.walkDecls((declaration) => {
    if (isRadius(declaration)) validate(declaration.value, roleFor(declaration), declaration, []);
  });
  for (const entry of applicable) {
    if (!used.has(entry)) errors.push(`${file}: stale radius exception "${entry.selector}".`);
  }
  return errors;
}
