import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { compileTokens, contrastRatio } from "../../scripts/build-tokens";

const source = resolve(import.meta.dirname, "../../src/tokens");

test("generation is deterministic and produces complete themes", async () => {
  const first = await compileTokens(source);
  const second = await compileTokens(source);
  assert.deepEqual([...first.files], [...second.files]);
  assert.deepEqual([...first.themes.keys()].sort(), ["acme", "atom", "luna", "orchid", "sublime"]);
  assert.equal(Object.keys(first.themes.get("acme")!).length, Object.keys(first.themes.get("luna")!).length);
  assert.equal(first.themes.get("orchid")!["color.canvas"], "#FFF2FD");
  assert.equal(first.themes.get("atom")!["color.canvas"], "#11111D");
  assert.equal(first.themes.get("atom")!["border.width.default"], "3px");
  assert.equal(first.themes.get("atom")!["border.width.subtle"], "2px");
  assert.equal(first.themes.get("atom")!["border.width.strong"], "4px");
  assert.equal(first.themes.get("atom")!["shadow.offset.surface"], "6px");
  assert.equal(first.themes.get("atom")!["shadow.offset.control"], "3px");
  assert.equal(first.themes.get("atom")!["shadow.elevation.surface"], "0px 6px 0px 0px #FF3D8D");
  assert.equal(first.themes.get("atom")!["shadow.elevation.control"], "0px 3px 0px 0px #FF3D8D");
  assert.equal(first.themes.get("luna")!["shadow.elevation.surface"], "none");
  assert.match(first.files.get("tokens.css")!, /--ds-shadow-elevation-surface: none;/);
  assert.match(first.files.get("token-types.ts")!, /"shadow\.elevation\.control"/);
  assert.equal(first.themes.get("sublime")!["color.canvas"], "#1F242C");
  assert.equal(first.themes.get("sublime")!["color.action.primary.bg"], "#66D9EF");
  assert.equal(first.themes.get("sublime")!["radius.surface"], "4px");
  assert.match(first.files.get("tokens.css")!, /--ds-layer-base: 0;/);
  assert.match(first.files.get("tokens.css")!, /--ds-layer-dropdown: 30;/);
  assert.match(first.files.get("tokens.css")!, /--ds-layer-scrim: 40;/);
  assert.match(first.files.get("tokens.css")!, /--ds-layer-notification: 60;/);
  assert.match(first.files.get("tokens.css")!, /--ds-font-family-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,/);
  assert.match(first.files.get("tokens.css")!, /--ds-font-family-sans: system-ui, -apple-system/);
  assert.equal(first.themes.get("acme")!["typography.heading.1.size"], "3rem");
  assert.equal(first.themes.get("acme")!["typography.display.letter-spacing"], "-0.04em");
  assert.equal(first.themes.get("acme")!["typography.measure.content"], "65ch");
  assert.match(first.files.get("tokens.css")!, /--ds-typography-heading-1-size: 3rem;/);
  assert.match(first.files.get("tokens.css")!, /--ds-typography-measure-content: 65ch;/);
  assert.equal(first.themes.get("luna")!["color.surface.overlay"], "#2B2545");
  assert.equal(first.themes.get("atom")!["color.status.info.fg"], "#97E9FF");
  assert.equal(first.themes.get("orchid")!["color.status.neutral.bg"], "#EEE4EF");
  assert.match(first.files.get("themes/acme.css")!, /--ds-motion-duration-standard: 200ms;/);
  assert.match(first.files.get("themes/acme.css")!, /--ds-motion-easing-standard: cubic-bezier\(0\.2, 0, 0, 1\);/);
  assert.match(first.files.get("themes/acme.css")!, /--ds-motion-distance-subtle: 2px;/);
  assert.match(first.files.get("themes/acme.css")!, /--ds-motion-distance-standard: 8px;/);
  assert.match(first.files.get("themes/acme.css")!, /--ds-motion-distance-prominent: 12px;/);
  assert.match(first.files.get("token-types.ts")!, /"motion\.easing\.standard"/);
  assert.match(first.files.get("token-types.ts")!, /"motion\.distance\.standard"/);
  assert.equal(first.themes.get("luna")!["motion.duration.standard"], "240ms");
  assert.equal(first.themes.get("orchid")!["motion.duration.standard"], "220ms");
  assert.equal(first.themes.get("atom")!["motion.duration.standard"], "160ms");
  assert.equal(first.themes.get("sublime")!["motion.distance.standard"], "6px");
  assert.match(first.files.get("themes/luna.css")!, /--ds-motion-duration-standard: 240ms;/);
  assert.match(first.files.get("themes/atom.css")!, /--ds-motion-easing-enter: cubic-bezier\(0\.2, 1, 0\.3, 1\);/);
  assert.match(first.files.get("tokens.css")!, /--ds-breakpoint-narrow: 32rem;/);
  assert.match(first.files.get("tokens.css")!, /--ds-breakpoint-medium: 48rem;/);
  assert.match(first.files.get("breakpoint-media.ts")!, /"--ds-viewport-medium-up": "\(min-width: 48rem\)"/);
  assert.match(first.files.get("token-types.ts")!, /"breakpoint\.wide"/);
  assert.ok(first.contrastResults.length >= 120);
  assert.ok(first.contrastResults.some((result) => result.name === "Primary text on overlay surface"));
  assert.ok(first.contrastResults.some((result) => result.name === "Strong boundary on overlay surface"));
  assert.ok(first.contrastResults.every((result) => result.ratio >= result.minimum));
});

test("semantic typography tokens support negative tracking and readable measures", async () => {
  const result = await compileTokens(source);
  const acme = result.themes.get("acme")!;

  assert.equal(acme["typography.display.letter-spacing"], "-0.04em");
  assert.equal(acme["typography.heading.1.letter-spacing"], "-0.03em");
  assert.equal(acme["typography.measure.narrow"], "45ch");
  assert.equal(acme["typography.measure.content"], "65ch");
  assert.equal(acme["typography.measure.wide"], "80ch");
});

test("Atom uses dark comic colors with hard, block-style elevation", async () => {
  const result = await compileTokens(source);
  const atom = result.themes.get("atom")!;

  assert.equal(atom["color.surface.primary"], "#202033");
  assert.equal(atom["color.action.primary.bg"], "#FF3D8D");
  assert.equal(atom["color.focus.ring"], "#70E8FF");
  assert.equal(atom["border.width.default"], "3px");
  assert.equal(atom["shadow.color"], "#FF3D8D");
  assert.equal(atom["shadow.offset.surface"], "6px");
  assert.equal(atom["shadow.offset.control"], "3px");
  assert.equal(atom["shadow.elevation.surface"], "0px 6px 0px 0px #FF3D8D");
  assert.equal(atom["shadow.elevation.control"], "0px 3px 0px 0px #FF3D8D");
});

test("contrast ratio matches the WCAG reference examples", () => {
  assert.ok(Math.abs(contrastRatio("#FFFFFF", "#000000") - 21) < 0.001);
  assert.ok(Math.abs(contrastRatio("#FFFFFF", "#1D4ED8") - 6.70) < 0.02);
});

test("reference cycles fail with a useful diagnostic", async () => {
  const temporary = await mkdtemp(join(tmpdir(), "design-system-cycles-"));
  try {
    await cp(source, temporary, { recursive: true });
    const file = join(temporary, "foundations.json");
    const json = JSON.parse(await readFile(file, "utf8")) as { tokens: Record<string, { type: string; value: unknown; description: string }> };
    json.tokens["palette.cycle.a"] = { type: "color", value: { ref: "palette.cycle.b" }, description: "Cycle test A." };
    json.tokens["palette.cycle.b"] = { type: "color", value: { ref: "palette.cycle.a" }, description: "Cycle test B." };
    json.tokens["palette.cycle.seed"] = { type: "color", value: { ref: "palette.cycle.a" }, description: "Cycle entry." };
    json.tokens["color.cycle.consumer"] = { type: "color", value: { ref: "palette.cycle.seed" }, description: "Cycle consumer." };
    await writeFile(file, JSON.stringify(json));
    await assert.rejects(() => compileTokens(temporary), /Reference cycle detected/);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test("incompatible token references fail validation", async () => {
  const temporary = await mkdtemp(join(tmpdir(), "design-system-types-"));
  try {
    await cp(source, temporary, { recursive: true });
    const file = join(temporary, "contract.json");
    const json = JSON.parse(await readFile(file, "utf8")) as { tokens: Record<string, { type: string; value: unknown; description: string }> };
    json.tokens["color.canvas"]!.value = { ref: "space.4" };
    await writeFile(file, JSON.stringify(json));
    await assert.rejects(() => compileTokens(temporary), /incompatible type/);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test("theme motion distances must use pixels", async () => {
  const temporary = await mkdtemp(join(tmpdir(), "design-system-motion-distance-"));
  try {
    await cp(source, temporary, { recursive: true });
    const file = join(temporary, "themes/acme.json");
    const json = JSON.parse(await readFile(file, "utf8")) as { values: Record<string, unknown> };
    json.values["motion.distance.standard"] = { amount: 0.5, unit: "rem" };
    await writeFile(file, JSON.stringify(json));
    await assert.rejects(() => compileTokens(temporary), /motion-distance.*must use px/);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test("breakpoint foundations must use rem units", async () => {
  const temporary = await mkdtemp(join(tmpdir(), "design-system-breakpoints-"));
  try {
    await cp(source, temporary, { recursive: true });
    const file = join(temporary, "foundations.json");
    const json = JSON.parse(await readFile(file, "utf8")) as {
      tokens: Record<string, { type: string; value: { amount: number; unit: string }; description: string }>;
    };
    json.tokens["breakpoint.medium"]!.value.unit = "px";
    await writeFile(file, JSON.stringify(json));
    await assert.rejects(() => compileTokens(temporary), /Breakpoint token "breakpoint\.medium" must use rem/);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test("box-shadow tokens reject declaration injection", async () => {
  const temporary = await mkdtemp(join(tmpdir(), "design-system-shadow-values-"));
  try {
    await cp(source, temporary, { recursive: true });
    const file = join(temporary, "themes/acme.json");
    const json = JSON.parse(await readFile(file, "utf8")) as { values: Record<string, unknown> };
    json.values["shadow.elevation.surface"] = "none; color: red";
    await writeFile(file, JSON.stringify(json));
    await assert.rejects(() => compileTokens(temporary), /Box-shadow token .* declaration delimiters/);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});
