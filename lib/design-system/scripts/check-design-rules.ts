import { readFile, readdir } from "node:fs/promises";
import { relative, resolve } from "node:path";
import postcss from "postcss";
import { fileURLToPath } from "node:url";
import { checkRadiusRules } from "./check-radius-rules";

const packageRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const componentRoot = resolve(packageRoot, "src/components");
const literalColorPattern = /#[\da-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\s*\(/i;
const forbiddenColorWords = /\b(?:red|blue|green|black|white|purple|pink|orange|yellow|gray|grey|rebeccapurple)\b/i;

async function cssFiles(directory: string): Promise<string[]> {
  const found: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) found.push(...await cssFiles(path));
    else if (entry.isFile() && entry.name.endsWith(".css")) found.push(path);
  }
  return found;
}

async function main(): Promise<void> {
  const files = await cssFiles(componentRoot);
  if (!files.length) throw new Error("Design rules: no component CSS files found.");
  const errors: string[] = [];
  for (const file of files) {
    const source = await readFile(file, "utf8");
    const fileName = relative(componentRoot, file);
    errors.push(...checkRadiusRules(source, fileName));
    const root = postcss.parse(source, { from: file });
    root.walkDecls((declaration) => {
      const value = declaration.value.replace(/var\([^)]*\)/g, "var()");
      const dimensions = [...value.matchAll(/(?<![\w-])(-?\d*\.?\d+)(?:px|rem|em|ms|s)\b/gi)];
      if (dimensions.some((match) => Number(match[1]) !== 0)) {
        errors.push(`${fileName}:${declaration.source?.start?.line ?? "?"}: raw dimensional literal "${declaration.value}"`);
      }
      if (literalColorPattern.test(value)) {
        errors.push(`${declaration.source?.start?.line ?? "?"}: raw color literal "${declaration.value}"`);
      }
      if (forbiddenColorWords.test(value) && !/\b(?:ButtonText|ButtonFace|CanvasText|Highlight|GrayText)\b/.test(value)) {
        errors.push(`${declaration.source?.start?.line ?? "?"}: named color literal "${declaration.value}"`);
      }
      if (declaration.prop.startsWith("--ds-")) {
        errors.push(`${declaration.source?.start?.line ?? "?"}: component CSS must use a token or hook, not define a public variable`);
      }
    });
  }
  if (errors.length) throw new Error(`Design rules failed:\n${errors.map((error) => `  - ${error}`).join("\n")}`);
  process.stdout.write(`Design rules passed for ${files.length} component stylesheet(s).\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
