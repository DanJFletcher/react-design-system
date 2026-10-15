import type { Root } from "postcss";

const sharedShadowValue =
  /^(?:none|var\(--ds-shadow-elevation-(?:surface|control|overlay)\))$/;
const dividerSelector =
  /(?:^|[^\w-])(?:\.[\w-]*(?:divider|separator)[\w-]*|\.tab[-_]?list|hr)(?=$|[\s.#:[>~+])/i;
const dividedVariant = /\[data-variant\s*=\s*["']divided["']\]/i;
const separatorStylesheet = /(?:^|\/)separator\/separator\.module\.css$/i;

function isDividerRule(selector: string, fileName: string): boolean {
  return (
    dividerSelector.test(selector) ||
    dividedVariant.test(selector) ||
    /\[role\s*=\s*["']separator["']\]/i.test(selector) ||
    separatorStylesheet.test(fileName)
  );
}

export function checkBorderElevationRules(root: Root, fileName: string): string[] {
  const errors: string[] = [];

  root.walkDecls((declaration) => {
    const line = declaration.source?.start?.line ?? "?";
    if (declaration.prop === "box-shadow" && !sharedShadowValue.test(declaration.value.trim())) {
      errors.push(
        `${fileName}:${line}: box-shadow must use a shared elevation token (surface, control, or overlay) or none`,
      );
    }

    if (!declaration.prop.startsWith("border")) return;
    if (!/var\(\s*--ds-border-width-default\s*(?:,|\))/.test(declaration.value)) return;

    const selector = declaration.parent?.type === "rule" ? declaration.parent.selector : "";
    if (isDividerRule(selector, fileName)) {
      errors.push(
        `${fileName}:${line}: decorative dividers must use --ds-border-width-subtle instead of --ds-border-width-default`,
      );
    }
  });

  return errors;
}
