import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type TokenType = "boxShadow" | "color" | "dimension" | "duration" | "easing" | "fontFamily" | "fontWeight" | "letterSpacing" | "lineHeight" | "number";
type Dimension = { amount: number; unit: string };
type Reference = { ref: string };
type TokenValue = string | number | Dimension | Reference;
type Token = { type: TokenType; value: TokenValue; description: string };
type ThemeSource = { schemaVersion: number; name: string; extends?: string; values: Record<string, TokenValue> };
type ResolvedToken = Token & { value: string | number };
type JsonRecord = Record<string, unknown>;

const here = dirname(fileURLToPath(import.meta.url));
const defaultTokenDir = resolve(here, "../src/tokens");
const defaultOutputDir = resolve(here, "../src/generated");
const namePattern = /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/;
const hexPattern = /^#[\da-f]{6}$/i;
const timingFunctionPattern =
  /^(?:linear|ease(?:-in|-out|-in-out)?|cubic-bezier\(\s*-?\d*\.?\d+\s*,\s*-?\d*\.?\d+\s*,\s*-?\d*\.?\d+\s*,\s*-?\d*\.?\d+\s*\))$/;

function fail(message: string): never {
  throw new Error(`Token compiler: ${message}`);
}

async function readJson(path: string): Promise<JsonRecord> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as JsonRecord;
  } catch (error) {
    fail(`Cannot read ${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function asRecord(value: unknown, label: string): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${label} must be an object.`);
  return value as JsonRecord;
}

function assertSchemaVersion(record: JsonRecord, file: string): void {
  if (record.schemaVersion !== 1) fail(`${file} must declare schemaVersion 1.`);
}

function cssName(name: string): string {
  return `--ds-${name.replaceAll(".", "-")}`;
}

function formatValue(value: string | number): string {
  return typeof value === "number" ? String(value) : value;
}

function referenceName(value: unknown): string | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const ref = (value as Reference).ref;
  return typeof ref === "string" ? ref : undefined;
}

function resolveValue(
  name: string,
  tokens: Map<string, Token>,
  cache: Map<string, string | number>,
  stack: string[] = [],
  allowedUnits: string[] = ["px", "rem", "em", "%", "ms"],
): string | number {
  if (cache.has(name)) return cache.get(name)!;
  if (stack.includes(name)) fail(`Reference cycle detected: ${[...stack, name].join(" -> ")}.`);
  const token = tokens.get(name);
  if (!token) fail(`Unknown reference "${name}".`);
  const ref = referenceName(token.value);
  if (ref) {
    const target = tokens.get(ref);
    if (!target) fail(`Token "${name}" references missing token "${ref}".`);
    if (target.type !== token.type) {
      fail(`Token "${name}" has type ${token.type}, but "${ref}" has incompatible type ${target.type}.`);
    }
    const resolved = resolveValue(ref, tokens, cache, [...stack, name], allowedUnits);
    cache.set(name, resolved);
    return resolved;
  }
  if (token.type === "color") {
    if (typeof token.value !== "string" || !hexPattern.test(token.value)) {
      fail(`Color token "${name}" must use a six-digit hexadecimal color or a compatible reference.`);
    }
    const resolved = token.value.toUpperCase();
    cache.set(name, resolved);
    return resolved;
  }
  if (token.type === "dimension" || token.type === "duration" || token.type === "letterSpacing") {
    const value = token.value as Dimension;
    if (!value || typeof value !== "object" || !Number.isFinite(value.amount) || typeof value.unit !== "string") {
      fail(`Token "${name}" must use an amount and unit.`);
    }
    if (!allowedUnits.includes(value.unit)) fail(`Token "${name}" uses unit "${value.unit}" which is not declared in schema.json.`);
    const allowed =
      token.type === "duration"
        ? ["ms"]
        : token.type === "letterSpacing"
          ? ["em", "px"]
          : ["px", "rem", "em", "%", "ch"];
    if (!allowed.includes(value.unit)) fail(`Token "${name}" uses unsupported unit "${value.unit}".`);
    if (value.amount < 0 && token.type !== "letterSpacing") fail(`Token "${name}" cannot have a negative amount.`);
    if (token.type === "duration" && name.startsWith("motion.") && value.unit !== "ms") {
      fail(`Motion token "${name}" must use milliseconds.`);
    }
    if (name.startsWith("font.size.") && value.unit !== "rem") {
      fail(`Font-size token "${name}" must use rem.`);
    }
    if (name.startsWith("typography.") && name.endsWith(".size") && value.unit !== "rem") {
      fail(`Typography size token "${name}" must use rem.`);
    }
    if (name.startsWith("typography.measure.") && value.unit !== "ch") {
      fail(`Typography measure token "${name}" must use ch.`);
    }
    if ((name.startsWith("space.") || name.startsWith("radius.") || name.startsWith("border.") ||
      name.startsWith("focus.") || name.startsWith("control.")) && value.unit !== "px") {
      fail(`Spatial and control token "${name}" must use px.`);
    }
    const resolved = `${value.amount}${value.unit}`;
    cache.set(name, resolved);
    return resolved;
  }
  if (token.type === "fontFamily") {
    if (typeof token.value !== "string" || !token.value.trim()) fail(`Font-family token "${name}" must be a non-empty string.`);
    cache.set(name, token.value);
    return token.value;
  }
  if (token.type === "boxShadow") {
    if (typeof token.value !== "string" || !token.value.trim() || /[;{}\r\n]/.test(token.value)) {
      fail(`Box-shadow token "${name}" must be a non-empty CSS value without declaration delimiters.`);
    }
    const resolved = token.value.trim();
    cache.set(name, resolved);
    return resolved;
  }
  if (token.type === "easing") {
    if (typeof token.value !== "string" || !timingFunctionPattern.test(token.value.trim())) {
      fail(`Easing token "${name}" must use a CSS timing keyword or cubic-bezier() function.`);
    }
    const resolved = token.value.trim();
    cache.set(name, resolved);
    return resolved;
  }
  if (typeof token.value !== "number" || !Number.isFinite(token.value)) {
    fail(`Token "${name}" must have a finite numeric value.`);
  }
  if (token.type === "fontWeight" && (token.value < 100 || token.value > 900)) {
    fail(`Font-weight token "${name}" must be from 100 through 900.`);
  }
  if (token.type === "lineHeight" && (token.value <= 0 || token.value > 3)) {
    fail(`Line-height token "${name}" must be positive and unitless.`);
  }
  cache.set(name, token.value);
  return token.value;
}

function validateToken(name: string, raw: unknown, label: string, allowedTypes: Set<string>): Token {
  if (!namePattern.test(name)) fail(`${label} has invalid token name "${name}".`);
  const record = asRecord(raw, `${label}.${name}`);
  if (typeof record.type !== "string" || !allowedTypes.has(record.type)) {
    fail(`${label}.${name} has an unsupported type.`);
  }
  if (!("value" in record)) fail(`${label}.${name} is missing a value.`);
  if (typeof record.description !== "string" || !record.description.trim()) {
    fail(`${label}.${name} needs a non-empty description.`);
  }
  return { type: record.type as TokenType, value: record.value as TokenValue, description: record.description };
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
  const linear = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
}

export function contrastRatio(foreground: string, background: string): number {
  if (!hexPattern.test(foreground) || !hexPattern.test(background)) {
    fail(`Contrast inputs must be six-digit hexadecimal colors: ${foreground}, ${background}.`);
  }
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

export type Compilation = {
  files: Map<string, string>;
  themes: Map<string, Record<string, string | number>>;
  contrastResults: Array<{ theme: string; name: string; ratio: number; minimum: number; kind: string }>;
};

export async function compileTokens(tokenDir = defaultTokenDir): Promise<Compilation> {
  const [schema, foundationsFile, contractFile, hooksFile, contrastFile] = await Promise.all([
    readJson(resolve(tokenDir, "schema.json")),
    readJson(resolve(tokenDir, "foundations.json")),
    readJson(resolve(tokenDir, "contract.json")),
    readJson(resolve(tokenDir, "component-hooks.json")),
    readJson(resolve(tokenDir, "contrast-pairs.json")),
  ]);
  assertSchemaVersion(schema, "schema.json");
  assertSchemaVersion(foundationsFile, "foundations.json");
  assertSchemaVersion(contractFile, "contract.json");
  assertSchemaVersion(hooksFile, "component-hooks.json");
  assertSchemaVersion(contrastFile, "contrast-pairs.json");
  const schemaTypeDefinitions = asRecord(schema.types, "schema.types");
  const allowedTypes = new Set(Object.keys(schemaTypeDefinitions));
  const allowedUnits = schema.units;
  if (!Array.isArray(allowedUnits) || !allowedUnits.every((unit) => typeof unit === "string")) {
    fail("schema.units must be an array of unit names.");
  }
  if (!["boxShadow", "color", "dimension", "duration", "easing", "fontFamily", "fontWeight", "letterSpacing", "lineHeight", "number"].every((type) => allowedTypes.has(type))) {
    fail("schema.types must declare every supported token type.");
  }

  const allTokens = new Map<string, Token>();
  const foundationSource = asRecord(foundationsFile.tokens, "foundations.tokens");
  const contractSource = asRecord(contractFile.tokens, "contract.tokens");
  const addTokens = (source: JsonRecord, label: string) => {
    for (const [name, value] of Object.entries(source)) {
      if (allTokens.has(name)) fail(`Duplicate token "${name}" in ${label}.`);
      allTokens.set(name, validateToken(name, value, label, allowedTypes));
    }
  };
  addTokens(foundationSource, "foundations");
  addTokens(contractSource, "contract");

  const hooksSource = asRecord(hooksFile.hooks, "component-hooks.hooks");
  const hooks: Array<{ name: string; type: TokenType; description: string; css: string }> = [];
  for (const [name, raw] of Object.entries(hooksSource)) {
    if (!namePattern.test(name)) fail(`Invalid component hook name "${name}".`);
    const hook = asRecord(raw, `component-hooks.${name}`);
    if (typeof hook.type !== "string" || !["color", "dimension", "duration", "fontFamily", "fontWeight", "lineHeight", "number"].includes(hook.type)) {
      fail(`Component hook "${name}" has an unsupported type.`);
    }
    if (typeof hook.description !== "string" || !hook.description.trim()) {
      fail(`Component hook "${name}" needs a description.`);
    }
    hooks.push({ name, type: hook.type as TokenType, description: hook.description, css: cssName(name) });
  }
  hooks.sort((a, b) => a.name.localeCompare(b.name));

  const publicTokens = [...allTokens.entries()]
    .filter(([name]) => !name.startsWith("palette."))
    .sort(([a], [b]) => a.localeCompare(b));
  const variables = new Map<string, string>();
  for (const [name] of publicTokens) variables.set(cssName(name), name);
  for (const hook of hooks) variables.set(hook.css, `hook:${hook.name}`);
  const publicNames = new Set<string>();
  for (const [variable, name] of variables) {
    if (publicNames.has(variable)) fail(`Generated CSS variable collision at "${variable}" (${name}).`);
    publicNames.add(variable);
  }

  const cache = new Map<string, string | number>();
  for (const name of allTokens.keys()) resolveValue(name, allTokens, cache, [], allowedUnits);
  const resolvedContract = new Map<string, ResolvedToken>();
  for (const [name, token] of allTokens) {
    resolvedContract.set(name, { ...token, value: cache.get(name)! });
  }

  const themeFiles = await (async () => {
    const { readdir } = await import("node:fs/promises");
    return (await readdir(resolve(tokenDir, "themes"))).filter((file) => file.endsWith(".json")).sort();
  })();
  if (themeFiles.length < 2) fail("At least two theme files are required for the initial foundation.");
  const themeSources = new Map<string, ThemeSource>();
  for (const file of themeFiles) {
    const source = await readJson(resolve(tokenDir, "themes", file));
    assertSchemaVersion(source, `themes/${file}`);
    const name = file.slice(0, -5);
    if (source.name !== name) fail(`Theme ${file} must declare name "${name}".`);
    const values = asRecord(source.values, `themes/${name}.values`) as Record<string, TokenValue>;
    themeSources.set(name, { schemaVersion: 1, name, extends: source.extends as string | undefined, values });
  }
  const contractNames = Object.keys(contractSource).sort();
  const themeValues = new Map<string, Record<string, string | number>>();
  const resolvingThemes = new Set<string>();
  const resolveTheme = (name: string): Record<string, string | number> => {
    const cached = themeValues.get(name);
    if (cached) return cached;
    if (resolvingThemes.has(name)) fail(`Theme inheritance cycle includes "${name}".`);
    const source = themeSources.get(name);
    if (!source) fail(`Theme inheritance references unknown theme "${name}".`);
    resolvingThemes.add(name);
    const values: Record<string, string | number> = source.extends ? { ...resolveTheme(source.extends) } : {};
    for (const [tokenName, raw] of Object.entries(source.values)) {
      const contractToken = resolvedContract.get(tokenName);
      if (!contractToken || !contractSource[tokenName]) {
        fail(`Theme "${name}" overrides unknown semantic token "${tokenName}".`);
      }
      const overrideToken = validateToken(tokenName, {
        type: contractToken.type,
        value: raw,
        description: contractToken.description,
      }, `theme ${name}`, allowedTypes);
      const overrideKey = `@theme:${name}:${tokenName}`;
      const tokensWithOverride = new Map(allTokens);
      tokensWithOverride.set(overrideKey, overrideToken);
      const value = resolveValue(overrideKey, tokensWithOverride, cache, [], allowedUnits);
      values[tokenName] = value;
    }
    for (const tokenName of contractNames) {
      if (!(tokenName in values)) fail(`Theme "${name}" does not provide semantic token "${tokenName}".`);
    }
    for (const tokenName of Object.keys(values)) {
      if (!contractSource[tokenName]) fail(`Theme "${name}" contains non-contract token "${tokenName}".`);
    }
    resolvingThemes.delete(name);
    themeValues.set(name, values);
    return values;
  };
  for (const name of themeSources.keys()) resolveTheme(name);
  if (!themeSources.has("acme") || !themeSources.has("luna")) {
    fail("The built-in theme files must include acme.json and luna.json.");
  }

  const contrast = asRecord(contrastFile, "contrast-pairs");
  const textPairs = contrast.textPairs;
  const indicatorPairs = contrast.indicatorPairs;
  if (!Array.isArray(textPairs) || !Array.isArray(indicatorPairs)) fail("Contrast pairs need textPairs and indicatorPairs arrays.");
  const contrastResults: Compilation["contrastResults"] = [];
  for (const themeName of themeSources.keys()) {
    const values = themeValues.get(themeName)!;
    for (const [kind, pairs] of [["text", textPairs], ["indicator", indicatorPairs]] as const) {
      for (const raw of pairs) {
        const pair = asRecord(raw, `contrastPairs.${kind}`);
        const foreground = values[String(pair.foreground)];
        const background = values[String(pair.background)];
        const minimum = pair.minimum;
        if (typeof pair.name !== "string" || typeof foreground !== "string" || typeof background !== "string" || typeof minimum !== "number") {
          fail(`Invalid ${kind} contrast pair.`);
        }
        const ratio = contrastRatio(foreground, background);
        contrastResults.push({ theme: themeName, name: pair.name, ratio, minimum, kind });
        if (ratio + 1e-9 < minimum) {
          fail(`${themeName} ${kind} contrast "${pair.name}" is ${ratio.toFixed(2)}:1; minimum is ${minimum}:1.`);
        }
      }
    }
  }

  const resolvedFoundations = publicTokens
    .filter(([name]) => !contractSource[name])
    .map(([name, token]) => ({ name, type: token.type, value: cache.get(name)!, description: token.description }));
  const semantics = contractNames.map((name) => ({
    name,
    type: resolvedContract.get(name)!.type,
    description: resolvedContract.get(name)!.description,
  }));
  const hookManifest = hooks.map(({ name, type, description }) => ({ name, type, description, cssVariable: cssName(name) }));
  const allPublicNameList = [...resolvedFoundations.map((token) => token.name), ...semantics.map((token) => token.name)].sort();
  const typeFile = [
    "/* Generated by scripts/build-tokens.ts. Do not edit. */",
    `export type DesignSystemThemeName = ${[...themeSources.keys()].sort().map((name) => JSON.stringify(name)).join(" | ")};`,
    `export type DesignSystemTokenName = ${allPublicNameList.map((name) => JSON.stringify(name)).join(" | ")};`,
    `export type DesignSystemHookName = ${hooks.map((hook) => JSON.stringify(hook.css)).join(" | ")};`,
    "export type DesignSystemStyle = Partial<Record<DesignSystemHookName, string | number>>;",
    "",
  ].join("\n");

  const hookReset = hooks.map((hook) => `  ${hook.css}: initial;`).join("\n");
  const foundationDeclarations = resolvedFoundations.map((token) =>
    `  ${cssName(token.name)}: ${formatValue(cache.get(token.name)!)};`,
  ).join("\n");
  const cssForTheme = (themeName: string, isDefault: boolean): string => {
    const declarations = contractNames.map((name) =>
      `  ${cssName(name)}: ${formatValue(themeValues.get(themeName)![name]!)};`,
    ).join("\n");
    const selectors = isDefault
      ? `:root,\n[data-ds-theme="${themeName}"]`
      : `:root:not([data-ds-theme]),\n:root[data-ds-theme="${themeName}"],\n[data-ds-theme="${themeName}"]`;
    return [
      "/* Generated by scripts/build-tokens.ts. Do not edit. */",
      ":where([data-ds-theme]) {",
      hookReset,
      "}",
      `${selectors} {`,
      declarations,
      "}",
      "",
    ].join("\n");
  };
  const tokensCss = [
    "/* Generated by scripts/build-tokens.ts. Do not edit. */",
    ":root {",
    foundationDeclarations,
    "}",
    cssForTheme("acme", true),
  ].join("\n");
  const manifest = {
    schemaVersion: 1,
    generatedBy: "scripts/build-tokens.ts",
    foundations: resolvedFoundations,
    semantic: semantics,
    componentHooks: hookManifest,
    themes: Object.fromEntries([...themeValues.entries()].sort(([a], [b]) => a.localeCompare(b))),
    contrast: contrastResults.map((result) => ({ ...result, ratio: Number(result.ratio.toFixed(3)) })),
  };

  const files = new Map<string, string>([
    ["tokens.css", tokensCss],
    ["token-types.ts", typeFile],
    ["token-manifest.json", `${JSON.stringify(manifest, null, 2)}\n`],
  ]);
  for (const name of themeSources.keys()) {
    files.set(`themes/${name}.css`, [
      "/* Generated by scripts/build-tokens.ts. Do not edit. */",
      ":root {",
      foundationDeclarations,
      "}",
      cssForTheme(name, false),
    ].join("\n"));
  }
  return { files, themes: themeValues, contrastResults };
}

async function writeGenerated(files: Map<string, string>, outputDir: string, check: boolean): Promise<void> {
  const changed: string[] = [];
  for (const [relativePath, content] of files) {
    const fullPath = resolve(outputDir, relativePath);
    let existing: string | undefined;
    try {
      existing = await readFile(fullPath, "utf8");
    } catch {
      existing = undefined;
    }
    if (existing === content) continue;
    changed.push(relativePath);
    if (!check) {
      await mkdir(dirname(fullPath), { recursive: true });
      await writeFile(fullPath, content);
    }
  }
  if (check && changed.length) {
    fail(`Generated files are stale: ${changed.join(", ")}. Run pnpm tokens:build.`);
  }
}

async function main(): Promise<void> {
  const compilation = await compileTokens();
  await writeGenerated(compilation.files, defaultOutputDir, process.argv.includes("--check"));
  if (!process.argv.includes("--check")) {
    process.stdout.write(
      `Generated ${compilation.files.size} files; verified ${compilation.contrastResults.length} contrast pairs across ${compilation.themes.size} themes.\n`,
    );
  } else {
    process.stdout.write("Generated token files match their sources.\n");
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
