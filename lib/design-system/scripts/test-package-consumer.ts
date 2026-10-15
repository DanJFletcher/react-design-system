import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const temporary = await mkdtemp(join(tmpdir(), "design-system-consumer-"));

try {
  execFileSync("pnpm", ["pack", "--pack-destination", temporary], {
    cwd: packageRoot,
    stdio: "inherit",
  });
  const archive = join(temporary, "workspace-design-system-0.1.0.tgz");
  await writeFile(join(temporary, "package.json"), JSON.stringify({
    name: "design-system-clean-consumer",
    private: true,
    type: "module",
    dependencies: {
      "@workspace/design-system": `file:${archive}`,
      react: "19.1.0",
    },
    devDependencies: {
      "@types/react": "19.2.0",
      typescript: "5.9.3",
    },
  }, null, 2));
  await writeFile(join(temporary, "tsconfig.json"), JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      module: "NodeNext",
      moduleResolution: "NodeNext",
      jsx: "react-jsx",
      strict: true,
      skipLibCheck: true,
      noEmit: true,
    },
    include: ["consumer.tsx"],
  }, null, 2));
  await writeFile(join(temporary, "consumer.tsx"), [
    'import { ArticleTableOfContents, Button, Checkbox, RadioGroup, RangeField, Rating, Select, TextField, Textarea, ThemeScope, ToggleGroup, type ArticleTableOfContentsItem, type ButtonIconPosition, type ButtonShape, type DesignSystemThemeName, type RangeFieldProps, type RatingProps, type ToggleGroupProps, type ToggleGroupSelectionMode } from "@workspace/design-system";',
    'import { BREAKPOINT_MEDIA_ALIASES, breakpointMediaPlugin, breakpointMediaVitePlugin } from "@workspace/design-system/breakpoint-media";',
    'import "@workspace/design-system/tokens.css";',
    'import "@workspace/design-system/styles.css";',
    'import "@workspace/design-system/themes/acme.css";',
    'import "@workspace/design-system/themes/luna.css";',
    'import "@workspace/design-system/themes/orchid.css";',
    'import "@workspace/design-system/themes/atom.css";',
    'import "@workspace/design-system/themes/sublime.css";',
    'const shape: ButtonShape = "pill";',
    'const iconPosition: ButtonIconPosition = "right";',
    'const selectedTheme: DesignSystemThemeName = "sublime";',
    'const selectionMode: ToggleGroupSelectionMode = "multiple";',
    'const narrowMediaQuery: string = BREAKPOINT_MEDIA_ALIASES["--ds-viewport-narrow"];',
    'void narrowMediaQuery; void breakpointMediaPlugin; void breakpointMediaVitePlugin; void selectionMode;',
    'const toggleGroupProps: ToggleGroupProps = { "aria-label": "View mode", items: [{ value: "grid", label: "Grid" }], selectionMode: "single", defaultValue: "grid" };',
    'const rangeFieldProps: RangeFieldProps = { label: "Moving budget", min: 0, max: 1000, step: 50, defaultValue: 250 };',
    'const ratingProps: RatingProps = { mode: "display", value: 4.5, max: 5 };',
    'const sections: ArticleTableOfContentsItem[] = [{ id: "overview", label: "Overview" }];',
    'export const example = <ThemeScope theme={selectedTheme} style={{ "--ds-button-radius": "12px" }}><ArticleTableOfContents items={sections} /><ToggleGroup {...toggleGroupProps} /><RangeField {...rangeFieldProps} /><Rating {...ratingProps} /><Button variant="secondary" shape={shape} icon={<span>★</span>} iconPosition={iconPosition}>Continue</Button><Button iconOnly icon={<span>×</span>} aria-label="Close dialog" /><TextField label="Email" type="email" required /><Textarea label="Notes" rows={4} /><Select label="Region" defaultValue="ca"><option value="ca">Canada</option></Select><Checkbox label="Subscribe" name="subscribe" value="yes" /><RadioGroup label="Contact method" name="contact" options={[{ value: "email", label: "Email" }]} /></ThemeScope>;',
    "",
  ].join("\n"));
  execFileSync("pnpm", ["install", "--ignore-workspace"], { cwd: temporary, stdio: "inherit" });
  execFileSync("pnpm", ["exec", "tsc", "-p", "tsconfig.json"], { cwd: temporary, stdio: "inherit" });
  execFileSync("pnpm", ["exec", "node", "--input-type=module", "-e", [
    'import assert from "node:assert/strict";',
    'import { ArticleTableOfContents, Button, Checkbox, RadioGroup, RangeField, Rating, Select, TextField, Textarea, ThemeScope, ToggleGroup } from "@workspace/design-system";',
    'import { BREAKPOINT_MEDIA_ALIASES, breakpointMediaVitePlugin } from "@workspace/design-system/breakpoint-media";',
    'assert.equal(typeof Button, "object");',
    'assert.equal(typeof ArticleTableOfContents, "object");',
    'assert.equal(typeof Checkbox, "object");',
    'assert.equal(typeof RadioGroup, "object");',
    'assert.equal(typeof Select, "object");',
    'assert.equal(typeof TextField, "object");',
    'assert.equal(typeof Textarea, "object");',
    'assert.equal(typeof ThemeScope, "function");',
    'assert.equal(typeof ToggleGroup, "object");',
    'assert.equal(typeof RangeField, "object");',
    'assert.equal(typeof Rating, "function");',
    'assert.equal(BREAKPOINT_MEDIA_ALIASES["--ds-viewport-narrow"], "(max-width: 32rem)");',
    'const breakpointPlugin = breakpointMediaVitePlugin();',
    'const responsiveCss = await breakpointPlugin.transform("@media (--ds-viewport-compact) { .consumer { display: grid; } }", "/consumer.css");',
    'assert.match(responsiveCss?.code ?? "", /@media \\(max-width: 40rem\\)/);',
  ].join("")], { cwd: temporary, stdio: "inherit" });
  for (const file of ["tokens.css", "styles.css", "themes/acme.css", "themes/luna.css", "themes/orchid.css", "themes/atom.css", "themes/sublime.css", "plugins/breakpoint-media.js", "plugins/breakpoint-media.d.ts"]) {
    await readFile(join(temporary, "node_modules/@workspace/design-system/dist", file));
  }
  await readFile(join(temporary, "node_modules/@workspace/design-system/README.md"));
  await readFile(join(temporary, "node_modules/@workspace/design-system/CONTRIBUTING.md"));
  await readFile(join(temporary, "node_modules/@workspace/design-system/docs/theming.md"));
  process.stdout.write("Package tarball installed in a clean consumer; ESM, declarations, CSS entrypoints, and developer docs work.\n");
} finally {
  await rm(temporary, { recursive: true, force: true });
}
